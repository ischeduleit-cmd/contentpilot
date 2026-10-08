# Product Requirements Document (PRD) — ContentPilot

## Product Name
**ContentPilot**

## Product Type
Web Application / Minimum Viable Product (MVP)

## Project & Deployment Metadata
* **GitHub Organization / Account:** [`ischeduleit-cmd`](https://github.com/ischeduleit-cmd)
* **GitHub Repository:** [`ischeduleit-cmd/contentpilot`](https://github.com/ischeduleit-cmd/contentpilot)
* **Vercel Team / Project:** [`ischeduleit`](https://vercel.com/new?teamSlug=ischeduleit) / `contentpilot`
* **Production URL:** [https://contentpilot-sandy.vercel.app](https://contentpilot-sandy.vercel.app)
* **Associated Account / Email:** `ischeduleit@gmail.com`
* **Database & File Storage:** **Supabase** (`https://supabase.com/dashboard/project/gnoxeiedfpiysnimyjog`)
  * PostgreSQL Database
  * Supabase Storage Bucket: `content-assets`

---

# 1. Product Context

ContentPilot is an AI-powered content strategy web application designed exclusively for restaurant owners and restaurant social media managers.

The core question it solves is:
> **"What should I post this week using the content I already have?"**

It is **NOT** a generic social media scheduler or caption rewriter.

The core product flow is:
$$\mathbf{Restaurant\ Context} + \mathbf{Existing\ Content} + \mathbf{Weekly\ Business\ Goal} \longrightarrow \mathbf{AI\ Understands\ Content} \longrightarrow \mathbf{Identifies\ Content\ Gaps} \longrightarrow \mathbf{Strategic\ 7\text{-}Day\ Plan} \longrightarrow \mathbf{Instagram\ \&\ TikTok\ Adaptations}$$

The product behaves like a **dedicated junior content strategist working directly for the restaurant**.

---

# 2. Critical Architecture Correction

Phase 3 implementation initially conflated the landing page with the content library. **This is strictly corrected**:

## Content MUST NOT exist on the public landing page.

The landing page features a **Live Strategy Run** section. This is the interactive product demonstration that visually sells the intelligence and outcome of ContentPilot.

* **Do NOT** place content upload zones on the landing page.
* **Do NOT** display the restaurant's media library or grid on the landing page.
* **Do NOT** expose file deletion, previews, filters, or asset counts on the landing page.
* **Do NOT** expose authenticated Supabase content state on the landing page.

The real Content experience is strictly an authenticated capability:
$$\mathbf{Main\ App} \longrightarrow \mathbf{Content}$$

---

# 3. Product Architecture

The application strictly enforces a separation between public acquisition and authenticated execution:

```text
PUBLIC
│
├── Landing Page (/)
│   ├── Hero / Value Proposition
│   ├── Problem Definition
│   ├── How It Works
│   ├── Live Strategy Run (Interactive Demonstration)
│   ├── Benefits / Outcomes
│   └── CTA
│
├── Sign Up (/signup)
└── Login (/login)
        │
        ▼
AUTHENTICATED
│
├── Restaurant Onboarding (/onboarding & /onboarding/goal)
│
└── Main App Shell (/app/layout.tsx)
    ├── Home (/app)
    ├── Content (/app/content)
    ├── Strategy (/app/strategy)
    └── Restaurant (/app/restaurant)
```

The user experiences this as one seamless, high-conviction product journey.

---

# 4. Public Landing Page Specifications

The public landing page communicates value, frames the operational problem, and demonstrates product intelligence.

* **Core Positioning:**
  * **Headline:** *"Turn the content you already have into a week's worth of restaurant marketing."*
  * **Supporting Copy:** *"Upload your photos and videos, choose your business goal, and get an AI-powered content plan for Instagram and TikTok."*
  * **Primary CTA:** `Build My Content Plan` (routes directly to onboarding/signup)
  * **Problem Framing:** *"You already have the content. You just don't know what to do with it."*
  * **How It Works:**
    1. *Upload your content:* Add the dish and prep footage already on your phone.
    2. *Choose your goal:* Select your weekly commercial target (lunch orders, table bookings, weekend crowd).
    3. *Get your strategy:* Receive an actionable 7-day schedule with platform-native adaptations.

### The Live Strategy Run (Product Demonstration)
The landing page incorporates the **Live Strategy Run** as the sole product demonstration. It communicates the algorithmic decision chain:
```text
Weekly Goal: Increase weekday lunch orders
         ↓
Available Restaurant Content (Culinary Scenes)
         ↓
AI Content Strategy Matrix
  • Monday:    Food / Prep footage       → Instagram Reel → Lunch Conversion
  • Tuesday:   Customer reaction video   → TikTok         → Social Proof
  • Wednesday: Behind-the-scenes craft   → Both           → Education & Quality
  • Thursday:  Corporate bundle unboxing → Instagram      → Promotion & Office Groups
  • Friday:    11:45 AM Kitchen rush     → TikTok         → Urgency & FOMO
  • Saturday:  Weekend slow-down special → Instagram      → Dine-in Discovery
  • Sunday:    Family table atmosphere   → Both           → Community & Retention
```
*Note: This is an interactive demo simulation. It is decoupled from authenticated user data.*

---

# 5. Phased Roadmap Structure

```text
PHASE 3: Content Foundation + Architectural Correction (COMPLETED)
        ↓
PHASE 4: AI Multimodal Content Analysis
        ↓
PHASE 5: Goal-Driven Content Gap Analysis
        ↓
PHASE 6: 7-Day Weekly Content Strategy Engine
        ↓
PHASE 7: Platform Adaptation + Strategy Editing + Export
```

*Rule: Do not skip phases or prematurely bundle downstream features.*

---

# 6. Phase 3 — Content Foundation + Architectural Correction

## Status: COMPLETE

### Objective
Ensure Content functionality lives exclusively within `Main App → Content` while preserving full file management, Supabase persistence, and navigation integrity.

### Main App Navigation
The authenticated header enforces a minimal 4-item navigation:
* **Home** (`/app`)
* **Content** (`/app/content`)
* **Strategy** (`/app/strategy`)
* **Restaurant** (`/app/restaurant`)

### Core Content Capabilities
* **File Uploads:** Drag-and-drop and manual file picker supporting batch uploads.
  * Supported Images: `JPG`, `JPEG`, `PNG`, `WEBP` (Max 15MB)
  * Supported Videos: `MP4`, `MOV`, `WEBM` (Max 60MB)
* **Cloud Persistence:** Uploads persist directly to Supabase Storage bucket `content-assets` via authenticated server route handlers (`/api/content/upload`).
* **Content Library Grid:** Visual responsive grid with lazy loading, media badges, and duration/size indicators.
* **Asset Preview Modal:** High-resolution photo preview and inline HTML5 video player with metadata breakdown.
* **Deletion Lifecycle:** Confirmation dialog with immediate teardown of Supabase Storage objects and database records (`/api/content/assets/[id]`).
* **Filtering & Sorting:** Simple filters (`All`, `Photos`, `Videos`) and sorting (`Newest`, `Oldest`).
* **Empty State:** Clean, distraction-free empty state with exact copy:
  > *"Upload the photos and videos already on your phone. You don't need to create anything new yet."*
* **Workspace Isolation:** Server-side validation enforcing data ownership by `restaurant_id`.

---

# 7. Phase 4 — AI Content Analysis

## Objective
Transform raw visual assets into structured, machine-readable marketing intelligence. The engine must answer:
> **"What specific culinary and operational content does this restaurant already have?"**

### Analysis Context
The vision model evaluates each asset alongside the restaurant's operational context:
* Restaurant Name & Concept
* Location & Cultural Setting (e.g., Nigerian hospitality context)
* Target Audience & Dining Habits
* Desired Customer Action

### Per-Asset Metadata Extraction (Strict JSON)
```json
{
  "description": "Close-up sizzling jollof rice garnished with grilled chicken and fried plantain",
  "content_type": "food_product",
  "content_pillar": "product",
  "subject": "Jollof Rice Lunch Special",
  "objectives": ["conversion", "awareness"],
  "recommended_platforms": ["instagram", "tiktok"],
  "confidence": 0.94,
  "needs_review": false,
  "suggested_angle": "Hearty weekday lunch delivered hot within 20 minutes"
}
```

### Classification Taxonomies
* **Content Types:** Food/Product, Customer, Ambience, Staff, Behind-the-Scenes, Promotional, Educational, Testimonial, Event, Community, Lifestyle.
* **Content Pillars:** Product, Social Proof, Education, Entertainment, Community, Brand, Promotion.
* **Objectives:** Awareness, Engagement, Trust, Conversion, Retention.
* **Platform Suitability:** Instagram, TikTok, Both.

### Analysis States & Reliability
* Supported States: `pending`, `analyzing`, `analyzed`, `needs_review`, `failed`.
* **Grounding Rule:** If footage is visually ambiguous, set `needs_review: true` with `confidence < 0.60`. Never hallucinate ingredients, dishes, or customer reactions.
* **Execution:** Multimodal API calls occur strictly server-side (OpenAI GPT-4o / Gemini Flash Vision). No API keys exposed to browser.

---

# 8. Phase 5 — Content Gap Analysis

## Objective
Transition from cataloging assets to strategic evaluation against commercial targets:
> **"What content is this restaurant missing to hit its goal this week?"**

### Strategic Logic
The engine contrasts the categorized asset distribution against the user's active **Weekly Business Goal**:

$$\mathbf{Weekly\ Goal} + \mathbf{Target\ Audience} \longleftrightarrow \mathbf{Available\ Media\ Assets\ \&\ Pillar\ Mix}$$

### Gap Diagnostic Output
* Calculates percentage distribution across all 5 content pillars.
* Identifies missing pillars, underrepresented objectives, and visual fatigue risks.
* **Actionable Gap Insight Card:**
  * *Example Scenario (Ovie's Kitchen, Akure):*
    * **Goal:** *"Increase weekday lunch orders."*
    * **Library:** 14 food photos, 4 kitchen prep videos, 0 customer reactions, 0 packaging/delivery unboxings.
    * **Generated Diagnostic:** *"You have sufficient product assets for lunch spotlights, but zero social proof or packaging footage. Without showing real customers or takeout containers, corporate workers hesitate to trust delivery timing."*
* Directly informs Phase 6 strategy recommendations.

---

# 9. Phase 6 — Weekly Content Strategy Engine

## Objective
Synthesize restaurant context, the weekly goal, available content assets, and gap insights into an actionable **7-Day Restaurant Content Plan**.

### Core Planning Directives
* Every day has an explicit commercial justification. **Never generate generic filler posts.**
* The engine matches real, uploaded media assets wherever applicable.
* Days requiring missing content types explicitly recommend high-leverage **"Content to Create"** briefs (e.g., *"Record a 10-second smartphone clip of your 12:00 PM takeout packaging rush"*).

### Strategy Item Data Model
```typescript
interface StrategyPlanItem {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  date: string;
  assetId?: string;                    // References existing uploaded content_assets record
  contentToCreate?: {
    concept: string;
    instructions: string;
    targetDurationSeconds: number;
  };
  contentPillar: "product" | "social_proof" | "education" | "entertainment" | "community" | "promotion";
  objective: "conversion" | "awareness" | "trust" | "engagement" | "retention";
  platform: "instagram" | "tiktok" | "both";
  hook: string;
  caption: string;
  cta: string;
  recommendedPostingTime: string;      // e.g. "11:30 AM" for lunch rush
  strategicRationale: string;          // Why this post on this day for this goal
}
```

### Strategic Balance
* Maintains a healthy mix of pillars across the 7 days (e.g., avoids 5 consecutive product discounts).
* Tailors post timing to local dining rhythms (lunch prep, evening relaxation, weekend specials).

### Phase 6 Implementation & Completion Verification
* **Core Engine (`lib/strategy-engine.ts`)**: Synthesizes restaurant context, active business goal, analyzed media assets, and Phase 5 gap deficits into a dynamic 7-day schedule (Monday to Sunday).
* **Asset Pairing Intelligence**: Automatically matches library assets to designated daily pillars and objectives; for deficit days, generates high-leverage smartphone filming briefs (`ContentToCreateBrief`).
* **Commercial Rationale**: Every day provides an explicit commercial justification explaining why this post runs at this time for this goal.
* **Storage & Persistence (`lib/strategy-repository.ts`)**: Persists plans to Supabase tables (`content_plans`, `content_plan_items`) with `.dev-plans.json` local disk mirror.
* **API Endpoints**:
  * `POST /api/strategy/generate`: Generates and persists the 7-day plan.
  * `GET /api/strategy/generate`: Retrieves or auto-seeds the active plan.
  * `PATCH /api/strategy/item`: Granular update and approval of daily items.
* **UI Workspace (`/app/strategy`)**: Interactive calendar schedule board, day selector with footage vs filming tags, side-by-side Instagram/TikTok drawers, and approval actions.
* **Pure Lucide Icons Only**: Strictly zero emojis and zero sparkles.

---

# 10. Phase 7 — Platform Adaptation, Editing & Export

## Objective
Convert strategic daily briefs into platform-native copy, provide granular user editing controls, and allow instant plan export.

### Platform-Native Execution
* **Instagram Adaptation:** Visual-first text overlays (first 3 seconds), structured captions with intentional line breaks, clear conversion CTAs (e.g., *"DM us 'LUNCH' or tap WhatsApp in bio"*).
* **TikTok Adaptation:** High-retention auditory/visual pattern interrupts, natural spoken-word scripting, search-optimized keywords, informal engagement CTAs.

### Interactive Strategy Controls
Users have granular control over every card in the 7-day schedule:
* **Keep:** Lock the daily recommendation.
* **Edit:** Inline drawer allowing full text modification of hooks, captions, CTAs, and times.
* **Regenerate:** Re-prompts the AI to suggest an alternative creative angle using the *same* asset and preserving broader weekly context.
* **Replace Asset:** Modal picker allowing the user to swap the assigned media file with another uploaded library asset.

### Export & Delivery
* **One-Click Copy:** Formatted Markdown/plain text copy ready for WhatsApp, Notion, or Slack.
* **Formatted PDF Export:** Downloadable weekly run-sheet with asset thumbnails, caption copy, and posting windows for kitchen managers and staff.
* **No Direct Publishing:** Cleanly decouples strategy from API scheduling dependencies.

### Phase 7 Implementation & Completion Verification
* **Platform-Native Copywriting**: Full native drawers for Instagram (first 3s overlay notes, readable line breaks, bio/DM conversion CTAs) and TikTok (pattern interrupt hooks, line-by-line spoken script, audio-visual pacing).
* **Interactive Controls Implemented**:
  * **Keep / Lock**: One-click toggle between `draft` and `approved` with visual badge locking on calendar tabs.
  * **Edit Modal**: Full text editing of headline/hook, body caption, conversion CTA, recommended posting time, and strategic commercial rationale.
  * **Regenerate Single Day**: Dedicated `POST /api/strategy/regenerate-day` endpoint and UI action to re-prompt alternative creative angles while keeping assigned assets and weekly context.
  * **Replace Media Asset**: Interactive modal picker allowing owners to browse uploaded library assets (filtered by photos/videos) and swap media onto any day, or revert to a custom filming brief.
* **Export & Delivery Suite**:
  * **WhatsApp / Notion / Slack Markdown**: One-click copy for the entire 7-day schedule or individual days, plus direct `.txt` file download.
  * **Printable Kitchen Run-Sheet**: Formatted weekly dispatch run-sheet table with browser print / PDF export styling (`window.print()` with `@media print` layout).
* **Zero Emojis Enforced**: Strictly Lucide icons across all views and modals.

---

# 11. Main App Views & Core Responsibilities

### 1. Home Dashboard (`/app`)
* **Core Question Answered:** *"What should I do with my content this week?"*
* **Key Widgets:**
  * Active Weekly Business Goal card
  * Available Media Assets summary card *(Camera roll readiness statement)*
  * Pillar Balance & Content Gap alert
  * Quick-access preview to the current 7-Day Strategy

### 2. Content Hub (`/app/content`)
* Full media management: upload, filter, sort, preview, and delete.
* Feeds directly into AI analysis and strategy generation.

### 3. Strategy Workspace (`/app/strategy`)
* 7-day interactive calendar view with daily drawers.
* Controls for Keep, Edit, Regenerate, Replace, and Export.

### 4. Restaurant Profile (`/app/restaurant`)
* Manages core business parameters: Name, Location, Restaurant Type, Target Customers, Primary Customer Action, and Default Brand Context.

---

# 12. Database Schema (PostgreSQL on Supabase)

```sql
-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  restaurant_type VARCHAR(100) NOT NULL,
  target_audience TEXT,
  primary_customer_action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Weekly Goals
CREATE TABLE IF NOT EXISTS weekly_goals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE,
  goal VARCHAR(150) NOT NULL,
  goal_description TEXT,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Content Assets (Phase 3 + Phase 4)
CREATE TABLE IF NOT EXISTS content_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Content Plans (Phase 6)
CREATE TABLE IF NOT EXISTS content_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  weekly_goal_id TEXT,
  week_start DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Content Plan Items (Phase 6 + Phase 7)
CREATE TABLE IF NOT EXISTS content_plan_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_id TEXT REFERENCES content_plans(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  scheduled_date DATE NOT NULL,
  asset_id TEXT REFERENCES content_assets(id) ON DELETE SET NULL,
  content_pillar VARCHAR(100) NOT NULL,
  objective VARCHAR(100) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  hook TEXT NOT NULL,
  caption TEXT NOT NULL,
  cta TEXT NOT NULL,
  recommended_time VARCHAR(50),
  strategic_rationale TEXT,
  content_to_create TEXT,
  instagram_adaptation JSONB,
  tiktok_adaptation JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

# 13. Scope Boundaries & MVP Protection

### STRICTLY OUT OF SCOPE (Do NOT Build)
* ❌ Native Instagram Graph API / TikTok Publishing APIs (Zero auto-publishing)
* ❌ Social media analytics, follower counting, or engagement scrapers
* ❌ OAuth login with Instagram / TikTok
* ❌ WhatsApp Cloud API integration or conversational auto-responders
* ❌ Telegram bot automations
* ❌ Payment gateways or billing systems
* ❌ Multi-tenant agency hierarchies or client sign-off portals
* ❌ Generic Buffer-style scheduling queues
* ❌ Native iOS or Android mobile applications

---

# 14. End-to-End Acceptance Test (Benchmark)

### Benchmark Restaurant Profile
* **Restaurant:** Ovie's Kitchen
* **Location:** Akure, Ondo State
* **Target Audience:** Bankers, civil servants, 9-to-5 corporate workers, university students
* **Primary Business Goal:** Increase weekday lunch orders
* **Uploaded Test Batch:** ~15–20 culinary items (jollof rice prep, soup simmering, takeout containers)

### Verification Workflow
```text
1. Visit Landing Page (Review Hero & Live Strategy Run demonstration)
       ↓
2. Complete Lightweight Onboarding / Sign In
       ↓
3. Navigate to Main App → Content
       ↓
4. Batch Upload raw photos and videos (Persisted in Supabase Storage)
       ↓
5. Trigger AI Multimodal Analysis (Structured JSON classifications)
       ↓
6. View Content Gap Diagnostic (Identifies missing social proof / delivery footage)
       ↓
7. Generate 7-Day Strategy for "Increase weekday lunch orders"
       ↓
8. Verify daily recommendations prioritize lunch conversion on Mon–Thu
       ↓
9. Inspect tailored Instagram vs. TikTok hooks and captions
       ↓
10. Test Edit, Regenerate, and Replace Asset controls
       ↓
11. Export completed plan as formatted PDF and Copy to Clipboard
```

---

# 15. Development & Deployment Directives

1. **Architecture Integrity:**
   * Never re-introduce content management or live media feeds onto the landing page.
   * Preserve the `PUBLIC (Landing + Demo + Auth)` vs. `AUTHENTICATED (Onboarding + Main App)` boundary.
2. **Security & Secrets:**
   * Never commit Supabase service role keys, database passwords, or AI API keys to Git.
   * Access tokens must reside strictly in `.env.local` and Vercel Environment Variables.
3. **Verification Before Commit:**
   * Run type checking and production build (`npm run build`) before pushing changes.
   * Ensure both local dev (`http://localhost:3000`) and live Vercel deployment stay in sync.

---

# 16. Final Architectural Principle

```text
LANDING PAGE
    ↓
SELL THE OUTCOME
    ↓
LIVE STRATEGY RUN
    ↓
DEMONSTRATE THE INTELLIGENCE
    ↓
SIGN UP / LOGIN
    ↓
RESTAURANT ONBOARDING
    ↓
MAIN APP
    │
    ├── HOME
    │
    ├── CONTENT
    │     ↓
    │   Existing restaurant assets
    │
    ├── STRATEGY
    │     ↓
    │   Goal
    │   +
    │   Content
    │   +
    │   Gaps
    │     ↓
    │   7-day strategy
    │
    └── RESTAURANT
          ↓
        Business context
```

* **Content is an input.**
* **Strategy is the core output.**
* **Live Strategy Run sells the intelligence.**
* **The Main App does the actual work.**
