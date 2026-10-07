# CLAUDE.md — ContentPilot Engineering & Agent Guidelines

## 1. Project & Account Overview

**ContentPilot** is a specialized, lightweight AI content strategist web application for restaurant owners and social media managers. It ingests an existing camera roll of restaurant photos and videos, analyzes their marketing utility, identifies content gaps, and translates the owner's weekly business goal into an actionable 7-day Instagram and TikTok content plan.

### Deployment, Repository & Identity Metadata
* **GitHub Account / Owner:** `ischeduleit-cmd`
* **Vercel Team Slug:** `ischeduleit`
* **Vercel Project Setup:** [https://vercel.com/new?teamSlug=ischeduleit](https://vercel.com/new?teamSlug=ischeduleit)
* **Associated Account / Email:** `ischeduleit@gmail.com`
* **Cloud File & Asset Storage:** **Vercel Blob Storage** (`@vercel/blob`)
* **Primary Framework:** Next.js (App Router), TypeScript, Tailwind CSS

---

## 2. Core Agent Directives & Product Philosophy

When writing code or planning architecture for ContentPilot, follow these non-negotiable rules:

### A. The Core Principle: "A Junior Content Strategist, Not a Caption Bot"
* Do NOT treat this product as a generic caption rewriter or video transcription tool.
* The AI must always reason through the strategic sequence:
  $$\mathbf{Business\ Goal} \longrightarrow \mathbf{Audience} \longrightarrow \mathbf{Available\ Assets} \longrightarrow \mathbf{Pillar\ Balance} \longrightarrow \mathbf{Platform\ Context} \longrightarrow \mathbf{Hook\ \&\ CTA}$$
* Every recommended post must have an explicit business rationale (e.g., *"Why this piece of content on Wednesday at 12 PM?"*).

### B. Strict MVP Scope Protection
Do **NOT** implement or propose the following features in the MVP:
* ❌ No Meta Graph API / Instagram direct publishing
* ❌ No TikTok Content Posting API
* ❌ No Social media analytics, follower tracking, or engagement scrapers
* ❌ No WhatsApp Cloud API or Telegram bots
* ❌ No complex CRM, customer lead databases, or table booking engines
* ❌ No payment gateways or subscription billing
* ❌ No multi-tenant agency approval hierarchies
* ❌ No mobile apps (responsive mobile web is sufficient)

Keep the MVP laser-focused on:
**Upload Media ➔ AI Strategic Classification ➔ Content Gap Check ➔ 7-Day Revenue-Driven Plan ➔ Export.**

---

## 3. Technology Stack & Packages

| Layer | Selected Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) | Server Components, Server Actions, Route Handlers |
| **Language** | TypeScript | Strict type checking throughout |
| **Styling** | Tailwind CSS + `shadcn/ui` | Radix primitives, Lucide React icons |
| **Media Storage** | **Vercel Blob** (`@vercel/blob`) | Used for all images & videos (Replaces Supabase Storage) |
| **Database** | PostgreSQL | Vercel Postgres / Neon with Drizzle ORM or Prisma |
| **Authentication** | Auth.js / NextAuth | Passwordless email / Google Auth linked to `ischeduleit@gmail.com` |
| **AI Vision & LLM** | OpenAI API (`gpt-4o` / `gpt-4o-mini`) | Structured JSON outputs (`response_format: { type: "json_object" }`) |
| **PDF Export** | `@react-pdf/renderer` or `jspdf` | Styled 7-day content schedule export |

---

## 4. File Architecture & Directory Structure

