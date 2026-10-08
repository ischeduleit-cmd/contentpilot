import { NextRequest, NextResponse } from "next/server";
import { listContentAssets } from "@/lib/content-repository";
import { analyzeContentGaps } from "@/lib/gap-analyzer";
import { BENCHMARK_RESTAURANT, SAMPLE_BENCHMARK_ASSETS } from "@/lib/constants";
import { BusinessGoalType } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;
    const goalParam = (searchParams.get("goal") as BusinessGoalType) || BENCHMARK_RESTAURANT.activeGoal.goal;

    // Fetch live assets for the restaurant
    let assets = await listContentAssets(restaurantId);

    // If zero assets uploaded yet, provide benchmark evaluation for immediate demo visibility
    const isUsingDemoBenchmark = assets.length === 0;
    const evaluatedAssets = isUsingDemoBenchmark ? SAMPLE_BENCHMARK_ASSETS : assets;

    const analysis = analyzeContentGaps(evaluatedAssets, goalParam, {
      id: restaurantId,
      name: BENCHMARK_RESTAURANT.name,
      location: BENCHMARK_RESTAURANT.location,
      targetAudience: BENCHMARK_RESTAURANT.targetAudience,
      primaryCustomerAction: BENCHMARK_RESTAURANT.primaryAction,
    });

    return NextResponse.json({
      success: true,
      analysis,
      isDemoData: isUsingDemoBenchmark,
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
