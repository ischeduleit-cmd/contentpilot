# ContentPilot

> **AI Multimodal Content Strategist for Restaurant Owners**  
> *"A Junior Content Strategist, Not a Caption Bot"*

---

## 1. Project Overview & Identity

* **GitHub Repository:** `ischeduleit-cmd/contentpilot`
* **Vercel Team Slug:** `ischeduleit`
* **Vercel Target Setup:** [https://vercel.com/new?teamSlug=ischeduleit](https://vercel.com/new?teamSlug=ischeduleit)
* **Associated Account / Email:** `ischeduleit@gmail.com`
* **Cloud Storage:** Vercel Blob (`@vercel/blob`)
* **Database & ORM:** PostgreSQL with Drizzle ORM (`drizzle-orm`)
* **Frontend Design System:** Swiss Strict Monochrome (Black & White, zero-emoji policy, Lucide SVG icons only)

---

## 2. Phase 1 Deliverables (Completed)

- [x] **Next.js 14 App Router:** TypeScript, Tailwind CSS, custom fonts (`Inter` & `JetBrains Mono`).
- [x] **Design Tokens & System:** Hairline border styling, pure monochrome contrast, accessible buttons, badges, cards, inputs, textareas, and tabs.
- [x] **Drizzle ORM Relational Schema:** Tables for `users`, `restaurants`, `weekly_goals`, `content_assets`, `content_plans`, `content_plan_items`.
- [x] **Vercel Blob Integration:** `@vercel/blob` client upload structure and typed asset interfaces.
- [x] **Section 11 Acceptance Benchmark:** Full interactive simulation of the "Ovie's Kitchen" dataset (Akure, Ondo State) with automated pillar deficit detection (14% social proof alert) and 7-day conversion schedule.

---

## 3. Project Structure

```text
content/
├── app/
│   ├── globals.css         # Swiss monochrome tailwind base & CSS tokens
│   ├── layout.tsx          # Root layout with fonts, Navbar, Footer
│   └── page.tsx            # Interactive Phase 1 overview & benchmark engine
├── components/
│   ├── navbar.tsx          # Navigation with repo, Vercel team & status tokens
│   ├── footer.tsx          # Technical specifications and repository links
│   └── ui/                 # Anti-slop UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── lib/
│   ├── blob.ts             # Vercel Blob client helpers and upload configurations
│   ├── constants.ts        # Content pillars, business goals, and Ovie's Kitchen benchmark
│   ├── utils.ts            # clsx + twMerge utility
│   └── db/
│       └── schema.ts       # Drizzle ORM tables and TypeScript domain models
├── claude.md               # Product architecture & engineering guide
├── prd.md                  # Complete Product Requirements Document
├── package.json
└── tsconfig.json
```

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm run start
```
