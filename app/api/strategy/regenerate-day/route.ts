import { NextRequest, NextResponse } from "next/server";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";
import { getContentAssetById } from "@/lib/content-repository";
import { updateContentPlanItem } from "@/lib/strategy-repository";
import { regenerateDayStrategy } from "@/lib/strategy-engine";
import { BusinessGoalType } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * POST /api/strategy/regenerate-day
 * Re-prompts the strategy engine to suggest an alternative creative angle
 * using the same assigned asset and preserving weekly context.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      itemId,
      dayOfWeek,
      restaurantId = BENCHMARK_RESTAURANT.id,
      goal = BENCHMARK_RESTAURANT.activeGoal.goal,
      assetId,
      time = "11:30 AM",
      variationIndex = 1,
    } = body;

    if (!itemId || !dayOfWeek) {
      return NextResponse.json(
        { success: false, error: "itemId and dayOfWeek are required" },
        { status: 400 }
      );
    }

    let matchedAsset = null;
    if (assetId) {
      matchedAsset = await getContentAssetById(assetId, restaurantId);
    }

    const { getRestaurantById } = await import("@/lib/restaurant-repository");
    const realRest = restaurantId !== BENCHMARK_RESTAURANT.id ? await getRestaurantById(restaurantId) : null;

    const regenerated = regenerateDayStrategy({
      dayOfWeek,
      pillar: "product",
      objective: "conversion",
      goal: goal as BusinessGoalType,
      restaurantName: body.restaurantName || realRest?.name || (restaurantId === BENCHMARK_RESTAURANT.id ? BENCHMARK_RESTAURANT.name : "Your Restaurant"),
      location: body.location || realRest?.location || (restaurantId === BENCHMARK_RESTAURANT.id ? BENCHMARK_RESTAURANT.location : "Your City"),
      primaryAction: body.primaryCustomerAction || realRest?.primaryCustomerAction || (restaurantId === BENCHMARK_RESTAURANT.id ? BENCHMARK_RESTAURANT.primaryAction : "order_food"),
      matchedAsset,
      time,
      variationIndex,
    });

    const updates = {
      contentAngle: regenerated.contentAngle,
      strategicRationale: regenerated.strategicRationale,
      instagramHook: regenerated.instagramHook,
      instagramCaption: regenerated.instagramCaption,
      instagramCta: regenerated.instagramCta,
      tiktokHook: regenerated.tiktokHook,
      tiktokCaption: regenerated.tiktokCaption,
      tiktokCta: regenerated.tiktokCta,
      instagramAdaptation: regenerated.instagramAdaptation,
      tiktokAdaptation: regenerated.tiktokAdaptation,
    };

    await updateContentPlanItem(itemId, updates);

    return NextResponse.json({
      success: true,
      itemId,
      updates,
    });
  } catch (error: any) {
    console.error("[Regenerate Day API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to regenerate day strategy" },
      { status: 500 }
    );
  }
}
