import { NextRequest, NextResponse } from "next/server";
import { listContentAssets } from "@/lib/content-repository";
import { getSupabaseEnvConfig } from "@/lib/supabase";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;

    const assets = await listContentAssets(restaurantId);

    const photosCount = assets.filter(
      (a) => a.mediaType === "image" || a.mimeType?.startsWith("image/")
    ).length;
    const videosCount = assets.filter(
      (a) => a.mediaType === "video" || a.mimeType?.startsWith("video/")
    ).length;

    const envConfig = getSupabaseEnvConfig();

    return NextResponse.json({
      success: true,
      assets,
      stats: {
        total: assets.length,
        photos: photosCount,
        videos: videosCount,
      },
      supabaseStatus: {
        isConfigured: envConfig.isConfigured,
        missing: envConfig.missing,
      },
    });
  } catch (err: any) {
    console.error("[List Assets Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve content library assets" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const { getContentAssetById, deleteContentAssetRecord } = await import("@/lib/content-repository");
    const { deleteAssetFromSupabase } = await import("@/lib/supabase");

    const existingAsset = await getContentAssetById(id, restaurantId);
    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found or unauthorized for this workspace" },
        { status: 404 }
      );
    }

    if (existingAsset.storageKey) {
      try {
        await deleteAssetFromSupabase(existingAsset.storageKey);
      } catch (storageErr) {
        console.warn("[Delete Asset] Storage removal notice:", storageErr);
      }
    }

    const deleted = await deleteContentAssetRecord(id, restaurantId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to remove asset record from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset and storage object deleted permanently",
      id,
    });
  } catch (err: any) {
    console.error("[Delete Asset Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete asset" },
      { status: 500 }
    );
  }
}

