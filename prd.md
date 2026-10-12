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
├── Single-page Restaurant Signup + Email OTP (/signup)
└── Legacy OAuth/Profile Onboarding (/onboarding & /onboarding/goal)
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
  * **Primary CTA:** `Build My Content Plan` / `Start Free` (routes directly to `/signup`)
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
*Note: This is an interactive demo simulation. It is strictly decoupled from authenticated user data.*

---

### 4.1 Landing Page Pricing Architecture

Pricing is monthly in NGN: Free ₦0, Grow ₦30,000, and Pro ₦50,000. The server uses these fixed plan amounts. Flutterwave bank-transfer checkout is implemented behind test-only configuration; paid access requires a verified webhook. Live collection remains disabled until provider account setup, migration, and explicit launch authorization are complete.

| Plan | Monthly price | Asset limit | Current product capabilities |
| :--- | :---: | :---: | :--- |
| Free | ₦0/month | 10 | Basic content analysis and gap insights, one restaurant workspace, seven-day strategy, Instagram and TikTok recommendations, hooks, captions, and calls to action. |
| Grow — Most Popular | ₦30,000/month | 100 | Free capabilities plus full content gap analysis, platform adaptations, asset recommendations and replacement, strategy editing and regeneration, copy, and export. |
| Pro | ₦50,000/month | 500 | Grow capabilities plus the larger library limit and the current advanced content-mix recommendations. No unimplemented fatigue detection, priority processing, team access, or support is promised. |

The signup and payment journey must not grant paid access until a verified provider payment updates the server-side entitlement record.

---

### 4.2 Landing Page FAQ Specifications

ContentPilot answers the 16 most common objections and questions held by busy restaurateurs through an accessible, interactive accordion (`components/ui/accordion`):

1. **How is ContentPilot different from Buffer, Hootsuite, or Later?**
   * *Answer:* Traditional tools are generic schedulers: they ask you to write captions, pick photos, and set times. ContentPilot is an AI content strategist: it inspects the media already on your phone, audits what you are missing against your specific weekly revenue goal, and decides what you should post, why, and how to adapt it for Instagram and TikTok.
2. **Do I need professional food photography to use this?**
   * *Answer:* Absolutely not. ContentPilot is built specifically for raw, authentic smartphone photos and videos. Casual kitchen prep clips, dining room ambiance, and plate presentations frequently outperform staged studio photos on Instagram Reels and TikTok.
3. **What kind of photos and videos should I upload?**
   * *Answer:* Anything already on your phone: dishes fresh off the pass, sizzling grills, plating sequences, staff prep, dining room crowds, menu boards, takeout packaging, and happy customers. The AI categorizes and maps them automatically.
4. **How does the AI know what my restaurant needs this week?**
   * *Answer:* When onboarding, you select your active weekly business goal (e.g., "Increase weekday lunch orders" or "Promote weekend dine-in"). ContentPilot's gap analysis engine compares your goal against your available media and plans high-converting posts for that exact commercial target.
5. **Does ContentPilot post directly to Instagram and TikTok for me?**
   * *Answer:* No. ContentPilot is an intelligent strategy and planning workspace, not a publishing bot. It generates your complete 7-day schedule, hooks, scripts, and captions, and allows you to copy everything in one click or print a run-sheet for your team. You retain full control before publishing.
6. **What is a "Content Gap Analysis"?**
   * *Answer:* If your goal is to boost weekday lunch orders but all 20 photos in your library are dessert photos, a standard scheduler would post cake photos on Monday morning. ContentPilot flags that you have zero speed-of-service or lunch combo assets and provides a 10-second smartphone shot brief to fill the gap.
7. **What are "Content to Create" briefs?**
   * *Answer:* When the AI identifies that your library lacks footage needed to hit your goal, it creates an exact, 10-second filming prompt for your kitchen or floor staff (e.g., *"Record 8 seconds of steam rising from the lunch special packaging at 11:45 AM"*).
8. **Can I edit the generated captions and hooks?**
   * *Answer:* Yes. Every single day in your 7-day strategy can be kept, edited inline, regenerated with a single click, or swapped with a different media asset from your library.
