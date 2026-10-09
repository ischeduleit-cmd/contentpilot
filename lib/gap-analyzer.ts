/**
 * ContentPilot Content Gap Analysis Engine (Phase 5)
 * 
 * Evaluates available categorized media assets against the restaurant's
 * active weekly business goal and audience to answer:
 * "What content is this restaurant missing to hit its goal this week?"
 * 
 * Pure Lucide-friendly structures, zero emojis, deterministic commercial intelligence.
 */

import {
  ContentAsset,
  ContentPillar,
  ContentObjective,
  BusinessGoalType,
} from "./db/schema";
import { BENCHMARK_RESTAURANT, CONTENT_PILLARS } from "./constants";

export interface RestaurantGapContext {
  id: string;
  name: string;
  location?: string;
  restaurantType?: string;
  targetAudience?: string;
  primaryCustomerAction?: string;
}

export interface PillarDistributionItem {
  id: ContentPillar;
  label: string;
  count: number;
  percentage: number;
  benchmarkPercentage: number;
  status: "optimal" | "balanced" | "underrepresented" | "missing";
  deficitCount: number;
}

export interface ContentGapItem {
  pillar: ContentPillar;
  title: string;
  severity: "critical" | "moderate" | "low";
  impactDescription: string;
  recommendedShootBrief: {
    title: string;
    instructions: string;
    targetDuration: string;
    optimalTime: string;
  };
}

export interface GapAnalysisResult {
  restaurantId: string;
  activeGoal: BusinessGoalType;
  activeGoalTitle: string;
  activeGoalDescription: string;
  totalAssetsCount: number;
  photosCount: number;
  videosCount: number;
  readinessScore: number; // 0 to 100
  status: "ready" | "moderate_gaps" | "critical_gaps";
  headlineDiagnostic: string;
  commercialRationale: string;
  pillarDistribution: PillarDistributionItem[];
  identifiedGaps: ContentGapItem[];
  strengths: string[];
  recommendedShootList: Array<{
    pillar: ContentPillar;
    title: string;
    instructions: string;
    duration: string;
    filmingWindow: string;
  }>;
}

/**
 * Ideal benchmark pillar distributions tailored to specific restaurant goals
 */
const GOAL_BENCHMARKS: Record<
  BusinessGoalType,
  {
    title: string;
    description: string;
    weights: Record<ContentPillar, number>; // percentages summing to 100
  }
