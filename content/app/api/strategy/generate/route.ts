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
import { getRestaurantById } from "@/lib/restaurant-repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/strategy/generate
 * Generates an actionable 7-day restaurant content strategy
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const restaurantId = body.restaurantId || BENCHMARK_RESTAURANT.id;
    const isPublicBenchmark = restaurantId === BENCHMARK_RESTAURANT.id;
    const goal: BusinessGoalType = body.goal || "get_more_orders";
    const weekStart = body.weekStart;

    // Fetch existing media assets from repository
    let assets = await listContentAssets(restaurantId);

    // If public benchmark demo and library is empty, seed with sample benchmark assets
    if (assets.length === 0 && isPublicBenchmark) {
      assets = SAMPLE_BENCHMARK_ASSETS;
    }

    // Lookup real restaurant profile if authenticated
    let realRest = null;
    if (!isPublicBenchmark) {
      realRest = await getRestaurantById(restaurantId);
    }

    const input: StrategyGenerationInput = {
      restaurantId,
      restaurantName: body.restaurantName || realRest?.name || (isPublicBenchmark ? BENCHMARK_RESTAURANT.name : "Your Restaurant"),
      location: body.location || realRest?.location || (isPublicBenchmark ? BENCHMARK_RESTAURANT.location : "Your City"),
      restaurantType: body.restaurantType || realRest?.restaurantType || (isPublicBenchmark ? BENCHMARK_RESTAURANT.type : "restaurant"),
      targetAudience: body.targetAudience || realRest?.targetAudience || (isPublicBenchmark ? BENCHMARK_RESTAURANT.targetAudience : "Local Diners"),
      primaryCustomerAction: body.primaryCustomerAction || realRest?.primaryCustomerAction || (isPublicBenchmark ? BENCHMARK_RESTAURANT.primaryAction : "order_food"),
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
    const isPublicBenchmark = restaurantId === BENCHMARK_RESTAURANT.id;
    const goal = (searchParams.get("goal") as BusinessGoalType) || "get_more_orders";

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
    if (assets.length === 0 && isPublicBenchmark) {
      assets = SAMPLE_BENCHMARK_ASSETS;
    }

    let realRest = null;
    if (!isPublicBenchmark) {
      realRest = await getRestaurantById(restaurantId);
    }

    const generated = await generateWeeklyContentStrategy({
      restaurantId,
      restaurantName: realRest?.name || (isPublicBenchmark ? BENCHMARK_RESTAURANT.name : "Your Restaurant"),
      location: realRest?.location || (isPublicBenchmark ? BENCHMARK_RESTAURANT.location : "Your City"),
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
