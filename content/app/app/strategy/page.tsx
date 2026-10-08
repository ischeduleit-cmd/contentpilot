"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Target,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  Copy,
  FolderOpen,
  Share2,
  Check,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Camera,
  Video,
  Layers,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BENCHMARK_RESTAURANT,
  BENCHMARK_WEEKLY_PLAN,
  CONTENT_PILLARS,
  BUSINESS_GOALS,
} from "@/lib/constants";
import {
  getStoredGoalProfile,
  getStoredRestaurantProfile,
} from "@/lib/onboarding-store";
import { GapAnalysisResult } from "@/lib/gap-analyzer";
import { BusinessGoalType } from "@/lib/db/schema";

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

  React.useEffect(() => {
    const profile = getStoredRestaurantProfile();
    const goal = getStoredGoalProfile();
    setRestaurantProfile(profile);
    setGoalProfile(goal);
    if (goal?.goal) {
      setSelectedGoal(goal.goal as BusinessGoalType);
    }
  }, []);

  // Fetch gap analysis whenever selectedGoal changes
  React.useEffect(() => {
    async function fetchGapAnalysis() {
      try {
        setIsLoadingGaps(true);
        const res = await fetch(
          `/api/strategy/gap-analysis?restaurantId=${BENCHMARK_RESTAURANT.id}&goal=${selectedGoal}`
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
  }, [selectedGoal]);

  const restaurantName = restaurantProfile?.name || BENCHMARK_RESTAURANT.name;
  const activePlanDay = React.useMemo(() => {
    return (
      BENCHMARK_WEEKLY_PLAN.find((p) => p.dayOfWeek === selectedDay) ||
      BENCHMARK_WEEKLY_PLAN[0]
    );
  }, [selectedDay]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
        {/* HIGH-LEVERAGE "CONTENT TO SHOOT" BRIEFS */}
        {/* ---------------------------------------------------- */}
        {gapAnalysis?.recommendedShootList && gapAnalysis.recommendedShootList.length > 0 && (
          <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-bold text-white font-sans">
                    High-Leverage Smartphone Prompts (Close the Gap)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Simple 10-second smartphone clips you can film today to complete your weekly conversion plan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gapAnalysis.recommendedShootList.map((brief, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-zinc-800 bg-black space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] uppercase font-mono border-zinc-700 text-zinc-300">
                        {brief.pillar.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{brief.duration}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white font-sans">
                      {brief.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {brief.instructions}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Best time: <strong className="text-zinc-300">{brief.filmingWindow}</strong></span>
                    <Link href="/app/content" className="text-white hover:underline font-mono">
                      Upload footage &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 7-DAY STRATEGY BOARD PREVIEW */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                7-Day Posting Schedule
              </h2>
              <p className="text-xs text-zinc-400 font-mono pt-0.5">
                Generated strategic calendar based on available assets and gap solutions.
              </p>
            </div>
          </div>

          {/* Day Selector Bar */}
          <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4 font-mono text-xs">
            {BENCHMARK_WEEKLY_PLAN.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedDay(plan.dayOfWeek)}
                className={`px-4 py-2 text-xs transition-all ${
                  selectedDay === plan.dayOfWeek
                    ? "bg-white text-black font-bold"
                    : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {plan.dayOfWeek}
              </button>
            ))}
          </div>

          {/* Active Day Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-zinc-800 bg-zinc-950 p-6">
            {/* Left: Day & Strategy Angle */}
            <div className="lg:col-span-5 space-y-4 font-mono text-xs border-b lg:border-b-0 lg:border-r border-zinc-900 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white font-sans">{activePlanDay.dayOfWeek}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {activePlanDay.contentPillar}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">Strategic Angle</div>
                <div className="text-xs font-medium text-zinc-200 font-sans leading-relaxed">
                  {activePlanDay.contentAngle}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">Recommended Posting Time</div>
                <div className="text-xs text-white font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{activePlanDay.recommendedTime}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">Primary Objective</div>
                <div className="text-xs text-zinc-300 capitalize">
                  {activePlanDay.objective} (Drive Orders)
                </div>
              </div>

              {activePlanDay.asset && (
                <div className="pt-2 border-t border-zinc-900 space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase">Matched Asset From Library</div>
                  <div className="flex items-center gap-2.5 p-2 bg-black border border-zinc-900">
                    <img
                      src={activePlanDay.asset.fileUrl}
                      alt={activePlanDay.asset.fileName}
                      className="w-10 h-10 object-cover"
                    />
                    <div className="truncate flex-1">
                      <div className="text-white truncate font-sans text-xs">{activePlanDay.asset.fileName}</div>
                      <div className="text-zinc-500 text-[10px] uppercase font-mono">{activePlanDay.asset.mediaType}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Instagram & TikTok Copy Drawer */}
            <div className="lg:col-span-7 space-y-5 font-mono text-xs">
              {/* Instagram Draft */}
              <div className="space-y-2 border border-zinc-900 bg-black p-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                  <span className="font-bold text-white text-[11px] uppercase">Instagram (Post / Story)</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${activePlanDay.instagramHook}\n\n${activePlanDay.instagramCaption}\n\n${activePlanDay.instagramCta}`,
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
                <div className="space-y-1.5 font-sans">
                  <div className="text-xs font-semibold text-white">
                    Hook: &ldquo;{activePlanDay.instagramHook}&rdquo;
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {activePlanDay.instagramCaption}
                  </p>
                  <div className="text-[11px] text-zinc-500 pt-1 font-mono">
                    CTA: {activePlanDay.instagramCta}
                  </div>
                </div>
              </div>

              {/* TikTok Draft */}
              <div className="space-y-2 border border-zinc-900 bg-black p-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                  <span className="font-bold text-white text-[11px] uppercase">TikTok (Video Pattern)</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${activePlanDay.tiktokHook}\n\n${activePlanDay.tiktokCaption}\n\n${activePlanDay.tiktokCta}`,
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
                <div className="space-y-1.5 font-sans">
                  <div className="text-xs font-semibold text-white">
                    Hook: &ldquo;{activePlanDay.tiktokHook}&rdquo;
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {activePlanDay.tiktokCaption}
                  </p>
                  <div className="text-[11px] text-zinc-500 pt-1 font-mono">
                    CTA: {activePlanDay.tiktokCta}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
