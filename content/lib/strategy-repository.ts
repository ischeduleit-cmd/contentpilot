/**
 * ContentPilot Strategy Repository (Phase 6)
 * Handles persistence for Content Plans & 7-Day Strategy Items
 * Primary storage: Supabase PostgreSQL (content_plans, content_plan_items)
 * Local fallback: Persistent disk store (.dev-plans.json)
 */

import fs from "fs";
import path from "path";
import { ContentPlan, ContentPlanItem, ContentAsset } from "./db/schema";
import { getSupabaseServerClient } from "./supabase";
import { getContentAssetById } from "./content-repository";

const DEV_PLANS_FILE = path.join(process.cwd(), ".dev-plans.json");

interface DevPlanStore {
  plans: Record<string, ContentPlan>;
  items: Record<string, ContentPlanItem[]>;
}

function readDevPlans(): DevPlanStore {
  try {
    if (fs.existsSync(DEV_PLANS_FILE)) {
      const raw = fs.readFileSync(DEV_PLANS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[Strategy Repository] Dev store read notice:", err);
  }
  return { plans: {}, items: {} };
}

function writeDevPlans(data: DevPlanStore) {
  try {
    fs.writeFileSync(DEV_PLANS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Strategy Repository] Dev store write notice:", err);
  }
}

/**
 * Persists a generated 7-day content plan and its daily strategy items
 */
export async function saveContentPlan(
  plan: ContentPlan,
  items: ContentPlanItem[]
): Promise<{ success: boolean; plan: ContentPlan; items: ContentPlanItem[] }> {
  // Always update disk mirror for zero-loss dev persistence
  const devStore = readDevPlans();
  devStore.plans[plan.id] = plan;
  devStore.items[plan.id] = items;
  writeDevPlans(devStore);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      // 1. Insert or update the content_plans row
      const { error: planErr } = await supabase.from("content_plans").upsert(
        {
          id: plan.id,
          restaurant_id: plan.restaurantId,
          weekly_goal_id: plan.weeklyGoalId || null,
          week_start: plan.weekStart,
          status: plan.status || "active",
          created_at: plan.createdAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (planErr) {
        console.warn("[Strategy Repository] Supabase plan upsert warning:", planErr);
      } else {
        // 2. Insert the 7 content_plan_items
        const planItemsPayload = items.map((item) => ({
          id: item.id,
          plan_id: plan.id,
          day_of_week: item.dayOfWeek,
          scheduled_date: item.scheduledDate,
          asset_id: item.assetId || null,
          content_pillar: item.contentPillar,
          objective: item.objective,
          platform: item.platform || "both",
          hook: item.instagramHook || item.tiktokHook || item.contentAngle,
          caption: item.instagramCaption || item.tiktokCaption || "",
          cta: item.instagramCta || item.tiktokCta || "",
          recommended_time: item.recommendedTime,
          strategic_rationale: item.strategicRationale || null,
          content_to_create: item.contentToCreate ? JSON.stringify(item.contentToCreate) : null,
          instagram_adaptation: item.instagramAdaptation ? JSON.stringify(item.instagramAdaptation) : null,
          tiktok_adaptation: item.tiktokAdaptation ? JSON.stringify(item.tiktokAdaptation) : null,
          status: item.status || "draft",
          created_at: new Date().toISOString(),
        }));

        const { error: itemsErr } = await supabase
          .from("content_plan_items")
          .upsert(planItemsPayload, { onConflict: "id" });

        if (itemsErr) {
          console.warn("[Strategy Repository] Supabase items upsert warning:", itemsErr);
        }
      }
    } catch (dbErr) {
      console.warn("[Strategy Repository] Supabase write error:", dbErr);
    }
  }

  return { success: true, plan, items };
}

/**
 * Retrieves the latest content plan and daily items for a restaurant
 */
export async function getLatestContentPlan(
  restaurantId: string
): Promise<{ plan: ContentPlan; items: ContentPlanItem[] } | null> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data: plans, error: planErr } = await supabase
        .from("content_plans")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!planErr && plans && plans.length > 0) {
        const planRow = plans[0];
        const plan: ContentPlan = {
          id: planRow.id,
          restaurantId: planRow.restaurant_id,
          weeklyGoalId: planRow.weekly_goal_id,
          weekStart: planRow.week_start,
          status: planRow.status,
          createdAt: planRow.created_at,
          updatedAt: planRow.updated_at,
        };

        const { data: itemsRows, error: itemsErr } = await supabase
          .from("content_plan_items")
          .select("*")
          .eq("plan_id", plan.id)
          .order("scheduled_date", { ascending: true });

        if (!itemsErr && itemsRows && itemsRows.length > 0) {
          const items: ContentPlanItem[] = await Promise.all(
            itemsRows.map(async (row) => {
              let asset: ContentAsset | null = null;
              if (row.asset_id) {
                asset = await getContentAssetById(row.asset_id, plan.restaurantId);
              }

              let contentToCreate = null;
              if (row.content_to_create) {
                try {
                  contentToCreate =
                    typeof row.content_to_create === "string"
                      ? JSON.parse(row.content_to_create)
                      : row.content_to_create;
                } catch {
                  contentToCreate = {
                    concept: row.content_to_create,
                    instructions: row.content_to_create,
                    targetDurationSeconds: 15,
                  };
                }
              }

              let instagramAdaptation = null;
              if (row.instagram_adaptation) {
                try {
                  instagramAdaptation =
                    typeof row.instagram_adaptation === "string"
                      ? JSON.parse(row.instagram_adaptation)
                      : row.instagram_adaptation;
                } catch {}
              }

              let tiktokAdaptation = null;
              if (row.tiktok_adaptation) {
                try {
                  tiktokAdaptation =
                    typeof row.tiktok_adaptation === "string"
                      ? JSON.parse(row.tiktok_adaptation)
                      : row.tiktok_adaptation;
                } catch {}
              }

              return {
                id: row.id,
                contentPlanId: row.plan_id,
                assetId: row.asset_id,
                asset,
                scheduledDate: row.scheduled_date,
                dayOfWeek: row.day_of_week as any,
                contentPillar: row.content_pillar as any,
                objective: row.objective as any,
                platform: (row.platform as any) || "both",
                contentAngle: row.strategic_rationale || row.hook || "Targeted Daily Special",
                strategicRationale: row.strategic_rationale || "",
                contentToCreate,
                instagramHook: row.hook,
                instagramCaption: row.caption,
                instagramCta: row.cta,
                tiktokHook: row.hook,
                tiktokCaption: row.caption,
                tiktokCta: row.cta,
                instagramAdaptation,
                tiktokAdaptation,
                recommendedTime: row.recommended_time || "11:30 AM",
                status: row.status || "draft",
              };
            })
          );

          return { plan, items };
        }
      }
    } catch (dbErr) {
      console.warn("[Strategy Repository] Supabase query notice:", dbErr);
    }
  }

  // Fallback to disk store
  const devStore = readDevPlans();
  const restaurantPlans = Object.values(devStore.plans)
    .filter((p) => p.restaurantId === restaurantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (restaurantPlans.length > 0) {
    const plan = restaurantPlans[0];
    const items = devStore.items[plan.id] || [];
    return { plan, items };
  }

  return null;
}

/**
 * Updates a single plan item (e.g. approve, edit hook/caption, swap asset)
 */
export async function updateContentPlanItem(
  itemId: string,
  updates: Partial<ContentPlanItem>
): Promise<boolean> {
  const devStore = readDevPlans();
  for (const planId in devStore.items) {
    const list = devStore.items[planId];
    const idx = list.findIndex((i) => i.id === itemId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      writeDevPlans(devStore);
      break;
    }
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const payload: any = {};
      if (updates.instagramHook) payload.hook = updates.instagramHook;
      if (updates.instagramCaption) payload.caption = updates.instagramCaption;
      if (updates.instagramCta) payload.cta = updates.instagramCta;
      if (updates.strategicRationale) payload.strategic_rationale = updates.strategicRationale;
      if (updates.recommendedTime) payload.recommended_time = updates.recommendedTime;
      if (updates.status) payload.status = updates.status;
      if (updates.assetId !== undefined) payload.asset_id = updates.assetId;
      if (updates.contentToCreate) payload.content_to_create = JSON.stringify(updates.contentToCreate);

      const { error } = await supabase
        .from("content_plan_items")
        .update(payload)
        .eq("id", itemId);

      return !error;
    } catch {
      return false;
    }
  }

  return true;
}
