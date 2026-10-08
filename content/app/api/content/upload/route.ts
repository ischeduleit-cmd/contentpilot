import { NextRequest, NextResponse } from "next/server";
import { uploadAssetToSupabase, getSupabaseEnvConfig } from "@/lib/supabase";
import { insertContentAsset } from "@/lib/content-repository";
import { ContentAsset, MediaType } from "@/lib/db/schema";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";

// Accepted MIME types per requirement
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024; // 60MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customRestaurantId = (formData.get("restaurantId") as string) || BENCHMARK_RESTAURANT.id;

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const filename = file.name || `upload-${Date.now()}`;
    const fileSize = file.size;

    const isImage = ACCEPTED_IMAGE_TYPES.includes(mimeType) || /\.(jpe?g|png|webp)$/i.test(filename);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(mimeType) || /\.(mp4|mov|webm)$/i.test(filename);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Accepted formats: JPG, JPEG, PNG, WEBP, MP4, MOV, WEBM.",
        },
        { status: 400 }
      );
    }

    // Size limit verification
    const limit = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (fileSize > limit) {
      return NextResponse.json(
        {
          error: `File exceeds maximum allowed size of ${isVideo ? "60MB" : "15MB"}.`,
        },
        { status: 400 }
      );
    }

    const assetId = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let storageKey = `${customRestaurantId}/${assetId}/${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    let fileUrl = "";

    const envConfig = getSupabaseEnvConfig();

    if (envConfig.isConfigured) {
      const uploadRes = await uploadAssetToSupabase({
        workspaceId: customRestaurantId,
        assetId,
        filename,
        mimeType,
        buffer,
      });

      if (uploadRes) {
        storageKey = uploadRes.storageKey;
        fileUrl = uploadRes.signedUrl;
      }
    } else {
      // In development when Supabase env keys are pending, use base64 data preview URL
      const base64Data = buffer.toString("base64");
      fileUrl = `data:${mimeType};base64,${base64Data}`;
    }

    const newAsset: ContentAsset = {
      id: assetId,
      restaurantId: customRestaurantId,
      fileUrl,
      fileName: filename,
      mediaType: isVideo ? "video" : "image",
      mimeType,
      fileSize,
      storageKey,
      uploadStatus: "uploaded",
      processingStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedAsset = await insertContentAsset(newAsset);

    return NextResponse.json({
      success: true,
      asset: savedAsset,
      supabaseConnected: envConfig.isConfigured,
      missingEnv: envConfig.missing,
    });
  } catch (error: any) {
    console.error("[Upload Route Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process content upload" },
      { status: 500 }
    );
  }
}
