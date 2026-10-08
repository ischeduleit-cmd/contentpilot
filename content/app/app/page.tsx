"use client";

import * as React from "react";
import Link from "next/link";
import {
  Target,
  FolderOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Upload,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Store,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ContentAsset } from "@/lib/db/schema";
import {
  BENCHMARK_RESTAURANT,
  BENCHMARK_WEEKLY_PLAN,
} from "@/lib/constants";
import {
  getStoredGoalProfile,
  getStoredRestaurantProfile,
} from "@/lib/onboarding-store";
import { GapAnalysisResult } from "@/lib/gap-analyzer";

export default function AppHomePage() {
  const [assets, setAssets] = React.useState<ContentAsset[]>([]);
  const [gapAnalysis, setGapAnalysis] = React.useState<GapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [restaurantProfile, setRestaurantProfile] = React.useState<any>(null);
  const [goalProfile, setGoalProfile] = React.useState<any>(null);

  React.useEffect(() => {
    // Load local workspace overrides if present
    const profile = getStoredRestaurantProfile();
    const goal = getStoredGoalProfile();
    setRestaurantProfile(profile);
    setGoalProfile(goal);

    // Fetch live asset counts and gap analysis
    async function fetchData() {
      try {
        setIsLoading(true);
        const [assetsRes, gapRes] = await Promise.all([
          fetch(`/api/content/assets?restaurantId=${BENCHMARK_RESTAURANT.id}`),
          fetch(`/api/strategy/gap-analysis?restaurantId=${BENCHMARK_RESTAURANT.id}`),
        ]);

        const assetsData = await assetsRes.json();
        if (assetsData.success && assetsData.assets) {
          setAssets(assetsData.assets);
        }

        const gapData = await gapRes.json();
        if (gapData.success && gapData.analysis) {
          setGapAnalysis(gapData.analysis);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const restaurantName = restaurantProfile?.name || BENCHMARK_RESTAURANT.name;
  const restaurantLocation = restaurantProfile?.location || BENCHMARK_RESTAURANT.location;
  const activeGoalTitle =
    goalProfile?.goal === "increase_lunch_orders" || !goalProfile
      ? "Increase Weekday Lunch Orders"
      : goalProfile.goal.replace(/_/g, " ").toUpperCase();
  const activeGoalDesc =
    goalProfile?.goalDescription ||
    "Drive corporate lunchtime delivery and pre-orders Monday through Thursday before 12:30 PM.";

  const photosCount = assets.filter(
    (a) => a.mediaType === "image" || a.mimeType?.startsWith("image/")
  ).length;

  const videosCount = assets.filter(
    (a) => a.mediaType === "video" || a.mimeType?.startsWith("video/")
  ).length;

  const todayPlan = BENCHMARK_WEEKLY_PLAN[0]; // Monday active

  return (
    <div className="flex-1 bg-black text-white p-4 sm:p-6 md:p-8 space-y-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Directive Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE RESTAURANT WORKSPACE</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-bold">{restaurantName}</span>
              <span className="text-zinc-500">({restaurantLocation})</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              What should I do with my content this week?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Operational summary, media library status, and your highest-priority commercial action.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <Link href="/app/content">
              <Button variant="default" size="sm" className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Media</span>
              </Button>
            </Link>
            <Link href="/app/strategy">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>View Full 7-Day Plan</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Priority 1: High-Impact Next Action Banner */}
        <div className="border border-white bg-zinc-950 p-5 sm:p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-white" />
              <span>TOP RECOMMENDED ACTION FOR TODAY</span>
            </div>
            <Badge variant="outline" className="border-white text-white font-mono text-[10px] uppercase">
              HIGH IMPACT
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="text-base font-bold text-white font-sans">
                Post Today&apos;s Lunch Hook by 11:30 AM on Instagram Stories &amp; Reels
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Angle: &ldquo;{todayPlan.contentAngle}&rdquo; &mdash; Targets hungry office workers making lunch decisions.
                Include direct WhatsApp ordering link in bio/sticker.
              </p>
              <div className="text-[11px] text-zinc-500 pt-1 font-mono">
                Suggested Opening Hook: <span className="text-zinc-300 italic font-sans">&ldquo;{todayPlan.instagramHook}&rdquo;</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2 justify-end">
              <Link href="/app/strategy">
                <Button variant="default" className="w-full font-mono text-xs justify-between">
                  <span>Inspect Today&apos;s Copy &amp; Assets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/app/content">
                <Button variant="secondary" className="w-full font-mono text-xs justify-between">
                  <span>Manage Assigned Media</span>
                  <FolderOpen className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Metric Operational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* 1. Commercial Goal */}
          <div className="p-5 border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span className="uppercase">WEEKLY BUSINESS GOAL</span>
                <Target className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-base font-bold text-white font-sans">
                {activeGoalTitle}
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {activeGoalDesc}
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Channel: WhatsApp / Delivery</span>
              <Link href="/app/strategy" className="text-white hover:underline text-[11px]">
                Adjust Goal &rarr;
              </Link>
            </div>
          </div>

          {/* 2. Media Library State */}
          <div className="p-5 border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span className="uppercase">AVAILABLE MEDIA ASSETS</span>
                <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-base font-bold text-white font-sans flex items-baseline gap-2">
                <span>{isLoading ? "..." : assets.length}</span>
                <span className="text-xs text-zinc-400 font-mono font-normal">
                  total files ({photosCount} photos &middot; {videosCount} videos)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Your camera roll organized and ready to publish. Every dish and prep clip powers your 7-day conversion schedule.
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Storage Connected
              </span>
              <Link href="/app/content" className="text-white hover:underline text-[11px]">
                Upload Content &rarr;
              </Link>
            </div>
          </div>

          {/* 3. Content Gap Audit Warning */}
          <div className="p-5 border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span className="uppercase">PILLAR BALANCE AUDIT</span>
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-base font-bold text-white font-sans flex items-center justify-between">
                <span className="truncate pr-2">
                  {gapAnalysis?.identifiedGaps[0]?.title || "Pillars Evaluated"}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase shrink-0 font-mono ${
                    gapAnalysis?.status === "ready"
                      ? "border-emerald-600 text-emerald-300"
                      : gapAnalysis?.status === "critical_gaps"
                      ? "border-amber-600 text-amber-300"
                      : "border-zinc-600 text-zinc-300"
                  }`}
                >
                  {gapAnalysis ? `${gapAnalysis.readinessScore}% Readiness` : "Auditing..."}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                {gapAnalysis?.headlineDiagnostic ||
                  "Auditing available media against your weekly revenue goal."}
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 truncate max-w-[190px]">
                {gapAnalysis?.recommendedShootList[0]
                  ? `Shoot: ${gapAnalysis.recommendedShootList[0].title}`
                  : "All core pillars covered"}
              </span>
              <Link href="/app/strategy" className="text-white hover:underline text-[11px] shrink-0 font-mono">
                Inspect Gaps &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 7-Day Strategy Sneak Peek */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Active 7-Day Content Schedule Overview
              </h2>
              <p className="text-xs text-zinc-400 font-sans pt-0.5">
                Synchronized specifically for {restaurantName} to convert lunch diners and weekend traffic.
              </p>
            </div>
            <Link href="/app/strategy">
              <Button variant="outline" size="sm" className="font-mono text-xs gap-1 border-zinc-700 hover:border-white">
                <span>Open Interactive Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {BENCHMARK_WEEKLY_PLAN.map((day, idx) => (
              <div
                key={day.id}
                className={`p-3 border flex flex-col justify-between space-y-2 ${
                  idx === 0
                    ? "border-white bg-black"
                    : "border-zinc-800 bg-black/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] pb-1 border-b border-zinc-900">
                    <span className="font-bold text-white">{day.dayOfWeek.slice(0, 3)}</span>
                    <span className="text-zinc-500">{day.recommendedTime.split(" ")[0]}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-sans font-medium line-clamp-2 pt-2">
                    {day.contentAngle}
                  </div>
                </div>
                <div className="text-[9px] uppercase tracking-wide text-zinc-500 pt-1">
                  {day.contentPillar}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
