/**
 * ContentPilot Weekly Content Strategy Engine (Phase 6)
 * 
 * Synthesizes:
 * - Restaurant Context (Audience, Location, Primary Action)
 * - Active Weekly Goal (e.g. increase_lunch_orders, promote_menu_item, drive_dine_in)
 * - Available Media Assets in Library
 * - Content Gap Analysis Insights (deficits, missing footage)
 * 
 * Output: Actionable 7-Day Commercial Content Plan (Monday to Sunday)
 * Zero emojis, pure Lucide icons, grounded in restaurant dining rhythms.
 */

import {
  ContentPlan,
  ContentPlanItem,
  ContentAsset,
  ContentPillar,
  ContentObjective,
  BusinessGoalType,
  ContentToCreateBrief,
  PlatformAdaptation,
} from "./db/schema";
import { BENCHMARK_RESTAURANT } from "./constants";
import { analyzeContentGaps, GapAnalysisResult } from "./gap-analyzer";

export interface StrategyGenerationInput {
  restaurantId: string;
  restaurantName?: string;
  location?: string;
  restaurantType?: string;
  targetAudience?: string;
  primaryCustomerAction?: string;
  goal?: BusinessGoalType;
  goalDescription?: string;
  weekStart?: string; // YYYY-MM-DD
  availableAssets?: ContentAsset[];
  customAngle?: string;
}

export interface StrategyPlanOutput {
  plan: ContentPlan;
  items: ContentPlanItem[];
  meta: {
    restaurantId: string;
    goal: BusinessGoalType;
    totalAssetsEvaluated: number;
    matchedAssetsCount: number;
    briefsToCreateCount: number;
    readinessScore: number;
    diagnosticNote: string;
  };
}

/**
 * Helper to compute upcoming Monday date if not provided
 */
