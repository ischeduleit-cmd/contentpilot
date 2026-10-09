import { NextRequest, NextResponse } from "next/server";
import { listContentAssets } from "@/lib/content-repository";
import { analyzeContentGaps } from "@/lib/gap-analyzer";
import { BENCHMARK_RESTAURANT, SAMPLE_BENCHMARK_ASSETS } from "@/lib/constants";
import { BusinessGoalType } from "@/lib/db/schema";
import { getRestaurantById } from "@/lib/restaurant-repository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;
    const goalParam = (searchParams.get("goal") as BusinessGoalType) || "get_more_orders";

    // Fetch live assets for the restaurant
    let assets = await listContentAssets(restaurantId);

    const isPublicBenchmark = restaurantId === BENCHMARK_RESTAURANT.id;
    let evaluatedAssets = assets;
    let restaurantContext: any = null;

    if (isPublicBenchmark) {
      // Benchmark demo on public landing page
      evaluatedAssets = assets.length > 0 ? assets : SAMPLE_BENCHMARK_ASSETS;
      restaurantContext = {
        id: BENCHMARK_RESTAURANT.id,
        name: BENCHMARK_RESTAURANT.name,
        location: BENCHMARK_RESTAURANT.location,
        targetAudience: BENCHMARK_RESTAURANT.targetAudience,
        primaryCustomerAction: BENCHMARK_RESTAURANT.primaryAction,
      };
    } else {
      // Authenticated user restaurant: strictly use their own restaurant and assets
      const realRest = await getRestaurantById(restaurantId);
      restaurantContext = {
        id: restaurantId,
        name: realRest?.name || "Your Restaurant",
        location: realRest?.location || "Your City",
        targetAudience: realRest?.targetAudience || "Local Diners",
        primaryCustomerAction: realRest?.primaryCustomerAction || "order_food",
      };
    }

    const analysis = analyzeContentGaps(evaluatedAssets, goalParam, restaurantContext);

    return NextResponse.json({
      success: true,
      analysis,
      isDemoData: isPublicBenchmark && assets.length === 0,
      realAssetsCount: assets.length,
    });
  } catch (err: any) {
    console.error("[Gap Analysis API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute content gap analysis" },
      { status: 500 }
    );
  }
}
