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

export default function AppStrategyPage() {
  const [selectedDay, setSelectedDay] = React.useState<string>("Monday");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [restaurantProfile, setRestaurantProfile] = React.useState<any>(null);
  const [goalProfile, setGoalProfile] = React.useState<any>(null);

  React.useEffect(() => {
    setRestaurantProfile(getStoredRestaurantProfile());
    setGoalProfile(getStoredGoalProfile());
  }, []);

  const restaurantName = restaurantProfile?.name || BENCHMARK_RESTAURANT.name;
  const activePlanDay = React.useMemo(() => {
    return BENCHMARK_WEEKLY_PLAN.find((p) => p.dayOfWeek === selectedDay) || BENCHMARK_WEEKLY_PLAN[0];
  }, [selectedDay]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 bg-black text-white p-4 sm:p-6 md:p-8 space-y-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>COMMERCIAL CONVERSION ENGINE</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-bold">{restaurantName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              7-Day Content Strategy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Deterministic posting schedule mapping your kitchen assets to weekly dining revenue goals.
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

        {/* Commercial Goal & Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Goal Card */}
          <div className="lg:col-span-5 p-5 border border-zinc-800 bg-zinc-950 space-y-4 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span className="uppercase">ACTIVE COMMERCIAL OBJECTIVE</span>
                <Target className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-lg font-bold text-white font-sans">
                Increase Weekday Lunch Orders
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Prioritizes high-urgency lunch conversion hooks Monday through Thursday before 12:30 PM.
                Directs diners to tap your WhatsApp link for zero-friction ordering.
              </p>
            </div>

            <div className="p-3 border border-zinc-900 bg-black space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Primary Conversion Channel</div>
              <div className="text-xs font-bold text-white font-mono">WhatsApp Bio Link + Story Stickers</div>
            </div>
          </div>

          {/* Content Pillar Balance Audit */}
          <div className="lg:col-span-7 p-5 border border-zinc-800 bg-zinc-950 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="font-bold text-white text-[11px] uppercase">Pillar Distribution Health</span>
              <Badge variant="outline" className="border-zinc-600 text-zinc-300 text-[9px]">
                DEFICIT DETECTED
              </Badge>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <div className="flex justify-between text-zinc-300 pb-1">
                  <span>Product &amp; Signature Dishes</span>
                  <span>29% (Satisfied)</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5">
                  <div className="bg-white h-1.5" style={{ width: "29%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 pb-1">
                  <span>Social Proof &amp; Customer Reactions</span>
                  <span className="text-zinc-300 font-bold">14% &mdash; Underrepresented (&lt;20%)</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5">
                  <div className="bg-zinc-400 h-1.5" style={{ width: "14%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 pb-1">
                  <span>Behind the Scenes &amp; Knife Work</span>
                  <span>29% (Healthy)</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5">
                  <div className="bg-white h-1.5" style={{ width: "29%" }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recommended fix: Upload 2 customer reaction clips to build social proof for lunch orders.</span>
            </div>
          </div>
        </div>

        {/* 7-Day Strategy Board */}
        <div className="space-y-6">
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

              <div className="p-4 border border-zinc-900 bg-black space-y-1.5">
                <div className="text-zinc-500 text-[10px] uppercase">Strategic Commercial Angle</div>
                <p className="text-zinc-200 text-sm leading-relaxed font-sans">{activePlanDay.contentAngle}</p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Recommended Post Time:</span>
                  <span className="text-white font-bold">{activePlanDay.recommendedTime}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Commercial Objective:</span>
                  <span className="text-white uppercase">{activePlanDay.objective}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Assigned Media Asset:</span>
                  <span className="text-white truncate max-w-[180px]">{activePlanDay.asset?.fileName}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[10px] text-zinc-500 uppercase pb-1">AI Asset Description:</div>
                <p className="text-[11px] text-zinc-400 italic font-sans leading-relaxed">
                  &ldquo;{activePlanDay.asset?.aiDescription}&rdquo;
                </p>
              </div>

              <div className="pt-2">
                <Link href="/app/content">
                  <Button variant="outline" size="sm" className="w-full font-mono text-xs gap-1.5 border-zinc-800 hover:border-white">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>View Assigned Media in Library</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Instagram vs TikTok Copy Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instagram Card */}
              <div className="border border-zinc-800 bg-black p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="font-bold text-white">INSTAGRAM COPY</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `${activePlanDay.instagramHook}\n\n${activePlanDay.instagramCaption}\n\n${activePlanDay.instagramCta}`,
                          "ig"
                        )
                      }
                      className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    >
                      {copiedKey === "ig" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">Opening Hook</div>
                    <p className="text-xs font-semibold text-white font-sans leading-snug">
                      {activePlanDay.instagramHook}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">Caption Body</div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {activePlanDay.instagramCaption}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-900 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase">Direct Call-To-Action</div>
                  <p className="text-[10px] text-zinc-300 font-sans font-medium">{activePlanDay.instagramCta}</p>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="border border-zinc-800 bg-black p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="font-bold text-white">TIKTOK COPY</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `POV: ${activePlanDay.tiktokHook}\n\n${activePlanDay.tiktokCaption}\n\n${activePlanDay.tiktokCta}`,
                          "tt"
                        )
                      }
                      className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    >
                      {copiedKey === "tt" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">On-Screen POV Hook</div>
                    <p className="text-xs font-semibold text-white font-sans leading-snug">
                      {activePlanDay.tiktokHook}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase">Sound &amp; Caption</div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {activePlanDay.tiktokCaption}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-900 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase">Direct Call-To-Action</div>
                  <p className="text-[10px] text-zinc-300 font-sans font-medium">{activePlanDay.tiktokCta}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
