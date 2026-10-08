"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  Calendar,
  Utensils,
  Share2,
  FileText,
  Clock,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Terminal,
  ExternalLink,
  Code2,
  Activity,
  Zap,
  UserPlus,
  AlertTriangle,
  Flame,
  ArrowDown,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  APP_CONFIG,
  BENCHMARK_RESTAURANT,
  BENCHMARK_WEEKLY_PLAN,
} from "@/lib/constants";

export default function HomePage() {
  const [selectedDay, setSelectedDay] = React.useState<string>("Monday");

  const activePlanDay = React.useMemo(() => {
    return BENCHMARK_WEEKLY_PLAN.find((p) => p.dayOfWeek === selectedDay) || BENCHMARK_WEEKLY_PLAN[0];
  }, [selectedDay]);

  return (
    <div className="flex-1 flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* 1. HERO SECTION (Anti-Slop Swiss Monochrome) */}
      <section className="border-b border-zinc-800 bg-black pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] font-sans">
            A Junior Content Strategist, Not a Caption Bot.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Engineered exclusively for restaurant operators. Upload raw kitchen prep and dish footage;
            ContentPilot extracts culinary angles, balances commercial pillars, and compiles a
            disciplined 7-day conversion schedule for Instagram and TikTok.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/onboarding">
              <Button variant="default" size="lg" className="gap-2 font-mono text-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Start Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <a href="#live-strategy">
              <Button variant="secondary" size="lg" className="gap-2 font-mono text-xs">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>View Live Strategy Run</span>
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM STATEMENT: WHY RESTAURANT SOCIAL MEDIA BREAKS */}
      <section className="border-b border-zinc-800 bg-zinc-950 py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              The Operational Reality
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Why Existing Social Media Fails Restaurant Owners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
              Chefs and kitchen managers belong on the line, not staring at blank caption boxes or paying agencies that don&rsquo;t understand food margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Problem 1 */}
            <div className="p-6 border border-zinc-800 bg-black space-y-4">
              <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-zinc-900">
                <span className="font-bold text-zinc-400">THE CAPTION BOT TRAP</span>
                <X className="w-5 h-5 text-red-500 stroke-[3]" />
              </div>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                Generic AI tools generate puns, superficial food descriptions, and random emojis without commercial intent. They produce zero lunchtime orders.
              </p>
              <div className="p-3 border border-zinc-900 bg-zinc-950/60 text-[11px] text-zinc-500 font-sans italic">
                &ldquo;Craving delicious food? Treat yourself to our mouthwatering treats today!&rdquo; &mdash; Zero revenue impact.
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-6 border border-zinc-800 bg-black space-y-4">
              <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-zinc-900">
                <span className="font-bold text-zinc-400">THE AGENCY RETAINER</span>
                <X className="w-5 h-5 text-red-500 stroke-[3]" />
              </div>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                Marketing agencies charge high monthly retainers, demand advance shoots, and post generic graphic templates days after your daily specials sell out.
              </p>
              <div className="p-3 border border-zinc-900 bg-zinc-950/60 text-[11px] text-zinc-500 font-sans italic">
                Heavy overhead, slow turnaround, disconnected from daily kitchen prep and real customer flow.
              </div>
            </div>

            {/* Problem 3: The ContentPilot Way */}
            <div className="p-6 border border-white bg-zinc-950 space-y-4">
              <div className="flex items-center justify-between text-white pb-2 border-b border-zinc-800">
                <span className="font-bold">THE CONTENTPILOT STRATEGY</span>
                <Check className="w-5 h-5 text-green-500 stroke-[3]" />
              </div>
              <p className="text-zinc-200 text-xs font-sans leading-relaxed">
                A 15-minute weekly workflow. Drop your raw phone footage; ContentPilot extracts culinary angles, enforces pillar balance, and delivers a 7-day conversion schedule.
              </p>
              <div className="p-3 border border-zinc-800 bg-black text-[11px] text-zinc-300 font-sans font-medium">
                Audience-timed conversion hooks tied directly to your stated weekly business goal.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKFLOW GRAPHIC (Interactive Architecture Visual) */}
      <section className="border-b border-zinc-800 bg-black py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              Interactive Architecture Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              From Raw Kitchen Clips to Scheduled Conversion
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
              How the multimodal strategist transforms phone video into platform-native Instagram &amp; TikTok copy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs relative">
            {/* Step 1 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>01. BATCH UPLOAD</span>
                <Cloud className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Raw Media Intake</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Drag and drop up to 50 raw phone videos or kitchen photos. Instantly stored securely in your private cloud media library.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                Format: MP4 / MOV / JPG
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>02. VISION ANALYSIS</span>
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Culinary Scene &amp; Angle Detection</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Our visual engine inspects every frame—identifying steaming signature dishes, kitchen knife work, customer reactions, and lunch rush pacing.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                High-Precision Visual Tagging | Zero Fluff
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>03. GAP AUDIT</span>
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Pillar Balancing</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Mathematical distribution check. Flags deficit pillars (e.g., &lt;10% social proof) and alerts the operator.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                5 Pillars: Product / Proof / Craft / BTS / Vibe
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>04. CALENDAR</span>
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">7-Day Conversion Plan</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Day-by-day distribution with distinct Instagram and TikTok copy, lunch rush timing, and direct WhatsApp CTAs.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                Keep / Edit / Export to PDF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE STRATEGY RUN */}
      <section id="live-strategy" className="border-b border-zinc-800 bg-black py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {BENCHMARK_RESTAURANT.name} — Live Strategy Run
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Location: {BENCHMARK_RESTAURANT.location} | Target: {BENCHMARK_RESTAURANT.targetAudience}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <Link href="/onboarding">
                <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 border-zinc-700 hover:border-white">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Configure Your Restaurant</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Tabs */}
          <Tabs defaultValue="calendar">
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>7-Day Calendar Board</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="audit">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Pillar Gap Audit</span>
                </span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CALENDAR BOARD */}
            <TabsContent value="calendar">
              <div className="space-y-6">
                {/* Day Selector Pills */}
                <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-3 font-mono text-xs">
                  {BENCHMARK_WEEKLY_PLAN.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedDay(plan.dayOfWeek)}
                      className={`px-3 py-1.5 text-xs transition-all ${
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
                      <span className="text-lg font-bold text-white font-sans">{activePlanDay.dayOfWeek}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {activePlanDay.contentPillar}
                      </Badge>
                    </div>

                    <div className="p-3 border border-zinc-900 bg-black space-y-1.5">
                      <div className="text-zinc-500 text-[10px] uppercase">Strategic Commercial Angle</div>
                      <p className="text-zinc-300 text-xs leading-relaxed font-sans">{activePlanDay.contentAngle}</p>
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
                  </div>

                  {/* Right: Instagram vs TikTok Copy Cards */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Instagram Card */}
                    <div className="border border-zinc-800 bg-black p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                          <span className="font-bold text-white">INSTAGRAM COPY</span>
                          <span className="text-[10px] text-zinc-500">FEED / REELS</span>
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
                    <div className="border border-zinc-800 bg-black p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                          <span className="font-bold text-white">TIKTOK COPY</span>
                          <span className="text-[10px] text-zinc-500">VIRAL PACING</span>
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
            </TabsContent>

            {/* TAB 3: CONTENT GAP AUDIT */}
            <TabsContent value="audit">
              <div className="border border-zinc-800 bg-zinc-950 p-6 space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-sans">
                      Automated Content Balance Analysis
                    </h3>
                    <p className="text-xs text-zinc-400 pt-1 font-sans">
                      Calculates the percentage share of each pillar across the uploaded library and alerts on deficiencies.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-zinc-500 text-zinc-300 bg-zinc-900 text-[10px]">
                    DEFICIT DETECTED
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distribution Matrix */}
                  <div className="space-y-3">
                    <div className="text-zinc-500 text-[10px] uppercase font-bold">Current Library Distribution</div>
                    <div className="space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Product &amp; Menu Dishes</span>
                          <span>29% (2/7 assets)</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-white h-1.5" style={{ width: "29%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Social Proof &amp; Customer Reactions</span>
                          <span className="text-zinc-300 font-bold">14% (1/7 assets) &mdash; LOW</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-zinc-400 h-1.5" style={{ width: "14%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Education &amp; Culinary Technique</span>
                          <span>14% (1/7 assets)</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-white h-1.5" style={{ width: "14%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Behind the Scenes &amp; Prep</span>
                          <span>14% (1/7 assets)</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-white h-1.5" style={{ width: "14%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Community &amp; Dining Room Vibe</span>
                          <span>14% (1/7 assets)</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-white h-1.5" style={{ width: "14%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-zinc-300">
                          <span>Direct Promotion &amp; Combos</span>
                          <span>14% (1/7 assets)</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5">
                          <div className="bg-white h-1.5" style={{ width: "14%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Automated Strategic Guidance */}
                  <div className="p-4 border border-zinc-900 bg-black space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <ShieldAlert className="w-4 h-4 text-zinc-400" />
                      <span>STRATEGIST RECOMMENDATION</span>
                    </div>

                    <div className="space-y-2 text-[11px] font-sans text-zinc-300 leading-relaxed">
                      <p>
                        Your library contains only <strong>1 customer reaction clip (14%)</strong>. For a goal centered on
                        &ldquo;Increasing Weekday Lunch Orders&rdquo;, first-time diners require reassurance on food safety,
                        clean packaging, and generous portion sizing.
                      </p>
                      <p className="text-zinc-400">
                        <strong>Actionable Next Step:</strong> Ask kitchen staff to record 2 brief 5-second video clips of
                        office workers receiving their lunch bags or smiling at clean empty plates tomorrow.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="secondary" size="sm" className="w-full font-mono text-[11px]">
                        Dismiss &amp; Proceed with Live Strategy Run
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 5. BOTTOM ONBOARDING CTA BANNER */}
      <section className="py-14 px-4 sm:px-6 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">
            START WITH YOUR ESTABLISHMENT
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Ready to Build Your Restaurant&rsquo;s 7-Day Strategy?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
            Set up your restaurant profile in under 2 minutes. Define your target diners, pick your weekly commercial goal,
            and connect your raw media library.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/onboarding">
              <Button variant="default" size="lg" className="gap-2 font-mono text-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Launch Onboarding (Step 1)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