> = {
  get_more_orders: {
    title: "Get More Orders",
    description: "Generate immediate delivery, takeout, or dine-in orders with high-urgency conversion hooks.",
    weights: {
      product: 35,
      behind_the_scenes: 20,
      social_proof: 20,
      promotion: 15,
      education: 5,
      community: 5,
    },
  },
  promote_menu: {
    title: "Promote Menu",
    description: "Spotlight signature dishes, specials, or newly added specialties with irresistible visuals.",
    weights: {
      product: 40,
      education: 20,
      social_proof: 20,
      promotion: 10,
      behind_the_scenes: 5,
      community: 5,
    },
  },
  bring_customers_in: {
    title: "Bring Customers into Restaurant",
    description: "Drive foot traffic and dine-in tables during lunch hours and dinner service.",
    weights: {
      community: 30,
      social_proof: 25,
      product: 25,
      behind_the_scenes: 10,
      promotion: 10,
      education: 0,
    },
  },
  increase_lunch_orders: {
    title: "Increase Weekday Lunch Orders",
    description:
      "Target corporate professionals, civil servants, and 9-to-5 workers between 11:00 AM and 2:00 PM for fast takeaway or delivery.",
    weights: {
      product: 30,
      behind_the_scenes: 25,
      social_proof: 20,
      promotion: 15,
      education: 5,
      community: 5,
    },
  },
  promote_menu_item: {
    title: "Promote a Specific Menu Item",
    description:
      "Spotlight a signature specialty, margin driver, or new culinary dish with irresistible closeups and craft storytelling.",
    weights: {
      product: 40,
      education: 20,
      social_proof: 20,
      promotion: 10,
      behind_the_scenes: 5,
      community: 5,
    },
  },
  drive_dine_in: {
    title: "Drive Dine-in Foot Traffic",
    description:
      "Fill physical dining tables during off-peak hours and weekends by featuring ambient seating, music, and atmosphere.",
    weights: {
      community: 30,
      social_proof: 25,
      product: 25,
      behind_the_scenes: 10,
      promotion: 10,
      education: 0,
    },
  },
  build_trust: {
    title: "Build Trust & Social Proof",
    description:
      "Eliminate buyer hesitation by proving cleanliness, raw ingredient freshness, and authentic patron satisfaction.",
    weights: {
      social_proof: 35,
      behind_the_scenes: 25,
      education: 20,
      product: 15,
      community: 5,
      promotion: 0,
    },
  },
  increase_awareness: {
    title: "Increase Local Brand Awareness",
    description:
      "Expand discovery among nearby diners who have never ordered through high-retention video hooks and local culture.",
    weights: {
      education: 25,
      behind_the_scenes: 25,
      product: 25,
      community: 15,
      social_proof: 10,
      promotion: 0,
    },
  },
  increase_engagement: {
    title: "Boost Engagement & Community",
    description:
      "Generate lively culinary conversations, debates, and shares across Instagram and TikTok.",
    weights: {
      education: 30,
      community: 25,
      behind_the_scenes: 20,
      product: 15,
      social_proof: 10,
      promotion: 0,
    },
  },
  promote_event: {
    title: "Promote Weekend Special or Event",
    description:
      "Drive RSVPs and reservations for weekend brunch, live acoustic nights, or seasonal tasting menus.",
    weights: {
      promotion: 30,
      community: 30,
      product: 20,
      social_proof: 15,
      behind_the_scenes: 5,
      education: 0,
    },
  },
  other: {
    title: "Custom Marketing Goal",
    description: "Balanced weekly conversion plan tailored across core restaurant storytelling pillars.",
    weights: {
      product: 30,
      behind_the_scenes: 20,
      social_proof: 20,
      promotion: 15,
      community: 10,
      education: 5,
    },
  },
};

/**
 * High-leverage smartphone filming briefs by pillar
 */
const PILLAR_SHOOT_BRIEFS: Record<
  ContentPillar,
  {
    title: string;
    instructions: string;
    duration: string;
    optimalTime: string;
    impact: string;
  }
> = {
  social_proof: {
    title: "Diner First-Bite Reaction or Clean Plate",
    instructions:
      "Ask a regular customer if you can record a 5-second clip of them nodding after their first bite or zooming in on an empty plate with a thumbs up.",
    duration: "5 to 8 seconds",
    optimalTime: "12:45 PM - 1:30 PM (Midday peak)",
    impact: "Eliminates hesitation for prospective corporate diners who need peer validation before ordering.",
  },
  behind_the_scenes: {
    title: "11:45 AM Rush Takeaway Packaging Line",
    instructions:
      "Position your smartphone at counter height. Film your staff rapidly boxing and foil-wrapping 5 takeaway packs for courier pickup.",
    duration: "10 to 12 seconds",
    optimalTime: "11:45 AM - 12:15 PM (Pre-lunch rush)",
    impact: "Proves speed and packaging hygiene, calming customer fears of delayed or messy food delivery.",
  },
  product: {
    title: "Steaming Macro Sizzle Spotlight",
    instructions:
      "Capture a tight, well-lit closeup of your signature dish right as it is plated, focusing on steam, glistening sauce, and fresh garnishes.",
    duration: "6 to 10 seconds",
    optimalTime: "11:00 AM (Fresh batch completion)",
    impact: "Triggers immediate biological appetite cues right before lunch decisions are finalized.",
  },
  education: {
    title: "Raw Seasoning or Firewood Simmer Spotlight",
    instructions:
      "Show a 10-second clip of your chef stirring the reduction pot, highlighting a specific whole spice or signature cooking technique.",
    duration: "10 to 15 seconds",
    optimalTime: "9:30 AM - 10:30 AM (Morning prep)",
    impact: "Elevates your food above generic fast food by showcasing deliberate culinary craft.",
  },
  community: {
    title: "Warm Midday Dining Room Atmosphere",
    instructions:
      "Slow, smooth panning shot of people dining comfortably at wooden tables with natural window light.",
    duration: "8 to 12 seconds",
    optimalTime: "1:00 PM - 2:00 PM (Busy lunch session)",
    impact: "Invites dine-in guests and remote workers looking for a welcoming local atmosphere.",
  },
  promotion: {
    title: "Executive Lunch Combo Box Breakdown",
    instructions:
      "Unbox your lunch pack on a clean table: open the container, reveal the sides, drink, and utensils in one smooth motion.",
    duration: "10 to 15 seconds",
    optimalTime: "11:15 AM (Pre-order announcement)",
    impact: "Provides price transparency and shows complete portion value at a glance.",
  },
};

