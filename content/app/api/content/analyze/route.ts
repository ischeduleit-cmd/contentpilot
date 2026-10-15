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
import { verifyRestaurantOwner } from "@/lib/supabase";
import { ContentAsset } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customRestaurantId = body.restaurantId;
    const access = await verifyRestaurantOwner(req, customRestaurantId);
    if (!access.user || !access.restaurant) return NextResponse.json({ error: "Workspace access denied." }, { status: access.status });
    const resolvedRestaurantId = access.restaurant.id;
    const { assetId, assetIds, allPending, restaurantContext, frames, assetFrames } = body;

    const context: Partial<RestaurantAnalysisContext> = {
      id: resolvedRestaurantId,
      ...restaurantContext,
    };

    let targetAssets: ContentAsset[] = [];

    if (assetId) {
      // Analyze single asset
      const asset = await getContentAssetById(assetId, resolvedRestaurantId);
      if (!asset) {
        return NextResponse.json(
          { error: "Asset not found or unauthorized for this workspace" },
          { status: 404 }
        );
      }
      targetAssets = [asset];
    } else if (Array.isArray(assetIds) && assetIds.length > 0) {
      // Analyze specific list of assets
      const allAssets = await listContentAssets(resolvedRestaurantId);
      targetAssets = allAssets.filter((a) => assetIds.includes(a.id));
    } else {
      // Batch analyze all pending or failed assets
      const allAssets = await listContentAssets(resolvedRestaurantId);
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
        await updateContentAssetRecord(asset.id, resolvedRestaurantId, {
          processingStatus: "analyzing",
        });

        const targetFrames =
          (assetFrames && Array.isArray(assetFrames[asset.id]) ? assetFrames[asset.id] : undefined) ||
          (assetId && Array.isArray(frames) ? frames : undefined);

        const analysis = await analyzeContentAsset(asset, {
          context,
          frames: targetFrames,
        });

        const updated = await updateContentAssetRecord(asset.id, resolvedRestaurantId, {
          aiDescription: analysis.aiDescription,
          contentType: analysis.contentType,
          contentPillar: analysis.contentPillar,
          objective: analysis.objective,
          suggestedPlatform: analysis.suggestedPlatform,
          suggestedAngle: analysis.suggestedAngle,
          confidence: analysis.confidence,
          processingStatus: analysis.processingStatus,
          contentCategory: analysis.contentCategory,
          validationStatus: analysis.validationStatus,
          rejectionReason: analysis.rejectionReason,
        });

        if (updated) {
          updatedAssets.push(updated);
        }
      } catch (assetErr: any) {
        console.error(`[Analyze API] Error analyzing asset ${asset.id}:`, assetErr);
        const isVideo =
          asset.mediaType === "video" ||
          asset.mimeType?.startsWith("video/") ||
          /\.(mp4|mov|webm)$/i.test(asset.fileName);

        const failedUpdate = await updateContentAssetRecord(asset.id, resolvedRestaurantId, {
          processingStatus: "failed",
          validationStatus: "error",
          rejectionReason: isVideo
            ? "We couldn't analyze this video right now. Please try again."
            : "We couldn't analyze this image right now. Please try again.",
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
