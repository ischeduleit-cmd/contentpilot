import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseUser, getSupabaseServerClient, resolveApplicationUserId } from "@/lib/supabase";
import { syncOnboardingToGoogleSheets } from "@/lib/google-sheets-sync";

export const dynamic = "force-dynamic";

function stableUuid(value: string) {
  const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function authRequired() {
  return NextResponse.json({ success: false, error: "Sign in is required." }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedSupabaseUser(req);
  if (!user) return authRequired();
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, error: "Workspace database is not configured." }, { status: 503 });

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Please check the restaurant details." }, { status: 400 });
    }
    const values = body as Record<string, unknown>;
    const pending = user.registration || {};
    const fromBodyOrPending = (key: string) => values[key] ?? pending[key];
    const name = typeof fromBodyOrPending("restaurantName") === "string" ? String(fromBodyOrPending("restaurantName")).trim() : "";
    const location = typeof fromBodyOrPending("location") === "string" ? String(fromBodyOrPending("location")).trim() : "";
    const restaurantType = typeof fromBodyOrPending("restaurantType") === "string" ? String(fromBodyOrPending("restaurantType")) : "restaurant";
    const targetAudience = typeof fromBodyOrPending("targetAudience") === "string" ? String(fromBodyOrPending("targetAudience")).trim() : "";
    const primaryCustomerAction = typeof fromBodyOrPending("primaryCustomerAction") === "string" ? String(fromBodyOrPending("primaryCustomerAction")) : "order_food";
    const businessDescription = typeof fromBodyOrPending("businessDescription") === "string" ? String(fromBodyOrPending("businessDescription")).trim() : "";
    const goal = typeof fromBodyOrPending("goal") === "string" ? String(fromBodyOrPending("goal")) : "get_more_orders";
    const goalDescription = typeof fromBodyOrPending("goalDescription") === "string" ? String(fromBodyOrPending("goalDescription")).trim() : "";
    const weekStart = typeof values.weekStart === "string" ? values.weekStart : new Date().toISOString().slice(0, 10);
    const allowedTypes = new Set(["restaurant", "fast_food", "cafe", "bakery", "food_delivery", "bar_lounge", "other"]);
    const allowedActions = new Set(["order_food", "visit", "whatsapp", "book_table", "discover", "other"]);
    const allowedGoals = new Set(["get_more_orders", "promote_menu", "increase_awareness", "build_trust", "increase_engagement", "promote_event", "bring_customers_in", "increase_lunch_orders", "other"]);
    if (!name || !location || name.length > 255 || location.length > 255 || !targetAudience || !businessDescription || businessDescription.length > 5000 || targetAudience.length > 1000 || !allowedTypes.has(restaurantType) || !allowedActions.has(primaryCustomerAction) || !allowedGoals.has(goal) || goalDescription.length > 2000) {
      return NextResponse.json({ success: false, error: "Please check the restaurant name, location, and description." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || Number.isNaN(Date.parse(`${weekStart}T00:00:00Z`))) {
      return NextResponse.json({ success: false, error: "Choose a valid week start date." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const normalizedEmail = user.email.trim().toLowerCase();
    const { data: matchedUser, error: lookupUserError } = await supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (lookupUserError) throw lookupUserError;
    const applicationUserId = matchedUser?.id || user.id;
    const { error: userError } = await supabase.from("users").upsert({ id: applicationUserId, email: normalizedEmail, created_at: now }, { onConflict: "id" });
    if (userError) throw userError;
    const { data: priorRestaurant, error: restaurantLookupError } = await supabase.from("restaurants").select("id").eq("user_id", applicationUserId).limit(1).maybeSingle();
    if (restaurantLookupError) throw restaurantLookupError;
    const restaurantId = priorRestaurant?.id || user.id;
    const goalId = stableUuid(`${restaurantId}:${weekStart}`);

    const baseRestaurantRecord = {
      id: restaurantId,
      user_id: applicationUserId,
      name,
      location,
      restaurant_type: restaurantType,
      target_audience: targetAudience,
      primary_customer_action: primaryCustomerAction,
    };
    const fullRestaurantRecord = {
      ...baseRestaurantRecord,
      business_description: businessDescription,
    };

    let restaurant: any = null;
    const { data: fullData, error: fullError } = await supabase
      .from("restaurants")
      .upsert(fullRestaurantRecord, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (fullError && (fullError.code === "PGRST204" || fullError.message?.includes("business_description"))) {
      const { data: baseData, error: baseError } = await supabase
        .from("restaurants")
        .upsert(baseRestaurantRecord, { onConflict: "id" })
        .select("*")
        .single();
      if (baseError || !baseData) throw baseError || new Error("restaurant_save_failed");
      restaurant = baseData;
    } else if (fullError || !fullData) {
      throw fullError || new Error("restaurant_save_failed");
    } else {
      restaurant = fullData;
    }
    if (restaurant.user_id !== applicationUserId) return NextResponse.json({ success: false, error: "Workspace ownership could not be verified." }, { status: 403 });

    const goalRecord = { id: goalId, restaurant_id: restaurantId, goal, goal_description: goalDescription, week_start: weekStart, created_at: now };
    const { error: goalError } = await supabase.from("weekly_goals").upsert(goalRecord, { onConflict: "id" });
    if (goalError) throw goalError;

    let sheetsStatus: "synced" | "already_synced" | "pending_configuration" | "failed" = "pending_configuration";
    try {
      const result = await syncOnboardingToGoogleSheets({
        createdAt: restaurant.created_at || now, userId: user.id, email: normalizedEmail, restaurantName: name, location,
        restaurantType, targetAudience, primaryCustomerAction, businessDescription, weeklyGoal: goal,
      });
      sheetsStatus = result.status;
    } catch (error) {
      sheetsStatus = "failed";
      const code = error instanceof Error && /^google_[a-z0-9_]+$/.test(error.message) ? error.message : "google_sync_unexpected_error";
      console.error("[Sheets Sync] Registration record could not be synced.", { code });
    }
    const { error: syncStatusError } = await supabase.from("restaurants").update({
      sheets_sync_status: sheetsStatus,
      sheets_synced_at: sheetsStatus === "synced" || sheetsStatus === "already_synced" ? now : null,
    }).eq("id", restaurantId).eq("user_id", applicationUserId);
    if (syncStatusError && syncStatusError.code !== "PGRST204") {
      console.warn("[Sheets Sync] Notice: Could not persist sheets_sync_status.", { code: syncStatusError.code || "sheets_status_persist_skipped" });
    }

    return NextResponse.json({
      success: true,
      user: { id: applicationUserId, email: user.email },
      restaurant: {
        id: restaurant.id, userId: user.id, name: restaurant.name,
        location: restaurant.location, restaurantType: restaurant.restaurant_type,
        targetAudience: restaurant.target_audience || "", primaryCustomerAction: restaurant.primary_customer_action,
        businessDescription: restaurant.business_description || businessDescription, createdAt: restaurant.created_at,
      },
      goal: { id: goalId, restaurantId, goal, goalDescription, weekStart },
      sheetsSync: { status: sheetsStatus },
    });
  } catch {
    console.error("[Onboarding] Could not persist authenticated restaurant workspace.");
    return NextResponse.json({ success: false, error: "We could not save your restaurant details. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedSupabaseUser(req);
  if (!user) return authRequired();
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ success: false, error: "Workspace database is not configured." }, { status: 503 });
  try {
    const applicationUserId = await resolveApplicationUserId(supabase, user);
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    let query = supabase.from("restaurants").select("*").or(`user_id.eq.${applicationUserId},user_id.eq.${user.id}`);
    if (restaurantId && restaurantId !== "default" && restaurantId !== "undefined") query = query.eq("id", restaurantId);
    let { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) {
      const reg = user.registration || {};
      const restaurantName = (reg.restaurantName as string) || (user.email ? user.email.split("@")[0] + "'s Kitchen" : "My Restaurant");
      const location = (reg.location as string) || "Workspace Location";
      const restaurantType = (reg.restaurantType as string) || "restaurant";
      const targetAudience = (reg.targetAudience as string) || "Restaurant guests";
      const primaryCustomerAction = (reg.primaryCustomerAction as string) || "order_food";
      const businessDescription = (reg.businessDescription as string) || "Restaurant workspace";

      await supabase.from("users").upsert({
        id: applicationUserId,
        email: user.email.toLowerCase().trim(),
        created_at: new Date().toISOString(),
      }, { onConflict: "id" });

      const { data: createdRest } = await supabase.from("restaurants").upsert({
        id: user.id,
        user_id: applicationUserId,
        name: restaurantName,
        location,
        restaurant_type: restaurantType,
        target_audience: targetAudience,
        primary_customer_action: primaryCustomerAction,
        created_at: new Date().toISOString(),
      }, { onConflict: "id" }).select("*").single();

      data = createdRest;
    }
    if (!data) return NextResponse.json({ success: false, restaurant: null, pendingRegistration: user.registration }, { status: 404 });
    let sheetsStatus = data.sheets_sync_status || "pending_configuration";
    if (sheetsStatus !== "synced" && sheetsStatus !== "already_synced") {
      const { data: goal } = await supabase.from("weekly_goals").select("goal").eq("restaurant_id", data.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (goal) {
        try {
          const sync = await syncOnboardingToGoogleSheets({
            createdAt: data.created_at, userId: user.id, email: user.email,
            restaurantName: data.name, location: data.location, restaurantType: data.restaurant_type,
            targetAudience: data.target_audience || "", primaryCustomerAction: data.primary_customer_action,
            businessDescription: data.business_description || (user.registration?.businessDescription as string) || "", weeklyGoal: goal.goal,
          });
          sheetsStatus = sync.status;
          const { error: updateSyncError } = await supabase.from("restaurants").update({ sheets_sync_status: sheetsStatus, sheets_synced_at: sync.synced ? new Date().toISOString() : null }).eq("id", data.id).eq("user_id", applicationUserId);
          if (updateSyncError && updateSyncError.code !== "PGRST204") {
            console.warn("[Sheets Sync] Notice: Could not update sheets_sync_status.", updateSyncError.message);
          }
        } catch (error) {
          sheetsStatus = "failed";
          const code = error instanceof Error && /^google_[a-z0-9_]+$/.test(error.message) ? error.message : "google_sync_unexpected_error";
          console.error("[Sheets Sync] Pending registration retry failed.", { code });
        }
      }
    }
    return NextResponse.json({ success: true, restaurant: {
      id: data.id, userId: user.id, name: data.name, location: data.location,
      restaurantType: data.restaurant_type, targetAudience: data.target_audience || "",
      primaryCustomerAction: data.primary_customer_action, businessDescription: data.business_description || (user.registration?.businessDescription as string) || "",
      createdAt: data.created_at,
    }, sheetsSync: { status: sheetsStatus } });
  } catch {
    console.error("[Onboarding] Could not load authenticated restaurant workspace.");
    return NextResponse.json({ success: false, error: "We could not load your restaurant workspace." }, { status: 500 });
  }
}