function getUpcomingMonday(baseDate: Date = new Date()): string {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * 7-Day Day-by-Day Strategic Blueprint Matrix
 * Tailored to restaurant dining behavior and meal decisions
 */
interface DayBlueprint {
  dayOfWeek: ContentPlanItem["dayOfWeek"];
  dayOffset: number; // 0 for Mon, 6 for Sun
  defaultPillar: ContentPillar;
  secondaryPillar: ContentPillar;
  defaultObjective: ContentObjective;
  recommendedTime: string;
  rhythmDescription: string;
}

const WEEKLY_BLUEPRINT: DayBlueprint[] = [
  {
    dayOfWeek: "Monday",
    dayOffset: 0,
    defaultPillar: "product",
    secondaryPillar: "behind_the_scenes",
    defaultObjective: "conversion",
    recommendedTime: "11:30 AM",
    rhythmDescription: "Solve the Monday office lunch dilemma before 12 PM meetings start.",
  },
  {
    dayOfWeek: "Tuesday",
    dayOffset: 1,
    defaultPillar: "social_proof",
    secondaryPillar: "product",
    defaultObjective: "trust",
    recommendedTime: "12:00 PM",
    rhythmDescription: "Peer validation from real diners to eliminate hesitation for new corporate patrons.",
  },
  {
    dayOfWeek: "Wednesday",
    dayOffset: 2,
    defaultPillar: "education",
    secondaryPillar: "behind_the_scenes",
    defaultObjective: "trust",
    recommendedTime: "10:45 AM",
    rhythmDescription: "Midweek technique spotlight: slow simmering and craft ingredients that justify quality.",
  },
  {
    dayOfWeek: "Thursday",
    dayOffset: 3,
    defaultPillar: "promotion",
    secondaryPillar: "product",
    defaultObjective: "conversion",
    recommendedTime: "11:15 AM",
    rhythmDescription: "Departmental group orders and corporate desk combo package unboxings.",
  },
  {
    dayOfWeek: "Friday",
    dayOffset: 4,
    defaultPillar: "behind_the_scenes",
    secondaryPillar: "promotion",
    defaultObjective: "conversion",
    recommendedTime: "11:30 AM",
    rhythmDescription: "High-energy dispatch line tempo: packaging 25 orders in 12 minutes for celebration lunch.",
  },
  {
    dayOfWeek: "Saturday",
    dayOffset: 5,
    defaultPillar: "product",
    secondaryPillar: "community",
    defaultObjective: "awareness",
    recommendedTime: "1:00 PM",
    rhythmDescription: "Weekend transition to dine-in comfort, family tables, and leisurely recovery specials.",
  },
  {
    dayOfWeek: "Sunday",
    dayOffset: 6,
    defaultPillar: "community",
    secondaryPillar: "social_proof",
    defaultObjective: "engagement",
    recommendedTime: "3:30 PM",
    rhythmDescription: "Sunday family table atmosphere, dining room traditions, and gratitude for weekly regulars.",
  },
];

/**
 * Generate commercial conversion CTAs tailored to customer channel
 */
function generateCta(action: string, contextName: string): string {
  switch (action) {
    case "order_delivery":
      return "Order direct delivery online or tap link in bio for 20-minute dispatch.";
    case "whatsapp_order":
      return `Tap link in bio or message our WhatsApp order desk to lock in your plate before rush hour.`;
    case "dine_in":
      return `Walk in today or message us to reserve your department table at ${contextName}.`;
    case "table_reservation":
      return "Reserve your table in advance via our bio link or call ahead for groups.";
    default:
      return "Send us a direct message or tap link in bio to place today's order.";
  }
}

/**
 * Strategy Generator Core Engine
 */
export async function generateWeeklyContentStrategy(
  input: StrategyGenerationInput
): Promise<StrategyPlanOutput> {
  const restaurantId = input.restaurantId || BENCHMARK_RESTAURANT.id;
  const restaurantName = input.restaurantName || BENCHMARK_RESTAURANT.name;
  const location = input.location || BENCHMARK_RESTAURANT.location;
  const audience =
    input.targetAudience ||
    "Bankers, civil servants, 9-to-5 corporate workers, and university students";
  const action = input.primaryCustomerAction || "whatsapp_order";
  const goal: BusinessGoalType = input.goal || "increase_lunch_orders";
  const weekStart = input.weekStart || getUpcomingMonday();
  const availableAssets = input.availableAssets || [];

  // Run Gap Analysis to identify deficits and shooting recommendations
  const gapAnalysis: GapAnalysisResult = analyzeContentGaps(
    availableAssets,
    goal,
    {
      id: restaurantId,
      name: restaurantName,
      location,
      targetAudience: audience,
      primaryCustomerAction: action,
    }
  );

  const planId = `plan-${restaurantId}-${weekStart}`;
  const usedAssetIds = new Set<string>();
  const strategyItems: ContentPlanItem[] = [];

  // Iterate across Monday through Sunday
  for (const blueprint of WEEKLY_BLUEPRINT) {
    const scheduledDate = addDaysToDate(weekStart, blueprint.dayOffset);
    const dayName = blueprint.dayOfWeek;

    // Check if the primary pillar is in deficit from Gap Analysis
    const primaryPillarDeficit = gapAnalysis.identifiedGaps.find(
      (g) => g.pillar === blueprint.defaultPillar
    );

    // Asset matching attempt: match primary pillar, else secondary pillar
    let matchedAsset: ContentAsset | null = null;

    const candidatePrimary = availableAssets.find(
      (a) =>
        a.contentPillar === blueprint.defaultPillar &&
        !usedAssetIds.has(a.id)
    );

    if (candidatePrimary) {
      matchedAsset = candidatePrimary;
      usedAssetIds.add(candidatePrimary.id);
    } else {
      const candidateSecondary = availableAssets.find(
        (a) =>
          a.contentPillar === blueprint.secondaryPillar &&
          !usedAssetIds.has(a.id)
      );
      if (candidateSecondary) {
        matchedAsset = candidateSecondary;
        usedAssetIds.add(candidateSecondary.id);
      }
    }

    // Determine pillar and brief
    let activePillar = blueprint.defaultPillar;
    let contentToCreate: ContentToCreateBrief | null = null;

    if (!matchedAsset) {
      // Missing footage: Generate smartphone shooting brief
      const matchingShootPrompt = gapAnalysis.recommendedShootList.find(
        (s) => s.pillar === activePillar
      ) || gapAnalysis.recommendedShootList[0];

      contentToCreate = {
        concept: matchingShootPrompt?.title || `Quick ${activePillar.replace(/_/g, " ")} Clip`,
        instructions:
          matchingShootPrompt?.instructions ||
          `Hold smartphone in vertical 9:16 orientation. Record 10-15 seconds capturing authentic kitchen/food action at ${blueprint.recommendedTime}.`,
        targetDurationSeconds: 12,
        filmingWindow: matchingShootPrompt?.filmingWindow || blueprint.recommendedTime,
      };
    }

    // Generate Goal-Specific Commercial Rationale and Angles
    const {
      contentAngle,
      strategicRationale,
      instagramHook,
      instagramCaption,
      tiktokHook,
      tiktokCaption,
    } = buildDayCopywriting({
      dayName,
      pillar: activePillar,
      objective: blueprint.defaultObjective,
      goal,
      restaurantName,
      location,
      audience,
      matchedAsset,
      contentToCreate,
      time: blueprint.recommendedTime,
    });

    const cta = generateCta(action, restaurantName);

    const instagramAdaptation: PlatformAdaptation = {
      hook: instagramHook,
      caption: `${instagramCaption}\n\n${cta}`,
      cta,
      visualOverlayNotes: `First 3 seconds: Bold high-contrast text overlay: "${instagramHook}"`,
    };

    const tiktokAdaptation: PlatformAdaptation = {
      hook: tiktokHook,
      caption: `${tiktokCaption} #akurefood #${restaurantName.replace(/\s+/g, "").toLowerCase()}`,
      cta,
      audioVisualPacing: "Fast-cut sequence (0.8s clips). Clear food sizzle or packaging audio. Natural spoken voiceover.",
    };

    const planItem: ContentPlanItem = {
      id: `item-${planId}-${dayName.toLowerCase()}`,
      contentPlanId: planId,
      assetId: matchedAsset ? matchedAsset.id : null,
      asset: matchedAsset || undefined,
      scheduledDate,
      dayOfWeek: dayName,
      contentPillar: activePillar,
      objective: blueprint.defaultObjective,
      platform: "both",
      contentAngle,
      strategicRationale,
      contentToCreate,
      instagramHook,
      instagramCaption,
      instagramCta: cta,
      tiktokHook,
      tiktokCaption,
      tiktokCta: cta,
      instagramAdaptation,
      tiktokAdaptation,
      recommendedTime: blueprint.recommendedTime,
      status: "draft",
    };

    strategyItems.push(planItem);
  }

  const plan: ContentPlan = {
    id: planId,
    restaurantId,
    weeklyGoalId: goal,
    weekStart,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const matchedAssetsCount = strategyItems.filter((i) => i.assetId).length;
  const briefsToCreateCount = strategyItems.filter((i) => i.contentToCreate).length;

  return {
    plan,
    items: strategyItems,
    meta: {
      restaurantId,
      goal,
      totalAssetsEvaluated: availableAssets.length,
      matchedAssetsCount,
      briefsToCreateCount,
      readinessScore: gapAnalysis.readinessScore,
      diagnosticNote: gapAnalysis.headlineDiagnostic,
    },
  };
}

/**
 * Commercial Copywriting Engine
 * Generates grounded, friction-addressing restaurant copy
 */
interface CopywritingContext {
  dayName: ContentPlanItem["dayOfWeek"];
  pillar: ContentPillar;
  objective: ContentObjective;
  goal: BusinessGoalType;
  restaurantName: string;
  location: string;
  audience: string;
  matchedAsset?: ContentAsset | null;
  contentToCreate?: ContentToCreateBrief | null;
  time: string;
}

function buildDayCopywriting(ctx: CopywritingContext) {
  const { dayName, pillar, goal, restaurantName, location, matchedAsset, contentToCreate, time } = ctx;

  switch (dayName) {
    case "Monday":
      return {
        contentAngle: `Solve the Monday office lunch decision early for ${location} workers.`,
        strategicRationale:
          "Monday morning corporate workers suffer decision fatigue. Showcasing an immediate, steaming lunch solution at 11:30 AM converts orders before internal team meetings start.",
        instagramHook: "Your Monday lunch dilemma is already solved.",
        instagramCaption: matchedAsset?.aiDescription
          ? `Why face another exhausting Monday wondering where to find honest, piping-hot food? Here is our ${matchedAsset.aiDescription.toLowerCase()} ready to dispatch straight to your desk. Freshly prepared, zero shortcuts.`
          : `Why face another exhausting Monday wondering where to find honest food? Our kitchen is running at full heat to get hot meals to your desk before 12:30 PM. Order early to guarantee arrival timing.`,
        tiktokHook: "POV: It's Monday 12 PM and your lunch is already on your desk.",
        tiktokCaption: "Monday lunch scramble? Never heard of it. Steaming plates on standby across Akure.",
      };

    case "Tuesday":
      return {
        contentAngle: "Zero actors. Real patron reactions validating food quality and portion size.",
        strategicRationale:
          "Peer social proof overcomes skepticism about taste and portion size. Highlighting authentic diner reactions builds trust with new corporate clients.",
        instagramHook: "Watch this before you order lunch anywhere else today.",
        instagramCaption: matchedAsset?.aiDescription
          ? `We can tell you our food is tender and flavorful all day, but nothing speaks clearer than an empty plate. Featuring ${matchedAsset.aiDescription.toLowerCase()}. Clean plates every time.`
          : `We can tell you our meals are hearty and satisfying all day, but nothing speaks clearer than empty plates from our regular Tuesday lunch patrons. Clean plates every single time.`,
        tiktokHook: "The face you make when the food actually matches the hype.",
        tiktokCaption: "First bite review from our regular Tuesday lunch crew. Clean plates every time.",
      };

    case "Wednesday":
      return {
        contentAngle: "Kitchen technique & fresh sourcing: why commercial shortcuts ruin good soup and rice.",
        strategicRationale:
          "Midweek customer retention requires proving quality craft over fast-food shortcuts. Revealing culinary simmering technique justifies premium menu pricing.",
        instagramHook: "Why our pepper sauce takes hours of slow simmer every morning.",
        instagramCaption: matchedAsset?.aiDescription
          ? `No artificial bouillon pastes. No rushing. Featuring ${matchedAsset.aiDescription.toLowerCase()}. When you order lunch from us, this level of craft is what you are actually paying for.`
          : `No artificial seasoning shortcuts. No microwave reheats. Just fresh tomatoes, scotch bonnets, and authentic culinary patience. When you taste our food today, this is what you are paying for.`,
        tiktokHook: "The real reason your homemade jollof doesn't hit like restaurant jollof.",
        tiktokCaption: "Step inside the kitchen at 7:30 AM. Fresh ingredients, zero shortcuts.",
      };

    case "Thursday":
      return {
        contentAngle: "Group corporate bundle unboxing: complete desk combo packaging breakdown.",
        strategicRationale:
          "Departmental lunch groups consolidate orders on Thursdays. Unboxing the full executive combo pack directly triggers office group WhatsApp orders.",
        instagramHook: "The executive combo that feeds your whole department without breaking budget.",
        instagramCaption: matchedAsset?.aiDescription
          ? `Midweek energy running low? Our Thursday departmental combo packs include ${matchedAsset.aiDescription.toLowerCase()}. Sealed in insulated packaging to arrive steaming hot.`
          : `Midweek energy running low? Our Thursday departmental combo packs feed your team with piping-hot mains, sides, and chilled drinks. Sealed in insulated containers to arrive steaming hot.`,
        tiktokHook: "What a full lunch combo gets you in Akure right now.",
        tiktokCaption: "Full unboxing of the Thursday executive combo. Tag a coworker who owes you lunch.",
      };

    case "Friday":
      return {
        contentAngle: "High-tempo 11:30 AM dispatch line: packing 25 orders in 12 minutes for celebration lunch.",
        strategicRationale:
          "Friday lunch urgency centers on delivery speed and celebration. Showing high-tempo packaging at 11:30 AM proves dispatch reliability for office lunch parties.",
        instagramHook: "Friday 11:45 AM inside our dispatch line. We don't play with delivery deadlines.",
        instagramCaption: matchedAsset?.aiDescription
          ? `When your team orders celebratory Friday lunch, you want it delivered when hunger strikes, not after your 1 PM meeting started. Featuring ${matchedAsset.aiDescription.toLowerCase()}.`
          : `When your team orders Friday celebration lunch, you want it delivered on time. Here is our line boxing up today's first 25 dispatch orders. Hot food moving fast.`,
        tiktokHook: "How we pack 25 corporate lunch deliveries in under 15 minutes.",
        tiktokCaption: "Friday shift tempo. Hot food moving fast. Deliveries on the road across town.",
      };

    case "Saturday":
      return {
        contentAngle: "Weekend slow-down: signature comfort dishes for dine-in relaxation with friends.",
        strategicRationale:
          "Weekend shift from delivery to dine-in relaxation. Spotlighting signature comfort dishes attracts families and friends seeking weekend recovery.",
        instagramHook: "The weekend recovery bowl your body has been asking for all week.",
        instagramCaption: matchedAsset?.aiDescription
          ? `Five days of corporate spreadsheets are behind you. Come sit down in our dining room, order ${matchedAsset.aiDescription.toLowerCase()}, and take your time.`
          : `Five days of corporate spreadsheets are behind you. Come sit down in our dining room, order a fresh pot of steaming comfort soup, and relax with good company.`,
        tiktokHook: "If your Saturday doesn't start with fresh pepper soup, what are you doing?",
        tiktokCaption: "Real meat, hot aromatic broth. Weekend reset in full effect.",
      };

    case "Sunday":
    default:
      return {
        contentAngle: "Sunday family table atmosphere: closing out the week with regular patrons.",
        strategicRationale:
          "Sunday dining room community builds brand loyalty and recurring tradition. Gratitude post invites customer engagement and closes out the marketing week.",
        instagramHook: "Sunday tables are for family, good laughter, and overflowing plates.",
        instagramCaption: matchedAsset?.aiDescription
          ? `Our dining room on Sunday afternoon is our favorite view of the week. Featuring ${matchedAsset.aiDescription.toLowerCase()}. To every family who joined us: thank you.`
          : `Our dining room on Sunday afternoon is our favorite view of the week. To every family and group of friends who made ${restaurantName} their Sunday tradition: thank you for dining with us.`,
        tiktokHook: "The Sunday dining room atmosphere hits different.",
        tiktokCaption: `Full tables, good music, honest food. Have a restful Sunday, ${location}.`,
      };
  }
}
