# Product Requirements Document (PRD) — ContentPilot

## Product Name
**ContentPilot**  
*(Working title — subject to future refinement)*

## Product Type
Web Application / Minimum Viable Product (MVP)

## Project & Account Information
* **GitHub Organization / Account:** `ischeduleit-cmd`
* **Vercel Team / Project:** [`ischeduleit`](https://vercel.com/new?teamSlug=ischeduleit)
* **Associated Account / Email:** `ischeduleit@gmail.com`
* **File & Object Storage:** Vercel Blob (`@vercel/blob`)

---

## Product Purpose
ContentPilot is a lightweight AI content strategist designed specifically for restaurant owners and restaurant social media managers.

The MVP solves one acute, high-frequency problem:
> **A restaurant owner has a camera roll full of photos and videos but doesn't know what to post, how to categorize them strategically, or how to turn them into an actionable weekly content plan that drives real business results.**

The user uploads their existing content assets, provides basic restaurant information and their weekly business objective, and ContentPilot analyzes the media, maps assets to strategic content pillars, highlights content gaps, and generates a structured 7-day Instagram and TikTok content plan.

---

# 1. MVP Core Promise

The entire MVP delivers one streamlined, cohesive experience:
> **Upload your restaurant content. Tell us your goal for this week. Get a strategic content plan using the content you already have.**

### Example Scenario
A restaurant uploads:
* 10 food videos
* 3 customer reaction videos
* 2 restaurant ambience videos
* 3 staff / behind-the-scenes clips
* 5 food photos

The user selects:
> **This week's goal: Increase weekday lunch orders**

The system analyzes the media library and produces:

#### Recommended Weekly Plan (Excerpt)
* **Monday — Product / Conversion**
  * **Asset:** Jollof rice video (`food_video_01.mp4`)
  * **Purpose:** Drive lunch orders
  * **Platform:** Instagram Reel + TikTok
  * **Suggested Angle:** *"Your Monday lunch is sorted."*
  * **Hook:** *"Your Monday lunch problem just got solved."*
  * **CTA:** *"Send us a DM or WhatsApp before 1 PM to get yours delivered hot."*
  * **Recommended Time:** 11:30 AM – 12:00 PM
* **Tuesday — Social Proof**
  * **Asset:** Customer tasting food video (`customer_reaction_02.mp4`)
  * **Purpose:** Build trust & desire
  * **Platform:** Instagram + TikTok
* **Wednesday — Education / Process**
  * **Asset:** Food preparation & firewood jollof technique
  * **Purpose:** Educate & showcase quality
  * **Platform:** Instagram + TikTok

The user can then review, edit, regenerate, or export the completed plan.

---

# 2. Target User & Market Focus

### Primary User Persona
Independent restaurant owners, cafe operators, food vendors, or boutique social media managers who:
* Have accumulated dozens/hundreds of photos and videos on their mobile phones.
* Want to post consistently across Instagram and TikTok.
* Do not have the budget or need for a full-time content strategist or marketing agency.
* Struggle to organize, categorize, or repurpose their media backlog.
* Want their social media output to directly drive foot traffic, reservations, or delivery orders.

### Initial Geographic Focus
**Nigeria** (e.g., Lagos, Abuja, Ibadan, Akure).  
*Architectural Note:* While initial messaging resonates with Nigerian hospitality realities, the underlying architecture, data models, and prompt chains must remain globally modular and customizable.

---

# 3. MVP Scope Boundaries

## MUST HAVE (In Scope)
1. **Landing Page:** Clear, conversion-focused single-page narrative with hero, workflow visual, problem explanation, and onboarding CTA.
2. **Restaurant Onboarding:** Lightweight profile collection (name, location, restaurant type, target audience, primary customer action).
3. **Weekly Business Goal Selection:** High-intent objective picker with optional contextual nuance.
4. **Content Upload (Vercel Blob):** Drag-and-drop batch upload supporting up to 50 assets per workspace/week.
5. **Content Library:** Visual grid showing thumbnails, metadata, AI classification, pillar tags, and review status.
6. **AI Multimodal Content Analysis:** Automated visual inspection determining content type, subject, content pillar, objective, and suggested platforms.
7. **Human-in-the-Loop Override:** Ability for users to manually edit or review AI classifications for ambiguous media.
8. **Content Gap Analysis:** Visual distribution mix calculation identifying missing pillars (e.g., deficit in social proof).
9. **Weekly Content Plan Generation:** 7-day strategic calendar customized to the restaurant's stated weekly business goal.
10. **Platform Adaptation (Instagram vs. TikTok):** Distinct, tailored hooks, captions, and CTAs for each channel.
11. **Interactive Calendar UI:** Day-by-day card layout with detailed preview drawers.
12. **User Controls:** Keep, Edit, Regenerate, and Replace Asset controls on every recommendation card.
13. **Export / Download:** Formatted PDF generation and one-click "Copy Plan to Clipboard" functionality.

## STRICTLY OUT OF SCOPE (Do NOT Build in MVP)
* ❌ Native Instagram Graph API / TikTok Content Posting APIs (No direct publishing)
* ❌ Social media analytics or follower tracking
* ❌ OAuth login with Instagram / TikTok
* ❌ WhatsApp Cloud API integration or conversational bots
* ❌ Telegram bot automation
* ❌ Complex CRM, customer contact databases, or order management
* ❌ Payment gateways (Stripe, Paystack, Flutterwave)
* ❌ Multi-tenant agency accounts or client approval workflows
* ❌ Automated calendar scheduling bots
* ❌ Social listening, hashtag scrapers, or competitor tracking
* ❌ Native iOS or Android mobile applications

---

# 4. Core User Flow

```
[ Landing Page ]
       ↓
[ Create Workspace / Simple Auth ]
       ↓
[ Step 1: Tell Us About Your Restaurant ]
       ↓
[ Step 2: Choose This Week's Business Goal ]
       ↓
[ Step 3: Batch Upload Existing Content (Vercel Blob) ]
       ↓
[ AI Analyzes & Classifies Assets ]
       ↓
[ Review Content Library & Content Gap Alert ]
       ↓
[ AI Generates 7-Day Strategic Content Plan ]
       ↓
[ User Reviews Weekly Calendar ]
       ↓
[ User Edits / Swaps / Regenerates Recommendations ]
       ↓
[ Export Plan (PDF / Copy to Clipboard) ]
```

---

# 5. Landing Page Specifications

* **Header:** Minimalist logo ("ContentPilot"), simple nav ("How It Works", "Example"), CTA button ("Build My Content Plan").
* **Hero Section:**
  * **Headline:** Turn the content you already have into a week's worth of restaurant marketing.
  * **Subheadline:** Upload your photos and videos, choose your business goal, and get an AI-powered content plan for Instagram and TikTok.
  * **Primary CTA:** `Build My Content Plan` (routes directly to onboarding).
  * **Secondary CTA:** `See How It Works` (smooth scroll to workflow section).
* **Hero Visual:** Clean, minimal 3-step workflow diagram:  
  `[Your Phone's Content]` ➔ `[AI Strategic Analysis]` ➔ `[7-Day Revenue-Driven Plan]`
* **Section 1 — The Real Problem:**
  * Heading: *"You already have the content. You just don't know what to do with it."*
  * Highlights the pain point: Restaurant owners have dozens of food clips sitting unused on their camera rolls, paralyzed by uncertainty over what to post, in what order, and whether it drives sales.
* **Section 2 — How It Works:**
  1. *Upload your content:* Add the photos and videos already sitting on your device.
  2. *Choose your goal:* Select your primary target (lunch orders, table bookings, brand trust).
  3. *Get your strategic plan:* AI categorizes your assets and delivers a ready-to-post 7-day schedule.
* **Section 3 — Before vs. After Comparison:**
  * *Before (Camera Roll Chaos):* 37 disorganized videos, repetitive food photos, no clear objective.
  * *After (ContentPilot Strategic Matrix):* Monday (Conversion), Tuesday (Social Proof), Wednesday (Education), Thursday (Product), Friday (Community), Saturday (Promotion), Sunday (Engagement).
* **Section 4 — Final CTA:**
  * Heading: *"Your next week of content is already sitting on your phone."*
  * Button: `Build My Content Plan`

---

# 6. Restaurant Onboarding Flow

Keep onboarding frictionless (under 2 minutes):

### Form Fields:
1. **Restaurant Name:** Text input (e.g., *"Ovie's Kitchen"*).
2. **Location:** Text input (e.g., *"Akure, Ondo State"*).
3. **Restaurant Type:** Dropdown select:
   * Restaurant / Casual Dining
   * Fast Food / QSR
   * Café & Bakery
   * Cloud Kitchen / Food Delivery Vendor
   * Bar & Lounge
   * Other
4. **Target Customers:** Text input (e.g., *"Bankers, 9-to-5 corporate workers, and university students"*).
5. **Primary Customer Action:** Single-select radio/button group:
   * Order delivery online
   * Visit restaurant for dine-in
   * Send WhatsApp message / DM to order
   * Reserve a table
   * Discover brand / follow page

---

# 7. Weekly Business Goal Selection

A single primary business objective drives the entire planning algorithm:

### Select One Primary Goal:
* **Get more orders** (e.g., boost lunch or dinner delivery)
* **Promote a specific product / menu item**
* **Increase brand awareness & local discovery**
* **Build trust & credibility (Social proof)**
* **Increase community engagement & comments**
* **Promote an event or weekend special**
* **Drive dine-in foot traffic**
* **Other**

### Nuance Field (Optional):
* **Describe your specific focus:** Text input (e.g., *"I want more professionals ordering our lunch combo between Monday and Thursday"*).

---

# 8. Content Upload & Media Storage

* **Storage Provider:** **Vercel Blob Storage** (`@vercel/blob`)
  * Vercel Team: `ischeduleit`
  * API Configuration: `BLOB_READ_WRITE_TOKEN` in environment variables.
* **Upload Limits:**
  * Supports: Images (`.jpg`, `.jpeg`, `.png`, `.webp`) and Videos (`.mp4`, `.mov`, `.webm`).
  * Maximum: Up to 50 assets per workspace/week.
  * Maximum single file size: 50MB (video compression recommended for MVP).
* **Upload UI:**
  * Clean drag-and-drop zone with native file browser fallback.
  * Multi-file concurrent upload with individual progress indicators.
  * Immediate thumbnail generation and temporary client-side preview.

---

# 9. Content Library & Asset Management

A responsive card grid displaying all uploaded media assets:
* **Asset Card Elements:**
  * Visual thumbnail / video preview with playable overlay.
  * File name, media format, and file size.
  * **AI Classification Pill:** (e.g., *Product*, *Social Proof*, *Behind-the-Scenes*).
  * **Objective Pill:** (e.g., *Conversion*, *Trust*, *Awareness*).
  * **Confidence Indicator:** (High / Needs Review).
  * **Processing Status:** Uploaded ➔ Analyzing ➔ Categorized / Needs Review.
* **Manual Override Modal:**
  * Users can click any card to inspect or adjust:
    * Content Pillar
    * Media Description
    * Primary Objective
    * Target Platform Suitability

---

# 10. AI Multimodal Content Analysis

Every uploaded asset is passed through a multimodal vision model (OpenAI GPT-4o / GPT-4o-mini or Gemini Flash vision):

### Analysis Inputs:
* Media asset (Image bytes or sampled video keyframe)
* File name & metadata
* Restaurant context (Name, type, location, audience, customer action)
* Current weekly business goal

### AI Extraction Schema (Strict JSON):
```json
{
  "description": "Close-up sizzling jollof rice garnished with fried chicken and plantain",
  "content_type": "food_product",
  "content_pillar": "product",
  "subject": "Jollof Rice Special",
  "objectives": ["conversion", "awareness"],
  "recommended_platforms": ["instagram", "tiktok"],
  "confidence": 0.94,
  "needs_review": false,
  "suggested_angle": "Hearty weekday lunch ready in 15 minutes"
}
```

### Safety & Grounding Rule:
* **No Hallucinated Content:** If visual ambiguity exists (e.g., low-resolution, obscured frames), the AI must set `needs_review: true` with `confidence < 0.60` rather than guessing ingredients or subjects.

---

# 11. Content Gap Analysis

Following full library classification, the system calculates the percentage distribution across strategic pillars:
* **Pillar Breakdown:**
  * Product / Menu Showcase: `X%`
  * Social Proof (Customer reactions, reviews, full dining rooms): `Y%`
  * Education & Craft (Ingredients, prep, chef techniques): `Z%`
  * Behind-the-Scenes & Staff: `A%`
  * Community & Culture: `B%`
* **Strategic Gap Warning Card:**
  * Highlights the most glaring deficiency relative to the chosen goal.
  * *Example:* "You selected **Build Trust**, but only 5% of your content features social proof. Recommendation: Capture customer reactions or repost customer Instagram stories in your next batch."

---

# 12. Weekly Content Plan Generation Engine

The AI acts as a **strategic restaurant marketer**, not a simple caption writer.  
It applies this explicit reasoning hierarchy:
$$\text{Business Goal} \longrightarrow \text{Audience} \longrightarrow \text{Available Assets} \longrightarrow \text{Pillar Balance} \longrightarrow \text{Platform Adaptation} \longrightarrow \text{Hook \& CTA}$$

### Output Requirements (7-Day Calendar):
For each day (Monday – Sunday):
1. **Day of Week & Date**
2. **Selected Asset Reference:** Linked directly to an uploaded Vercel Blob asset.
3. **Content Pillar:** (e.g., Product, Social Proof, Education).
4. **Strategic Objective:** (e.g., Drive weekday lunch orders).
5. **Content Angle:** Core creative premise.
6. **Instagram Adaptation:**
   * Visual Hook / First 3-second text overlay
   * Caption (engaging, localized, structured with line breaks)
   * Clear Call-To-Action (DM, WhatsApp link, bio link)
7. **TikTok Adaptation:**
   * High-retention audio/visual hook
   * Casual, snappy caption with search-optimized phrasing
   * Conversational CTA
8. **Recommended Posting Window:** (e.g., `11:30 AM – 1:00 PM` for lunch orders).

---

# 13. Weekly Calendar UI & Interactive Controls

* **Weekly Board Layout:**
  * 7 sequential day cards displaying assigned thumbnail, pillar badge, channel tags, and hook.
* **Per-Day Action Controls:**
  * **Keep:** Confirm and lock the recommendation.
  * **Edit:** Inline drawer allowing instant text modification of captions, hooks, CTAs, and scheduled times.
  * **Regenerate:** Re-prompts the AI to propose a different angle, hook, and caption using the *same* asset.
  * **Replace Asset:** Opens a modal of the uploaded library to swap the media asset with another matching piece.

---

# 14. Export & Sharing

* **PDF Export:** Generates a branded, clean, printable PDF summarizing the 7-day schedule with image thumbnails, angles, and caption copy.
* **Copy Plan:** One-click clipboard copy formatted with clean markdown/plain text for direct pasting into WhatsApp, Notion, or Google Docs.

---

# 15. Database Architecture

Relational PostgreSQL schema (Vercel Postgres / Neon / PostgreSQL):

```sql
-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Restaurants Table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  restaurant_type VARCHAR(100) NOT NULL,
  target_audience TEXT,
  primary_customer_action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Weekly Goals Table
CREATE TABLE weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  goal VARCHAR(150) NOT NULL,
  goal_description TEXT,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content Assets Table
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,              -- Vercel Blob public download URL
  file_name VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) NOT NULL,      -- image/jpeg, video/mp4, etc.
  ai_description TEXT,
  content_type VARCHAR(100),
  content_pillar VARCHAR(100),
  objective VARCHAR(100),
  suggested_platform VARCHAR(50),
  confidence NUMERIC(3, 2),
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending | analyzing | ready | needs_review | error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Content Plans Table
CREATE TABLE content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  weekly_goal_id UUID REFERENCES weekly_goals(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Content Plan Items Table
CREATE TABLE content_plan_items (
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
  instagram_cta TEXT,
  tiktok_hook TEXT,
  tiktok_caption TEXT,
  tiktok_cta TEXT,
  recommended_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft'  -- draft | approved | exported
);
```

---

# 16. Technical Stack & Architecture

| Layer | Technology | Specification / Configuration |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router) | React, TypeScript, Server Components |
| **Styling & UI** | Tailwind CSS & shadcn/ui | Lucide icons, accessible Radix UI primitives |
| **Hosting & Deployment** | Vercel | Team: `ischeduleit` (`https://vercel.com/new?teamSlug=ischeduleit`) |
| **Source Control** | GitHub | Account: `ischeduleit-cmd` |
| **Object / Media Storage**| **Vercel Blob** | `@vercel/blob` (Server upload handlers, SAS tokens) |
| **Database** | PostgreSQL | Vercel Postgres / Neon serverless pool |
| **Authentication** | Lightweight Auth / NextAuth | Magic link / Google auth via `ischeduleit@gmail.com` |
| **AI Intelligence** | Multimodal LLM API | OpenAI (GPT-4o) / Anthropic (Claude 3.5 Sonnet) / Gemini |
| **PDF Generation** | `@react-pdf/renderer` or Puppeteer | Clean, styled single-page calendar export |

