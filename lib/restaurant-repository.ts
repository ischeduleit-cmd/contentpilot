import fs from "fs";
import path from "path";
import { Restaurant, RestaurantType, PrimaryCustomerAction } from "./db/schema";
import { getSupabaseServerClient } from "./supabase";

const DEV_WORKSPACES_FILE = path.join(process.cwd(), ".dev-workspaces.json");

interface LocalWorkspaceData {
  users: Record<string, { id: string; email: string; createdAt: string }>;
  restaurants: Record<string, any>;
  weeklyGoals: Record<string, any>;
}

function readLocalWorkspaces(): LocalWorkspaceData {
  try {
    if (fs.existsSync(DEV_WORKSPACES_FILE)) {
      const raw = fs.readFileSync(DEV_WORKSPACES_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[Restaurant Repository] Read notice:", err);
  }
  return { users: {}, restaurants: {}, weeklyGoals: {} };
}

function writeLocalWorkspaces(data: LocalWorkspaceData) {
  try {
    fs.writeFileSync(DEV_WORKSPACES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Restaurant Repository] Write notice:", err);
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const localData = readLocalWorkspaces();
  if (localData.restaurants[id]) {
    const r = localData.restaurants[id];
    return {
      id: r.id,
      userId: r.userId || "",
      name: r.name,
      location: r.location,
      restaurantType: r.restaurantType as RestaurantType,
      targetAudience: r.targetAudience || "",
      primaryCustomerAction: r.primaryCustomerAction as PrimaryCustomerAction,
      businessDescription: r.businessDescription || "",
      createdAt: r.createdAt || new Date().toISOString(),
    };
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          location: data.location,
          restaurantType: data.restaurant_type as RestaurantType,
          targetAudience: data.target_audience || "",
          primaryCustomerAction: data.primary_customer_action as PrimaryCustomerAction,
          businessDescription: data.business_description || "",
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("[Restaurant Repository] Supabase query notice:", err);
    }
  }

  return null;
}

export async function saveRestaurant(restaurant: Partial<Restaurant> & { id: string; name: string; location: string }): Promise<Restaurant> {
  const localData = readLocalWorkspaces();
  const existing = localData.restaurants[restaurant.id] || {};
  const updated: any = {
    ...existing,
    ...restaurant,
    updatedAt: new Date().toISOString(),
  };
  localData.restaurants[restaurant.id] = updated;
  writeLocalWorkspaces(localData);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("restaurants").upsert({
        id: restaurant.id,
        user_id: restaurant.userId,
        name: restaurant.name,
        location: restaurant.location,
        restaurant_type: restaurant.restaurantType,
        target_audience: restaurant.targetAudience,
        primary_customer_action: restaurant.primaryCustomerAction,
        business_description: restaurant.businessDescription,
      });
    } catch (err) {
      console.warn("[Restaurant Repository] Supabase save notice:", err);
    }
  }

  return updated;
}
