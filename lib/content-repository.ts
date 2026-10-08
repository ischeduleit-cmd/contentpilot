/**
 * Content Assets Repository
 * Interacts with Supabase PostgreSQL content_assets table
 * Includes persistent disk fallback for development when credentials are in transit
 */

import fs from "fs";
import path from "path";
import { ContentAsset } from "./db/schema";
import { getSupabaseServerClient, getAssetSignedUrl } from "./supabase";

const DEV_STORAGE_FILE = path.join(process.cwd(), ".dev-assets.json");

function readDevAssets(): Map<string, ContentAsset> {
  try {
    if (fs.existsSync(DEV_STORAGE_FILE)) {
      const raw = fs.readFileSync(DEV_STORAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      return new Map(Object.entries(data));
    }
  } catch (err) {
    console.warn("[Dev Assets] Read notice:", err);
  }
  return new Map();
}

function writeDevAssets(map: Map<string, ContentAsset>) {
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(DEV_STORAGE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Dev Assets] Write notice:", err);
  }
}

/**
 * Fetch all content assets for a specific restaurant/workspace
 * Scoped strictly by restaurantId to enforce data ownership
 */
export async function listContentAssets(restaurantId: string): Promise<ContentAsset[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("content_assets")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Refresh signed URLs if storageKey is present
        const assetsWithSignedUrls = await Promise.all(
          data.map(async (row) => {
            let currentUrl = row.file_url;
            if (row.storage_key) {
              const freshSigned = await getAssetSignedUrl(row.storage_key, 7200);
              if (freshSigned) currentUrl = freshSigned;
            }
            return {
              id: row.id,
              restaurantId: row.restaurant_id,
              fileUrl: currentUrl,
              fileName: row.file_name,
              mediaType: row.media_type,
              mimeType: row.mime_type,
              fileSize: Number(row.file_size) || 0,
              storageKey: row.storage_key,
              uploadStatus: row.upload_status || "uploaded",
              aiDescription: row.ai_description,
              contentType: row.content_type,
              contentPillar: row.content_pillar,
              objective: row.objective,
              suggestedPlatform: row.suggested_platform,
              suggestedAngle: row.suggested_angle,
              confidence: Number(row.confidence) || 0.9,
              processingStatus: row.processing_status || "pending",
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            } as ContentAsset;
          })
        );
        return assetsWithSignedUrls;
      }
    } catch (dbErr) {
      console.warn("[Content Repository] Supabase query notice:", dbErr);
    }
  }

  // Fallback to disk store scoped to restaurantId
  const store = readDevAssets();
  return Array.from(store.values())
    .filter((a) => a.restaurantId === restaurantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Insert a new content asset record into database
 */
export async function insertContentAsset(asset: ContentAsset): Promise<ContentAsset> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("content_assets")
        .insert({
          id: asset.id,
          restaurant_id: asset.restaurantId,
          file_url: asset.fileUrl,
          file_name: asset.fileName,
          media_type: asset.mediaType,
          mime_type: asset.mimeType,
          file_size: asset.fileSize,
          storage_key: asset.storageKey,
          upload_status: asset.uploadStatus || "uploaded",
          processing_status: asset.processingStatus || "pending",
          created_at: asset.createdAt,
          updated_at: asset.updatedAt || asset.createdAt,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          restaurantId: data.restaurant_id,
          fileUrl: data.file_url,
          fileName: data.file_name,
          mediaType: data.media_type,
          mimeType: data.mime_type,
          fileSize: Number(data.file_size) || 0,
          storageKey: data.storage_key,
          uploadStatus: data.upload_status,
          processingStatus: data.processing_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as ContentAsset;
      }
    } catch (dbErr) {
      console.warn("[Content Repository] Supabase insert notice:", dbErr);
    }
  }

  // Save to persistent disk fallback
  const store = readDevAssets();
  store.set(asset.id, asset);
  writeDevAssets(store);
  return asset;
}

/**
 * Retrieve a single asset by ID, ensuring strict restaurant ownership
 */