---

# 17. Error Handling & Edge Conditions

1. **Upload Failures:** Display descriptive error badge: *"We couldn't upload this file to Vercel Blob. Please check file size (<50MB) and try again."*
2. **AI Analysis Failure:** Fallback to manual entry: *"We couldn't automatically analyze this asset. You can categorize it manually in the library."*
3. **Insufficient Content (< 7 assets):** If the user uploads fewer than 7 assets, the AI should intelligently repeat the highest-impact assets with different hooks/angles, clearly alerting: *"You don't have 7 distinct assets yet. We've maximized your available content across this week's plan."*
4. **Unsupported Media Format:** Reject client-side before uploading with friendly alert.

---

# 18. Build Order for Coding Agents

* **Phase 1: Foundation & Scaffold**
  * Initialize Next.js project with TypeScript, Tailwind CSS, and shadcn/ui.
  * Connect GitHub repository under `ischeduleit-cmd`.
  * Set up database migrations and Prisma/Drizzle ORM schema.
  * Configure Vercel project under team `ischeduleit`.
* **Phase 2: Marketing & Onboarding**
  * Build responsive Landing Page with Hero, Problem, How-it-Works, and CTA.
  * Build Onboarding Flow (Restaurant details + Weekly goal selector).
* **Phase 3: Media Upload & Library (Vercel Blob)**
  * Implement `@vercel/blob` client/server upload routes.
  * Build drag-and-drop batch upload component with upload progress.
  * Build Content Library grid with metadata cards and manual edit modal.
