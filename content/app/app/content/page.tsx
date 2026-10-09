"use client";

import * as React from "react";
import Link from "next/link";
import {
  Upload,
  X,
  Trash2,
  Play,
  AlertCircle,
  RefreshCw,
  Scan,
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Save,
  Check,
  Layers,
  Target,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContentAsset,
  ContentPillar,
  ContentObjective,
  ProcessingStatus,
} from "@/lib/db/schema";
import { CONTENT_PILLARS } from "@/lib/constants";
import { getStoredRestaurantProfile } from "@/lib/onboarding-store";
import { PRD_CONTENT_TYPES } from "@/lib/ai-analyzer";

type FilterType = "all" | "photos" | "videos" | "needs_review";
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

  // AI Analysis states
  const [isAnalyzingBatch, setIsAnalyzingBatch] = React.useState(false);
  const [analyzingAssetId, setAnalyzingAssetId] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<UploadItem[]>([]);
  const [previewAsset, setPreviewAsset] = React.useState<ContentAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = React.useState<ContentAsset | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Editable Form for Preview Asset (Human-in-the-Loop)
  const [editForm, setEditForm] = React.useState({
    aiDescription: "",
    contentType: "Food/product",
    contentPillar: "product" as ContentPillar,
    objective: "conversion" as ContentObjective,
    suggestedPlatform: "both" as "instagram" | "tiktok" | "both",
    suggestedAngle: "",
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [restaurantProfile, setRestaurantProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const profile = getStoredRestaurantProfile();
    setRestaurantProfile(profile);
  }, []);

  const restaurantId = restaurantProfile?.id || "default";

  // Load assets from server API
  const loadAssets = React.useCallback(async () => {
    const currentProfile = getStoredRestaurantProfile();
    const activeRestId = currentProfile?.id || "default";
    try {
      setIsLoading(true);
      const res = await fetch(`/api/content/assets?restaurantId=${activeRestId}`);
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

  // Sync preview asset to editable form
  React.useEffect(() => {
    if (previewAsset) {
      setEditForm({
        aiDescription: previewAsset.aiDescription || "",
        contentType: previewAsset.contentType || "Food/product",
        contentPillar: (previewAsset.contentPillar as ContentPillar) || "product",
        objective: (previewAsset.objective as ContentObjective) || "conversion",
        suggestedPlatform: (previewAsset.suggestedPlatform as "instagram" | "tiktok" | "both") || "both",
        suggestedAngle: previewAsset.suggestedAngle || "",
      });
      setSaveSuccess(false);
    }
  }, [previewAsset]);

  // Counts and stats
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

  const pendingCount = React.useMemo(() => {
    return assets.filter(
      (a) => a.processingStatus === "pending" || a.processingStatus === "failed" || !a.aiDescription
    ).length;
  }, [assets]);

  const needsReviewCount = React.useMemo(() => {
    return assets.filter((a) => a.processingStatus === "needs_review").length;
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
    } else if (filter === "needs_review") {
      result = result.filter((a) => a.processingStatus === "needs_review");
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [assets, filter, sort]);

  // Execute Batch AI Analysis
  const handleBatchAnalyze = async () => {
    try {
      setIsAnalyzingBatch(true);
      const res = await fetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          allPending: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadAssets();
      }
    } catch (err) {
      console.error("Batch AI analysis failed:", err);
    } finally {
      setIsAnalyzingBatch(false);
    }
  };

  // Execute Single Asset AI Analysis
  const handleSingleAnalyze = async (assetId: string) => {
    try {
      setAnalyzingAssetId(assetId);
      const res = await fetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          assetId,
        }),
      });
      const data = await res.json();
      if (data.success && data.assets?.[0]) {
        const updated = data.assets[0];
        setAssets((prev) => prev.map((a) => (a.id === assetId ? updated : a)));
        if (previewAsset?.id === assetId) {
          setPreviewAsset(updated);
        }
      }
    } catch (err) {
      console.error("Single AI analysis failed:", err);
    } finally {
      setAnalyzingAssetId(null);
    }
  };

  // Save Human Edits to Asset (Human-in-the-Loop)
  const handleSaveEdits = async () => {
    if (!previewAsset) return;
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/content/assets/${previewAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          aiDescription: editForm.aiDescription,
          contentType: editForm.contentType,
          contentPillar: editForm.contentPillar,
          objective: editForm.objective,
          suggestedPlatform: editForm.suggestedPlatform,
          suggestedAngle: editForm.suggestedAngle,
          processingStatus: "analyzed", // Manual review marks as analyzed
        }),
      });
      const data = await res.json();
      if (data.success && data.asset) {
        const updated = data.asset;
        setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setPreviewAsset(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save edits:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

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
    newItems.forEach((item) => executeUpload(item));
  };

  const executeUpload = async (item: UploadItem) => {
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("restaurantId", restaurantId);

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
        `/api/content/assets?id=${assetToDelete.id}&restaurantId=${restaurantId}`,
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

  const renderStatusBadge = (asset: ContentAsset) => {
    const isAnalyzing = analyzingAssetId === asset.id || asset.processingStatus === "analyzing";
    if (isAnalyzing) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-blue-950/80 border border-blue-800 text-blue-300">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>Analyzing</span>
        </span>
      );
    }

    if (asset.processingStatus === "analyzed" || (asset.aiDescription && asset.processingStatus !== "needs_review" && asset.processingStatus !== "failed")) {
      const pct = Math.round((asset.confidence || 0.9) * 100);
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span>Analyzed &middot; {pct}%</span>
        </span>
      );
    }

    if (asset.processingStatus === "needs_review") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-amber-950/80 border border-amber-700 text-amber-300">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
          <span>Needs Review</span>
        </span>
      );
    }

    if (asset.processingStatus === "failed") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-red-950/80 border border-red-800 text-red-300">
          <AlertCircle className="w-2.5 h-2.5 text-red-400" />
          <span>Failed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400">
        <Clock className="w-2.5 h-2.5 text-zinc-500" />
        <span>Pending</span>
      </span>
    );
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
              Upload the photos and videos you already have. ContentPilot understands your available footage, visual pillars, and marketing hooks.
            </p>
            {assets.length > 0 && (
              <div className="text-xs font-mono text-zinc-400 pt-1 flex flex-wrap items-center gap-2">
                <span>{assets.length} {assets.length === 1 ? "asset" : "assets"}</span>
                <span>&middot;</span>
                <span>{photosCount} photos</span>
                <span>&middot;</span>
                <span>{videosCount} videos</span>
                {needsReviewCount > 0 && (
                  <>
                    <span>&middot;</span>
                    <span className="text-amber-400 font-semibold">{needsReviewCount} needs review</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch AI Analysis Trigger */}
            <Button
              variant="outline"
              disabled={isAnalyzingBatch || assets.length === 0}
              onClick={handleBatchAnalyze}
              className="font-mono text-xs gap-2 border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-900"
            >
              {isAnalyzingBatch ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Analyzing Library...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 text-zinc-300" />
                  <span>Analyze Library {pendingCount > 0 ? `(${pendingCount})` : ""}</span>
                </>
              )}
            </Button>

            {/* Upload Button */}
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
              Connected to <strong>ischeduleit-cmd</strong> Supabase project. Local fallback store is active for offline development.
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
              {needsReviewCount > 0 && (
                <button
                  onClick={() => setFilter("needs_review")}
                  className={`px-3 py-1 transition-colors ${
                    filter === "needs_review"
                      ? "bg-amber-400 text-black font-semibold"
                      : "text-amber-400 hover:text-amber-300"
                  }`}
                >
                  Needs Review ({needsReviewCount})
                </button>
              )}
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
              {filter === "needs_review"
                ? "No assets currently require review"
                : "Your content library is empty"}
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              {filter === "needs_review"
                ? "All uploaded assets have been successfully analyzed with high confidence."
                : "Upload the photos and videos already on your phone. You don't need to create anything new yet."}
            </p>
            {filter === "needs_review" ? (
              <Button
                variant="outline"
                onClick={() => setFilter("all")}
                className="font-mono text-xs"
              >
                Show All Assets
              </Button>
            ) : (
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
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              const isVideo =
                asset.mediaType === "video" || asset.mimeType?.startsWith("video/");
              const isAnalyzing = analyzingAssetId === asset.id;

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

                    {/* Top Badges: Media Type & Analysis Status */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-black/80 border border-zinc-800 text-zinc-300 backdrop-blur-xs">
                        {isVideo ? "Video" : "Photo"}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      {renderStatusBadge(asset)}
                    </div>

                    {/* Platform Tag */}
                    {asset.suggestedPlatform && (
                      <div className="absolute bottom-2 left-2">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-black/90 border border-zinc-800 text-zinc-300">
                          {asset.suggestedPlatform}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Meta & Strategic Intelligence */}
                  <div className="p-3 space-y-2.5 border-t border-zinc-900 font-mono text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="truncate font-sans font-medium text-white text-xs cursor-pointer hover:underline"
                          title={asset.fileName}
                          onClick={() => setPreviewAsset(asset)}
                        >
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

                      {/* AI Description Snippet */}
                      {asset.aiDescription ? (
                        <p
                          className="text-[11px] font-sans text-zinc-400 line-clamp-2 leading-relaxed cursor-pointer"
                          onClick={() => setPreviewAsset(asset)}
                        >
                          {asset.aiDescription}
                        </p>
                      ) : (
                        <p className="text-[11px] font-sans text-zinc-500 italic">
                          Pending AI marketing analysis...
                        </p>
                      )}

                      {/* Content Pillar & Objective Pills */}
                      {asset.contentPillar && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 capitalize">
                            {asset.contentPillar.replace(/_/g, " ")}
                          </span>
                          {asset.objective && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
                              {asset.objective}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Metadata and Quick Action */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{formatFileSize(asset.fileSize)}</span>

                      <div className="flex items-center gap-2">
                        {(!asset.aiDescription || asset.processingStatus === "pending" || asset.processingStatus === "failed") && (
                          <button
                            onClick={() => handleSingleAnalyze(asset.id)}
                            disabled={isAnalyzing}
                            className="text-zinc-300 hover:text-white font-mono text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Scan className="w-3 h-3 text-zinc-400" />
                            <span>Analyze</span>
                          </button>
                        )}
                        {asset.processingStatus === "needs_review" && (
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            className="text-amber-400 hover:text-amber-300 font-mono text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <span>Review</span>
                          </button>
                        )}
                        <span>{formatDate(asset.createdAt)}</span>
                      </div>
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
      {/* CONTENT PREVIEW & AI ANALYSIS MODAL (Human-in-the-Loop) */}
      {/* ---------------------------------------------------- */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="border border-zinc-800 bg-zinc-950 w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3 truncate pr-4">
                <h3 className="text-sm font-bold text-white truncate font-sans">
                  {previewAsset.fileName}
                </h3>
                {renderStatusBadge(previewAsset)}
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Media Viewer + AI Intelligence Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Media Player Column */}
              <div className="lg:col-span-5 bg-black flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-zinc-800 min-h-[280px]">
                {previewAsset.mediaType === "video" || previewAsset.mimeType?.startsWith("video/") ? (
                  <video
                    src={previewAsset.fileUrl}
                    controls
                    className="max-h-[50vh] max-w-full object-contain shadow-lg"
                  />
                ) : (
                  <img
                    src={previewAsset.fileUrl}
                    alt={previewAsset.fileName}
                    className="max-h-[50vh] max-w-full object-contain shadow-lg"
                  />
                )}

                <div className="w-full mt-4 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-2 font-mono text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Format:</span>
                    <span className="text-zinc-300">{previewAsset.mediaType}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">File Size:</span>
                    <span className="text-zinc-300">{formatFileSize(previewAsset.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Uploaded:</span>
                    <span className="text-zinc-300">{formatDate(previewAsset.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Confidence:</span>
                    <span className="text-zinc-300">
                      {previewAsset.confidence ? `${Math.round(previewAsset.confidence * 100)}%` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Strategic Intelligence Column (Human-in-the-Loop) */}
              <div className="lg:col-span-7 p-5 space-y-4 bg-zinc-950 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-zinc-300" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Content Analysis &amp; Strategy Tags
                      </h4>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={analyzingAssetId === previewAsset.id}
                      onClick={() => handleSingleAnalyze(previewAsset.id)}
                      className="text-[11px] font-mono h-7 gap-1.5 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900"
                    >
                      <RefreshCw className={`w-3 h-3 text-zinc-300 ${analyzingAssetId === previewAsset.id ? "animate-spin" : ""}`} />
                      <span>Re-analyze</span>
                    </Button>
                  </div>

                  {/* Visual Scene Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                      Visual Scene Description
                    </label>
                    <textarea
                      value={editForm.aiDescription}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, aiDescription: e.target.value }))
                      }
                      rows={3}
                      placeholder="Describe what is shown in this asset..."
                      className="w-full bg-black border border-zinc-800 rounded-none p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-zinc-500 font-sans"
                    />
                  </div>

                  {/* Strategic Classifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Content Type */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Content Type
                      </label>
                      <select
                        value={editForm.contentType}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, contentType: e.target.value }))
                        }
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans"
                      >
                        {PRD_CONTENT_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-zinc-950 text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Content Pillar */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Content Pillar
                      </label>
                      <select
                        value={editForm.contentPillar}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            contentPillar: e.target.value as ContentPillar,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans"
                      >
                        {CONTENT_PILLARS.map((p) => (
                          <option key={p.id} value={p.id} className="bg-zinc-950 text-white">
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Marketing Objective */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Marketing Objective
                      </label>
                      <select
                        value={editForm.objective}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            objective: e.target.value as ContentObjective,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans"
                      >
                        <option value="conversion" className="bg-zinc-950 text-white">Conversion (Drive Orders)</option>
                        <option value="trust" className="bg-zinc-950 text-white">Trust (Social Proof)</option>
                        <option value="awareness" className="bg-zinc-950 text-white">Awareness (Reach Diners)</option>
                        <option value="engagement" className="bg-zinc-950 text-white">Engagement (Comments/Shares)</option>
                        <option value="retention" className="bg-zinc-950 text-white">Retention (Loyalty)</option>
                      </select>
                    </div>

                    {/* Suggested Platform */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Suggested Platform
                      </label>
                      <select
                        value={editForm.suggestedPlatform}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            suggestedPlatform: e.target.value as "instagram" | "tiktok" | "both",
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans"
                      >
                        <option value="both" className="bg-zinc-950 text-white">Instagram + TikTok (Both)</option>
                        <option value="instagram" className="bg-zinc-950 text-white">Instagram Only</option>
                        <option value="tiktok" className="bg-zinc-950 text-white">TikTok Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Creative Angle / Marketing Hook */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                      Recommended Strategic Angle / Hook
                    </label>
                    <textarea
                      value={editForm.suggestedAngle}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, suggestedAngle: e.target.value }))
                      }
                      rows={2}
                      placeholder="Suggested marketing angle for weekly strategy..."
                      className="w-full bg-black border border-zinc-800 rounded-none p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-zinc-500 font-sans"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    {saveSuccess && (
                      <span className="text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved to library</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setPreviewAsset(null)}
                      className="font-mono text-xs"
                    >
                      Close
                    </Button>
                    <Button
                      variant="default"
                      disabled={isSavingEdit}
                      onClick={handleSaveEdits}
                      className="font-mono text-xs gap-1.5"
                    >
                      {isSavingEdit ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
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