9. **How many files can I upload at once?**
   * *Answer:* You can drag and drop dozens of photos and videos simultaneously. Supported formats include JPG, PNG, WEBP, MP4, MOV, and WEBM.
10. **Does ContentPilot work for takeout, cafes, and cloud kitchens?**
    * *Answer:* Yes. ContentPilot supports fast-casual restaurants, sit-down dining, cafes, bakeries, food trucks, delivery-only cloud kitchens, and bar lounges. Your strategy adapts to your specific dining format.
11. **Why does ContentPilot adapt differently for Instagram vs. TikTok?**
    * *Answer:* Instagram audiences convert heavily on aesthetic text overlays, structured captions with clear calls-to-action (DM or bio link), and carousel saves. TikTok demands rapid pattern interrupts in the first 2 seconds, spoken-word natural scripting, and community curiosity hooks.
12. **Can I export my weekly content plan?**
    * *Answer:* Yes. You can copy the entire week's plan formatted for WhatsApp, Notion, or Slack in one click, download a plain text backup, or print a formatted kitchen dispatch run-sheet table for your staff.
13. **Is there really a free plan?**
    * *Answer:* Yes. The Free plan is ₦0/month and lets you upload up to 10 media assets and generate one seven-day strategy each week without entering a card.
14. **Do I need to connect my social media passwords or accounts?**
    * *Answer:* No. You never connect social media accounts or enter social passwords into ContentPilot. Your social accounts remain 100% secure.
15. **What happens if I change my restaurant's weekly goal mid-week?**
    * *Answer:* You can update your weekly goal anytime in your restaurant profile or strategy settings and regenerate your 7-day schedule to match the new commercial objective.
16. **How quickly does it take to generate my first 7-day plan?**
    * *Answer:* Once you upload your initial batch of photos and videos, the multimodal AI categorizes them in seconds and produces a full 7-day strategy with platform adaptations in under a minute.

---

### 4.3 SaaS Multi-Column Footer Architecture

The public landing page concludes with a clean, high-conviction multi-column SaaS footer (Buffer-inspired layout) using real internal links:
* **Brand Column:** ContentPilot logo, product badge, positioning statement (*"AI content strategist for restaurants. What to post, why to post it, and which existing asset to use."*), and copyright statement.
* **Product Column:** How It Works (`#how-it-works`), Live Strategy Run (`#strategy-demo`), Pricing (`#pricing`), FAQ (`#faq`), Restaurant App (`/app`).
* **Features Column:** Content Library (`/app/content`), Gap Analysis (`/app/strategy`), 7-Day Strategy (`/app/strategy`), Platform Native Adaptations (`/app/strategy`), Printable Run-Sheets (`/app/strategy`).
* **Company & Legal Column:** About Us (`/#how-it-works`), Privacy Policy (`/privacy`), Terms of Service (`/terms`), Status (`https://contentpilot-sandy.vercel.app`).
* **Strict Link Integrity:** Zero dead links, zero external placeholders (`#`), and pure Lucide icon glyphs.

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

---

# 11. Real Restaurant Authentication, Onboarding & Workspace Isolation

ContentPilot enforces a genuine multi-tenant workspace architecture where every restaurant owner signs up with their own business details, establishes an isolated workspace, and manages their own camera-roll media.

### 11.1 Complete Removal of Operator Authentication
* The previous "Operator Authentication" layer and operator passkeys (`contentpilot_op_2026`) have been completely removed from the user journey.
* Restaurant owners and social managers must never be prompted for operator access or internal developer passwords.
* The "Fast-Track via Benchmark Workspace" bypass has been permanently excised from `/login` and `/signup`.

### 11.2 Single-Page Restaurant Signup & Verification
`/signup` is a single-page registration experience. The registration state collects restaurant name, location, restaurant type, target customers, desired customer action, business description, weekly goal, email, password, and password confirmation. Both browser and server validate the submitted values. A server-only isolated Supabase client initiates signup so a pre-existing browser session cannot authenticate the new registration; the password is sent only to Supabase Auth and is never logged, persisted in application tables, returned to the browser, or sent to Google Sheets. Supabase Auth user metadata retains the restaurant details until a verified session completes profile creation.

