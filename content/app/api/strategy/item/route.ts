import { NextRequest, NextResponse } from "next/server";
import { updateContentPlanItem } from "@/lib/strategy-repository";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/strategy/item
 * Updates an individual plan item (e.g. approve, edit hook/caption/cta, or set status)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { itemId, updates } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    const success = await updateContentPlanItem(itemId, updates || {});

    return NextResponse.json({
      success,
      itemId,
      updates,
    });
  } catch (error: any) {
    console.error("[Strategy Item API] Update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update item" },
      { status: 500 }
    );
  }
}