* **Phase 4: AI Analysis Pipeline**
  * Implement multimodal vision prompt returning validated JSON.
  * Store categorization, pillar, objective, and confidence in `content_assets`.
* **Phase 5: Content Gap & Strategy Engine**
  * Compute pillar distribution metrics and display Gap Alert.
  * Implement 7-day strategy planner prompt factoring in restaurant context and goal.
* **Phase 6: Interactive Weekly Calendar**
  * Build 7-day card calendar UI.
  * Implement Keep, Edit, Regenerate, and Replace Asset controls.
* **Phase 7: Export & Polishing**
  * Implement Copy-to-Clipboard and PDF download.
  * Audit loading states, skeleton screens, and empty states.
* **Phase 8: End-to-End Validation**
  * Execute real test scenario using "Ovie's Kitchen" dataset.

---

# 19. Definition of Done (Validation Test)

The MVP is complete when the following test executes without manual code intervention:
* **Restaurant:** Ovie's Kitchen
* **Location:** Akure, Ondo State
* **Audience:** Bankers, civil servants, 9-to-5 corporate workers
* **Primary Goal:** Increase weekday lunch orders
* **Uploaded Media:** 15+ food photos and cooking videos
* **Verification Checks:**
  1. All files upload securely to Vercel Blob storage.
  2. The AI categorizes each asset accurately without hallucination.
  3. The system highlights any social proof or community content deficit.
  4. The 7-day calendar prioritizes lunch-conversion assets for Monday–Thursday.
  5. Tailored Instagram and TikTok captions and hooks are generated.
  6. Modifying, regenerating, or replacing an asset works instantaneously.
  7. The user can export the clean plan as a PDF or copy it to the clipboard.