1. **Email/password signup (`/signup`)**: `/api/auth/signup` validates the complete form and calls Supabase Auth `signUp`. A returned session or confirmed user is treated as a project-configuration error; it is never accepted as OTP verification. The same page accepts a six-digit code using `verifyOtp({ type: "signup" })`, checks that the resulting confirmed user matches the submitted email, and then makes an authenticated request to save the restaurant and initial goal before redirecting to `/app`.
2. **Code expiry and resend**: Supabase validates OTPs and rejects incorrect, expired, and reused codes. The UI explains the 15-minute validity period and applies a 60-second resend cooldown; Supabase Auth rate limits remain authoritative. Returning to edit leaves no workspace behind. Duplicate signup responses are generic to avoid account enumeration.
3. **Existing users (`/login`)**: Email/password sign-in and the existing Google OAuth option remain available. The signup page detects and labels a pre-existing verified browser session so it is not mistaken for access granted to a pending registration. If the browser is closed after signup, verified sign-in can resume profile completion from the Auth user metadata.

The legacy `/onboarding` and `/onboarding/goal` forms remain available for OAuth registration started before this flow and profile editing. New email registrants do not repeat their restaurant details.

Restaurant profile fields:
   * **Restaurant Name:** Full commercial trading name.
   * **Location:** City, neighborhood, or state (e.g., "Victoria Island, Lagos" or "Downtown Austin").
   * **Restaurant Type:** Selected from curated dining types (`restaurant`, `fast_food`, `cafe`, `bakery`, `food_delivery`, `bar_lounge`, `cloud_kitchen`, `other`).
   * **Target Audience:** Freeform demographic and customer description (e.g., "Corporate workers, banking professionals, university students").
   * **Primary Customer Action:** Desired diner behavior (`order_food`, `visit`, `whatsapp`, `book_table`, `discover`, `other`).
   * **Business Description:** Narrative operational context describing culinary concept, signature dishes, vibe, and kitchen specialty.
### 11.3 Workspace Isolation & Demo Decoupling
* **Dedicated Workspace State:** Every user owns their restaurant record, media assets, gap audit results, and 7-day strategy plans.
* **Storage Scoping:** Media uploads (`/api/content/upload`) and library queries (`/api/content/assets`) strictly require and enforce `restaurantId`.
* **Clean Empty States:** New workspaces start with a clean empty media library and an onboarding banner welcoming the owner to upload their first batch of photos and videos.
* **Verified-user protection:** API identity is validated with Supabase `getUser`; email must be confirmed before workspace APIs accept the token. Profile writes use the authenticated user ID and existing ownership RLS policies.
* **Idempotency:** Restaurant ID is stable per authenticated user and initial weekly-goal ID is stable per restaurant/week, so completion retries do not create duplicate profiles or goals.
* **Decoupling of Ovie's Kitchen:**
  * Ovie's Kitchen (`rest-ovie`) is strictly isolated as static benchmark data for the public Landing Page Live Strategy Run demo.
  * Ovie's Kitchen is **never** loaded as default state in authenticated routes (`/app`, `/app/content`, `/app/strategy`, `/app/restaurant`).
  * All "Load Preset: Ovie's Kitchen" and "Reset to Benchmark" buttons have been completely removed.

---

# 12. Google Sheets Registration Synchronization

After verification, the profile and goal persist to Supabase first. Server-side Google Sheets synchronization is secondary and never blocks workspace access. Pending/failed sync state is stored on the restaurant row and shown in the workspace; the user can retry, and workspace lookup also attempts reconciliation. Retries look up the stable Supabase user ID and update the existing row or append a new one. Sheets does not provide atomic compare-and-append, so simultaneous first-time sync requests are not guaranteed exactly-once.

