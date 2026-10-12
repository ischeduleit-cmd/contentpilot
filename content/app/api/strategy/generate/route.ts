import { NextRequest, NextResponse } from "next/server";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";
import { listContentAssets } from "@/lib/content-repository";
import {
  generateWeeklyContentStrategy,
  StrategyGenerationInput,
} from "@/lib/strategy-engine";
import {
  saveContentPlan,
  getLatestContentPlan,
} from "@/lib/strategy-repository";
import { BusinessGoalType } from "@/lib/db/schema";
import { verifyRestaurantOwner } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getWorkspacePlan } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

/**
 * POST /api/strategy/generate
 * Generates an actionable 7-day restaurant content strategy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const restaurantId = body.restaurantId;
    if (!restaurantId || restaurantId === BENCHMARK_RESTAURANT.id) return NextResponse.json({ success: false, error: "A restaurant workspace is required." }, { status: 400 });
    const access = await verifyRestaurantOwner(req, restaurantId);
    if (!access.user || !access.restaurant) return NextResponse.json({ success: false, error: "Workspace access denied." }, { status: access.status });
    const goal: BusinessGoalType = body.goal || "get_more_orders";
    const weekStart = body.weekStart;
    const billingDb = getSupabaseServerClient();
    const plan = billingDb ? await getWorkspacePlan(billingDb, access.user.id, restaurantId) : "free";
    if (plan === "free") {
      const now = new Date();
      const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
      const allowedWeekStart = monday.toISOString().slice(0, 10);
      if (typeof weekStart !== "string" || weekStart !== allowedWeekStart) {
        return NextResponse.json({ success: false, error: "The Free plan creates one strategy for the current week." }, { status: 403 });
      }
      const existingPlan = await getLatestContentPlan(restaurantId);
      if (existingPlan?.plan.weekStart === allowedWeekStart) {
        return NextResponse.json({ success: false, error: "Your Free plan strategy for this week already exists." }, { status: 403 });
      }
    }

    // Fetch existing media assets from repository
    let assets = await listContentAssets(restaurantId);

    const realRest = access.restaurant;

    const input: StrategyGenerationInput = {
      restaurantId,
      restaurantName: realRest.name,
      location: realRest.location,
      restaurantType: realRest.restaurant_type,
      targetAudience: realRest.target_audience || "Local diners",
      primaryCustomerAction: realRest.primary_customer_action,
      goal,
      weekStart,
      availableAssets: assets,
      customAngle: body.customAngle,
    };

    // Run Strategy Engine
    const result = await generateWeeklyContentStrategy(input);

    // Persist to Supabase and dev disk storage
    await saveContentPlan(result.plan, result.items);

    return NextResponse.json({
      success: true,
      plan: result.plan,
      items: result.items,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("[Strategy API] Generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate weekly strategy" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/strategy/generate?restaurantId=...
 * Fetches the current saved 7-day plan without creating a new one
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) return NextResponse.json({ success: false, error: "Restaurant ID is required." }, { status: 400 });
    const access = await verifyRestaurantOwner(req, restaurantId);
    if (!access.restaurant) return NextResponse.json({ success: false, error: "Workspace access denied." }, { status: access.status });
    const existing = await getLatestContentPlan(restaurantId);

    // A read should never silently create and persist a plan. Generation is an
    // explicit user action handled by POST so an empty workspace stays honest.
    return NextResponse.json({
      success: true,
      plan: existing?.plan || null,
      items: existing?.items || [],
    });
  } catch (error: any) {
    console.error("[Strategy API] Fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}
