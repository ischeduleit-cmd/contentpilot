import { NextRequest, NextResponse } from "next/server";
import { getContentAssetById, deleteContentAssetRecord } from "@/lib/content-repository";
import { deleteAssetFromSupabase } from "@/lib/supabase";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId") || BENCHMARK_RESTAURANT.id;

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    // Verify ownership at backend level
    const existingAsset = await getContentAssetById(id, restaurantId);
    if (!existingAsset) {
      return NextResponse.json(
        { error: "Asset not found or unauthorized for this workspace" },
        { status: 404 }
      );
    }

    // 1. Delete from Supabase Storage if storageKey exists
    if (existingAsset.storageKey) {
      try {
        await deleteAssetFromSupabase(existingAsset.storageKey);
      } catch (storageErr) {
        console.warn("[Delete Asset] Storage removal notice:", storageErr);
      }
    }

    // 2. Delete from database metadata
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
