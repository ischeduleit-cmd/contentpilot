import { SupabaseClient } from "@supabase/supabase-js";
import { getPlan, PlanId } from "@/lib/plans";

export async function getWorkspacePlan(supabase: SupabaseClient, userId: string, restaurantId: string): Promise<PlanId> {
  const { data, error } = await supabase.from("subscriptions")
    .select("plan,status,current_period_end,mode")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .eq("mode", process.env.FLW_MODE === "live" && process.env.VERCEL_ENV === "production" ? "live" : "test")
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return "free";
  if (data.current_period_end && new Date(data.current_period_end).getTime() <= Date.now()) return "free";
  return getPlan(data.plan).id;
}