```
contentpilot/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                     # Landing page with problem, workflow & CTA
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx                   # App shell (Nav: Plan | Content | Restaurant)
│   │   ├── onboarding/
│   │   │   ├── page.tsx                 # Restaurant profile setup
│   │   │   └── goal/page.tsx            # Weekly business goal selection
│   │   ├── content/
│   │   │   ├── page.tsx                 # Content library grid & Vercel Blob uploader
│   │   │   └── [assetId]/page.tsx       # Asset inspection & manual override modal
│   │   └── plan/
│   │       ├── page.tsx                 # 7-day weekly calendar & gap analysis card
│   │       └── export/page.tsx          # Export preview (PDF & clipboard copy)
│   └── api/
│       ├── upload/route.ts              # Vercel Blob client token / upload handler
│       ├── analyze-asset/route.ts       # Multimodal AI asset categorization
│       └── generate-plan/route.ts       # 7-day strategic plan generator
├── components/
│   ├── ui/                              # shadcn/ui components (button, card, dialog, badge)
│   ├── marketing/                       # Landing page hero, before-after, workflow visual
│   ├── upload/
│   │   ├── dropzone.tsx                 # Drag-and-drop batch upload component
│   │   └── upload-progress.tsx
│   ├── content/
│   │   ├── asset-card.tsx               # Media card with pillar pill and review badge
│   │   └── asset-edit-dialog.tsx        # Human-in-the-loop categorization override
│   └── plan/
│       ├── calendar-board.tsx           # 7-day calendar row / grid
│       ├── day-card.tsx                 # Single day card (Keep, Edit, Regenerate, Swap)
│       ├── gap-analysis-banner.tsx      # Strategic imbalance alert card
│       └── plan-edit-drawer.tsx         # Inline editor for hooks, captions, and CTAs
├── lib/
│   ├── db/
│   │   ├── schema.ts                    # PostgreSQL schema definition
│   │   └── index.ts                     # Database client connection
│   ├── blob.ts                          # Vercel Blob client helpers and upload utils
│   ├── ai/
│   │   ├── client.ts                    # OpenAI API client
│   │   ├── prompts.ts                   # System prompts for asset analysis and planning
│   │   └── schemas.ts                   # Zod schemas for validated structured outputs
│   └── utils.ts
├── public/
│   └── og-image.png
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 5. Storage Architecture (Vercel Blob Integration)

Vercel Blob handles all media uploads up to 50 assets per weekly batch:

### Client Upload Route Handler (`app/api/upload/route.ts`)
```typescript
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate user & ensure workspace file count <= 50
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Store asset record in PostgreSQL content_assets table
        console.log('Blob upload finished:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
```

---

## 6. Database Schema & Data Models

PostgreSQL schema configured with Vercel Postgres / Drizzle ORM:

```typescript
// lib/db/schema.ts
import { pgTable, uuid, varchar, text, numeric, timestamp, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  restaurantType: varchar('restaurant_type', { length: 100 }).notNull(),
  targetAudience: text('target_audience'),
  primaryCustomerAction: varchar('primary_customer_action', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const weeklyGoals = pgTable('weekly_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }),
  goal: varchar('goal', { length: 150 }).notNull(),
  goalDescription: text('goal_description'),
  weekStart: date('week_start').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contentAssets = pgTable('content_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),        // Vercel Blob CDN URL
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mediaType: varchar('media_type', { length: 50 }).notNull(),
  aiDescription: text('ai_description'),
  contentType: varchar('content_type', { length: 100 }),
  contentPillar: varchar('content_pillar', { length: 100 }), // product | social_proof | education | behind_the_scenes | community
  objective: varchar('objective', { length: 100 }),         // conversion | trust | awareness | engagement
  suggestedPlatform: varchar('suggested_platform', { length: 50 }), // instagram | tiktok | both
  confidence: numeric('confidence', { precision: 3, scale: 2 }),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'), // pending | analyzing | ready | needs_review | error
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contentPlans = pgTable('content_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }),
  weeklyGoalId: uuid('weekly_goal_id').references(() => weeklyGoals.id, { onDelete: 'cascade' }),
  weekStart: date('week_start').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contentPlanItems = pgTable('content_plan_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentPlanId: uuid('content_plan_id').references(() => contentPlans.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id').references(() => contentAssets.id, { onDelete: 'set null' }),
  scheduledDate: date('scheduled_date').notNull(),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
  contentPillar: varchar('content_pillar', { length: 100 }).notNull(),
  objective: varchar('objective', { length: 100 }).notNull(),
  contentAngle: text('content_angle').notNull(),
  instagramHook: text('instagram_hook'),
  instagramCaption: text('instagram_caption'),
  instagramCta: text('instagram_cta'),
  tiktokHook: text('tiktok_hook'),
  tiktokCaption: text('tiktok_caption'),
  tiktokCta: text('tiktok_cta'),
  recommendedTime: varchar('recommended_time', { length: 50 }),
  status: varchar('status', { length: 50 }).default('draft'), // draft | approved | exported
});
```

---

## 7. AI Prompts & Structured JSON Schemas

### Prompt 1: Asset Classification (`app/api/analyze-asset/route.ts`)
* **Role:** Junior Restaurant Marketing Analyst.
* **Input Context:** Restaurant profile (Type, Location, Audience), File URL, Media Type.
* **System Prompt:**
  ```text
  You are an expert hospitality social media strategist. Analyze this restaurant photo/video asset.
  Identify what is physically depicted. Do NOT guess or hallucinate ingredients you cannot see.
  Classify it into one content pillar: [product, social_proof, education, behind_the_scenes, community, promotion].
  Suggest its primary objective: [conversion, awareness, trust, engagement].
  If the image is blurry, ambiguous, or lacks context, set needs_review: true and confidence below 0.60.
  ```
* **Expected Output:**
  ```json
  {
    "description": "Sizzling jollof rice served with grilled chicken and fried plantains",
    "content_type": "food_platter",
    "content_pillar": "product",
    "objectives": ["conversion", "awareness"],
    "recommended_platforms": ["instagram", "tiktok"],
    "confidence": 0.95,
    "needs_review": false,
    "suggested_angle": "The ultimate comfort lunch plate ready in 10 minutes"
  }
  ```

### Prompt 2: Weekly Plan Strategy Generator (`app/api/generate-plan/route.ts`)
* **Input Context:**
  * Restaurant Details (e.g., Ovie's Kitchen, Akure, Bankers & 9-5 workers).
  * This Week's Stated Goal (e.g., Increase weekday lunch orders).
  * Analyzed Asset Library (Array of assets with IDs, descriptions, and pillars).
* **Strategic Rules:**
  1. Calculate pillar mix (Product vs Social Proof vs Education vs BTS).
  2. Flag the biggest deficit (Gap Analysis).
  3. Formulate a 7-day strategy matching the goal:
     * High-intent conversion assets placed during lunch-order hours on Monday–Thursday.
     * Social proof / customer satisfaction clips to build trust.
     * Provide separate hooks and captions for Instagram vs. TikTok.
* **Expected Output Schema:**
  ```json
  {
    "weekly_goal": "Increase weekday lunch orders",
    "content_gap": {
      "missing_pillar": "social_proof",
      "insight": "Only 8% of your library shows happy customers or reviews.",
      "recommendation": "Film customer reactions this week to boost dining trust."
    },
    "recommendations": [
      {
        "day": "Monday",
        "asset_id": "asset_uuid_here",
        "pillar": "product",
        "objective": "conversion",
        "content_angle": "Solve Monday hunger before peak rush",
        "instagram": {
          "hook": "Your Monday lunch dilemma is already solved.",
          "caption": "Why stress over what to eat on a busy Monday? Fresh, steaming jollof rice ready for pickup or direct desk delivery. Order before 12:30 PM to beat the rush! 🍛✨",
          "cta": "Tap the link in our bio or send us a WhatsApp DM to place your order."
        },
        "tiktok": {
          "hook": "POV: It's Monday 12 PM and your lunch is already on your desk.",
          "caption": "Monday lunch rush? Never heard of her. Fresh jollof delivered hot. Link in bio! #AkureFood #LunchBreak",
          "cta": "DM to order before 1 PM."
        },
        "recommended_time": "11:45 AM"
      }
    ]
  }
  ```

---

## 8. User Interface Guidelines & Component Rules

1. **Aesthetic Direction:**
   * Clean, warm, hospitality-oriented (warm neutrals, deep slate, subtle terracotta or amber accents).
   * Clean typography: Inter or Geist Sans.
   * Avoid dark, aggressive cybersecurity/crypto themes.
2. **Simplified Navigation:**
   * Top Navbar containing only: `Plan` | `Content` | `Restaurant` + Vercel Deployment Indicator.
3. **Weekly Calendar UX:**
   * 7 cards representing Monday through Sunday.
   * Visual indicators: Thumbnail badge, Pillar tag, Channel badge (`IG`, `TT`).
   * Quick action buttons on each card:
     * `Keep` (locks card)
     * `Edit` (opens text-edit drawer for instant copy modifications)
     * `Regenerate` (re-prompts LLM for another hook/angle with same asset)
     * `Swap Asset` (opens asset selector modal)
4. **Empty States & Feedback:**
   * Empty Content Library: *"Your content library is empty. Upload photos and videos from your phone to start."*
   * Loading State: *"Our AI strategist is organizing your media and building your 7-day plan..."*
   * Error State: *"We couldn't analyze this asset. You can categorize it manually."*

---

## 9. Environment Variables (`.env.local`)

```bash
# Vercel Blob Configuration
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Database Connection (Vercel Postgres / Neon)
POSTGRES_URL="postgres://default:...@ep-....postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:...@ep-....postgres.vercel-storage.com:5432/verceldb?pgbouncer=true"

# AI Multimodal API Keys
OPENAI_API_KEY="sk-..."
# Optional alternative: ANTHROPIC_API_KEY="sk-ant-..."

# NextAuth / Auth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-secret-key"

# Admin & Notification Email
ADMIN_EMAIL="ischeduleit@gmail.com"
```

---

## 10. Phased Build Order for Coding Agents

* **Phase 1: Project Setup & Vercel Linking**
  * Scaffold Next.js 14 project with TypeScript and Tailwind CSS.
  * Initialize Git repo linked to `ischeduleit-cmd`.
  * Link Vercel project under team `ischeduleit`.
  * Install `@vercel/blob`, Drizzle ORM, and `lucide-react`.
* **Phase 2: Marketing & Onboarding**
  * Implement landing page (`/`) with Hero, Workflow Graphic, Problem statement, and CTA.
  * Implement onboarding screens: `/onboarding` (Restaurant profile) and `/onboarding/goal` (Weekly goal).
* **Phase 3: Media Upload with Vercel Blob**
  * Implement `@vercel/blob` client upload handler in `/api/upload`.
  * Create drag-and-drop file uploader supporting batch uploads up to 50 assets.
  * Build the `/content` library grid with status indicators and manual override dialog.
* **Phase 4: Multimodal AI Classification**
  * Connect vision model in `/api/analyze-asset`.
  * Parse structured JSON for each uploaded image/video.
  * Store categorization, confidence, and pillar assignments in the database.
* **Phase 5: Content Gap Analysis & Strategy Engine**
  * Implement library distribution math (percentage breakdown across 5 pillars).
  * Build `/api/generate-plan` combining goal, audience, and categorized library into a 7-day schedule.
* **Phase 6: Interactive 7-Day Calendar Board**
  * Build `/plan` weekly calendar board.
  * Implement Keep, Edit drawer, Regenerate action, and Swap Asset modal.
* **Phase 7: Export & PDF Output**
  * Add one-click "Copy Plan" formatted markdown string.
  * Implement printable/downloadable PDF summary via `@react-pdf/renderer`.
* **Phase 8: End-to-End Acceptance Test**
  * Validate against the benchmark test case ("Ovie's Kitchen", Akure, weekday lunch orders).

---

## 11. Acceptance Benchmark: Ovie's Kitchen

Before considering any milestone complete, verify this realistic scenario:
1. **Input:**
   * Name: *Ovie's Kitchen*
   * Location: *Akure, Ondo State*
   * Audience: *Bankers, corporate workers, and university students*
   * Weekly Goal: *Increase weekday lunch orders*
   * Content: 15 uploaded food and kitchen clips (uploaded to Vercel Blob)
2. **Expected System Behavior:**
   * Assets upload to Vercel Blob with public CDN links stored in DB.
   * AI classifies food dishes under `product` and kitchen prep under `education`.
   * System detects if `social_proof` is low (<10%) and displays an alert card.
   * Generated plan prioritizes high-urgency lunch conversion hooks for Mon–Thu between 11:30 AM and 1:00 PM.
   * Distinct, authentic Instagram and TikTok copy are generated.
   * User can edit copy, swap assets, and export to PDF.
