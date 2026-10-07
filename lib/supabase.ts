/**
 * Supabase Client & Storage Infrastructure
 * Associated with: ischeduleit-cmd
 * 
 * Strict Security Rules:
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to the client
 * - Storage bucket: 'content-assets' (private with signed URL access)
 * - Path structure: content-assets/{workspace_id}/{asset_id}/original-file.ext
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import https from "https";

export const STORAGE_BUCKET = "content-assets";

/**
 * Custom fetch implementation forcing IPv4 resolution to prevent
 * undici IPv6 connect timeouts on Linux container network bridges
 */
function ipv4HttpsFetch(url: any, options: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url.toString());
    const headers: Record<string, string> = {};

    if (options.headers) {
      if (typeof options.headers.forEach === "function") {
        options.headers.forEach((val: string, key: string) => {
          headers[key] = val;
        });
      } else if (typeof options.headers === "object") {
        Object.assign(headers, options.headers);
      }
    }

    const req = https.request(
      u,
      {
        method: options.method || "GET",
        headers,
        family: 4, // Force IPv4
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            ok: (res.statusCode || 200) >= 200 && (res.statusCode || 200) < 300,
            status: res.statusCode || 200,
            statusText: res.statusMessage || "OK",
            headers: new Headers(res.headers as any),
            text: () => Promise.resolve(buffer.toString("utf-8")),
            json: () => Promise.resolve(JSON.parse(buffer.toString("utf-8"))),
            arrayBuffer: () => Promise.resolve(buffer.buffer),
            blob: () => Promise.resolve(new Blob([buffer])),
          });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      if (Buffer.isBuffer(options.body) || typeof options.body === "string") {
        req.write(options.body);
      } else if (options.body instanceof Uint8Array) {
        req.write(Buffer.from(options.body));
      }
    }

    req.end();
  });
}

/**
 * Validates required Supabase environment variables
 */
export function getSupabaseEnvConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  return {
    url,
    anonKey,
    serviceKey,
    isConfigured: Boolean(url && (serviceKey || anonKey)),
    missing,
  };
}

let serverClientInstance: SupabaseClient | null = null;

/**
 * Server-side Supabase client with administrative / service-role access
 * Only callable in Server Actions or Route Handlers
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseServerClient must not be called from the browser.");
  }

  const { url, serviceKey, anonKey } = getSupabaseEnvConfig();
  if (!url || (!serviceKey && !anonKey)) {
    return null;
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient(url, (serviceKey || anonKey)!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: ipv4HttpsFetch as any,
      },
    });
  }

  return serverClientInstance;
}

/**
 * Client-side Supabase client for browser interactions
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseEnvConfig();
  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

/**
 * Ensure the 'content-assets' private storage bucket exists
 */
export async function ensureStorageBucket(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: buckets, error: getError } = await supabase.storage.listBuckets();
    if (getError) {
      console.warn("[Supabase Storage] List buckets warning:", getError.message);
      return false;
    }

    const exists = buckets?.some((b) => b.name === STORAGE_BUCKET);
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false, // Strict private bucket per security requirements
        fileSizeLimit: 104857600, // 100MB limit
      });
      if (createError) {
        console.warn("[Supabase Storage] Create bucket notice:", createError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn("[Supabase Storage] Bucket check error:", err);
    return false;
  }
}

/**
 * Upload an asset buffer/blob to Supabase Storage
 * Pattern: content-assets/{workspace_id}/{asset_id}/{filename}
 */
export async function uploadAssetToSupabase(params: {
  workspaceId: string;
  assetId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer | Uint8Array;
}): Promise<{ storageKey: string; signedUrl: string } | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  await ensureStorageBucket(supabase);

  // Sanitize filename and create storage key
  const sanitizedFilename = params.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${params.workspaceId}/${params.assetId}/${sanitizedFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageKey, params.buffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  // Generate private signed URL valid for 2 hours (7200s)
  const { data: signedData, error: signError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storageKey, 7200);

  if (signError || !signedData?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${signError?.message || "Unknown error"}`);
  }

  return {
    storageKey,
    signedUrl: signedData.signedUrl,
  };
}

/**
 * Generate a fresh signed URL for an existing storage key
 */
export async function getAssetSignedUrl(storageKey: string, expiresIn = 7200): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storageKey, expiresIn);

  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

/**
 * Delete an object from Supabase Storage
 */
export async function deleteAssetFromSupabase(storageKey: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storageKey]);

  if (error) {
    console.error(`[Supabase Storage] Remove failed for ${storageKey}:`, error.message);
    return false;
  }
  return true;
}
