export type PlanId = "free" | "grow" | "pro";

export const PLANS = {
  free: {
    id: "free" as const, name: "Free", monthlyNgn: 0, maxAssets: 10, maxWeeklyPlans: 1,
    note: "For restaurants starting with a clear weekly plan.",
    features: ["One restaurant workspace", "Up to 10 content assets", "Basic content analysis", "Content gap insights", "One seven-day plan each week", "Instagram and TikTok recommendations", "Hooks, captions, and calls to action"],
    cta: "Start Free",
  },
  grow: {
    id: "grow" as const, name: "Grow", monthlyNgn: 30000, maxAssets: 100, maxWeeklyPlans: null,
    note: "For restaurants building a consistent content rhythm.", popular: true,
    features: ["Everything in Free", "Up to 100 content assets", "Full content gap analysis", "Instagram and TikTok adaptations", "Existing-asset recommendations", "Content replacement recommendations", "Edit, regenerate, copy, and export plans"],
    cta: "Start Growing",
  },
  pro: {
    id: "pro" as const, name: "Pro", monthlyNgn: 50000, maxAssets: 500, maxWeeklyPlans: null,
    note: "For larger libraries and more demanding planning needs.",
    features: ["Everything in Grow", "Up to 500 content assets", "Advanced content analysis", "Detailed weekly recommendations", "Platform-specific recommendations", "Advanced content-mix recommendations"],
    cta: "Go Pro",
  },
} as const;

export function getPlan(plan: string | null | undefined) {
  return plan === "grow" ? PLANS.grow : plan === "pro" ? PLANS.pro : PLANS.free;
}
