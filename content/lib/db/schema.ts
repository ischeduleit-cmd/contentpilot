/**
 * ContentPilot Database Schema & TypeScript Domain Models
 * Target DB: PostgreSQL (Vercel Postgres / Neon) with Drizzle ORM
 * Object Storage: Vercel Blob (@vercel/blob)
 * Vercel Team: ischeduleit | GitHub: ischeduleit-cmd | Email: ischeduleit@gmail.com
 */

import { pgTable, uuid, varchar, text, numeric, timestamp, date } from "drizzle-orm/pg-core";

// ==========================================
// DRIZZLE ORM TABLE DEFINITIONS
// ==========================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  restaurantType: varchar("restaurant_type", { length: 100 }).notNull(),
  targetAudience: text("target_audience"),
  primaryCustomerAction: varchar("primary_customer_action", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weeklyGoals = pgTable("weekly_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
  goal: varchar("goal", { length: 150 }).notNull(),
  goalDescription: text("goal_description"),
  weekStart: date("week_start").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentAssets = pgTable("content_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(), // Supabase Storage public or signed URL reference
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // "image" or "video"
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: numeric("file_size"), // in bytes
  storageKey: text("storage_key"), // content-assets/{restaurantId}/{assetId}/{filename}
  uploadStatus: varchar("upload_status", { length: 50 }).default("uploaded"), // uploading | uploaded | failed
  aiDescription: text("ai_description"),
  contentType: varchar("content_type", { length: 100 }),
  contentPillar: varchar("content_pillar", { length: 100 }),
  objective: varchar("objective", { length: 100 }),
  suggestedPlatform: varchar("suggested_platform", { length: 50 }),
  confidence: numeric("confidence", { precision: 3, scale: 2 }),
  processingStatus: varchar("processing_status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contentPlans = pgTable("content_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
  weeklyGoalId: uuid("weekly_goal_id").references(() => weeklyGoals.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentPlanItems = pgTable("content_plan_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentPlanId: uuid("content_plan_id").references(() => contentPlans.id, { onDelete: "cascade" }),
  assetId: uuid("asset_id").references(() => contentAssets.id, { onDelete: "set null" }),
  scheduledDate: date("scheduled_date").notNull(),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
  contentPillar: varchar("content_pillar", { length: 100 }).notNull(),
  objective: varchar("objective", { length: 100 }).notNull(),
  contentAngle: text("content_angle").notNull(),
  instagramHook: text("instagram_hook"),
  instagramCaption: text("instagram_caption"),
  instagramCta: text("instagram_cta"),
  tiktokHook: text("tiktok_hook"),
  tiktokCaption: text("tiktok_caption"),
  tiktokCta: text("tiktok_cta"),
  recommendedTime: varchar("recommended_time", { length: 50 }),
  status: varchar("status", { length: 50 }).default("draft"),
});

// ==========================================
// TYPESCRIPT DOMAIN TYPES & INTERFACES
// ==========================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type RestaurantType =
  | "restaurant"
  | "fast_food"
  | "cafe_bakery"
  | "cloud_kitchen"
  | "bar_lounge"
  | "other";

export type PrimaryCustomerAction =
  | "order_delivery"
  | "dine_in"
  | "whatsapp_order"
  | "table_reservation"
  | "brand_discovery"
  | "other";

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  location: string;
  restaurantType: RestaurantType;
  targetAudience: string;
  primaryCustomerAction: PrimaryCustomerAction;
  createdAt: string;
}

export type BusinessGoalType =
  | "increase_lunch_orders"
  | "promote_menu_item"
  | "increase_awareness"
  | "build_trust"
  | "increase_engagement"
  | "promote_event"
  | "drive_dine_in"
  | "other";

export interface WeeklyGoal {
  id: string;
  restaurantId: string;
  goal: BusinessGoalType;
  goalDescription?: string;
  weekStart: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}

export type ContentPillar =
  | "product"
  | "social_proof"
  | "education"
  | "behind_the_scenes"
  | "community"
  | "promotion";

export type ContentObjective =
  | "conversion"
  | "trust"
  | "awareness"
  | "engagement"
  | "retention";

export type MediaType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/quicktime";

export type ProcessingStatus =
  | "pending"
  | "analyzing"
  | "ready"
  | "analyzed"
  | "needs_review"
  | "failed"
  | "error";

export interface ContentAsset {
  id: string;
  restaurantId: string;
  fileUrl: string; // Supabase Storage public or signed URL reference
  fileName: string;
  mediaType: MediaType | string;
  mimeType?: string;
  fileSize?: number;
  storageKey?: string;
  uploadStatus?: "uploading" | "uploaded" | "failed";
  aiDescription?: string;
  contentType?: string;
  contentPillar?: ContentPillar;
  objective?: ContentObjective;
  suggestedPlatform?: "instagram" | "tiktok" | "both";
  suggestedAngle?: string;
  confidence?: number; // 0.00 to 1.00
  processingStatus: ProcessingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ContentPlan {
  id: string;
  restaurantId: string;
  weeklyGoalId: string;
  weekStart: string;
  createdAt: string;
}

export interface ContentPlanItem {
  id: string;
  contentPlanId: string;
  assetId: string;
  asset?: ContentAsset;
  scheduledDate: string;
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  contentPillar: ContentPillar;
  objective: ContentObjective;
  contentAngle: string;
  instagramHook: string;
  instagramCaption: string;
  instagramCta: string;
  tiktokHook: string;
  tiktokCaption: string;
  tiktokCta: string;
  recommendedTime: string;
  status: "draft" | "approved" | "exported";
}

export interface ContentGapReport {
  mix: Record<ContentPillar, number>; // percentage 0-100
  deficitPillar: ContentPillar;
  insight: string;
  recommendation: string;
}

/**
 * Raw PostgreSQL DDL for migrations or direct pool instantiation
 */
export const postgresDDL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  restaurant_type VARCHAR(100) NOT NULL,
  target_audience TEXT,
  primary_customer_action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  goal VARCHAR(150) NOT NULL,
  goal_description TEXT,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100),
  file_size NUMERIC,
  storage_key TEXT,
  upload_status VARCHAR(50) DEFAULT 'uploaded',
  ai_description TEXT,
  content_type VARCHAR(100),
  content_pillar VARCHAR(100),
  objective VARCHAR(100),
  suggested_platform VARCHAR(50),
  confidence NUMERIC(3, 2),
  processing_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) for Content Assets
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Restaurant workspace isolation" ON content_assets
  FOR ALL USING (true); -- scoped to restaurant_id in application tier

CREATE TABLE IF NOT EXISTS content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_plan_id UUID REFERENCES content_plans(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  content_pillar VARCHAR(100) NOT NULL,
  objective VARCHAR(100) NOT NULL,
  content_angle TEXT NOT NULL,
  instagram_hook TEXT,
  instagram_caption TEXT,
  instagramCta TEXT,
  tiktok_hook TEXT,
  tiktok_caption TEXT,
  tiktok_cta TEXT,
  recommended_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft'
);
`;
