/**
 * Vercel Blob Client & Server Helper
 * Deployment Team: ischeduleit | Account: ischeduleit@gmail.com
 */

import { put, del, list } from "@vercel/blob";

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition: string;
}

/**
 * Server-side upload helper for server actions / route handlers
 */
export async function uploadToVercelBlob(
  file: File | Blob,
  filename: string,
  options?: { access?: "public" }
): Promise<BlobUploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Clean, sanitized pathname under workspace assets
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `contentpilot/assets/${Date.now()}-${cleanFilename}`;

  const blob = await put(pathname, file, {
    access: options?.access || "public",
    token: token || undefined,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || "application/octet-stream",
    contentDisposition: blob.contentDisposition,
  };
}

/**
 * Delete asset from Vercel Blob
 */
export async function deleteFromVercelBlob(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  await del(url, {
    token: token || undefined,
  });
}

/**
 * List assets in ContentPilot directory
 */
export async function listVercelBlobAssets(prefix = "contentpilot/assets/") {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return await list({
    prefix,
    token: token || undefined,
  });
}