export async function getContentAssetById(id: string, restaurantId: string): Promise<ContentAsset | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("content_assets")
        .select("*")
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .single();

      if (!error && data) {
        let currentUrl = data.file_url;
        if (data.storage_key) {
          const freshSigned = await getAssetSignedUrl(data.storage_key, 7200);
          if (freshSigned) currentUrl = freshSigned;
        }
        return {
          id: data.id,
          restaurantId: data.restaurant_id,
          fileUrl: currentUrl,
          fileName: data.file_name,
          mediaType: data.media_type,
          mimeType: data.mime_type,
          fileSize: Number(data.file_size) || 0,
          storageKey: data.storage_key,
          uploadStatus: data.upload_status,
          aiDescription: data.ai_description,
          contentType: data.content_type,
          contentPillar: data.content_pillar,
          objective: data.objective,
          suggestedPlatform: data.suggested_platform,
          suggestedAngle: data.suggested_angle,
          confidence: Number(data.confidence) || 0.9,
          processingStatus: data.processing_status || "pending",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as ContentAsset;
      }
    } catch (err) {
      console.warn("[Content Repository] Supabase get error:", err);
    }
  }

  const store = readDevAssets();
  const found = store.get(id);
  if (found && found.restaurantId === restaurantId) {
    return found;
  }
  return null;
}

/**
 * Update a content asset record, scoped to restaurantId
 */
export async function updateContentAssetRecord(
  id: string,
  restaurantId: string,
  updates: Partial<ContentAsset>
): Promise<ContentAsset | null> {
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: now,
      };

      if (updates.aiDescription !== undefined) dbUpdates.ai_description = updates.aiDescription;
      if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
      if (updates.contentPillar !== undefined) dbUpdates.content_pillar = updates.contentPillar;
      if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
      if (updates.suggestedPlatform !== undefined) dbUpdates.suggested_platform = updates.suggestedPlatform;
      if (updates.suggestedAngle !== undefined) dbUpdates.suggested_angle = updates.suggestedAngle;
      if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
      if (updates.processingStatus !== undefined) dbUpdates.processing_status = updates.processingStatus;
      if (updates.uploadStatus !== undefined) dbUpdates.upload_status = updates.uploadStatus;

      const { data, error } = await supabase
        .from("content_assets")
        .update(dbUpdates)
        .eq("id", id)
        .eq("restaurant_id", restaurantId)
        .select()
        .single();

      if (!error && data) {
        let currentUrl = data.file_url;
        if (data.storage_key) {
          const freshSigned = await getAssetSignedUrl(data.storage_key, 7200);
          if (freshSigned) currentUrl = freshSigned;
        }

        const updated: ContentAsset = {
          id: data.id,
          restaurantId: data.restaurant_id,
          fileUrl: currentUrl,
          fileName: data.file_name,
          mediaType: data.media_type,
          mimeType: data.mime_type,
          fileSize: Number(data.file_size) || 0,
          storageKey: data.storage_key,
          uploadStatus: data.upload_status,
          aiDescription: data.ai_description,
          contentType: data.content_type,
          contentPillar: data.content_pillar,
          objective: data.objective,
          suggestedPlatform: data.suggested_platform,
          suggestedAngle: data.suggested_angle,
          confidence: Number(data.confidence) || 0.9,
          processingStatus: data.processing_status || "pending",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        const store = readDevAssets();
        store.set(id, updated);
        writeDevAssets(store);
        return updated;
      }
    } catch (err) {
      console.warn("[Content Repository] Supabase update notice:", err);
    }
  }

  // Fallback to disk store
  const store = readDevAssets();
  const existing = store.get(id);
  if (existing && existing.restaurantId === restaurantId) {
    const updated: ContentAsset = {
      ...existing,
      ...updates,
      updatedAt: now,
    };
    store.set(id, updated);
    writeDevAssets(store);
    return updated;
  }

  return null;
}

/**
 * Delete a content asset record, scoped to restaurantId
 */
export async function deleteContentAssetRecord(id: string, restaurantId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from("content_assets")
        .delete()
        .eq("id", id)
        .eq("restaurant_id", restaurantId);

      if (!error) {
        const store = readDevAssets();
        store.delete(id);
        writeDevAssets(store);
        return true;
      }
    } catch (err) {
      console.warn("[Content Repository] Supabase delete notice:", err);
    }
  }

  const store = readDevAssets();
  if (store.has(id)) {
    const item = store.get(id);
    if (item?.restaurantId === restaurantId) {
      store.delete(id);
      writeDevAssets(store);
      return true;
    }
  }
  return false;
}
