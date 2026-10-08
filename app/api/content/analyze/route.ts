import { NextRequest, NextResponse } from "next/server";
import {
  getContentAssetById,
  listContentAssets,
  updateContentAssetRecord,
} from "@/lib/content-repository";
import {
  analyzeContentAsset,
  RestaurantAnalysisContext,
} from "@/lib/ai-analyzer";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";
import { ContentAsset } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const restaurantId: string = body.restaurantId || BENCHMARK_RESTAURANT.id;
    const { assetId, assetIds, allPending, restaurantContext } = body;

    const context: Partial<RestaurantAnalysisContext> = {
      id: restaurantId,
      ...restaurantContext,
    };

    let targetAssets: ContentAsset[] = [];

    if (assetId) {
      // Analyze single asset
      const asset = await getContentAssetById(assetId, restaurantId);
      if (!asset) {
        return NextResponse.json(
          { error: "Asset not found or unauthorized for this workspace" },
          { status: 404 }
        );
      }
      targetAssets = [asset];
    } else if (Array.isArray(assetIds) && assetIds.length > 0) {
      // Analyze specific list of assets
      const allAssets = await listContentAssets(restaurantId);
      targetAssets = allAssets.filter((a) => assetIds.includes(a.id));
    } else {
      // Batch analyze all pending or failed assets
      const allAssets = await listContentAssets(restaurantId);
      if (allPending) {
        targetAssets = allAssets.filter(
          (a) =>
            a.processingStatus === "pending" ||
            a.processingStatus === "failed" ||
            !a.aiDescription
        );
      } else {
        // If nothing specified, analyze all unanalyzed assets, or all if none analyzed
        const unanalyzed = allAssets.filter(
          (a) =>
            a.processingStatus === "pending" ||
            a.processingStatus === "failed" ||
            !a.aiDescription
        );
        targetAssets = unanalyzed.length > 0 ? unanalyzed : allAssets;
      }
    }

    if (targetAssets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending assets require analysis at this time.",
        analyzedCount: 0,
        assets: [],
      });
    }

    const updatedAssets: ContentAsset[] = [];

    for (const asset of targetAssets) {
      try {
        // Mark as analyzing
        await updateContentAssetRecord(asset.id, restaurantId, {
          processingStatus: "analyzing",
        });

        const analysis = await analyzeContentAsset(asset, context);

        const updated = await updateContentAssetRecord(asset.id, restaurantId, {
          aiDescription: analysis.aiDescription,
          contentType: analysis.contentType,
          contentPillar: analysis.contentPillar,
          objective: analysis.objective,
          suggestedPlatform: analysis.suggestedPlatform,
          suggestedAngle: analysis.suggestedAngle,
          confidence: analysis.confidence,
          processingStatus: analysis.processingStatus,
        });

        if (updated) {
          updatedAssets.push(updated);
        }
      } catch (assetErr: any) {
        console.error(`[Analyze API] Error analyzing asset ${asset.id}:`, assetErr);
        const failedUpdate = await updateContentAssetRecord(asset.id, restaurantId, {
          processingStatus: "failed",
        });
        if (failedUpdate) {
          updatedAssets.push(failedUpdate);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully analyzed ${updatedAssets.length} asset${updatedAssets.length === 1 ? "" : "s"}.`,
      analyzedCount: updatedAssets.length,
      assets: updatedAssets,
    });
  } catch (err: any) {
    console.error("[Analyze API Global Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute AI analysis" },
      { status: 500 }
    );
  }
}