/**
 * Execute Content Gap Analysis for a given set of assets and active goal
 */
export function analyzeContentGaps(
  assets: ContentAsset[],
  goalType: BusinessGoalType = "increase_lunch_orders",
  restaurantContext?: Partial<RestaurantGapContext>
): GapAnalysisResult {
  const restaurantName = restaurantContext?.name || BENCHMARK_RESTAURANT.name;
  const restaurantLocation = restaurantContext?.location || BENCHMARK_RESTAURANT.location;
  const benchmark = GOAL_BENCHMARKS[goalType] || GOAL_BENCHMARKS.increase_lunch_orders;

  const totalCount = assets.length;
  const photosCount = assets.filter(
    (a) => a.mediaType === "image" || a.mimeType?.startsWith("image/")
  ).length;
  const videosCount = assets.filter(
    (a) => a.mediaType === "video" || a.mimeType?.startsWith("video/")
  ).length;

  // Count by pillar
  const pillarCounts: Record<ContentPillar, number> = {
    product: 0,
    social_proof: 0,
    education: 0,
    behind_the_scenes: 0,
    community: 0,
    promotion: 0,
  };

  assets.forEach((asset) => {
    const p = (asset.contentPillar as ContentPillar) || "product";
    if (pillarCounts[p] !== undefined) {
      pillarCounts[p]++;
    } else {
      pillarCounts.product++;
    }
  });

  // Build pillar distribution items
  const distribution: PillarDistributionItem[] = CONTENT_PILLARS.map((col) => {
    const id = col.id as ContentPillar;
    const count = pillarCounts[id] || 0;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    const benchmarkPct = benchmark.weights[id] || 0;

    let status: "optimal" | "balanced" | "underrepresented" | "missing" = "balanced";
    let deficitCount = 0;

    if (benchmarkPct > 0 && count === 0) {
      status = "missing";
      deficitCount = Math.max(1, Math.round((benchmarkPct / 100) * Math.max(7, totalCount)));
    } else if (benchmarkPct > 15 && percentage < benchmarkPct * 0.5) {
      status = "underrepresented";
      deficitCount = Math.max(1, Math.ceil(((benchmarkPct - percentage) / 100) * totalCount));
    } else if (percentage >= benchmarkPct * 0.8 && percentage <= benchmarkPct * 1.5) {
      status = "optimal";
    }

    return {
      id,
      label: col.label,
      count,
      percentage,
      benchmarkPercentage: benchmarkPct,
      status,
      deficitCount,
    };
  });

  // Identify specific gaps
  const identifiedGaps: ContentGapItem[] = [];
  const strengths: string[] = [];

  distribution.forEach((item) => {
    const brief = PILLAR_SHOOT_BRIEFS[item.id];
    if (item.status === "missing" && item.benchmarkPercentage >= 15) {
      identifiedGaps.push({
        pillar: item.id,
        title: `Zero ${item.label} Footage`,
        severity: "critical",
        impactDescription: brief.impact,
        recommendedShootBrief: {
          title: brief.title,
          instructions: brief.instructions,
          targetDuration: brief.duration,
          optimalTime: brief.optimalTime,
        },
      });
    } else if (item.status === "underrepresented" && item.benchmarkPercentage >= 15) {
      identifiedGaps.push({
        pillar: item.id,
        title: `Underrepresented ${item.label} (${item.percentage}% vs ${item.benchmarkPercentage}% target)`,
        severity: "moderate",
        impactDescription: brief.impact,
        recommendedShootBrief: {
          title: brief.title,
          instructions: brief.instructions,
          targetDuration: brief.duration,
          optimalTime: brief.optimalTime,
        },
      });
    } else if (item.status === "optimal" || (item.percentage >= 20 && item.benchmarkPercentage >= 15)) {
      strengths.push(`Strong library of ${item.label} (${item.count} assets, ${item.percentage}% share)`);
    }
  });

  // Calculate readiness score (0 - 100)
  let score = 50; // baseline

  // Volume factor (need at least 5 assets for a reliable 7-day schedule)
  if (totalCount >= 7) score += 20;
  else if (totalCount >= 4) score += 10;
  else score -= 20;

  // Video factor (at least 1 video is crucial for TikTok/Reels)
  if (videosCount >= 2) score += 15;
  else if (videosCount === 1) score += 5;
  else score -= 15;

  // Gaps penalty
  const criticalCount = identifiedGaps.filter((g) => g.severity === "critical").length;
  const moderateCount = identifiedGaps.filter((g) => g.severity === "moderate").length;
  score -= criticalCount * 18;
  score -= moderateCount * 8;

  // Clamp score
  const readinessScore = Math.max(15, Math.min(98, score));

  // Determine overall status
  let status: "ready" | "moderate_gaps" | "critical_gaps" = "moderate_gaps";
  if (readinessScore >= 75) {
    status = "ready";
  } else if (readinessScore < 50 || criticalCount >= 2) {
    status = "critical_gaps";
  }

  // Generate commercial diagnostic headline & narrative
  let headlineDiagnostic = "";
  let commercialRationale = "";

  if (totalCount === 0) {
    headlineDiagnostic = "Library empty. Upload existing phone footage to begin strategic mapping.";
    commercialRationale = `Without visual media, ${restaurantName} cannot generate a deterministic schedule. Even 4 raw smartphone clips of your dishes and kitchen will unlock your full weekly plan.`;
  } else if (criticalCount > 0) {
    const missingNames = identifiedGaps
      .filter((g) => g.severity === "critical")
      .map((g) => g.pillar.replace(/_/g, " "))
      .join(" and ");

    headlineDiagnostic = `Critical deficit: Missing ${missingNames} footage for your lunch goal.`;
    commercialRationale = `While you have ${photosCount} product assets to showcase food quality, corporate diners in ${restaurantLocation || "your area"} require visual reassurance of packaging speed and peer reactions before choosing where to order delivery.`;
  } else if (moderateCount > 0) {
    headlineDiagnostic = "Sufficient content available, but slight imbalance in social proof.";
    commercialRationale = `Your current library can support a full 7-day schedule, but adding 1 quick patron reaction clip will noticeably boost Monday-to-Thursday conversion rates.`;
  } else {
    headlineDiagnostic = "Well-balanced media library aligned with your commercial goal.";
    commercialRationale = `Your mix of product sizzle, kitchen dispatch, and customer validation provides optimal coverage across Instagram and TikTok for this week.`;
  }

  // Recommended shoot list (top 2 highest leverage briefs)
  const recommendedShootList = identifiedGaps.slice(0, 2).map((g) => ({
    pillar: g.pillar,
    title: g.recommendedShootBrief.title,
    instructions: g.recommendedShootBrief.instructions,
    duration: g.recommendedShootBrief.targetDuration,
    filmingWindow: g.recommendedShootBrief.optimalTime,
  }));

  // If no gaps, provide a proactive maintenance brief
  if (recommendedShootList.length === 0) {
    const fallbackBrief = PILLAR_SHOOT_BRIEFS.social_proof;
    recommendedShootList.push({
      pillar: "social_proof",
      title: fallbackBrief.title,
      instructions: fallbackBrief.instructions,
      duration: fallbackBrief.duration,
      filmingWindow: fallbackBrief.optimalTime,
    });
  }

  return {
    restaurantId: restaurantContext?.id || BENCHMARK_RESTAURANT.id,
    activeGoal: goalType,
    activeGoalTitle: benchmark.title,
    activeGoalDescription: benchmark.description,
    totalAssetsCount: totalCount,
    photosCount,
    videosCount,
    readinessScore,
    status,
    headlineDiagnostic,
    commercialRationale,
    pillarDistribution: distribution,
    identifiedGaps,
    strengths,
    recommendedShootList,
  };
}