* **Managing account:** Local service-account credentials successfully read the configured spreadsheet metadata and the 11-cell header row in `Sheet1`. This proves local read access only; it does not prove a registration row write or production Vercel access. Vercel CLI is logged out in the current workspace, so deployed environment variables and the deployed source revision could not be inspected.
* **Required deployment configuration:** Server-only `GOOGLE_SHEETS_SPREADSHEET_ID` and service-account JSON or email/private key. Share the destination sheet with that service account as an editor. `GOOGLE_SHEETS_SHEET_NAME` selects a tab; if unset, the first tab is used. Local credentials do not supply Vercel production credentials.
* **Columns:** Created At, User ID, Email, Restaurant Name, Location, Restaurant Type, Target Customers, Desired Customer Action, Business Description, Weekly Goal, Sheets Sync Status.
* **Idempotency and retry:** Existing rows are found by user ID and updated; missing rows are appended. This avoids duplicate rows on sequential retries, but concurrent append races are not atomic. The workspace lookup and explicit retry action are the reconciliation mechanism; there is no background retry queue. Failures are logged using sanitized error codes, persisted when the database update succeeds, and shown to the user. Passwords, OTPs, access tokens, and refresh tokens are excluded.
* **Current deployment status:** Local spreadsheet ID and service-account configuration are present, and `Sheet1` is readable. A synthetic integration-test row was written, read back, and removed. No real registration row or Vercel production write was verified; production requires its own service-account env vars and sheet editor permission.
* **Prior committed flow diagnosis:** The repository's current `HEAD` signup page created a random browser-side user, saved it in local storage, and moved directly to onboarding without calling Supabase Auth. Its onboarding API created a local workspace and launched Sheets sync without awaiting it. This code explains both reported symptoms if it matches the deployed revision. The live Vercel revision could not be confirmed because the Vercel CLI is logged out; the working-tree flow includes the OTP and sync fixes described above.

### 12.1 Supabase Dashboard and Email Provider Configuration
In Supabase, enable email confirmations under **Authentication → Providers → Email**, set **Authentication → Email → OTP length** to `6`, and **OTP expiry** to `900` seconds. The confirmation email template must display `{{ .Token }}` so it delivers the numeric code. Configure production SMTP and sending-domain deliverability. These project-level settings cannot be verified or changed from this repository. The application uses Supabase signup, verifyOtp, and resend APIs and does not generate or store OTPs.

### 12.2 Supabase Dashboard and Email Provider Configuration
Email confirmation must be enabled under **Authentication → Providers → Email** (`mailer_autoconfirm` false). The confirmation email template must display `{{ .Token }}` to deliver a numeric code. Set OTP length to `6` and OTP expiry to `900` seconds. Hosted settings inspection available to this app confirmed email auto-confirm is disabled, but OTP length/expiry and template contents were not exposed for verification; check those three settings in the Dashboard. SMTP has been configured by the project owner; delivery still requires a controlled test signup.

### 12.3 Registration Verification Plan (Partially Executed)
Local checks performed: hosted Auth reports email auto-confirm disabled; local Google service-account access read spreadsheet metadata and header; no production Vercel access or live email delivery was available. Remaining scenarios require a dedicated test account: correct, incorrect, expired, and reused OTP; resend cooldown/rate limit; registration completion and session persistence; existing login; user isolation; Google row upsert and retry under injected failure; and mobile/desktop UI. Do not mark scenarios passed until they are actually run.

---

# 13. Main App Views & Core Responsibilities

### 1. Home Dashboard (`/app`)
* **Core Question Answered:** *"What should I do with my content this week?"*
* **Key Widgets:**
  * Active Weekly Business Goal card
  * Available Media Assets summary card *(Camera roll readiness statement)*
  * Pillar Balance & Content Gap alert
  * Quick-access preview to the current 7-Day Strategy
  * Dynamic empty state onboarding banner for fresh workspaces

### 2. Content Hub (`/app/content`)
* Full media management: upload, filter, sort, preview, and delete.
* Uploads scoped to active `restaurantId`.
* Feeds directly into AI analysis and strategy generation.

### 3. Strategy Workspace (`/app/strategy`)
* 7-day interactive calendar view with daily drawers.
* Controls for Keep, Edit, Regenerate, Replace, and Export.
* WhatsApp markdown copy, plain text export, and printable kitchen dispatch run-sheet.

### 4. Restaurant Profile (`/app/restaurant`)
* Manages core business parameters: Name, Location, Restaurant Type, Target Customers, Primary Customer Action, and Business Description.
* Edits persist immediately to Supabase and active session.

