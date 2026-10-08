"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  Copy,
  FolderOpen,
  Check,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Camera,
  Video,
  Layers,
  Zap,
  RefreshCw,
  FileText,
  Printer,
  Download,
  Edit3,
  Shuffle,
  Image,
  X,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BENCHMARK_RESTAURANT,
  BENCHMARK_WEEKLY_PLAN,
  BUSINESS_GOALS,
} from "@/lib/constants";
import {
  getStoredGoalProfile,
  getStoredRestaurantProfile,
} from "@/lib/onboarding-store";
import { GapAnalysisResult } from "@/lib/gap-analyzer";
import { BusinessGoalType, ContentPlanItem, ContentAsset } from "@/lib/db/schema";

export default function AppStrategyPage() {
  const [selectedDay, setSelectedDay] = React.useState<string>("Monday");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [restaurantProfile, setRestaurantProfile] = React.useState<any>(null);
  const [goalProfile, setGoalProfile] = React.useState<any>(null);
  const [selectedGoal, setSelectedGoal] = React.useState<BusinessGoalType>(
    BENCHMARK_RESTAURANT.activeGoal.goal
  );
  const [gapAnalysis, setGapAnalysis] = React.useState<GapAnalysisResult | null>(null);
  const [isLoadingGaps, setIsLoadingGaps] = React.useState(true);

  // Strategy Generation State
  const [planItems, setPlanItems] = React.useState<ContentPlanItem[]>(BENCHMARK_WEEKLY_PLAN);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRegeneratingDay, setIsRegeneratingDay] = React.useState(false);
  const [libraryAssets, setLibraryAssets] = React.useState<ContentAsset[]>([]);
  const [generationMeta, setGenerationMeta] = React.useState<{
    matchedAssetsCount: number;
    briefsToCreateCount: number;
    totalAssetsEvaluated: number;
  }>({
    matchedAssetsCount: 2,
    briefsToCreateCount: 5,
    totalAssetsEvaluated: 2,
  });

  // Phase 7: Platform Adaptation View State
  const [platformView, setPlatformView] = React.useState<"all" | "instagram" | "tiktok">("all");

  // Phase 7: Modals State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isReplaceAssetModalOpen, setIsReplaceAssetModalOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [exportTab, setExportTab] = React.useState<"markdown" | "runsheet">("markdown");

  // Edit Form State
  const [editForm, setEditForm] = React.useState({
    hook: "",
    caption: "",
    cta: "",
    recommendedTime: "",
    strategicRationale: "",
    contentAngle: "",
  });

  // Asset Filter in Replace Modal
  const [assetFilter, setAssetFilter] = React.useState<"all" | "photo" | "video">("all");

  React.useEffect(() => {
    const profile = getStoredRestaurantProfile();
    const goal = getStoredGoalProfile();
    setRestaurantProfile(profile);
    setGoalProfile(goal);
    if (goal?.goal) {
      setSelectedGoal(goal.goal as BusinessGoalType);
    }
  }, []);

  const restaurantId = restaurantProfile?.id || BENCHMARK_RESTAURANT.id;
  const restaurantName = restaurantProfile?.name || BENCHMARK_RESTAURANT.name;
  const restaurantLocation = restaurantProfile?.location || BENCHMARK_RESTAURANT.location;

  // Fetch gap analysis whenever selectedGoal changes
  React.useEffect(() => {
    async function fetchGapAnalysis() {
      try {
        setIsLoadingGaps(true);
        const res = await fetch(
          `/api/strategy/gap-analysis?restaurantId=${restaurantId}&goal=${selectedGoal}`
        );
        const data = await res.json();
        if (data.success && data.analysis) {
          setGapAnalysis(data.analysis);
        }
      } catch (err) {
        console.error("Failed to fetch gap analysis:", err);
      } finally {
        setIsLoadingGaps(false);
      }
    }

    fetchGapAnalysis();
  }, [selectedGoal, restaurantId]);

  // Fetch current generated plan and library assets on mount
  React.useEffect(() => {
    async function fetchCurrentPlanAndAssets() {
      try {
        const [planRes, assetsRes] = await Promise.all([
          fetch(`/api/strategy/generate?restaurantId=${restaurantId}&goal=${selectedGoal}`),
          fetch(`/api/content/assets?restaurantId=${restaurantId}`),
        ]);

        const planData = await planRes.json();
        if (planData.success && planData.items && planData.items.length > 0) {
          setPlanItems(planData.items);
          if (planData.meta) {
            setGenerationMeta({
              matchedAssetsCount: planData.meta.matchedAssetsCount || 0,
              briefsToCreateCount: planData.meta.briefsToCreateCount || 0,
              totalAssetsEvaluated: planData.meta.totalAssetsEvaluated || 0,
            });
          }
        }

        const assetsData = await assetsRes.json();
        if (assetsData.success && assetsData.assets) {
          setLibraryAssets(assetsData.assets);
        }
      } catch (err) {
        console.error("Failed to fetch strategy or assets:", err);
      }
    }

    fetchCurrentPlanAndAssets();
  }, [restaurantId]);

  const activePlanDay = React.useMemo(() => {
    return (
      planItems.find((p) => p.dayOfWeek === selectedDay) ||
      planItems[0] ||
      BENCHMARK_WEEKLY_PLAN[0]
    );
  }, [planItems, selectedDay]);

  // Synchronize Edit Form when activePlanDay changes
  React.useEffect(() => {
    if (activePlanDay) {
      setEditForm({
        hook: activePlanDay.instagramHook || activePlanDay.tiktokHook || "",
        caption: activePlanDay.instagramCaption || activePlanDay.tiktokCaption || "",
        cta: activePlanDay.instagramCta || activePlanDay.tiktokCta || "",
        recommendedTime: activePlanDay.recommendedTime || "11:30 AM",
        strategicRationale: activePlanDay.strategicRationale || "",
        contentAngle: activePlanDay.contentAngle || "",
      });
    }
  }, [activePlanDay]);

  // Handle Strategy Generation for entire week
  const handleGenerateStrategy = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/strategy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          goal: selectedGoal,
          location: restaurantLocation,
          targetAudience: restaurantProfile?.targetAudience || BENCHMARK_RESTAURANT.targetAudience,
          primaryCustomerAction: restaurantProfile?.primaryCustomerAction || BENCHMARK_RESTAURANT.primaryAction,
        }),
      });
      const data = await res.json();
      if (data.success && data.items) {
        setPlanItems(data.items);
        if (data.meta) {
          setGenerationMeta({
            matchedAssetsCount: data.meta.matchedAssetsCount || 0,
            briefsToCreateCount: data.meta.briefsToCreateCount || 0,
            totalAssetsEvaluated: data.meta.totalAssetsEvaluated || 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to generate strategy:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Phase 7: Regenerate a Single Day's Angle
  const handleRegenerateDay = async () => {
    if (!activePlanDay) return;
    try {
      setIsRegeneratingDay(true);
      const res = await fetch("/api/strategy/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: activePlanDay.id,
          dayOfWeek: activePlanDay.dayOfWeek,
          restaurantId,
          restaurantName,
          location: restaurantLocation,
          goal: selectedGoal,
          assetId: activePlanDay.assetId,
          time: activePlanDay.recommendedTime,
          primaryCustomerAction: restaurantProfile?.primaryCustomerAction || BENCHMARK_RESTAURANT.primaryAction,
        }),
      });
      const data = await res.json();
      if (data.success && data.updates) {
        setPlanItems((prev) =>
          prev.map((item) =>
            item.id === activePlanDay.id ? { ...item, ...data.updates } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to regenerate day:", err);
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  // Phase 7: Toggle Plan Item Approval / Lock
  const handleToggleStatus = async (item: ContentPlanItem) => {
    const nextStatus = item.status === "approved" ? "draft" : "approved";
    setPlanItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );

    try {
      await fetch("/api/strategy/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          updates: { status: nextStatus },
        }),
      });
    } catch (err) {
      console.error("Failed to update item status:", err);
    }
  };

  // Phase 7: Save Manual Edits
  const handleSaveEdit = async () => {
    if (!activePlanDay) return;
    const updates = {
      instagramHook: editForm.hook,
      tiktokHook: editForm.hook,
      instagramCaption: editForm.caption,
      tiktokCaption: editForm.caption,
      instagramCta: editForm.cta,
      tiktokCta: editForm.cta,
      recommendedTime: editForm.recommendedTime,
      strategicRationale: editForm.strategicRationale,
      contentAngle: editForm.contentAngle || editForm.hook,
    };

    setPlanItems((prev) =>
      prev.map((i) => (i.id === activePlanDay.id ? { ...i, ...updates } : i))
    );
    setIsEditModalOpen(false);

    try {
      await fetch("/api/strategy/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: activePlanDay.id,
          updates,
        }),
      });
    } catch (err) {
      console.error("Failed to persist edits:", err);
    }
  };

  // Phase 7: Swap / Replace Asset
  const handleAssignAsset = async (asset: ContentAsset | null) => {
    if (!activePlanDay) return;
    const updates: Partial<ContentPlanItem> = asset
      ? {
          assetId: asset.id,
          asset,
          contentToCreate: null,
        }
      : {
          assetId: null,
          asset: null,
          contentToCreate: {
            concept: `Custom Smartphone Clip for ${activePlanDay.dayOfWeek}`,
            instructions: `Hold smartphone in vertical 9:16 orientation. Record 10-15 seconds at ${activePlanDay.recommendedTime}.`,
            targetDurationSeconds: 12,
            filmingWindow: activePlanDay.recommendedTime,
          },
        };

    setPlanItems((prev) =>
      prev.map((i) => (i.id === activePlanDay.id ? { ...i, ...updates } : i))
    );
    setIsReplaceAssetModalOpen(false);

    try {
      await fetch("/api/strategy/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: activePlanDay.id,
          updates: {
            assetId: asset ? asset.id : null,
            contentToCreate: updates.contentToCreate,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to update assigned asset:", err);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate 7-Day Formatted Plain Text / Markdown for Export
  const generateFullWeekMarkdown = () => {
    const header = `CONTENTPILOT 7-DAY CONTENT RUN-SHEET: ${restaurantName}\nLocation: ${restaurantLocation}\nGoal: ${gapAnalysis?.activeGoalTitle || "Increase Weekday Orders"}\nGenerated: ${new Date().toLocaleDateString()}\n============================================================\n\n`;
    const body = planItems
      .map((item) => {
        const mediaNote = item.asset
          ? `Media File: ${item.asset.fileName} (${item.asset.mediaType})`
          : `Filming Brief: ${item.contentToCreate?.concept || "Record 10s smartphone clip"} (${item.contentToCreate?.filmingWindow || item.recommendedTime})`;

        return `[${item.dayOfWeek.toUpperCase()}] - ${item.scheduledDate} | Posting Time: ${item.recommendedTime}\nPillar: ${item.contentPillar.replace(/_/g, " ")} | Objective: ${item.objective}\n${mediaNote}\nRationale: ${item.strategicRationale || item.contentAngle}\n\nINSTAGRAM HOOK:\n"${item.instagramHook}"\n\nINSTAGRAM CAPTION:\n${item.instagramCaption}\n\nCTA:\n${item.instagramCta}\n\nTIKTOK PATTERN HOOK:\n"${item.tiktokHook}"\n\nTIKTOK SCRIPT:\n${item.tiktokCaption}\n\n------------------------------------------------------------\n`;
      })
      .join("\n");

    return header + body;
  };

  const handleDownloadMarkdown = () => {
    const text = generateFullWeekMarkdown();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contentpilot-7day-plan-${restaurantName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const filteredAssets = libraryAssets.filter((a) => {
    if (assetFilter === "photo") return a.mediaType === "image" || a.mimeType?.startsWith("image/");
    if (assetFilter === "video") return a.mediaType === "video" || a.mimeType?.startsWith("video/");
    return true;
  });

  const getPillarStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return (
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-mono uppercase">
            Optimal
          </span>
        );
      case "missing":
        return (
          <span className="text-[9px] px-1.5 py-0.2 bg-red-950/80 border border-red-800 text-red-300 font-mono uppercase">
            Missing
          </span>
        );
      case "underrepresented":
        return (
          <span className="text-[9px] px-1.5 py-0.2 bg-amber-950/80 border border-amber-700 text-amber-300 font-mono uppercase">
            Deficit
          </span>
        );
      default:
        return (
          <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono uppercase">
            Balanced
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-black text-white p-4 sm:p-6 md:p-8 space-y-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>COMMERCIAL STRATEGY &amp; GAP DIAGNOSTICS</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-bold">{restaurantName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Weekly Content Strategy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Evaluates what content you already have, reveals commercial gaps, and maps footage to weekly dining revenue.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Link href="/app/content">
              <Button variant="outline" size="sm" className="gap-1.5 border-zinc-700 hover:border-white">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </Button>
            </Link>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-zinc-700 hover:border-white font-mono"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export &amp; Run-Sheet</span>
            </Button>
            <Button
              onClick={handleGenerateStrategy}
              disabled={isGenerating}
              size="sm"
              className="gap-1.5 bg-white text-black hover:bg-zinc-200 border-none font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Synthesizing Plan..." : "Regenerate Week"}</span>
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 5: CONTENT GAP ANALYSIS STUDIO */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Commercial Goal Selector & Channel */}
          <div className="lg:col-span-5 p-5 border border-zinc-800 bg-zinc-950 space-y-5 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span className="uppercase">ACTIVE COMMERCIAL OBJECTIVE</span>
                <Target className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Goal Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 block font-mono">
                  Target Business Goal for This Week:
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value as BusinessGoalType)}
                  className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans"
                >
                  {BUSINESS_GOALS.map((g) => (
                    <option key={g.id} value={g.id} className="bg-zinc-950 text-white">
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-1">
                {gapAnalysis?.activeGoalDescription ||
                  "Tailors weekly content hooks and timing to convert local diners during peak meal decisions."}
              </p>
            </div>

            <div className="p-3 border border-zinc-900 bg-black space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Primary Conversion Channel</div>
              <div className="text-xs font-bold text-white font-mono">
                {restaurantProfile?.primaryCustomerAction
                  ? restaurantProfile.primaryCustomerAction.replace(/_/g, " ").toUpperCase()
                  : "WHATSAPP BIO LINK + DIRECT STORY ORDERS"}
              </div>
            </div>
          </div>

          {/* Right Column: Readiness Score & Diagnostic Summary */}
          <div className="lg:col-span-7 p-5 border border-zinc-800 bg-zinc-950 space-y-5 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold text-white text-[11px] uppercase">
                    Content Readiness &amp; Gap Audit
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase font-mono ${
                    gapAnalysis?.status === "ready"
                      ? "border-emerald-600 text-emerald-300"
                      : gapAnalysis?.status === "critical_gaps"
                      ? "border-amber-600 text-amber-300"
                      : "border-zinc-600 text-zinc-300"
                  }`}
                >
                  {gapAnalysis?.status === "ready"
                    ? "Library Ready"
                    : gapAnalysis?.status === "critical_gaps"
                    ? "Critical Deficit"
                    : "Moderate Gaps"}
                </Badge>
              </div>

              {/* Readiness Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">Strategic Readiness Score</span>
                  <span className="font-bold text-white font-mono">
                    {gapAnalysis ? `${gapAnalysis.readinessScore}%` : "..."}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      gapAnalysis?.status === "ready"
                        ? "bg-emerald-500"
                        : gapAnalysis?.status === "critical_gaps"
                        ? "bg-amber-500"
                        : "bg-zinc-300"
                    }`}
                    style={{ width: `${gapAnalysis?.readinessScore || 30}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                  <span>Evaluated {gapAnalysis?.totalAssetsCount || 0} media assets</span>
                  <span>
                    {gapAnalysis?.photosCount || 0} photos &middot; {gapAnalysis?.videosCount || 0} videos
                  </span>
                </div>
              </div>

              {/* Diagnostic Headline & Commercial Narrative */}
              <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                <div className="text-xs font-bold text-white font-sans flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{gapAnalysis?.headlineDiagnostic}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pl-6">
                  {gapAnalysis?.commercialRationale}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">
                {gapAnalysis?.identifiedGaps.length || 0} gaps detected for this goal
              </span>
              <Link href="/app/content" className="text-white hover:underline font-mono">
                Add Missing Media &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PILLAR DISTRIBUTION BREAKDOWN (All 6 Pillars) */}
        {/* ---------------------------------------------------- */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Content Pillar Distribution &amp; Goal Benchmark
              </h3>
              <p className="text-xs text-zinc-400 font-sans pt-0.5">
                Compares your current camera roll mix against the recommended distribution for{" "}
                <span className="text-white font-medium">{gapAnalysis?.activeGoalTitle}</span>.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-white inline-block" /> Current Library
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-zinc-700 inline-block" /> Target Benchmark
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gapAnalysis?.pillarDistribution.map((item) => (
              <div
                key={item.id}
                className="p-3.5 border border-zinc-900 bg-black/60 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-sans">{item.label}</span>
                    {getPillarStatusBadge(item.status)}
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>
                      Library: <strong className="text-white">{item.percentage}%</strong> ({item.count} items)
                    </span>
                    <span>Target: {item.benchmarkPercentage}%</span>
                  </div>

                  {/* Dual comparison bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-900 h-1.5 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                    <div className="w-full bg-zinc-900 h-1 overflow-hidden">
                      <div
                        className="bg-zinc-600 h-full transition-all duration-500"
                        style={{ width: `${item.benchmarkPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                  {item.deficitCount > 0 ? (
                    <span className="text-amber-400 font-mono">
                      Deficit: Need +{item.deficitCount} {item.deficitCount === 1 ? "asset" : "assets"}
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-mono">Benchmark satisfied</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 6 + PHASE 7: 7-DAY CONTENT STRATEGY BOARD */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <h2 className="text-base font-bold text-white font-sans">
                  Actionable 7-Day Commercial Schedule
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-mono pt-0.5">
                Granular control: Keep, Edit, Regenerate, Swap Footage, or Export directly to messaging and run-sheets.
              </p>
            </div>

            {/* Health Metrics & Platform View Selector */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
              <div className="flex items-center border border-zinc-800 bg-black">
                <button
                  onClick={() => setPlatformView("all")}
                  className={`px-2.5 py-1 text-[11px] transition-colors ${
                    platformView === "all" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All Platforms
                </button>
                <button
                  onClick={() => setPlatformView("instagram")}
                  className={`px-2.5 py-1 text-[11px] transition-colors border-l border-zinc-800 ${
                    platformView === "instagram" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Instagram
                </button>
                <button
                  onClick={() => setPlatformView("tiktok")}
                  className={`px-2.5 py-1 text-[11px] transition-colors border-l border-zinc-800 ${
                    platformView === "tiktok" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  TikTok
                </button>
              </div>
            </div>
          </div>

          {/* Day Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-xs">
            {planItems.map((plan) => {
              const isSelected = selectedDay === plan.dayOfWeek;
              const hasAsset = !!plan.assetId;
              const isApproved = plan.status === "approved";

              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedDay(plan.dayOfWeek)}
                  className={`p-3 text-left transition-all border flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? "bg-white text-black border-white"
                      : "bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{plan.dayOfWeek}</span>
                    {isApproved && (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-emerald-400"}`} />
                    )}
                  </div>

                  <div className="text-[10px] truncate uppercase tracking-wider font-mono">
                    {plan.contentPillar.replace(/_/g, " ")}
                  </div>

                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {plan.recommendedTime.split(" ")[0]}
                    </span>
                    {hasAsset ? (
                      <span className={`font-mono ${isSelected ? "text-emerald-800" : "text-emerald-400"}`}>
                        Footage Matched
                      </span>
                    ) : (
                      <span className={`font-mono ${isSelected ? "text-amber-800" : "text-amber-400"}`}>
                        Shoot Needed
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6">
            {/* Commercial Strategic Rationale Alert */}
            <div className="p-4 bg-black border border-zinc-800 space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-white font-sans">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Commercial Strategic Rationale:</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed pl-6 pt-0.5">
                  {activePlanDay.strategicRationale ||
                    activePlanDay.contentAngle ||
                    "Targeting active diners during lunch decision windows with clear friction-reducing proof."}
                </p>
              </div>

              {/* Action Buttons for Active Day */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs pl-6 sm:pl-0">
                <Button
                  onClick={handleRegenerateDay}
                  disabled={isRegeneratingDay}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isRegeneratingDay ? "animate-spin" : ""}`} />
                  <span>{isRegeneratingDay ? "Regenerating..." : "Regenerate Angle"}</span>
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Brief</span>
                </Button>
                <Button
                  onClick={() => handleToggleStatus(activePlanDay)}
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 ${
                    activePlanDay.status === "approved"
                      ? "border-emerald-600 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50"
                      : "border-zinc-700 text-zinc-300 hover:border-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activePlanDay.status === "approved" ? "Locked / Approved" : "Approve Post"}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Day Context & Assigned Media / Filming Brief */}
              <div className="lg:col-span-5 space-y-5 font-mono text-xs border-b lg:border-b-0 lg:border-r border-zinc-900 pb-6 lg:pb-0 lg:pr-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xl font-bold text-white font-sans block">{activePlanDay.dayOfWeek}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{activePlanDay.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-zinc-700 text-zinc-300">
                      {activePlanDay.contentPillar.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-zinc-800 text-zinc-400">
                      {activePlanDay.objective}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase">Recommended Posting Window</div>
                  <div className="text-xs text-white font-bold flex items-center gap-2 p-2.5 bg-black border border-zinc-900">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{activePlanDay.recommendedTime}</span>
                    <span className="text-zinc-500 text-[10px] font-normal">
                      &middot; Tailored for dining rhythms
                    </span>
                  </div>
                </div>

                {/* Assigned Media State vs Shoot Brief */}
                {activePlanDay.asset ? (
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 uppercase">Matched Library Footage</span>
                      <button
                        onClick={() => setIsReplaceAssetModalOpen(true)}
                        className="text-white hover:underline flex items-center gap-1 font-mono"
                      >
                        <Image className="w-3 h-3" />
                        <span>Swap Footage</span>
                      </button>
                    </div>

                    <div className="p-3 bg-black border border-zinc-900 space-y-2.5">
                      <div className="flex items-start gap-3">
                        <img
                          src={activePlanDay.asset.fileUrl}
                          alt={activePlanDay.asset.fileName}
                          className="w-14 h-14 object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="truncate flex-1 space-y-1">
                          <div className="text-white truncate font-sans text-xs font-semibold">
                            {activePlanDay.asset.fileName}
                          </div>
                          <div className="text-zinc-400 text-[10px] uppercase font-mono">
                            {activePlanDay.asset.mediaType} &middot; Pillar: {activePlanDay.asset.contentPillar}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">
                            {activePlanDay.asset.aiDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePlanDay.contentToCreate ? (
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 uppercase flex items-center gap-1 font-bold">
                        <Camera className="w-3 h-3" />
                        Smartphone Filming Required
                      </span>
                      <button
                        onClick={() => setIsReplaceAssetModalOpen(true)}
                        className="text-white hover:underline flex items-center gap-1 font-mono"
                      >
                        <Image className="w-3 h-3" />
                        <span>Assign Library File</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-amber-950/20 border border-amber-900/60 space-y-2.5 text-left">
                      <div className="text-xs font-bold text-amber-200 font-sans">
                        {activePlanDay.contentToCreate.concept}
                      </div>

                      <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                        {activePlanDay.contentToCreate.instructions}
                      </p>

                      <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Duration: ~{activePlanDay.contentToCreate.targetDurationSeconds}s</span>
                        </span>
                        <Link href="/app/content" className="text-white hover:underline font-mono">
                          Upload footage &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right Column: Platform-Native Copy Drawers */}
              <div className="lg:col-span-7 space-y-5 font-mono text-xs">
                {/* Instagram Brief */}
                {(platformView === "all" || platformView === "instagram") && (
                  <div className="space-y-2 border border-zinc-900 bg-black p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[11px] uppercase">
                          Instagram (Reel / Feed / Story)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Conversion-First
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            `[HOOK]: ${activePlanDay.instagramHook}\n\n[CAPTION]:\n${activePlanDay.instagramCaption}\n\n[CTA]: ${activePlanDay.instagramCta}`,
                            "ig"
                          )
                        }
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                      >
                        {copiedKey === "ig" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Brief</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2.5 font-sans pt-1">
                      <div className="p-2.5 bg-zinc-950 border border-zinc-900 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">
                          First 3 Seconds Text Overlay
                        </div>
                        <div className="text-xs font-bold text-white">
                          &ldquo;{activePlanDay.instagramHook}&rdquo;
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">
                          Formatted Caption
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                          {activePlanDay.instagramCaption}
                        </p>
                      </div>

                      <div className="p-2 bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-300 font-mono">
                        <strong className="text-white uppercase text-[10px] block pb-0.5">Primary Conversion CTA:</strong>
                        {activePlanDay.instagramCta}
                      </div>

                      {activePlanDay.instagramAdaptation?.visualOverlayNotes && (
                        <div className="text-[10px] text-zinc-400 font-mono pt-1">
                          Overlay Direction: {activePlanDay.instagramAdaptation.visualOverlayNotes}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TikTok Brief */}
                {(platformView === "all" || platformView === "tiktok") && (
                  <div className="space-y-2 border border-zinc-900 bg-black p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-[11px] uppercase">
                          TikTok (Pattern Interrupt Video)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-400 border border-zinc-800">
                          High Retention
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            `[PATTERN HOOK]: ${activePlanDay.tiktokHook}\n\n[SPOKEN SCRIPT / CAPTION]:\n${activePlanDay.tiktokCaption}\n\n[CTA]: ${activePlanDay.tiktokCta}`,
                            "tiktok"
                          )
                        }
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                      >
                        {copiedKey === "tiktok" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Brief</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2.5 font-sans pt-1">
                      <div className="p-2.5 bg-zinc-950 border border-zinc-900 space-y-1">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">
                          Visual &amp; Audio Pattern Interrupt
                        </div>
                        <div className="text-xs font-bold text-white">
                          &ldquo;{activePlanDay.tiktokHook}&rdquo;
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-zinc-500">
                          Spoken Script &amp; Caption
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                          {activePlanDay.tiktokCaption}
                        </p>
                      </div>

                      <div className="p-2 bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-300 font-mono">
                        <strong className="text-white uppercase text-[10px] block pb-0.5">Engagement &amp; Bio CTA:</strong>
                        {activePlanDay.tiktokCta}
                      </div>

                      {activePlanDay.tiktokAdaptation?.audioVisualPacing && (
                        <div className="text-[10px] text-zinc-400 font-mono pt-1">
                          Pacing &amp; Audio: {activePlanDay.tiktokAdaptation.audioVisualPacing}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PHASE 7 MODAL 1: EDIT STRATEGY BRIEF MODAL */}
      {/* ---------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Edit Daily Brief &mdash; {activePlanDay.dayOfWeek}
                </h3>
                <p className="text-xs text-zinc-400 font-mono pt-0.5">
                  Fine-tune headlines, body copy, and posting times.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-mono block">Headline / First 3s Hook</label>
                <input
                  type="text"
                  value={editForm.hook}
                  onChange={(e) => setEditForm({ ...editForm, hook: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-mono block">Body Caption Copy</label>
                <textarea
                  rows={4}
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-mono block">Primary Conversion CTA</label>
                  <input
                    type="text"
                    value={editForm.cta}
                    onChange={(e) => setEditForm({ ...editForm, cta: e.target.value })}
                    className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-mono block">Posting Window (e.g. 11:30 AM)</label>
                  <input
                    type="text"
                    value={editForm.recommendedTime}
                    onChange={(e) => setEditForm({ ...editForm, recommendedTime: e.target.value })}
                    className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-mono block">Strategic Commercial Rationale</label>
                <textarea
                  rows={2}
                  value={editForm.strategicRationale}
                  onChange={(e) => setEditForm({ ...editForm, strategicRationale: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 font-bold"
              >
                Save &amp; Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PHASE 7 MODAL 2: REPLACE / SWAP MEDIA ASSET MODAL */}
      {/* ---------------------------------------------------- */}
      {isReplaceAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Select Footage for {activePlanDay.dayOfWeek}
                </h3>
                <p className="text-xs text-zinc-400 font-mono pt-0.5">
                  Pick an existing library asset or switch this day to a filming brief.
                </p>
              </div>
              <button
                onClick={() => setIsReplaceAssetModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-black border border-zinc-800 p-0.5">
                <button
                  onClick={() => setAssetFilter("all")}
                  className={`px-3 py-1 text-[11px] ${
                    assetFilter === "all" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({libraryAssets.length})
                </button>
                <button
                  onClick={() => setAssetFilter("photo")}
                  className={`px-3 py-1 text-[11px] ${
                    assetFilter === "photo" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setAssetFilter("video")}
                  className={`px-3 py-1 text-[11px] ${
                    assetFilter === "video" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Videos
                </button>
              </div>

              <Button
                onClick={() => handleAssignAsset(null)}
                variant="outline"
                size="sm"
                className="gap-1.5 border-amber-800/80 text-amber-300 hover:bg-amber-950/40 text-[11px]"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Switch to Filming Brief</span>
              </Button>
            </div>

            {/* Asset Grid */}
            {filteredAssets.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 space-y-2">
                <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="text-sm text-zinc-300 font-sans">No assets found in library</div>
                <Link href="/app/content" className="text-white hover:underline text-xs block font-mono">
                  Upload footage in Content Hub &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredAssets.map((asset) => {
                  const isCurrent = activePlanDay.assetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      className={`p-2.5 border bg-black flex flex-col justify-between space-y-2 ${
                        isCurrent ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-video bg-zinc-900 overflow-hidden border border-zinc-900">
                          <img
                            src={asset.fileUrl}
                            alt={asset.fileName}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            variant="outline"
                            className="absolute top-1.5 right-1.5 text-[8px] bg-black/80 font-mono uppercase text-white border-zinc-700"
                          >
                            {asset.mediaType}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-white truncate font-sans text-xs font-semibold">
                            {asset.fileName}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">
                            Pillar: {asset.contentPillar || "Product"}
                          </div>
                          <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 pt-0.5">
                            {asset.aiDescription}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAssignAsset(asset)}
                        disabled={isCurrent}
                        variant="outline"
                        size="sm"
                        className={`w-full text-[11px] font-mono mt-1 ${
                          isCurrent
                            ? "border-emerald-700 text-emerald-400 bg-emerald-950/20"
                            : "border-zinc-800 hover:border-white text-zinc-200"
                        }`}
                      >
                        {isCurrent ? "Currently Assigned" : "Assign to This Day"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button
                onClick={() => setIsReplaceAssetModalOpen(false)}
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PHASE 7 MODAL 3: EXPORT & DELIVERY MODAL */}
      {/* ---------------------------------------------------- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Export &amp; Run-Sheet &mdash; {restaurantName}
                </h3>
                <p className="text-xs text-zinc-400 font-mono pt-0.5">
                  Share formatted text to team messaging or print a run-sheet for kitchen managers.
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
              <button
                onClick={() => setExportTab("markdown")}
                className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                  exportTab === "markdown"
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white bg-black border border-zinc-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>WhatsApp / Notion / Slack</span>
              </button>
              <button
                onClick={() => setExportTab("runsheet")}
                className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                  exportTab === "runsheet"
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white bg-black border border-zinc-800"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Printable Kitchen Run-Sheet</span>
              </button>
            </div>

            {/* TAB 1: Markdown / Plain Text */}
            {exportTab === "markdown" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Complete 7-day schedule with hooks, captions, and filming notes.
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleCopy(generateFullWeekMarkdown(), "all-plan")}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-zinc-700 hover:border-white text-xs font-mono"
                    >
                      {copiedKey === "all-plan" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied All</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Entire Week</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadMarkdown}
                      size="sm"
                      className="gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-black border border-zinc-800 max-h-[50vh] overflow-y-auto font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap select-all">
                  {generateFullWeekMarkdown()}
                </div>
              </div>
            )}

            {/* TAB 2: Printable Kitchen Run-Sheet */}
            {exportTab === "runsheet" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Weekly dispatch sheet for kitchen dispatchers and content coordinators.
                  </span>
                  <Button
                    onClick={handleTriggerPrint}
                    size="sm"
                    className="gap-1.5 bg-white text-black hover:bg-zinc-200 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </Button>
                </div>

                <div className="border border-zinc-800 bg-black p-4 space-y-4 max-h-[50vh] overflow-y-auto print:max-h-none print:border-none print:bg-white print:text-black">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white font-sans print:text-black">
                        {restaurantName} &mdash; Weekly Content Run-Sheet
                      </div>
                      <div className="text-[10px] text-zinc-400 print:text-zinc-600">
                        Goal: {gapAnalysis?.activeGoalTitle} &middot; Location: {restaurantLocation}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      7 Days Active
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {planItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border border-zinc-900 bg-zinc-950/70 space-y-2 print:border-zinc-300 print:bg-white"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 print:border-zinc-300">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white print:text-black text-xs font-sans">
                              {item.dayOfWeek}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-mono">
                              ({item.scheduledDate})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] uppercase font-mono border-zinc-800">
                              {item.contentPillar.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-[10px] text-white print:text-black font-bold font-mono">
                              {item.recommendedTime}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                          <div>
                            <span className="text-zinc-500 font-mono text-[10px] block">Hook:</span>
                            <span className="text-white print:text-black font-medium">&ldquo;{item.instagramHook}&rdquo;</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono text-[10px] block">Media Assigned / Filming Note:</span>
                            <span className="text-zinc-300 print:text-zinc-800">
                              {item.asset ? item.asset.fileName : item.contentToCreate?.concept || "Smartphone recording"}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-zinc-400 print:text-zinc-700 border-t border-zinc-900/60 pt-1.5 flex justify-between">
                          <span>CTA: <strong className="text-zinc-300 print:text-black">{item.instagramCta}</strong></span>
                          <span>Objective: <strong className="uppercase">{item.objective}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button
                onClick={() => setIsExportModalOpen(false)}
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
