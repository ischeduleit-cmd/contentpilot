import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ipv4HttpsFetch } from "@/lib/supabase";
import { syncOnboardingToGoogleSheets } from "@/lib/google-sheets-sync";

export const dynamic = "force-dynamic";

const RESTAURANT_TYPES = new Set(["restaurant", "fast_food", "cafe", "bakery", "food_delivery", "bar_lounge", "other"]);
const CUSTOMER_ACTIONS = new Set(["order_food", "visit", "whatsapp", "book_table", "discover", "other"]);
const BUSINESS_GOALS = new Set(["get_more_orders", "promote_menu", "increase_awareness", "build_trust", "increase_engagement", "promote_event", "bring_customers_in", "increase_lunch_orders", "other"]);
const GENERIC_SIGNUP_ERROR = "We could not start registration. Check your details or sign in if you already have an account.";

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}

function stableUuid(value: string) {
  const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Check the registration details and try again." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Check the registration details and try again." }, { status: 400 });
  }

  const restaurantName = text(body.restaurantName, 255);
  const location = text(body.location, 255);
  const restaurantType = text(body.restaurantType, 60);
  const targetAudience = text(body.targetAudience, 1000);
  const primaryCustomerAction = text(body.primaryCustomerAction, 60);
  const businessDescription = text(body.businessDescription, 5000);
  const goal = text(body.goal, 80);
  const goalDescription = text(body.goalDescription, 2000);
  const email = text(body.email, 255).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!restaurantName || !location || !targetAudience || !businessDescription || !email ||
      !RESTAURANT_TYPES.has(restaurantType) || !CUSTOMER_ACTIONS.has(primaryCustomerAction) || !BUSINESS_GOALS.has(goal) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 || password !== confirmPassword) {
    return NextResponse.json({ error: "Check the required details, email, and password confirmation." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceKey)) {
    return NextResponse.json({ error: "Registration is temporarily unavailable." }, { status: 503 });
  }

  const metadata = {
    registration: {
      restaurantName,
      location,
      restaurantType,
      targetAudience,
      primaryCustomerAction,
      businessDescription,
      goal,
      goalDescription,
    },
  };

  let userId: string | null = null;

  // Use service role client if available to create pre-confirmed account without blocking on email
  if (serviceKey) {
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: ipv4HttpsFetch as any },
    });

    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (adminError) {
      const msg = adminError.message?.toLowerCase() || "";
      if (msg.includes("already") || (adminError as any).code === "email_exists" || (adminError as any).code === "user_already_exists") {
        return NextResponse.json({
          error: "An account with this email already exists. Please sign in instead."
        }, { status: 409 });
      }
      if (msg.includes("password")) {
        return NextResponse.json({ error: adminError.message }, { status: 400 });
      }
      console.error("[Auth Signup Admin] User creation error:", adminError);
      return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
    }

    userId = adminUser.user?.id || null;
  } else {
    // Fallback to standard client
    const supabase = createClient(url, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: ipv4HttpsFetch as any },
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("already registered") || (error as any).code === "user_already_exists") {
        return NextResponse.json({
          error: "An account with this email already exists. Please sign in instead."
        }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || GENERIC_SIGNUP_ERROR }, { status: 400 });
    }

    userId = data.user?.id || null;
  }

  if (!userId) {
    return NextResponse.json({ error: GENERIC_SIGNUP_ERROR }, { status: 400 });
  }

  // Securely persist restaurant profile and weekly goal in the database using service role
  const clientForDb = createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: ipv4HttpsFetch as any },
  });

  const now = new Date().toISOString();
  const weekStart = new Date().toISOString().slice(0, 10);

  // 1. Upsert public.users
  const { error: userUpsertError } = await clientForDb.from("users").upsert(
    { id: userId, email, created_at: now },
    { onConflict: "id" }
  );
  if (userUpsertError) {
    console.warn("[Auth Signup] public.users upsert notice:", userUpsertError.message);
  }

  // 2. Upsert public.restaurants
  const { data: priorRestaurant } = await clientForDb
    .from("restaurants")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const restaurantId = priorRestaurant?.id || userId;
  const baseRestaurant = {
    id: restaurantId,
    user_id: userId,
    name: restaurantName,
    location,
    restaurant_type: restaurantType,
    target_audience: targetAudience,
    primary_customer_action: primaryCustomerAction,
  };

  const { error: fullRestError } = await clientForDb.from("restaurants").upsert(
    { ...baseRestaurant, business_description: businessDescription },
    { onConflict: "id" }
  );

  if (fullRestError && (fullRestError.code === "PGRST204" || fullRestError.message?.includes("business_description"))) {
    const { error: baseRestError } = await clientForDb.from("restaurants").upsert(baseRestaurant, { onConflict: "id" });
    if (baseRestError) {
      console.warn("[Auth Signup] restaurants fallback upsert notice:", baseRestError.message);
    }
  } else if (fullRestError) {
    console.warn("[Auth Signup] restaurants upsert notice:", fullRestError.message);
  }

  // 3. Upsert public.weekly_goals
  const goalId = stableUuid(`${restaurantId}:${weekStart}`);
  const { error: goalUpsertError } = await clientForDb.from("weekly_goals").upsert(
    {
      id: goalId,
      restaurant_id: restaurantId,
      goal,
      goal_description: goalDescription,
      week_start: weekStart,
      created_at: now,
    },
    { onConflict: "id" }
  );
  if (goalUpsertError) {
    console.warn("[Auth Signup] weekly_goals upsert notice:", goalUpsertError.message);
  }

  // 4. Synchronize to Google Sheets
  let sheetsStatus: "synced" | "already_synced" | "pending_configuration" | "failed" = "pending_configuration";
  try {
    const syncResult = await syncOnboardingToGoogleSheets({
      createdAt: now,
      userId,
      email,
      restaurantName,
      location,
      restaurantType,
      targetAudience,
      primaryCustomerAction,
      businessDescription,
      weeklyGoal: goal,
    });
    sheetsStatus = syncResult.status;
  } catch (sheetsErr) {
    sheetsStatus = "failed";
    const code = sheetsErr instanceof Error && /^google_[a-z0-9_]+$/.test(sheetsErr.message) ? sheetsErr.message : "google_sync_unexpected_error";
    console.error("[Sheets Sync] Signup sync failed:", { code });
  }

  // Update sheets sync status in database if column exists
  const { error: syncUpdateErr } = await clientForDb.from("restaurants").update({
    sheets_sync_status: sheetsStatus,
    sheets_synced_at: sheetsStatus === "synced" || sheetsStatus === "already_synced" ? now : null,
  }).eq("id", restaurantId);

  if (syncUpdateErr && syncUpdateErr.code !== "PGRST204") {
    // Ignored gracefully if column not present yet
  }

  return NextResponse.json({
    success: true,
    email,
    userId,
    restaurant: {
      id: restaurantId,
      userId,
      name: restaurantName,
      location,
      restaurantType,
      targetAudience,
      primaryCustomerAction,
      businessDescription,
    },
    sheetsSync: { status: sheetsStatus },
  }, { status: 200 });
}