---

# 14. Database Schema (PostgreSQL on Supabase)

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
  business_description TEXT,
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

# 15. Scope Boundaries & MVP Protection

### STRICTLY OUT OF SCOPE (Do NOT Build)
* ❌ Native Instagram Graph API / TikTok Publishing APIs (Zero auto-publishing)
* ❌ Social media analytics, follower counting, or engagement scrapers
* ❌ OAuth login with Instagram / TikTok
* ❌ WhatsApp Cloud API integration or conversational auto-responders
* ❌ Telegram bot automations
* ❌ Live payment collection until test-mode verification, merchant configuration, currency policy, and explicit launch authorization are complete
* ❌ Multi-tenant agency hierarchies or client sign-off portals
* ❌ Generic Buffer-style scheduling queues
* ❌ Native iOS or Android mobile applications

---

# 16. Pure Lucide Icons Only (Zero Emojis Mandate)

Across the entire application (UI layouts, modals, buttons, badges, notifications, copy, code constants, and generated content plans):
* **Strictly Lucide Icons Only (`lucide-react`)**: All visual signifiers, status indicators, and actions must use clean, vector-rendered Lucide icons.
* **Zero Emojis**: Absolutely no unicode emojis, pictograms, or sparkle icons in headlines, body copy, CTA labels, toasts, or AI prompts.

---

# 17. End-to-End Acceptance Test & Benchmark Separation

### Public Benchmark Simulation (Landing Page Only)
* **Restaurant:** Ovie's Kitchen
* **Location:** Akure, Ondo State
* **Target Audience:** Bankers, civil servants, 9-to-5 corporate workers, university students
* **Primary Business Goal:** Increase weekday lunch orders
* **Purpose:** Live Strategy Run interactive demonstration only.

### Real Authenticated Flow Verification
```text
1. Visit Landing Page (Review Hero, Pricing, FAQ, Footer & Live Strategy Run)
       ↓
2. Click "Start Free" or "Build My Content Plan" → Navigate to /signup
       ↓
3. Create account with restaurant details, weekly goal, email, and password (`/signup`)
       ↓
4. Enter the six-digit email code within 15 minutes
       ↓
5. Persist the verified profile and weekly goal; attempt server-side Google Sheets sync
       ↓
6. Lands on Authenticated Dashboard (/app) showing real restaurant name and empty state
       ↓
7. Navigate to Content (/app/content) and batch upload camera roll photos/videos
       ↓
8. Multimodal AI categorizes culinary media into structured pillars and objectives
       ↓
9. Navigate to Strategy (/app/strategy) to generate personalized 7-Day Strategy
       ↓
10. Inspect Instagram overlays & TikTok spoken-word scripts; test Keep, Edit, Regen, Replace
       ↓
11. Copy formatted WhatsApp run-sheet or print kitchen dispatch schedule
```

---

# 18. Development & Deployment Directives

1. **Architecture Integrity:**
   * Never re-introduce content management or live media feeds onto the landing page.
   * Preserve the `PUBLIC (Landing + Demo + Auth)` vs. `AUTHENTICATED (Onboarding + Main App)` boundary.
2. **Security & Secrets:**
   * Never commit Supabase service role keys, database passwords, or AI API keys to Git.
   * Access tokens must reside strictly in `.env.local` and Vercel Environment Variables.
3. **Verification Before Commit:**
   * Run type checking (`npx tsc --noEmit`) and production build (`npm run build`) before pushing changes.
   * Ensure both local dev (`http://localhost:3000`) and live Vercel deployment stay in sync.

---

# 19. Final Architectural Principle

```text
LANDING PAGE
    ↓
SELL THE OUTCOME
    ↓
PRICING & FAQ & FOOTER
    ↓
COMMUNICATE COMMERCIAL VALUE & CONFIDENCE
    ↓
LIVE STRATEGY RUN
    ↓
DEMONSTRATE THE INTELLIGENCE
    ↓
SIGN UP / LOGIN
    ↓
RESTAURANT ONBOARDING
    ↓
MAIN APP (PERSONAL WORKSPACE)
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
