import { NextRequest, NextResponse } from "next/server";
import { BENCHMARK_RESTAURANT, SAMPLE_BENCHMARK_ASSETS } from "@/lib/constants";
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

export const dynamic = "force-dynamic";

/**
 * POST /api/strategy/generate
 * Generates an actionable 7-day restaurant content strategy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const restaurantId = body.restaurantId || BENCHMARK_RESTAURANT.id;
    const goal: BusinessGoalType = body.goal || BENCHMARK_RESTAURANT.activeGoal.goal;
    const weekStart = body.weekStart;

    // Fetch existing media assets from repository
    let assets = await listContentAssets(restaurantId);

    // If benchmark restaurant and library is empty, seed with sample benchmark assets
    if (assets.length === 0 && restaurantId === BENCHMARK_RESTAURANT.id) {
      assets = SAMPLE_BENCHMARK_ASSETS;
    }

    const input: StrategyGenerationInput = {
      restaurantId,
      restaurantName: body.restaurantName || BENCHMARK_RESTAURANT.name,
      location: body.location || BENCHMARK_RESTAURANT.location,
      restaurantType: body.restaurantType || BENCHMARK_RESTAURANT.type,
      targetAudience: body.targetAudience || BENCHMARK_RESTAURANT.targetAudience,
      primaryCustomerAction: body.primaryCustomerAction || BENCHMARK_RESTAURANT.primaryAction,
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
 * Fetches the current 7-day plan, or auto-generates if not present
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;
    const goal = (searchParams.get("goal") as BusinessGoalType) || BENCHMARK_RESTAURANT.activeGoal.goal;

    const existing = await getLatestContentPlan(restaurantId);

    if (existing && existing.items.length > 0) {
      return NextResponse.json({
        success: true,
        plan: existing.plan,
        items: existing.items,
      });
    }

    // Auto-generate if no plan exists yet
    let assets = await listContentAssets(restaurantId);
    if (assets.length === 0 && restaurantId === BENCHMARK_RESTAURANT.id) {
      assets = SAMPLE_BENCHMARK_ASSETS;
    }

    const generated = await generateWeeklyContentStrategy({
      restaurantId,
      restaurantName: BENCHMARK_RESTAURANT.name,
      location: BENCHMARK_RESTAURANT.location,
      goal,
      availableAssets: assets,
    });

    await saveContentPlan(generated.plan, generated.items);

    return NextResponse.json({
      success: true,
      plan: generated.plan,
      items: generated.items,
      meta: generated.meta,
    });
  } catch (error: any) {
    console.error("[Strategy API] Fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}
