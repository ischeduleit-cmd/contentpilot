import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { syncOnboardingToGoogleSheets } from "@/lib/google-sheets-sync";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DEV_WORKSPACES_FILE = path.join(process.cwd(), ".dev-workspaces.json");

interface LocalWorkspaceData {
  users: Record<string, { id: string; email: string; createdAt: string }>;
  restaurants: Record<string, any>;
  weeklyGoals: Record<string, any>;
}

function readLocalWorkspaces(): LocalWorkspaceData {
  try {
    if (fs.existsSync(DEV_WORKSPACES_FILE)) {
      const raw = fs.readFileSync(DEV_WORKSPACES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[Local Workspaces] Read notice:", err);
  }
  return { users: {}, restaurants: {}, weeklyGoals: {} };
}

function writeLocalWorkspaces(data: LocalWorkspaceData) {
  try {
    fs.writeFileSync(DEV_WORKSPACES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Workspaces] Write notice:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      restaurantName,
      location,
      restaurantType = "restaurant",
      targetAudience = "",
      primaryCustomerAction = "order_food",
      businessDescription = "",
      goal = "get_more_orders",
      goalDescription = "",
      weekStart = new Date().toISOString().split("T")[0],
    } = body;

    if (!restaurantName || !location) {
      return NextResponse.json(
        { success: false, error: "Restaurant name and location are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email && email.includes("@") ? email.trim().toLowerCase() : `restaurant_${Date.now()}@contentpilot.app`;
    const userId = crypto.randomUUID();
    const restaurantId = crypto.randomUUID();
    const goalId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const localData = readLocalWorkspaces();

    // 1. Check or create User locally
    let existingUser = Object.values(localData.users).find((u) => u.email === cleanEmail);
    const activeUserId = existingUser ? existingUser.id : userId;
    if (!existingUser) {
      localData.users[activeUserId] = { id: activeUserId, email: cleanEmail, createdAt: nowIso };
    }

    // 2. Create Restaurant profile
    const restaurantRecord = {
      id: restaurantId,
      userId: activeUserId,
      name: restaurantName.trim(),
      location: location.trim(),
      restaurantType,
      targetAudience: targetAudience.trim(),
      primaryCustomerAction,
      businessDescription: businessDescription.trim(),
      createdAt: nowIso,
    };
    localData.restaurants[restaurantId] = restaurantRecord;

    // 3. Create Weekly Goal
    const goalRecord = {
      id: goalId,
      restaurantId,
      goal,
      goalDescription: goalDescription.trim(),
      weekStart,
      createdAt: nowIso,
    };
    localData.weeklyGoals[goalId] = goalRecord;
    writeLocalWorkspaces(localData);

    // 4. Mirror to Supabase if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        // Upsert user
        await supabase.from("users").upsert({
          id: activeUserId,
          email: cleanEmail,
          created_at: nowIso,
        });

        // Insert restaurant
        await supabase.from("restaurants").upsert({
          id: restaurantId,
          user_id: activeUserId,
          name: restaurantName.trim(),
          location: location.trim(),
          restaurant_type: restaurantType,
          target_audience: targetAudience.trim(),
          primary_customer_action: primaryCustomerAction,
          business_description: businessDescription.trim(),
          created_at: nowIso,
        });

        // Insert weekly goal
        await supabase.from("weekly_goals").upsert({
          id: goalId,
          restaurant_id: restaurantId,
          goal,
          goal_description: goalDescription.trim(),
          week_start: weekStart,
          created_at: nowIso,
        });
      } catch (dbErr) {
        console.warn("[Onboarding DB Mirror Warning]:", dbErr);
      }
    }

    // 5. Trigger Google Sheets synchronization (non-blocking)
    syncOnboardingToGoogleSheets({
      createdAt: nowIso,
      userId: activeUserId,
      email: cleanEmail,
      restaurantName: restaurantName.trim(),
      location: location.trim(),
      restaurantType,
      targetAudience: targetAudience.trim(),
      primaryCustomerAction,
      businessDescription: businessDescription.trim(),
      weeklyGoal: goal,
    }).catch((err) => {
      console.warn("[Google Sheets Sync Background Notice]:", err);
    });

    return NextResponse.json({
      success: true,
      user: { id: activeUserId, email: cleanEmail },
      restaurant: restaurantRecord,
      goal: goalRecord,
    });
  } catch (error: any) {
    console.error("[Onboarding API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete onboarding." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const restaurantId = searchParams.get("restaurantId");

    const localData = readLocalWorkspaces();
    let restaurant = null;

    if (restaurantId && localData.restaurants[restaurantId]) {
      restaurant = localData.restaurants[restaurantId];
    } else if (userId) {
      restaurant = Object.values(localData.restaurants).find((r: any) => r.userId === userId);
    }

    // Check Supabase if not found locally
    if (!restaurant) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        let query = supabase.from("restaurants").select("*");
        if (restaurantId) query = query.eq("id", restaurantId);
        else if (userId) query = query.eq("user_id", userId);
        const { data } = await query.limit(1).maybeSingle();
        if (data) {
          restaurant = {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            location: data.location,
            restaurantType: data.restaurant_type,
            targetAudience: data.target_audience,
            primaryCustomerAction: data.primary_customer_action,
            businessDescription: data.business_description,
            createdAt: data.created_at,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
