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
  ChevronDown,
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
  Target,
  Sparkle,
  HelpCircle,
  FolderOpen,
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
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const activePlanDay = React.useMemo(() => {
    return BENCHMARK_WEEKLY_PLAN.find((p) => p.dayOfWeek === selectedDay) || BENCHMARK_WEEKLY_PLAN[0];
  }, [selectedDay]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "Who is ContentPilot for?",
      a: "ContentPilot is designed for independent restaurants, casual dining spots, fast-food outlets, cafés, bakeries, food delivery brands, cloud kitchens, and bars looking to turn their existing photos and videos into a disciplined social media marketing plan without hiring a costly agency.",
    },
    {
      q: "Is there a free version?",
      a: "Yes. Restaurants can get started on our Free plan at $0/month. You get 1 restaurant workspace, up to 10 content assets, basic AI content analysis, basic gap detection, and 1 weekly 7-day content plan with no credit card required.",
    },
    {
      q: "How does ContentPilot work?",
      a: "You upload the photos and smartphone clips you already have, select your weekly commercial goal (such as increasing weekday lunch orders or promoting a signature dish), and ContentPilot analyzes your assets, audits content gaps, and builds an actionable 7-day Instagram and TikTok schedule.",
    },
    {
      q: "Do I need to create new content before using ContentPilot?",
      a: "No. ContentPilot is purpose-built to help you make maximum use of the content already sitting in your camera roll. If an essential marketing pillar is underrepresented, ContentPilot flags the exact gap and creates a 10-second smartphone filming brief for your kitchen staff.",
    },
    {
      q: "Does ContentPilot automatically post to Instagram or TikTok?",
      a: "No. ContentPilot is an AI content strategist and planner, not an auto-scheduler. It generates high-converting opening hooks, captions, sound angles, and conversion CTAs tailored specifically for each platform, allowing you to review, approve, and publish with precision.",
    },
    {
      q: "Do I need to be good at marketing?",
      a: "No. ContentPilot acts as a junior content strategist working for your restaurant. It translates business objectives—like filling seats on slow Tuesdays or moving high-margin lunch specials—into clear, everyday guidance with zero marketing jargon.",
    },
    {
      q: "Can I use existing restaurant photos and videos?",
      a: "Yes. Raw kitchen prep footage, sizzle plates, staff line routines, dining room ambiance, and customer reaction clips right off your phone are central to the system.",
    },
    {
      q: "Can ContentPilot tell me what content I'm missing?",
      a: "Yes. Our automated Content Gap Analyzer evaluates your uploaded media across 5 commercial pillars (Product, Social Proof, Craft, BTS, and Community) and alerts you when your library is deficient in trust-building proof or direct promotional offers.",
    },
    {
      q: "Does ContentPilot work for Instagram and TikTok?",
      a: "Yes. It delivers distinct, platform-native adaptations for every day: authoritative visual captions and Story hooks for Instagram, alongside vertical POV sound hooks and pacing notes for TikTok.",
    },
    {
      q: "How do I sign up?",
      a: "Click 'Start Free' anywhere on this page, enter your account details, specify your restaurant name and location, and you will be inside your dedicated restaurant workspace in under 2 minutes.",
    },
    {
      q: "Do I need a large content library?",
      a: "No. You can start with as few as 5 to 10 raw clips. ContentPilot immediately identifies which assets to assign and highlights exactly what short clip to record next.",
    },
    {
      q: "Can I edit the AI-generated strategy?",
      a: "Yes. You can edit hooks, captions, calls-to-action, and recommended posting times directly from the interactive strategy board, and approve items to lock them in.",
    },
    {
      q: "Can I regenerate a strategy item?",
      a: "Yes. If you want an alternative creative angle for a particular day, click 'Regenerate Angle' to generate fresh hook and caption ideas while keeping the assigned asset and weekly commercial objective intact.",
    },
    {
      q: "What if I don't have the right content?",
      a: "ContentPilot cleanly differentiates between available footage and missing media. If a crucial angle is missing, it creates an actionable 'Shoot Brief' with vertical smartphone instructions rather than pretending an asset exists.",
    },
    {
      q: "Which restaurants can use ContentPilot?",
      a: "ContentPilot is built for all food establishments: casual dining restaurants, fast-food outlets, cafés, bakeries, delivery brands, cloud kitchens, bars, lounges, and food trucks.",
    },
    {
      q: "What makes ContentPilot different from a social media scheduler?",
      a: "Generic social media schedulers only organize and auto-publish files you have already made. ContentPilot helps you decide: what to post, why to post it, which existing asset to use, what content you are missing, and how to adapt each post for Instagram and TikTok.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* 1. HERO SECTION (Anti-Slop Swiss Monochrome) */}
      <section className="border-b border-zinc-800 bg-black pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
            <Utensils className="w-3.5 h-3.5 text-zinc-300" />
            <span>AI CONTENT STRATEGIST FOR RESTAURANTS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] font-sans">
            Turn the content you already have into a week&rsquo;s worth of restaurant marketing.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Upload your kitchen photos and phone videos, choose your weekly business goal, and get an AI-powered content plan for Instagram and TikTok. ContentPilot acts as a junior content strategist working directly for your restaurant.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/signup">
              <Button variant="default" size="lg" className="gap-2 font-mono text-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Build My Content Plan</span>
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
              You already have the content. You just don&rsquo;t know what to do with it.
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

      {/* 3. WORKFLOW GRAPHIC (How It Works) */}
      <section id="how-it-works" className="border-b border-zinc-800 bg-black py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              How ContentPilot Works
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              From Raw Camera Roll to a Strategic 7-Day Plan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
              1. Upload your content &rarr; 2. Choose your goal &rarr; 3. Get your platform-tailored strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs relative">
            {/* Step 1 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>01. UPLOAD CONTENT</span>
                <Cloud className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Raw Food Footage</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Drop in raw dish clips, sizzling prep videos, and photos straight from your smartphone. Stored securely in your private media library.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                JPG / PNG / WEBP / MP4 / MOV
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>02. CHOOSE GOAL</span>
                <Target className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Commercial Direction</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Select your focus: get more weekday lunch orders, promote a high-margin menu item, drive dine-in seats, or build trust with new diners.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                Goal-Driven AI Sequencing
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
                Mathematical distribution check. Flags missing angles (e.g. lack of customer social proof) and provides simple 5-second filming briefs.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                5 Pillars: Product / Proof / Craft / BTS / Vibe
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>04. 7-DAY PLAN</span>
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-white font-sans">Platform Copy &amp; CTAs</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Full 7-day schedule with distinct Instagram captions and TikTok POV hooks, recommended post times, and direct conversion CTAs.
              </p>
              <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                Instagram + TikTok Adaptations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE STRATEGY RUN (Demonstration of Intelligence) */}
      <section id="live-strategy" className="border-b border-zinc-800 bg-black py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] text-emerald-400 border border-emerald-900 bg-emerald-950/40 px-2 py-0.5">
                <span>INTERACTIVE PRODUCT DEMONSTRATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {BENCHMARK_RESTAURANT.name} &mdash; Live Strategy Run
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Goal: Increase Weekday Lunch Orders | Target: {BENCHMARK_RESTAURANT.targetAudience}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <Link href="/signup">
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

            {/* TAB 2: CONTENT GAP AUDIT */}
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
                      <Link href="/signup">
                        <Button variant="secondary" size="sm" className="w-full font-mono text-[11px]">
                          Audit Your Own Restaurant Assets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 5. PRICING SECTION (Buffer-Inspired Multi-Tier Architecture) */}
      <section id="pricing" className="border-b border-zinc-800 bg-zinc-950 py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-black px-3 py-1">
              <span>TRANSPARENT RESTAURANT PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Simple, Predictable Plans for Every Stage
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans">
              Start free with the footage you already have. Upgrade as your content library and multi-channel marketing grow.
            </p>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: FREE */}
            <div className="border border-zinc-800 bg-black p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    FREE
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold font-sans text-white">$0</span>
                    <span className="text-xs font-mono text-zinc-500">/month</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-1">
                    For restaurants getting started with AI-powered content strategy.
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-6 space-y-3 font-mono text-xs text-zinc-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>1 restaurant workspace</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Up to 10 content assets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Basic AI content analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Basic content gap insights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>1 weekly content strategy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>7-day content plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Instagram + TikTok recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Basic hooks, captions and CTAs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                <Link href="/signup">
                  <Button variant="outline" className="w-full font-mono text-xs border-zinc-700 hover:border-white">
                    Start Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: GROW (MOST POPULAR) */}
            <div className="border-2 border-white bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-white text-black font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                  MOST POPULAR
                </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    GROW
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold font-sans text-white">$5</span>
                    <span className="text-xs font-mono text-zinc-400">/month</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed pt-1">
                    For restaurants actively using content marketing to drive orders.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-6 space-y-3 font-mono text-xs text-zinc-200">
                  <div className="flex items-start gap-2 font-bold text-white">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Everything in Free, plus:</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Up to 100 content assets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Full multimodal AI content analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Full 5-pillar content gap audit</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Unlimited weekly strategy generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Single-day angle regeneration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Instagram + TikTok platform adaptations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Asset swapping &amp; shoot briefs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Inline brief editing &amp; markdown exports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>Priority access to new strategy models</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <Link href="/signup">
                  <Button variant="default" className="w-full font-mono text-xs">
                    Start Growing
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 3: PRO */}
            <div className="border border-zinc-800 bg-black p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    PRO
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold font-sans text-white">$10</span>
                    <span className="text-xs font-mono text-zinc-500">/month</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-1">
                    For high-volume restaurants with extensive libraries and multi-day shoots.
                  </p>
                </div>

                <div className="border-t border-zinc-900 pt-6 space-y-3 font-mono text-xs text-zinc-300">
                  <div className="flex items-start gap-2 font-bold text-white">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Everything in Grow, plus:</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Up to 500 content assets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Advanced AI vision tagging</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Deep multi-week content fatigue detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Unlimited strategy regenerations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Advanced content mix recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>High-priority multimodal processing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Priority email &amp; strategist support</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                <Link href="/signup">
                  <Button variant="outline" className="w-full font-mono text-xs border-zinc-700 hover:border-white">
                    Go Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Comparison Matrix Table (Buffer-Style Inspection) */}
          <div className="border border-zinc-800 bg-black p-6 space-y-4 font-mono text-xs">
            <div className="text-sm font-bold font-sans text-white border-b border-zinc-900 pb-3">
              Detailed Plan Feature Comparison
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                    <th className="py-3 pr-4 font-semibold">Capability</th>
                    <th className="py-3 px-4 font-semibold">Free ($0/mo)</th>
                    <th className="py-3 px-4 font-semibold text-white">Grow ($5/mo)</th>
                    <th className="py-3 pl-4 font-semibold">Pro ($10/mo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-[11px]">
                  {/* Category: Content */}
                  <tr className="bg-zinc-950/60 font-bold text-zinc-400">
                    <td colSpan={4} className="py-2.5 px-2 uppercase tracking-wider text-[10px]">
                      Content Storage &amp; Intake
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Content Asset Capacity</td>
                    <td className="py-2.5 px-4 text-zinc-400">10 assets</td>
                    <td className="py-2.5 px-4 text-white font-semibold">100 assets</td>
                    <td className="py-2.5 pl-4 text-zinc-300">500 assets</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Vision Angle &amp; Scene Tagging</td>
                    <td className="py-2.5 px-4 text-zinc-400">Basic</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Standard Multimodal</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Advanced High-Precision</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Pillar Deficit Audits</td>
                    <td className="py-2.5 px-4 text-zinc-400">Basic Summary</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Full 5-Pillar Matrix</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Full + Fatigue Alerts</td>
                  </tr>

                  {/* Category: Strategy */}
                  <tr className="bg-zinc-950/60 font-bold text-zinc-400">
                    <td colSpan={4} className="py-2.5 px-2 uppercase tracking-wider text-[10px]">
                      Strategy Engine &amp; Calendars
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">7-Day Plan Generation</td>
                    <td className="py-2.5 px-4 text-zinc-400">1 / week</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Unlimited</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Angle Regeneration</td>
                    <td className="py-2.5 px-4 text-zinc-500">&mdash;</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Unlimited per day</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Unlimited per day</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Platform Adaptations</td>
                    <td className="py-2.5 px-4 text-zinc-400">Standard IG + TikTok</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Native POV &amp; Story Hooks</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Deep Native + Hashtag clusters</td>
                  </tr>

                  {/* Category: Execution */}
                  <tr className="bg-zinc-950/60 font-bold text-zinc-400">
                    <td colSpan={4} className="py-2.5 px-2 uppercase tracking-wider text-[10px]">
                      Editing &amp; Workflow
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Inline Brief Editing</td>
                    <td className="py-2.5 px-4 text-zinc-500">&mdash;</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Included</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Included</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Shoot Briefs for Missing Media</td>
                    <td className="py-2.5 px-4 text-zinc-400">Basic</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Custom Smartphone Guides</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Custom Smartphone Guides</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-zinc-300">Export Run-Sheets &amp; Markdown</td>
                    <td className="py-2.5 px-4 text-zinc-500">&mdash;</td>
                    <td className="py-2.5 px-4 text-white font-semibold">Included</td>
                    <td className="py-2.5 pl-4 text-zinc-300">Included</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION (Accessible Accordion) */}
      <section id="faq" className="border-b border-zinc-800 bg-black py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950 px-3 py-1">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-lg mx-auto">
              Clear answers on how ContentPilot turns your kitchen photos and videos into a conversion engine.
            </p>
          </div>

          {/* Accordion List */}
          <div className="border border-zinc-800 divide-y divide-zinc-800 bg-zinc-950">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:bg-zinc-900 group"
                  >
                    <span className="font-sans font-semibold text-sm sm:text-base text-white group-hover:text-zinc-200 transition-colors">
                      {item.q}
                    </span>
                    <span
                      className={`p-1 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed animate-in fade-in duration-200 border-t border-zinc-900/60 bg-black/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px] font-mono">
            GET STARTED TODAY
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans max-w-2xl mx-auto leading-tight">
            Ready to turn the content you already have into a better week of restaurant marketing?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
            Upload your kitchen footage, choose your weekly goal, and receive a customized 7-day conversion strategy for Instagram and TikTok. Free forever on our starter tier.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button variant="default" size="lg" className="gap-2 font-mono text-xs">
                <span>Start Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <a href="#live-strategy">
              <Button variant="secondary" size="lg" className="gap-2 font-mono text-xs">
                <span>See How It Works</span>
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
