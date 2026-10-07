"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Building2,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_GOALS, BENCHMARK_RESTAURANT } from "@/lib/constants";
import {
  OnboardingGoalForm,
  getStoredGoalProfile,
  saveStoredGoalProfile,
  getStoredRestaurantProfile,
  DEFAULT_GOAL_PROFILE,
} from "@/lib/onboarding-store";
import { BusinessGoalType } from "@/lib/db/schema";

export default function OnboardingGoalPage() {
  const router = useRouter();

  const [restaurantProfile, setRestaurantProfile] = React.useState<any>(null);

  const [formData, setFormData] = React.useState<OnboardingGoalForm>(() => {
    return getStoredGoalProfile() || { ...DEFAULT_GOAL_PROFILE };
  });

  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    const profile = getStoredRestaurantProfile();
    setRestaurantProfile(profile);
  }, []);

  const handleGoalSelect = (goalId: BusinessGoalType) => {
    const selected = BUSINESS_GOALS.find((g) => g.id === goalId);
    setFormData((prev) => ({
      ...prev,
      goal: goalId,
      goalDescription:
        goalId === "increase_lunch_orders"
          ? "Increase delivery orders for corporate lunch combos from Monday to Thursday before 12:30 PM."
          : selected?.description || "",
    }));
  };

  const handleResetBenchmark = () => {
    setFormData({ ...DEFAULT_GOAL_PROFILE });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredGoalProfile(formData);
    setIsCompleted(true);
  };

  return (
    <div className="flex-1 bg-black text-white py-10 px-4 sm:px-6 selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb & Step Tracker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Restaurant Profile</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Weekly Business Goal Selection
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Step 2 of 2: Define your primary commercial objective for the upcoming 7-day schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetBenchmark}
              className="font-mono text-xs gap-1.5 border-zinc-700 hover:border-white"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Reset to Benchmark Goal</span>
            </Button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <Link
            href="/onboarding"
            className="p-3 border border-zinc-800 bg-black/60 flex items-center justify-between hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-zinc-300">
                1. {restaurantProfile?.name || "Restaurant Profile"}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 underline">EDIT</span>
          </Link>

          <div className="p-3 border border-white bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-white text-black font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="font-semibold text-white">Weekly Business Goal</span>
            </div>
            <Badge variant="default" className="text-[9px]">ACTIVE</Badge>
          </div>
        </div>

        {/* Main Grid: Form + Strategic Live Context */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 space-y-6 border border-zinc-800 bg-zinc-950 p-6">
            {/* Week Starting Date */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Week Starting Date *
              </label>
              <Input
                type="date"
                value={formData.weekStart}
                onChange={(e) => setFormData((prev) => ({ ...prev, weekStart: e.target.value }))}
                required
                className="font-sans text-sm max-w-xs"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Anchors Monday through Sunday in the 7-day schedule.
              </p>
            </div>

            {/* High-Intent Business Goals Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Select Primary Commercial Objective *
              </label>
              <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
                {BUSINESS_GOALS.map((goal) => {
                  const isSelected = formData.goal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`p-3.5 text-left border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{goal.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <p
                        className={`text-[11px] font-sans leading-relaxed ${
                          isSelected ? "text-zinc-700" : "text-zinc-500"
                        }`}
                      >
                        {goal.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strategic Notes / Operational Nuance */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Operational Context &amp; Constraints
              </label>
              <Textarea
                placeholder="e.g. Focus on pushing corporate lunch delivery combos from Mon to Thu before 12:30 PM. Emphasize firewood taste and prompt dispatch."
                value={formData.goalDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, goalDescription: e.target.value }))
                }
                rows={3}
                className="font-sans text-sm"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Instructs the AI on specific menu specials, cutoff times, or promotional pricing.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
              <Link href="/onboarding">
                <Button type="button" variant="outline" size="sm" className="font-mono text-xs">
                  Back
                </Button>
              </Link>
              <Button type="submit" variant="default" size="lg" className="gap-2 font-mono text-xs">
                <span>Lock Goal &amp; Finalize Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Right Live Strategy Card: 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                  <span>STRATEGY ENGINE PREVIEW</span>
                </div>
                <Badge variant="outline" className="text-[9px]">ACTIVE</Badge>
              </div>

              <div className="space-y-3 text-[11px] font-sans text-zinc-400 leading-relaxed">
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Target Profile:</div>
                  <div className="text-white font-medium">
                    {restaurantProfile?.name || "Ovie's Kitchen"} &bull;{" "}
                    {restaurantProfile?.location || "Akure, Ondo State"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">Selected Objective:</div>
                  <div className="text-white font-medium">
                    {BUSINESS_GOALS.find((g) => g.id === formData.goal)?.label}
                  </div>
                </div>

                <div className="p-3 border border-zinc-900 bg-black space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono">
                    Deterministic Plan Behavior:
                  </div>
                  <ul className="space-y-1.5 text-zinc-300 text-[11px] list-disc list-inside">
                    <li>Prioritizes high-urgency lunch conversion hooks Mon&ndash;Thu at 11:30 AM.</li>
                    <li>Schedules behind-the-scenes rush packaging clips to demonstrate speed.</li>
                    <li>Generates distinct Instagram authoritative copy and TikTok POV sound hooks.</li>
                    <li>Flags low social proof (&lt;10%) if customer review clips are missing.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Success Modal / Banner */}
            {isCompleted && (
              <div className="border border-white bg-zinc-950 p-5 space-y-4 font-mono text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-white font-bold">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ONBOARDING COMPLETE</span>
                </div>
                <p className="text-zinc-300 text-[11px] font-sans leading-relaxed">
                  Restaurant profile and weekly goal have been saved to your local session. You are now ready
                  to upload kitchen media and generate your 7-day conversion schedule.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/app">
                    <Button variant="default" className="w-full font-mono text-xs gap-1.5">
                      <span>Enter Main App Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href="/app/content">
                    <Button variant="secondary" className="w-full font-mono text-xs gap-1.5">
                      <span>Go Directly to Content Upload</span>
                    </Button>
                  </Link>
                  <Link href="/app/strategy">
                    <Button variant="secondary" className="w-full font-mono text-xs">
                      View 7-Day Strategy Schedule
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
