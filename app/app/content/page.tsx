"use client";

import * as React from "react";
import Link from "next/link";
import { Upload, X, Trash2, Play, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentAsset } from "@/lib/db/schema";
import { BENCHMARK_RESTAURANT } from "@/lib/constants";

type FilterType = "all" | "photos" | "videos";
type SortType = "newest" | "oldest";

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "uploaded" | "failed";
  errorMessage?: string;
  progress?: number;
}

export default function AppContentPage() {
  const [assets, setAssets] = React.useState<ContentAsset[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [sort, setSort] = React.useState<SortType>("newest");
  const [supabaseConfigured, setSupabaseConfigured] = React.useState(true);
  const [missingEnv, setMissingEnv] = React.useState<string[]>([]);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<UploadItem[]>([]);
  const [previewAsset, setPreviewAsset] = React.useState<ContentAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = React.useState<ContentAsset | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load assets from server API
  const loadAssets = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/content/assets?restaurantId=${BENCHMARK_RESTAURANT.id}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.assets || []);
        if (data.supabaseStatus) {
          setSupabaseConfigured(data.supabaseStatus.isConfigured);
          setMissingEnv(data.supabaseStatus.missing || []);
        }
      }
    } catch (err) {
      console.error("Failed to load content assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Statistics calculation
  const photosCount = React.useMemo(() => {
    return assets.filter(
      (a) => a.mediaType === "image" || a.mimeType?.startsWith("image/")
    ).length;
  }, [assets]);

  const videosCount = React.useMemo(() => {
    return assets.filter(
      (a) => a.mediaType === "video" || a.mimeType?.startsWith("video/")
    ).length;
  }, [assets]);

  // Filtering & Sorting
  const filteredAssets = React.useMemo(() => {
    let result = [...assets];

    if (filter === "photos") {
      result = result.filter(
        (a) => a.mediaType === "image" || a.mimeType?.startsWith("image/")
      );
    } else if (filter === "videos") {
      result = result.filter(
        (a) => a.mediaType === "video" || a.mimeType?.startsWith("video/")
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [assets, filter, sort]);

  // Handle file uploads
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 30,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Upload each file
    newItems.forEach((item) => executeUpload(item));
  };

  const executeUpload = async (item: UploadItem) => {
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("restaurantId", BENCHMARK_RESTAURANT.id);

    try {
      const res = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Upload failed");
      }

      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "uploaded", progress: 100 } : q
        )
      );

      // Refresh live assets
      loadAssets();
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "failed", errorMessage: err.message || "Upload failed" }
            : q
        )
      );
    }
  };

  const retryUpload = (item: UploadItem) => {
    setUploadQueue((prev) =>
      prev.map((q) =>
        q.id === item.id ? { ...q, status: "uploading", errorMessage: undefined } : q
      )
    );
    executeUpload(item);
  };

  // Delete asset
  const executeDelete = async () => {
    if (!assetToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(
        `/api/content/assets?id=${assetToDelete.id}&restaurantId=${BENCHMARK_RESTAURANT.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== assetToDelete.id));
        setAssetToDelete(null);
        if (previewAsset?.id === assetToDelete.id) {
          setPreviewAsset(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete asset:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "Unknown size";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white min-h-[calc(100vh-3.5rem)] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your Content
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Upload the photos and videos you already have. We&apos;ll help you turn them into a strategic content plan.
            </p>
            {assets.length > 0 && (
              <div className="text-xs font-mono text-zinc-400 pt-1">
                {assets.length} {assets.length === 1 ? "asset" : "assets"} &middot; {photosCount} {photosCount === 1 ? "photo" : "photos"} &middot; {videosCount} {videosCount === 1 ? "video" : "videos"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              onClick={() => setIsUploadOpen(true)}
              className="font-mono text-xs gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Content</span>
            </Button>
          </div>
        </div>

        {/* Supabase Environment Notification (if unconfigured) */}
        {!supabaseConfigured && (
          <div className="p-4 border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              <span>Supabase Storage Integration</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              To connect directly to the <strong>ischeduleit-cmd</strong> Supabase project bucket, set the following environment variables in <code>.env.local</code>:
            </p>
            <div className="bg-black p-2.5 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=&quot;ey...&quot;</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=&quot;ey...&quot;</div>
            </div>
            <p className="text-[10px] text-zinc-500">
              Files uploaded locally are stored in the development session registry until Supabase keys are active.
            </p>
          </div>
        )}

        {/* Controls: Filtering and Sorting */}
        {assets.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Filter Tabs */}
            <div className="inline-flex items-center p-1 border border-zinc-800 bg-zinc-950 text-xs font-mono">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 transition-colors ${
                  filter === "all"
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setFilter("photos")}
                className={`px-3 py-1 transition-colors ${
                  filter === "photos"
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Photos ({photosCount})
              </button>
              <button
                onClick={() => setFilter("videos")}
                className={`px-3 py-1 transition-colors ${
                  filter === "videos"
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Videos ({videosCount})
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Sort:</span>
              <button
                onClick={() => setSort("newest")}
                className={`px-2 py-1 border ${
                  sort === "newest"
                    ? "border-zinc-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSort("oldest")}
                className={`px-2 py-1 border ${
                  sort === "oldest"
                    ? "border-zinc-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
        )}

        {/* Content State: Empty vs Grid */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3 font-mono text-xs text-zinc-500">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-zinc-400" />
            <p>Loading your content library...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">
              Your content library is empty
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Upload the photos and videos already on your phone. You don&apos;t need to create anything new yet.
            </p>
            <div className="pt-2">
              <Button
                variant="default"
                onClick={() => setIsUploadOpen(true)}
                className="font-mono text-xs gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              const isVideo =
                asset.mediaType === "video" || asset.mimeType?.startsWith("video/");

              return (
                <div
                  key={asset.id}
                  className="group border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-600 transition-colors"
                >
                  {/* Thumbnail / Media Container */}
                  <div
                    onClick={() => setPreviewAsset(asset)}
                    className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer flex items-center justify-center"
                  >
                    {isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <video
                          src={asset.fileUrl}
                          preload="metadata"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-black/80 border border-zinc-800 text-zinc-300 backdrop-blur-xs">
                        {isVideo ? "Video" : "Photo"}
                      </span>
                    </div>
                  </div>

                  {/* Card Meta & Controls */}
                  <div className="p-3 space-y-2 border-t border-zinc-900 font-mono text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate font-sans font-medium text-white text-xs" title={asset.fileName}>
                        {asset.fileName}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssetToDelete(asset);
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                        title="Delete asset"
                        aria-label="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{formatFileSize(asset.fileSize)}</span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* UPLOAD MODAL */}
      {/* ---------------------------------------------------- */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-zinc-800 bg-zinc-950 w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Upload Content</h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadQueue([]);
                }}
                className="text-zinc-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 transition-colors p-8 text-center cursor-pointer space-y-3 bg-black/50"
            >
              <Upload className="w-8 h-8 mx-auto text-zinc-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  Drop your files here, or <span className="underline">browse</span>
                </p>
                <p className="text-xs text-zinc-400 font-sans">
                  Accepts JPG, JPEG, PNG, WEBP, MP4, MOV, WEBM
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Limit: Up to 15MB for photos &middot; Up to 60MB for videos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>

            {/* Upload Queue Progress */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
                <div className="text-[11px] text-zinc-500 uppercase font-bold">Upload Queue</div>
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 border border-zinc-800 bg-black flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate flex-1">
                      <div className="text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{formatFileSize(item.size)}</div>
                    </div>

                    <div>
                      {item.status === "uploading" && (
                        <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Uploading...</span>
                        </span>
                      )}
                      {item.status === "uploaded" && (
                        <span className="text-white font-medium text-[11px]">
                          Uploaded
                        </span>
                      )}
                      {item.status === "failed" && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 text-[11px]">Upload failed</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => retryUpload(item)}
                            className="text-[10px] py-0.5 px-2 h-auto"
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadQueue([]);
                }}
                className="font-mono text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTENT PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-zinc-800 bg-zinc-950 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="truncate pr-4">
                <h3 className="text-sm font-bold text-white truncate font-sans">
                  {previewAsset.fileName}
                </h3>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Player / Image Viewer */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden p-2">
              {previewAsset.mediaType === "video" || previewAsset.mimeType?.startsWith("video/") ? (
                <video
                  src={previewAsset.fileUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] max-w-full object-contain"
                />
              ) : (
                <img
                  src={previewAsset.fileUrl}
                  alt={previewAsset.fileName}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              )}
            </div>

            {/* Details Footer */}
            <div className="p-4 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-zinc-400">
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">File Name</span>
                <span className="text-white truncate block text-[11px]">{previewAsset.fileName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">File Type</span>
                <span className="text-white uppercase text-[11px]">{previewAsset.mediaType}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">File Size</span>
                <span className="text-white text-[11px]">{formatFileSize(previewAsset.fileSize)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase">Upload Date</span>
                <span className="text-white text-[11px]">{formatDate(previewAsset.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-zinc-800 bg-zinc-950 w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans">
            <h3 className="text-base font-bold text-white">Delete this content?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This will permanently remove the file from your content library.
            </p>
            <div className="pt-4 flex items-center justify-end gap-3 font-mono text-xs">
              <Button
                variant="secondary"
                disabled={isDeleting}
                onClick={() => setAssetToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                disabled={isDeleting}
                onClick={executeDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
