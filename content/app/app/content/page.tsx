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
import { getStoredRestaurantProfile, saveStoredRestaurantProfile } from "@/lib/onboarding-store";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { PRD_CONTENT_TYPES, VALIDATION_MESSAGES } from "@/lib/ai-analyzer";

type FilterType = "all" | "photos" | "videos" | "needs_review" | "rejected";
type SortType = "newest" | "oldest";

async function extractVideoFramesFromUrl(fileUrl: string): Promise<string[]> {
  if (typeof window === "undefined" || !fileUrl) return [];
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.src = fileUrl;

      const timeout = setTimeout(() => {
        resolve([]);
      }, 5000);

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        if (!duration || duration <= 0 || isNaN(duration)) {
          clearTimeout(timeout);
          resolve([]);
          return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const width = Math.min(640, video.videoWidth || 640);
        const height = Math.round((width / (video.videoWidth || 640)) * (video.videoHeight || 360));
        canvas.width = width;
        canvas.height = height;

        const timestamps = [duration * 0.2, duration * 0.5, duration * 0.8];
        const frames: string[] = [];

        for (const t of timestamps) {
          try {
            await new Promise<void>((resSeek) => {
              const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                if (ctx) {
                  ctx.drawImage(video, 0, 0, width, height);
                  frames.push(canvas.toDataURL("image/jpeg", 0.65));
                }
                resSeek();
              };
              video.addEventListener("seeked", onSeeked);
              video.currentTime = Math.min(t, duration - 0.1);
            });
          } catch {
            // seek error fallback
          }
        }
        clearTimeout(timeout);
        resolve(frames);
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve([]);
      };
    } catch {
      resolve([]);
    }
  });
}

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
  const [supabaseConfigured, setSupabaseConfigured] = React.useState<boolean | null>(null);
  const [missingEnv, setMissingEnv] = React.useState<string[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);

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

  const isPreviewRejected = Boolean(
    previewAsset &&
      (previewAsset.validationStatus === "rejected" || previewAsset.processingStatus === "rejected")
  );
  const isPreviewNeedsReview = Boolean(
    previewAsset &&
      (previewAsset.validationStatus === "uncertain" || previewAsset.processingStatus === "needs_review")
  );
  const isPreviewAlert = isPreviewRejected || isPreviewNeedsReview;

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

  const restaurantId = restaurantProfile?.id && restaurantProfile.id !== "default" ? restaurantProfile.id : (getStoredRestaurantProfile()?.id || "");

  // Load assets from server API
  const loadAssets = React.useCallback(async () => {
    const currentProfile = getStoredRestaurantProfile();
    const activeRestId = currentProfile?.id && currentProfile.id !== "default" ? currentProfile.id : "";
    try {
      setIsLoading(true);
      setLoadError(null);
      const query = activeRestId ? `?restaurantId=${encodeURIComponent(activeRestId)}` : "";
      const res = await authenticatedFetch(`/api/content/assets${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.error?.toLowerCase().includes("access denied") || res.status === 403) {
          setAssets([]);
          setLoadError(null);
          return;
        }
        throw new Error(data.error || "The content library could not be loaded.");
      }
      setAssets(data.assets || []);
      if (data.restaurant) {
        setRestaurantProfile(data.restaurant);
        saveStoredRestaurantProfile(data.restaurant);
      }
      if (data.supabaseStatus) {
        setSupabaseConfigured(data.supabaseStatus.isConfigured);
        setMissingEnv(data.supabaseStatus.missing || []);
      }
    } catch (err) {
      console.error("Failed to load content assets:", err);
      setLoadError(err instanceof Error ? err.message : "The content library could not be loaded.");
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
    return assets.filter(
      (a) => a.processingStatus === "needs_review" || a.validationStatus === "uncertain"
    ).length;
  }, [assets]);

  const rejectedCount = React.useMemo(() => {
    return assets.filter(
      (a) => a.validationStatus === "rejected" || a.processingStatus === "rejected"
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
    } else if (filter === "needs_review") {
      result = result.filter(
        (a) => a.processingStatus === "needs_review" || a.validationStatus === "uncertain"
      );
    } else if (filter === "rejected") {
      result = result.filter(
        (a) => a.validationStatus === "rejected" || a.processingStatus === "rejected"
      );
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

      // Pre-extract representative frames for pending video assets
      const pendingVideos = assets.filter(
        (a) =>
          (a.processingStatus === "pending" || a.processingStatus === "failed" || !a.aiDescription) &&
          (a.mediaType === "video" || a.mimeType?.startsWith("video/"))
      );

      const assetFrames: Record<string, string[]> = {};
      for (const videoAsset of pendingVideos) {
        try {
          const frames = await extractVideoFramesFromUrl(videoAsset.fileUrl);
          if (frames && frames.length > 0) {
            assetFrames[videoAsset.id] = frames;
          }
        } catch {
          // proceed gracefully
        }
      }

      const res = await authenticatedFetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          allPending: true,
          assetFrames: Object.keys(assetFrames).length > 0 ? assetFrames : undefined,
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
      const target = assets.find((a) => a.id === assetId) || (previewAsset?.id === assetId ? previewAsset : null);
      let frames: string[] | undefined = undefined;

      // For video analysis, sample representative frames across duration
      if (target && (target.mediaType === "video" || target.mimeType?.startsWith("video/"))) {
        frames = await extractVideoFramesFromUrl(target.fileUrl);
      }

      const res = await authenticatedFetch("/api/content/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          assetId,
          frames,
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
      const res = await authenticatedFetch(`/api/content/assets/${previewAsset.id}`, {
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
          validationStatus: "valid",
          rejectionReason: "",
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
    const activeRestId = restaurantProfile?.id || getStoredRestaurantProfile()?.id;
    if (activeRestId && activeRestId !== "default") {
      formData.append("restaurantId", activeRestId);
    }

    try {
      const res = await authenticatedFetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Upload failed");
      }

      if (json.restaurant) {
        setRestaurantProfile(json.restaurant);
        saveStoredRestaurantProfile(json.restaurant);
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
    const targetId = assetToDelete.id;
    const targetRestId = assetToDelete.restaurantId || restaurantId;
    try {
      setIsDeleting(true);
      // Primary delete attempt via query param
      const res = await authenticatedFetch(
        `/api/content/assets?id=${encodeURIComponent(targetId)}&restaurantId=${encodeURIComponent(targetRestId)}`,
        { method: "DELETE" }
      );

      if (res.ok || res.status === 404) {
        setAssets((prev) => prev.filter((a) => a.id !== targetId));
        setAssetToDelete(null);
        if (previewAsset?.id === targetId) {
          setPreviewAsset(null);
        }
        return;
      }

      // Fallback delete attempt via path param
      const fallbackRes = await authenticatedFetch(
        `/api/content/assets/${encodeURIComponent(targetId)}?restaurantId=${encodeURIComponent(targetRestId)}`,
        { method: "DELETE" }
      );

      if (fallbackRes.ok || fallbackRes.status === 404) {
        setAssets((prev) => prev.filter((a) => a.id !== targetId));
        setAssetToDelete(null);
        if (previewAsset?.id === targetId) {
          setPreviewAsset(null);
        }
        return;
      }

      // Ensure client UI removes item so user is never blocked
      setAssets((prev) => prev.filter((a) => a.id !== targetId));
      setAssetToDelete(null);
      if (previewAsset?.id === targetId) {
        setPreviewAsset(null);
      }
    } catch (err) {
      console.error("Failed to delete asset:", err);
      setAssets((prev) => prev.filter((a) => a.id !== targetId));
      setAssetToDelete(null);
      if (previewAsset?.id === targetId) {
        setPreviewAsset(null);
      }
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
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-black/95 border border-blue-500/70 text-white rounded-xs shadow-sm backdrop-blur-md"
          style={{ color: "#ffffff" }}
        >
          <RefreshCw className="w-3 h-3 animate-spin text-blue-400 shrink-0" />
          <span style={{ color: "#ffffff" }}>Analyzing</span>
        </span>
      );
    }

    if (asset.validationStatus === "rejected" || asset.processingStatus === "rejected") {
      return (
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 bg-[#b9513a] text-white rounded-xs shadow-[0_2px_8px_rgba(185,81,58,0.35)] backdrop-blur-md"
          style={{ backgroundColor: "#b9513a", color: "#ffffff" }}
        >
          <AlertCircle className="w-3.5 h-3.5 text-white shrink-0" />
          <span style={{ color: "#ffffff" }}>Rejected</span>
        </span>
      );
    }

    if (
      asset.processingStatus === "analyzed" ||
      (asset.aiDescription &&
        asset.processingStatus !== "needs_review" &&
        asset.processingStatus !== "failed")
    ) {
      const pct = Math.round((asset.confidence || 0.9) * 100);
      return (
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-black/95 border border-emerald-500/70 text-white rounded-xs shadow-sm backdrop-blur-md"
          style={{ color: "#ffffff" }}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span style={{ color: "#ffffff" }}>Analyzed {pct}%</span>
        </span>
      );
    }

    if (asset.processingStatus === "needs_review" || asset.validationStatus === "uncertain") {
      return (
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 bg-[#b9513a] text-white rounded-xs shadow-[0_2px_8px_rgba(185,81,58,0.35)] backdrop-blur-md"
          style={{ backgroundColor: "#b9513a", color: "#ffffff" }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
          <span style={{ color: "#ffffff" }}>Needs Review</span>
        </span>
      );
    }

    if (asset.processingStatus === "failed") {
      return (
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 bg-[#b9513a] text-white rounded-xs shadow-[0_2px_8px_rgba(185,81,58,0.35)] backdrop-blur-md"
          style={{ backgroundColor: "#b9513a", color: "#ffffff" }}
        >
          <AlertCircle className="w-3.5 h-3.5 text-white shrink-0" />
          <span style={{ color: "#ffffff" }}>Failed</span>
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-black/95 border border-zinc-700 text-white rounded-xs shadow-sm backdrop-blur-md"
        style={{ color: "#ffffff" }}
      >
        <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
        <span style={{ color: "#ffffff" }}>Pending</span>
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
                    <span className="text-[#b9513a] font-bold">{needsReviewCount} needs review</span>
                  </>
                )}
                {rejectedCount > 0 && (
                  <>
                    <span>&middot;</span>
                    <span className="text-[#b9513a] font-bold">{rejectedCount} rejected</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch AI Analysis Trigger */}
            <Button
              variant="default"
              disabled={isAnalyzingBatch || assets.length === 0}
              onClick={handleBatchAnalyze}
              className="font-mono text-xs gap-2"
            >
              {isAnalyzingBatch ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Library...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
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
        {supabaseConfigured === false && (
          <div className="p-4 border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              <span>Cloud storage is not configured</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Your workspace is using the available local fallback. Configure the server storage credentials to keep uploads in cloud storage.{missingEnv.length > 0 ? ` Missing settings: ${missingEnv.join(", ")}.` : ""}
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
                aria-pressed={filter === "all"}
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
                aria-pressed={filter === "photos"}
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
                aria-pressed={filter === "videos"}
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
                  aria-pressed={filter === "needs_review"}
                  className={`px-3 py-1 transition-colors ${
                    filter === "needs_review"
                      ? "bg-[#b9513a] text-white font-bold shadow-xs"
                      : "text-[#b9513a] hover:text-[#e06346] font-semibold"
                  }`}
                  style={filter === "needs_review" ? { backgroundColor: "#b9513a", color: "#ffffff" } : undefined}
                >
                  Needs Review ({needsReviewCount})
                </button>
              )}
              {rejectedCount > 0 && (
                <button
                  onClick={() => setFilter("rejected")}
                  aria-pressed={filter === "rejected"}
                  className={`px-3 py-1 transition-colors ${
                    filter === "rejected"
                      ? "bg-[#b9513a] text-white font-bold shadow-xs"
                      : "text-[#b9513a] hover:text-[#e06346] font-semibold"
                  }`}
                  style={filter === "rejected" ? { backgroundColor: "#b9513a", color: "#ffffff" } : undefined}
                >
                  Rejected ({rejectedCount})
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Sort:</span>
              <button
                onClick={() => setSort("newest")}
                aria-pressed={sort === "newest"}
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
                aria-pressed={sort === "oldest"}
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
        ) : loadError ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4 rounded-xl">
            <h2 className="text-xl font-bold text-white">
              Ready to power your social channels? Add your restaurant's first content
            </h2>
            <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
              Your new workspace is all set. Upload the photos and videos already on your phone — signature dishes, behind-the-scenes clips, and dining moments — and let ContentPilot turn them into customer-ready posts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="default"
                onClick={() => setIsUploadOpen(true)}
                className="font-mono text-xs gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </Button>
              <Button
                variant="outline"
                onClick={loadAssets}
                className="font-mono text-xs"
              >
                Refresh Workspace
              </Button>
            </div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4 rounded-xl">
            <h2 className="text-xl font-bold text-white">
              {filter === "needs_review"
                ? "No assets currently require review"
                : filter === "rejected"
                ? "No rejected assets"
                : "Welcome to your new content workspace"}
            </h2>
            <p className="text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
              {filter === "needs_review"
                ? "All uploaded assets have been successfully analyzed with high confidence."
                : filter === "rejected"
                ? "All uploads are valid and relevant to your restaurant marketing strategy."
                : "Your workspace is ready. Upload the photos and videos already on your phone so ContentPilot can craft high-converting posts for your restaurant."}
            </p>
            {filter === "needs_review" || filter === "rejected" ? (
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
              const isRejected = asset.validationStatus === "rejected" || asset.processingStatus === "rejected";
              const isNeedsReview = asset.validationStatus === "uncertain" || asset.processingStatus === "needs_review";

              return (
                <div
                  key={asset.id}
                  className={`group border flex flex-col justify-between transition-colors ${
                    isRejected || isNeedsReview
                      ? "border-2 border-[#b9513a] bg-[#140b09] shadow-[0_0_24px_rgba(185,81,58,0.22)]"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                  }`}
                >
                  {/* Thumbnail / Media Container */}
                  <button
                    type="button"
                    aria-label={`Preview ${asset.fileName}`}
                    onClick={() => setPreviewAsset(asset)}
                    className="relative aspect-[4/3] w-full border-0 bg-black p-0 overflow-hidden cursor-pointer flex items-center justify-center"
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
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                      <span
                        className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase px-2 py-0.5 bg-black/95 border border-zinc-700 text-white rounded-xs shadow-sm backdrop-blur-md"
                        style={{ color: "#ffffff" }}
                      >
                        <span style={{ color: "#ffffff" }}>{isVideo ? "Video" : "Photo"}</span>
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      {renderStatusBadge(asset)}
                    </div>

                    {/* Platform Tag */}
                    {asset.validationStatus !== "rejected" &&
                      asset.processingStatus !== "rejected" &&
                      asset.suggestedPlatform && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span
                            className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase px-2 py-0.5 bg-black/95 border border-zinc-700 text-white rounded-xs shadow-sm backdrop-blur-md"
                            style={{ color: "#ffffff" }}
                          >
                            <span style={{ color: "#ffffff" }}>{asset.suggestedPlatform}</span>
                          </span>
                        </div>
                      )}
                  </button>

                  {/* Card Meta & Strategic Intelligence */}
                  <div className="p-3 space-y-2.5 border-t border-zinc-900 font-mono text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className={`max-w-full truncate text-left font-mono text-xs cursor-pointer transition-colors ${
                            isRejected || isNeedsReview
                              ? "border border-[#b9513a]/60 bg-[#1c0f0d] px-2.5 py-1 rounded-xs font-bold text-white hover:border-[#b9513a] hover:bg-[#251310] shadow-xs"
                              : "border-0 bg-transparent p-0 font-sans font-medium text-white hover:underline"
                          }`}
                          style={{
                            color: "#ffffff",
                            backgroundColor: isRejected || isNeedsReview ? "#1c0f0d" : "transparent",
                          }}
                          title={asset.fileName}
                          onClick={() => setPreviewAsset(asset)}
                        >
                          <span style={{ color: "#ffffff" }}>{asset.fileName}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setAssetToDelete(asset);
                          }}
                          className="text-zinc-400 hover:text-[#b9513a] hover:bg-zinc-800/80 transition-colors p-1.5 rounded cursor-pointer shrink-0 z-10"
                          title="Delete asset"
                          aria-label="Delete asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* AI Description Snippet / Rejection Notice */}
                      {asset.validationStatus === "rejected" || asset.processingStatus === "rejected" ? (
                        <div className="p-2.5 rounded-md border border-[#b9513a] bg-[#1a0f0d] shadow-sm space-y-1.5">
                          <div className="flex items-center gap-1.5 text-white">
                            <AlertCircle className="w-3.5 h-3.5 text-[#b9513a] shrink-0" />
                            <span className="font-sans font-bold text-[11px] text-white leading-tight" style={{ color: "#ffffff" }}>
                              Content Unsuitable for Restaurant Marketing
                            </span>
                          </div>
                          <p className="text-[11px] font-sans leading-relaxed" style={{ color: "#f7f4ec" }}>
                            {asset.rejectionReason || VALIDATION_MESSAGES.NON_FOOD_REJECTED}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setAssetToDelete(asset);
                            }}
                            className="mt-1 w-full py-1.5 px-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-[10px] font-bold rounded-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                            <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                          </button>
                        </div>
                      ) : asset.validationStatus === "uncertain" || (asset.processingStatus === "needs_review" && asset.rejectionReason) ? (
                        <div
                          className="p-2.5 border border-[#b9513a] rounded-xs space-y-1.5 shadow-sm"
                          style={{ backgroundColor: "#1a0f0d" }}
                        >
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#b9513a] shrink-0" />
                            <span
                              className="font-bold text-[11px] font-sans tracking-tight"
                              style={{ color: "#ffffff" }}
                            >
                              Uncertain Content Classification
                            </span>
                          </div>
                          <p className="text-[11px] font-sans leading-relaxed" style={{ color: "#f7f4ec" }}>
                            {asset.rejectionReason || VALIDATION_MESSAGES.UNCERTAIN}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setAssetToDelete(asset);
                            }}
                            className="mt-1 w-full py-1.5 px-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-[10px] font-bold rounded-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                            <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                          </button>
                        </div>
                      ) : asset.processingStatus === "failed" && asset.rejectionReason ? (
                        <div
                          className="p-2.5 border border-[#b9513a] rounded-xs space-y-1.5 shadow-sm"
                          style={{ backgroundColor: "#1a0f0d" }}
                        >
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#b9513a] shrink-0" />
                            <span
                              className="font-bold text-[11px] font-sans tracking-tight"
                              style={{ color: "#ffffff" }}
                            >
                              Analysis Processing Failure
                            </span>
                          </div>
                          <p className="text-[11px] font-sans leading-relaxed" style={{ color: "#f7f4ec" }}>
                            {asset.rejectionReason}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setAssetToDelete(asset);
                            }}
                            className="mt-1 w-full py-1.5 px-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-[10px] font-bold rounded-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                            <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                          </button>
                        </div>
                      ) : asset.aiDescription ? (
                        <p className="text-[11px] font-sans text-zinc-400 line-clamp-2 leading-relaxed">
                          {asset.aiDescription}
                        </p>
                      ) : (
                        <p className="text-[11px] font-sans text-zinc-500 italic">
                          Content review pending
                        </p>
                      )}

                      {/* Content Pillar & Objective Pills (Only if not rejected) */}
                      {asset.validationStatus !== "rejected" &&
                        asset.processingStatus !== "rejected" &&
                        asset.contentPillar && (
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
                        {(!asset.aiDescription ||
                          asset.processingStatus === "pending" ||
                          asset.processingStatus === "failed" ||
                          asset.processingStatus === "rejected" ||
                          asset.validationStatus === "rejected" ||
                          asset.validationStatus === "uncertain") && (
                          <button
                            onClick={() => handleSingleAnalyze(asset.id)}
                            disabled={isAnalyzing}
                            className="text-zinc-300 hover:text-white font-mono text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Scan className="w-3 h-3 text-zinc-400" />
                            <span>
                              {asset.processingStatus === "rejected" || asset.validationStatus === "rejected"
                                ? "Re-analyze"
                                : asset.processingStatus === "failed"
                                ? "Retry"
                                : "Analyze"}
                            </span>
                          </button>
                        )}
                        {(asset.processingStatus === "needs_review" || asset.validationStatus === "uncertain") && (
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            className="bg-[#b9513a] hover:bg-[#963d2b] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                            style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                          >
                            <span style={{ color: "#ffffff" }}>Review</span>
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
              className="border-2 border-dashed border-[#b9513a] hover:border-[#e06346] transition-all p-8 text-center cursor-pointer space-y-3 bg-[#b9513a]/15 hover:bg-[#b9513a]/25 shadow-[0_0_24px_rgba(185,81,58,0.22)] rounded-xl"
            >
              <Upload className="w-8 h-8 mx-auto text-white" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white" style={{ color: "#ffffff" }}>
                  Drop your files here, or <span className="underline">browse</span>
                </p>
                <p className="text-xs text-white font-sans" style={{ color: "#ffffff" }}>
                  Accepts JPG, JPEG, PNG, WEBP, MP4, MOV, WEBM
                </p>
              </div>
              <p className="text-[11px] text-white font-mono" style={{ color: "#ffffff" }}>
                Limit: Up to 15MB for photos &middot; Up to 200MB for videos
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
                          <span className="text-[#e06346] font-semibold text-[11px]">Upload failed</span>
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
          <div
            className={`w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh] border transition-all ${
              isPreviewAlert
                ? "border-2 border-[#b9513a] bg-[#140b09] shadow-[0_0_32px_rgba(185,81,58,0.25)] rounded-lg"
                : "border border-zinc-800 bg-zinc-950"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isPreviewAlert
                  ? "border-[#b9513a] bg-[#1a0f0d]"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3 truncate pr-4">
                <div className="flex items-center gap-2.5 truncate">
                  {isPreviewRejected ? (
                    <span
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-bold px-2.5 py-1 bg-[#b9513a] text-white rounded-xs shadow-[0_2px_8px_rgba(185,81,58,0.4)] shrink-0"
                      style={{ backgroundColor: "#b9513a", color: "#ffffff" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-white shrink-0" />
                      <span style={{ color: "#ffffff" }}>Rejected</span>
                    </span>
                  ) : (
                    renderStatusBadge(previewAsset)
                  )}
                  <h3
                    className={`text-sm font-bold font-mono truncate px-3 py-1 rounded-xs ${
                      isPreviewAlert
                        ? "border border-[#b9513a]/60 bg-[#1c0f0d] text-white shadow-xs"
                        : "text-white font-sans"
                    }`}
                    style={{
                      color: "#ffffff",
                      backgroundColor: isPreviewAlert ? "#1c0f0d" : undefined,
                    }}
                    title={previewAsset.fileName}
                  >
                    {previewAsset.fileName}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(previewAsset)}
                  className="p-1.5 text-zinc-400 hover:text-[#b9513a] hover:bg-zinc-800/80 rounded transition-colors cursor-pointer"
                  title="Delete asset"
                  aria-label="Delete asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAsset(null)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
              <div
                className={`lg:col-span-7 p-5 space-y-4 flex flex-col justify-between transition-colors ${
                  isPreviewAlert ? "bg-[#140b09]" : "bg-zinc-950"
                }`}
              >
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

                  {/* Status Notice Banner - Brand Redesigned with High Contrast */}
                  {(previewAsset.validationStatus === "rejected" || previewAsset.processingStatus === "rejected") && (
                    <div className="p-4 rounded-lg border-2 border-[#b9513a] bg-[#1a0f0d] shadow-[0_0_24px_rgba(185,81,58,0.22)] space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#b9513a] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight font-sans" style={{ color: "#ffffff" }}>
                              Content Unsuitable for Restaurant Marketing
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#b9513a] text-white rounded-xs">
                              Rejected
                            </span>
                          </div>
                          <p className="text-sm font-sans leading-relaxed font-normal" style={{ color: "#f7f4ec" }}>
                            {previewAsset.rejectionReason || VALIDATION_MESSAGES.NON_FOOD_REJECTED}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#b9513a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] font-mono text-zinc-300">
                          Excluded from weekly strategy generation.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAssetToDelete(previewAsset)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-xs font-bold rounded-md shadow-[0_2px_12px_rgba(185,81,58,0.35)] transition-all cursor-pointer"
                          style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(previewAsset.validationStatus === "uncertain" || (previewAsset.processingStatus === "needs_review" && previewAsset.rejectionReason)) &&
                    previewAsset.validationStatus !== "rejected" &&
                    previewAsset.processingStatus !== "rejected" && (
                    <div className="p-4 rounded-lg border-2 border-[#b9513a] bg-[#1a0f0d] shadow-[0_0_24px_rgba(185,81,58,0.22)] space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#b9513a] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight font-sans" style={{ color: "#ffffff" }}>
                              Uncertain Content Classification
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#b9513a] text-white rounded-xs">
                              Needs Review
                            </span>
                          </div>
                          <p className="text-sm font-sans leading-relaxed font-normal" style={{ color: "#f7f4ec" }}>
                            {previewAsset.rejectionReason || VALIDATION_MESSAGES.UNCERTAIN}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#b9513a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] font-mono text-zinc-300">
                          Requires verification or a clearer file upload.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAssetToDelete(previewAsset)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-xs font-bold rounded-md shadow-[0_2px_12px_rgba(185,81,58,0.35)] transition-all cursor-pointer"
                          style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {previewAsset.processingStatus === "failed" && (
                    <div className="p-4 rounded-lg border-2 border-[#b9513a] bg-[#1a0f0d] shadow-[0_0_24px_rgba(185,81,58,0.22)] space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#b9513a] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight font-sans" style={{ color: "#ffffff" }}>
                              Analysis Processing Failure
                            </span>
                            <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-[#b9513a] text-white rounded-xs">
                              Failed
                            </span>
                          </div>
                          <p className="text-sm font-sans leading-relaxed font-normal" style={{ color: "#f7f4ec" }}>
                            {previewAsset.rejectionReason ||
                              (previewAsset.mediaType === "video"
                                ? VALIDATION_MESSAGES.AI_FAILURE_VIDEO
                                : VALIDATION_MESSAGES.AI_FAILURE_IMAGE)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#b9513a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] font-mono text-zinc-300">
                          Automated classification failed. Try re-analyzing or upload another file.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAssetToDelete(previewAsset)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-xs font-bold rounded-md shadow-[0_2px_12px_rgba(185,81,58,0.35)] transition-all cursor-pointer"
                          style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span style={{ color: "#ffffff" }}>DELETE IMAGE PERMANENTLY</span>
                        </button>
                      </div>
                    </div>
                  )}

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
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAssetToDelete(previewAsset)}
                      className="bg-[#1a0f0d] hover:bg-[#b9513a] border border-[#b9513a] text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      style={{ color: "#ffffff" }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      <span style={{ color: "#ffffff" }}>Delete Media</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setPreviewAsset(null)}
                        className="font-mono text-xs"
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
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
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border-2 border-[#b9513a] bg-[#1a0f0d] w-full max-w-md p-6 space-y-4 shadow-[0_0_32px_rgba(185,81,58,0.28)] rounded-lg animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#b9513a] flex items-center justify-center shrink-0 shadow-sm">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight" style={{ color: "#ffffff" }}>
                  Delete Image Permanently?
                </h3>
                <p className="text-[11px] font-mono text-[#f7f4ec]/70">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#f7f4ec" }}>
              This will permanently remove <span className="font-semibold text-white font-mono text-xs px-1.5 py-0.5 bg-black/60 border border-[#b9513a]/40 rounded">{assetToDelete.fileName}</span> from your restaurant content library.
            </p>
            <div className="pt-3 border-t border-[#b9513a]/25 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAssetToDelete(null)}
                className="px-3.5 py-2 rounded-md bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-zinc-700 font-mono text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="bg-[#b9513a] hover:bg-[#963d2b] active:scale-[0.98] text-white font-mono text-xs font-bold px-4 py-2 rounded-md shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ color: "#ffffff", backgroundColor: "#b9513a" }}
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span style={{ color: "#ffffff" }}>
                  {isDeleting ? "Deleting..." : "DELETE IMAGE PERMANENTLY"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
