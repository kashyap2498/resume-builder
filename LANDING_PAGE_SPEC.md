# Resumello Landing Page - Complete Agent Reference Specification

> This document is the single source of truth for building the Resumello.app marketing landing page.
> Follow it exactly. Every section, every word of copy, every design decision is intentional and backed by competitor research and consumer psychology analysis.

---

## Table of Contents

1. [Product Context](#1-product-context)
2. [Target Customer Psychology](#2-target-customer-psychology)
3. [Competitor Intelligence](#3-competitor-intelligence)
4. [Brand Identity](#4-brand-identity)
5. [Technical Implementation](#5-technical-implementation)
6. [Page Structure Overview](#6-page-structure-overview)
7. [Section-by-Section Specification](#7-section-by-section-specification)
8. [Responsive Behavior](#8-responsive-behavior)
9. [Animations and Interactions](#9-animations-and-interactions)
10. [SEO Requirements](#10-seo-requirements)
11. [Assets Required](#11-assets-required)
12. [Copy Bank](#12-copy-bank)

---

## 1. Product Context

### What Resumello Is
- A web-based resume builder at Resumello.app
- 18 professional templates across 8 categories
- Built-in ATS (Applicant Tracking System) scoring engine
- PDF and DOCX export
- Import from PDF, DOCX, and JSON
- Cloud sync (data persists across devices via Convex backend)
- Drag-and-drop section reordering
- 11 professional fonts, 10 color themes
- Version history with named snapshots
- Job application tracker
- Cover letter support
- Fully responsive (mobile, tablet, desktop)

### What Resumello Is NOT
- Not a subscription trap
- Not a "free with hidden paywall" tool
- Not an image-based PDF generator (text-based, ATS-parseable)
- Not a design tool (like Canva) — purpose-built for resumes

### Pricing Model
- **Monthly**: $14.99/month (exists as a decoy to make lifetime obvious)
- **Lifetime**: $49 one-time payment (the hero option)
- **Money-back guarantee**: 7 days, no questions asked
- **No free trial**: You buy it, you use it immediately

### Auth System (Already Built)
- Email + password sign up
- Google OAuth sign in
- Powered by Convex Auth
- Users sign up/sign in at /login, then land on dashboard at /

### The 18 Templates (Complete List)

**ATS-Optimized (2)**
1. ATS Standard — Pure text, no colors, maximum ATS compatibility. Single column.
2. ATS Professional — ATS-friendly with subtle accent color and decorative line. Single column.

**Minimal (2)**
3. Minimal Lines — Thin line dividers, light fonts, elegant. Single column.
4. Whitespace — Maximum white space, ultra-clean, no dividers. Single column.

**Professional (2)**
5. Professional Classic — Traditional corporate look with navy header. Single column.
6. Executive Suite — Elegant design for executives, gold/dark accents. Single column.

**Modern (3)**
7. Modern Clean — Accent color top bar, contemporary sans-serif. Single column.
8. Modern Sidebar — Colored sidebar for contact/skills, main area for experience. Two column.
9. Elegant Columns — Refined indigo accent, clean sidebar. Two column.

**Technical (3)**
10. Technical Blueprint — Monospace headings, steel blue, engineering feel. Single column.
11. Circuit Board — Left sidebar with skills, tech green accent. Two column.
12. Developer Stack — Dark sidebar, code-inspired JSX-style name. Two column.

**Healthcare (2)**
13. Clinical Professional — Trustworthy blue palette, prominent header banner. Single column.
14. Healthcare Modern — Teal sidebar for certifications and skills. Two column.

**Creative (2)**
15. Creative Portfolio — Dark sidebar, large name treatment, vibrant accents. Two column.
16. Bold Creative — Oversized colorful headers, generous spacing. Single column.

**Academic (2)**
17. Academic Research — Numbered citation-style publications, green accents, serif. Single column.
18. Academic CV — Traditional CV with serif typography, formal layout. Single column.

---

## 2. Target Customer Psychology

### Who They Are
**Primary**: Job seekers aged 22-40 who have been burned by resume builder subscriptions. They searched "resume builder," used one, got hit with a paywall after investing 1-3 hours of work, and are now angry and distrustful.

**Secondary**: College students and recent graduates who are price-sensitive and need a professional resume but cannot justify $24/month.

**Tertiary**: Career changers and people re-entering the workforce who need multiple resume versions for different roles.

### The Emotional Journey They've Been Through (CRITICAL — all copy derives from this)

**Stage 1 — Hope**: They Googled "free resume builder." Saw "Free" in giant letters on a competitor site.

**Stage 2 — Investment**: Spent 1-3 hours entering work history, education, skills, references. Customized fonts, colors, layout. Felt proud.

**Stage 3 — Betrayal**: Clicked "Download." A paywall appeared. Or the download button was grayed out. Or a "$2.95 trial" was required. Their stomach dropped.

**Stage 4 — Rage**: They paid because of sunk cost. Then got charged $25-30/month without warning. Tried to cancel. Couldn't find the button. Support didn't respond.

**Stage 5 — Distrust**: Now they Google "resume builder no subscription" or "resume builder one time payment" or "resume builder not a scam." **This search is how they find Resumello.**

### The Emotional Language They Use (from real reviews)
These exact phrases appear across Reddit, Trustpilot, and review sites:
- "holding my resume hostage"
- "bait and switch"
- "felt scammed"
- "about 2 hours of my life wasted"
- "they upgrade people without their concern and debit as pleased"
- "kept charging me even though I cancelled it many times"
- "Can't I write it as text on my computer from the start? As long as it is paid just say so don't waste my time."
- "the money back guarantee is literally a scam"

### What They Desperately Want
1. **Honesty** — Tell me the price upfront. Don't hide it behind a trial.
2. **No subscription** — Let me pay once and be done.
3. **No download paywall** — If I build it, let me download it.
4. **Working ATS** — Don't give me a pretty PDF that gets auto-rejected.
5. **Respect for their time** — Don't waste hours of my life then demand money.

### Psychological Principles to Apply on the Landing Page
- **Pattern interrupt**: They expect hidden pricing. Show it immediately to break the pattern.
- **Loss aversion**: They fear losing money to another scam. The 7-day guarantee neutralizes this.
- **Social proof**: They trust other burned users more than brand claims.
- **Anchoring**: The $14.99/month price anchors perceived value. $49 lifetime feels like a steal by comparison.
- **Urgency through education**: The ATS rejection stat (75% of resumes rejected) creates urgency without fake countdown timers.

---

## 3. Competitor Intelligence

### Use this data to inform copy. Never name competitors directly on the landing page — say "other builders" instead. The visitor already knows who you mean.

### Resume.io
- $2.95 "7-day trial" auto-renews to $29.95 every 4 weeks
- Paywall appears ONLY at download after user builds entire resume
- Cancellation page reportedly crashes for some users
- No email warning before auto-renewal
- Trustpilot: 4.3/5 (54,797 reviews) but Product Hunt: 1.5/5
- 38 templates

### Novoresume
- $21.99/month, $139.99/year
- Premium features (fonts, backgrounds) marked with tiny blue star icon
- Users select premium features unknowingly, discover download button is grayed out
- Free tier limited to 1 page, 3 fonts
- 16 templates

### EnhanCV
- $24.99/month, ~$160/year
- Price DOUBLES after login — shows one price on landing page, 2x at checkout
- 15 templates
- Users call it "very scammy"

### Canva
- $15/month or $120/year for Pro
- 75% of Canva resumes are rejected by ATS (2023 Jobscan study)
- Image/graphics-based PDFs that ATS systems cannot parse
- No DOCX export
- Not purpose-built for resumes

### Kickresume
- $19/month, $84/year
- Free tier: only 4 templates, no AI, no custom sections
- 40+ templates total

### Reactive Resume (open source)
- Completely free, 18+ templates
- Resumello's ONLY honest competitor
- Less polished UX, requires technical comfort, community-only support
- Do NOT attack this product on the landing page

### Competitor Cost Comparison (use in pricing section)
| Service | 1 Year Cost | 2 Year Cost |
|---------|-------------|-------------|
| Resume.io | ~$390 | ~$780 |
| EnhanCV | ~$160 | ~$320 |
| Novoresume | ~$140 | ~$280 |
| Canva Pro | ~$120 | ~$240 |
| Kickresume | ~$84 | ~$168 |
| **Resumello** | **$49** | **$49** |

---

## 4. Brand Identity

### Name
**Resumello** — pronounced "reh-zoo-MEL-oh"

### Domain
resumello.app

### Brand Voice
- **Direct**: Say what you mean. No marketing fluff.
- **Honest**: Lead with price. Lead with limitations. Earn trust through transparency.
- **Slightly irreverent**: Subtle jabs at competitor practices without being petty.
- **Confident**: This is a good product and we know it. No hedging.
- **Human**: Write like a real person talking to a friend who needs resume help.

### Brand Voice Examples
- YES: "No subscriptions. No trial traps. No paywall at download."
- YES: "$49. Once. Forever."
- YES: "They never saw you." (about ATS rejection)
- NO: "We're revolutionizing the resume building experience!"
- NO: "Join thousands of happy users!"
- NO: "Unlock your career potential!"
- NO: "Best-in-class resume solution"

### Color Palette for Landing Page

**Primary brand color**: Use a deep blue similar to the app's existing blue-600 (#2563EB). This conveys trust, professionalism, and reliability — critical for a product selling to people who've been scammed.

**Full palette**:
- **Primary**: #2563EB (blue-600) — CTAs, links, emphasis
- **Primary hover**: #1D4ED8 (blue-700)
- **Primary dark**: #1E3A5F — hero backgrounds, headers
- **Secondary**: #10B981 (emerald-500) — success states, checkmarks, "included" indicators
- **Text primary**: #111827 (gray-900)
- **Text secondary**: #6B7280 (gray-500)
- **Text muted**: #9CA3AF (gray-400)
- **Background primary**: #FFFFFF
- **Background subtle**: #F9FAFB (gray-50)
- **Background hero**: Gradient from #0F172A (slate-900) to #1E3A5F (dark blue)
- **Border**: #E5E7EB (gray-200)
- **Danger/negative**: #EF4444 (red-500) — used for competitor X marks
- **Surface card**: #FFFFFF with border gray-200 and subtle shadow

### Typography for Landing Page
- **Headings**: Inter (already in the app's font stack — @fontsource/inter)
- **Body**: Inter
- **Heading weights**: 700 (bold) for h1/h2, 600 (semibold) for h3/h4
- **Body weight**: 400 (regular), 500 (medium) for emphasis

**Type scale** (desktop):
- Hero headline: 56px / 3.5rem, font-bold, tracking-tight, leading-tight
- Section headlines: 36px / 2.25rem, font-bold, tracking-tight
- Section subheads: 20px / 1.25rem, font-normal, text-secondary
- Body text: 16px / 1rem or 18px / 1.125rem
- Small text / labels: 14px / 0.875rem
- Fine print: 12px / 0.75rem

### Logo
- For now, use text-based logo: "Resumello" in Inter Bold
- The "R" can optionally have a subtle accent (blue underline or highlight) to make it feel branded
- Navbar logo: "Resumello" with a small document icon (use Lucide FileText icon) to the left

---

## 5. Technical Implementation

### This landing page must be built as a NEW route in the existing React app.

**Route**: `/landing` or the root `/` (with the current dashboard moved to `/dashboard`)

**Recommended approach**: Create the landing page as a new route. Unauthenticated users see the landing page. Authenticated users are redirected to the dashboard.

**File location**: `src/pages/LandingPage.tsx`

**Tech stack** (use what's already in the project):
- React 19
- TypeScript
- Tailwind CSS 4 (already configured)
- Framer Motion (already installed — use for scroll animations)
- Lucide React (already installed — use for icons)
- React Router (already configured)

**DO NOT add new dependencies** unless absolutely necessary. Everything needed is already installed.

### Performance Requirements
- Hero section must render instantly (no lazy loading)
- Template screenshots/previews can be lazy loaded
- All images must use modern formats (WebP) with proper width/height attributes
- Aim for Lighthouse performance score > 90
- Use `loading="lazy"` on all images below the fold

### Accessibility Requirements
- All interactive elements must be keyboard accessible
- Color contrast must meet WCAG AA (4.5:1 for body text, 3:1 for large text)
- All images must have alt text
- Heading hierarchy must be semantic (h1 > h2 > h3, no skipping)
- Focus states must be visible (the app already has focus-visible ring styles)
- CTA buttons must have descriptive aria-labels if text alone is ambiguous

---

## 6. Page Structure Overview

The landing page consists of 10 sections in this exact order:

```
1. Navbar (sticky)
2. Hero
3. Anti-Competitor Strip ("Tired of...")
4. Template Showcase
5. Feature Grid
6. ATS Deep-Dive Section
7. How It Works (3 steps)
8. Pricing
9. FAQ
10. Final CTA + Footer
```

Total estimated scroll: 6-8 viewport heights on desktop.

---

## 7. Section-by-Section Specification

---

### SECTION 1: Navbar

**Behavior**: Sticky at top. Transparent background on hero, transitions to white with bottom border on scroll (use `backdrop-blur-xl bg-white/80` when scrolled).

**Layout**: Max-width container (max-w-6xl), horizontally padded (px-6), vertically padded (py-4).

**Left side**:
- Logo: Lucide `FileText` icon (h-6 w-6, text-blue-600) + "Resumello" text (text-xl font-bold text-gray-900). On dark hero background, logo text should be white and icon should be blue-400.

**Right side**:
- Navigation links (desktop only, hidden on mobile):
  - "Features" — scrolls to Feature Grid section
  - "Templates" — scrolls to Template Showcase section
  - "Pricing" — scrolls to Pricing section
  - "FAQ" — scrolls to FAQ section
  - Style: text-sm font-medium text-gray-600 hover:text-gray-900 (or text-gray-300 hover:text-white on dark hero)
- CTA button: "Get Resumello" — small primary button (bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium)
- On hero (dark bg): button should be white bg with dark text, or keep blue-600 with white text

**Mobile**: Hamburger menu icon (Lucide `Menu`) that opens a slide-down or slide-in nav with the same links + CTA.

**Scroll behavior**: Use IntersectionObserver or scroll event to detect when user scrolls past hero. Toggle navbar from transparent to solid white.

---

### SECTION 2: Hero

**Purpose**: Instantly communicate the value prop. Show price immediately. Break the pattern of hidden pricing.

**Background**: Dark gradient — `bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900`. This creates a premium, trustworthy feel and makes the white text pop.

**Layout**: Full viewport height (min-h-screen) on desktop, auto height on mobile. Content centered vertically and horizontally. Max-width container.

**Content structure**:

```
[Small badge/pill at top]
"No subscriptions. No trial traps."
(bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm font-medium)

[Main headline]
"Build your resume once.
Pay once. Own it forever."
(text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight)

Note: "Pay once." should be on its own line for emphasis. Consider making
"Own it forever." a slightly different color — text-blue-400 — to create
visual interest.

[Subheadline]
"18 ATS-optimized templates. Real PDF and Word export.
Built-in ATS scoring. $49 one-time. That's it."
(text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mt-6)

[CTA buttons — side by side on desktop, stacked on mobile]
Primary: "Get Lifetime Access — $49"
(bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold
 rounded-xl px-8 py-4 shadow-lg shadow-blue-600/25
 transition-all duration-200)

Secondary: "or $14.99/month"
(text-gray-400 text-sm mt-2, displayed below or beside the primary CTA)

[Trust indicators — horizontal row below CTAs]
Three items, separated by dots or pipes:
- "7-day money-back guarantee"
- "No auto-renewals"
- "Cancel monthly anytime"
(text-sm text-gray-400 flex items-center gap-4 mt-6)
Each prefixed with a small Lucide Shield/Check icon in text-green-400
```

**Right side / below (optional but recommended)**:
A screenshot or mockup of the app's editor interface. This should be a high-quality image showing the 3-panel layout with a resume being edited. Place it to the right of the text on large screens (lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center), or below the text on smaller screens.

If no screenshot is available yet, use an abstract visual — a minimal illustration of a resume document with a checkmark, or skip the image entirely and center the text.

**Floating element (subtle)**:
A small animated element at the bottom of the hero indicating "scroll down" — Lucide `ChevronDown` icon with a gentle bounce animation.

---

### SECTION 3: Anti-Competitor Strip

**Purpose**: Validate the visitor's anger. Show them you understand what happened to them with other builders. Position Resumello as the antidote.

**Background**: White (#FFFFFF) or very light gray (gray-50).

**Layout**: Max-width container. Section padding: py-20 sm:py-24.

**Header**:
```
"Tired of resume builders that waste your time?"
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**Subheader** (optional):
```
"We built Resumello because we were tired of it too."
(text-lg text-gray-500 text-center mt-4)
```

**Three comparison cards in a row** (grid grid-cols-1 md:grid-cols-3 gap-8 mt-16):

Each card has:
- A top section describing the competitor problem
- A bottom section describing the Resumello solution

**Card 1: The Download Trap**
```
[Red X icon, large, centered] (Lucide X in a red circle bg)

Problem text:
"You spend 2 hours building your resume.
You click Download.
Paywall."
(text-gray-600, text-center)

[Divider line]

[Green check icon] (Lucide Check in a green circle bg)

Solution text:
"Resumello: Download the moment you're done.
PDF or Word. No surprises."
(text-gray-900 font-medium, text-center)
```

**Card 2: The Subscription Trap**
```
[Red X icon]

Problem text:
"$2.95 trial becomes $30/month.
No warning email. No cancel button.
Check your bank statement."
(text-gray-600)

[Divider]

[Green check icon]

Solution text:
"Resumello: $49 once. No auto-renewals. Ever.
Check your bank in a year. Nothing from us."
(text-gray-900 font-medium)
```

**Card 3: The ATS Trap**
```
[Red X icon]

Problem text:
"Beautiful templates that ATS software
can't read. Your resume gets auto-rejected.
You never hear back."
(text-gray-600)

[Divider]

[Green check icon]

Solution text:
"Resumello: Every template is ATS-tested.
Real text-based PDFs that systems can parse."
(text-gray-900 font-medium)
```

**Card styling**:
- Rounded-2xl, border border-gray-200, bg-white, p-8
- Subtle shadow on hover (hover:shadow-md transition-shadow)
- Red X icon: w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto
- Green check icon: w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto
- Divider: border-t border-gray-100 my-6

---

### SECTION 4: Template Showcase

**Purpose**: Prove the product is real and high-quality. Let visitors see exactly what they're buying. Show breadth across industries.

**Background**: Gray-50 (#F9FAFB)

**Layout**: Max-width container (max-w-7xl for this section — wider to fit template previews). Section padding: py-20 sm:py-24.

**Header**:
```
"18 professional templates. Every one included."
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**Subheader**:
```
"No 'premium' locks. No grayed-out buttons. Pick any template. It's yours."
(text-lg text-gray-500 text-center mt-4 max-w-2xl mx-auto)
```

**Category filter tabs** (mt-10, centered):
A horizontal row of pill-shaped filter buttons:
- "All" (default active)
- "ATS-Optimized"
- "Professional"
- "Modern"
- "Technical"
- "Healthcare"
- "Creative"
- "Academic"
- "Minimal"

Active tab style: bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium
Inactive tab style: bg-white text-gray-600 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium hover:border-gray-300

On mobile: horizontally scrollable row with `overflow-x-auto` and `flex-nowrap`.

**Template grid** (mt-10):
- Desktop: grid grid-cols-3 lg:grid-cols-4 gap-6
- Tablet: grid grid-cols-2 gap-5
- Mobile: grid grid-cols-1 sm:grid-cols-2 gap-4

**Each template card**:
```
[Template preview image/screenshot]
- Aspect ratio: roughly 8.5:11 (US Letter) — use aspect-[85/110] or similar
- Rounded-xl overflow-hidden border border-gray-200
- Shadow-sm, hover:shadow-lg transition-all duration-300
- On hover: slight scale transform (scale-[1.02])
- Image: High-quality screenshot of the template rendered with sample data
- If screenshots are not yet available: use the mini layout wireframes
  similar to what exists in CreateResumeDialog (see HomePage.tsx lines 182-204)
  but larger and more detailed

[Template name below image]
- text-sm font-semibold text-gray-900 mt-3

[Category + layout badges]
- Horizontal row of small pills:
  - Category: text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize
  - Layout: text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500
    ("Single column" or "Two column")
```

**Animation**: Cards should stagger-animate in when they scroll into view using Framer Motion's `whileInView` + `variants` with staggerChildren.

---

### SECTION 5: Feature Grid

**Purpose**: Communicate depth. Show this isn't a toy. Each feature addresses a specific need the audience has.

**Background**: White (#FFFFFF)

**Layout**: Max-width container (max-w-6xl). Section padding: py-20 sm:py-24.

**Header**:
```
"Everything you need. Nothing you don't."
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**Subheader**:
```
"No bloat. No upsells. Every feature is included in every plan."
(text-lg text-gray-500 text-center mt-4)
```

**Feature grid** (mt-16): grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8

**8 feature cards** (each card is a simple stack, not a bordered card):

```
[Icon] — Lucide icon, 40x40, in a rounded-xl bg with brand color tint
[Title] — text-base font-semibold text-gray-900 mt-4
[Description] — text-sm text-gray-500 mt-2 leading-relaxed
```

**Feature 1: ATS Score Checker**
- Icon: Lucide `BarChart3` in bg-blue-50 text-blue-600
- Title: "ATS Score Checker"
- Description: "See exactly how your resume scores against applicant tracking systems. Keyword matching, formatting checks, and content quality analysis — all in real time."

**Feature 2: PDF + Word Export**
- Icon: Lucide `Download` in bg-emerald-50 text-emerald-600
- Title: "PDF + Word Export"
- Description: "Download in both formats. Recruiters get what they need. Real text-based PDFs — not images — so ATS systems can actually read them."

**Feature 3: Import Your Resume**
- Icon: Lucide `Upload` in bg-purple-50 text-purple-600
- Title: "Import Existing Resume"
- Description: "Upload your current PDF or Word resume. We'll parse it automatically so you don't start from scratch."

**Feature 4: Drag-and-Drop Sections**
- Icon: Lucide `GripVertical` in bg-amber-50 text-amber-600
- Title: "Drag-and-Drop Sections"
- Description: "Reorder, rename, show or hide any section. 16 built-in section types plus custom sections you define."

**Feature 5: Cloud Sync**
- Icon: Lucide `Cloud` in bg-sky-50 text-sky-600
- Title: "Cloud Sync"
- Description: "Your resumes are saved securely. Switch devices, clear your browser — your work is always there."

**Feature 6: Version History**
- Icon: Lucide `History` in bg-indigo-50 text-indigo-600
- Title: "Version History"
- Description: "Save named snapshots. 'Marketing role v2' and 'Engineering role v3' — switch between them instantly."

**Feature 7: Job Application Tracker**
- Icon: Lucide `Briefcase` in bg-orange-50 text-orange-600
- Title: "Job Tracker"
- Description: "Track where you applied, when, and what happened. Keep everything organized alongside your resumes."

**Feature 8: 11 Professional Fonts**
- Icon: Lucide `Type` in bg-pink-50 text-pink-600
- Title: "11 Professional Fonts"
- Description: "From clean sans-serifs like Inter and Roboto to elegant serifs like Playfair Display and EB Garamond. Every one included."

---

### SECTION 6: ATS Deep-Dive

**Purpose**: Educate AND terrify. Most visitors don't know their Canva resume is getting auto-rejected. This section creates urgency through education, not fake scarcity.

**Background**: Dark section — `bg-slate-900` with white/light text. This creates visual contrast from the surrounding light sections and signals "this is important."

**Layout**: Max-width container (max-w-6xl). Section padding: py-20 sm:py-24. Two-column layout on desktop (lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center).

**Left column (text)**:

```
[Small eyebrow label]
"Why ATS matters"
(text-blue-400 text-sm font-semibold uppercase tracking-wider)

[Main headline]
"75% of resumes are rejected before a human sees them."
(text-3xl sm:text-4xl font-bold text-white leading-tight mt-4)

[Body copy]
"Applicant Tracking Systems scan your resume before any recruiter does.
If the format is wrong — columns, graphics, images, fancy layouts —
your resume goes straight to the rejection pile.

You never hear back. You assume the company wasn't interested.

They never saw you."
(text-gray-300 text-lg leading-relaxed mt-6, with space between paragraphs)

Note: "They never saw you." should be its own paragraph, potentially in
text-white font-semibold to make it stand out.

[Feature bullets]
"Resumello's ATS scorer analyzes your resume in real time:"
(text-gray-300 mt-8)

Four bullet items with green check icons (Lucide Check, text-green-400):
- "Keyword matching against job descriptions and industry standards"
- "Formatting checks for full ATS compatibility"
- "Content quality scoring — action verbs, quantified achievements"
- "Section completeness analysis with improvement suggestions"
(text-gray-200 text-base)

[CTA]
"Don't let software reject you."
(text-white font-semibold text-lg mt-8)

Button: "Get Resumello — $49"
(bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 py-4
 font-semibold text-lg shadow-lg shadow-blue-600/25 mt-4)
```

**Right column (visual)**:
A mockup/screenshot of the ATS Score Card as it appears in the app. Show the circular SVG score ring (like the one in AtsScoreCard.tsx) displaying a score of 87/100 in green, with category breakdowns below it.

If a real screenshot is not available, build a static visual representation:
- A card (bg-slate-800 border border-slate-700 rounded-2xl p-8) containing:
  - The ATS score ring (can reuse/adapt the AtsScoreCard component)
  - Score category bars showing: Keywords 36/40, Formatting 18/20, Content 17/20, Sections 9/10, Readability 7/10
  - A "Great" badge in green
- This visual should feel like a real product screenshot, not an illustration

---

### SECTION 7: How It Works

**Purpose**: Reduce perceived complexity. Show that the path from purchase to finished resume is short and simple.

**Background**: White (#FFFFFF) or gray-50

**Layout**: Max-width container (max-w-4xl — narrower for this section). Section padding: py-20 sm:py-24. Center-aligned.

**Header**:
```
"Up and running in 3 steps."
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**Three steps in a horizontal row** (flex flex-col md:flex-row gap-12 mt-16):

Each step:
```
[Step number in a circle]
- w-12 h-12 rounded-full bg-blue-600 text-white
  flex items-center justify-center text-lg font-bold mx-auto

[Step title]
- text-xl font-semibold text-gray-900 mt-6 text-center

[Step description]
- text-gray-500 text-base mt-2 text-center max-w-xs mx-auto
```

**Step 1**:
- Number: "1"
- Title: "Pick a template"
- Description: "Choose from 18 professional templates. ATS-optimized, modern, creative, technical, healthcare, academic — every industry covered."

**Step 2**:
- Number: "2"
- Title: "Fill in your details"
- Description: "Type or import your existing resume. Drag sections to reorder. Check your ATS score in real time. Auto-saved as you go."

**Step 3**:
- Number: "3"
- Title: "Download and apply"
- Description: "Export as PDF or Word. Your resume is ATS-parseable and ready to send. No watermarks. No paywall. It's yours."

**Connecting line between steps** (desktop only):
A thin dashed line or arrow connecting the three step circles horizontally. Use a simple CSS border-dashed on a div positioned between the circles, or skip if it adds too much complexity.

---

### SECTION 8: Pricing

**Purpose**: Close the deal. Make the math undeniable. The monthly option exists to make lifetime the obvious choice.

**Background**: Gray-50 (#F9FAFB)

**Layout**: Max-width container (max-w-4xl). Section padding: py-20 sm:py-24. Center-aligned.

**Header**:
```
"Simple pricing. No surprises."
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**Subheader**:
```
"One resume builder. Two ways to pay. Every feature included in both."
(text-lg text-gray-500 text-center mt-4)
```

**Two pricing cards side-by-side** (grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-3xl mx-auto):

**Card 1: Monthly (the decoy — intentionally less appealing)**
```
Container: bg-white rounded-2xl border border-gray-200 p-8

[Plan name]
"Monthly"
(text-lg font-semibold text-gray-900)

[Price]
"$14.99"
(text-4xl font-bold text-gray-900 mt-4)
"/month"
(text-base text-gray-500 inline)

[Description]
"Perfect if you only need it for a month or two."
(text-sm text-gray-500 mt-4)

[Feature list — simple checks]
All items prefixed with Lucide Check icon (text-gray-400 h-4 w-4):
- "All 18 templates"
- "PDF + Word export"
- "ATS scoring"
- "Cloud sync"
- "Cancel anytime"
(text-sm text-gray-600, each item on its own line with gap-3)

[CTA button]
"Get Monthly"
(Secondary style: bg-white border border-gray-300 text-gray-700
 hover:bg-gray-50 rounded-xl px-6 py-3 w-full text-center
 font-medium mt-8)
```

**Card 2: Lifetime (the hero — visually dominant)**
```
Container: bg-white rounded-2xl border-2 border-blue-600 p-8
           relative shadow-lg shadow-blue-600/10

[Badge — positioned at top-right or top-center of card]
"BEST VALUE"
(absolute -top-3 left-1/2 -translate-x-1/2
 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider
 rounded-full px-4 py-1)

[Plan name]
"Lifetime"
(text-lg font-semibold text-gray-900)

[Price]
"$49"
(text-5xl font-bold text-gray-900 mt-4)
"one-time"
(text-base text-gray-500 inline ml-1)

[Description]
"Pay once. Use forever. All future updates included."
(text-sm text-gray-500 mt-4)

[Feature list — checks in green]
All items prefixed with Lucide Check icon (text-green-500 h-4 w-4):
- "All 18 templates"
- "PDF + Word export"
- "Full ATS scoring + job description matching"
- "Cloud sync across devices"
- "Version history"
- "Job application tracker"
- "All future updates"
- "7-day money-back guarantee"
(text-sm text-gray-600, each item on its own line with gap-3)

[CTA button]
"Get Lifetime Access"
(Primary style: bg-blue-600 hover:bg-blue-700 text-white
 rounded-xl px-6 py-3.5 w-full text-center font-semibold
 text-lg mt-8 shadow-sm)
```

**Below both cards** (centered, mt-8):
```
"That's less than 2 months of what other resume builders charge per year."
(text-sm text-gray-400 text-center)
```

**IMPORTANT design note**: The lifetime card MUST be visually dominant. It should be:
- Slightly larger (can add scale-105 or just more padding)
- Have the blue border (not gray)
- Have the "BEST VALUE" badge
- Have a shadow
- Have the primary CTA button style (blue, not outlined)
The monthly card should feel intentionally plain by comparison.

---

### SECTION 9: FAQ

**Purpose**: Destroy every remaining hesitation. Each question maps to a specific objection identified from competitor review analysis.

**Background**: White (#FFFFFF)

**Layout**: Max-width container (max-w-3xl — narrow for readability). Section padding: py-20 sm:py-24.

**Header**:
```
"Questions? Answered."
(text-3xl sm:text-4xl font-bold text-gray-900 text-center)
```

**FAQ items** (mt-12): Use an accordion/disclosure pattern. Each item has a clickable question that expands to reveal the answer.

**Styling for each FAQ item**:
```
Container: border-b border-gray-200 py-6 first:pt-0 last:border-b-0

Question (button):
- flex w-full items-center justify-between text-left
- text-base font-semibold text-gray-900
- Lucide ChevronDown icon on the right (h-5 w-5 text-gray-400)
- Icon rotates 180deg when expanded (transition-transform duration-200)

Answer (revealed on click):
- text-gray-600 text-base leading-relaxed mt-4
- Animate height expansion with Framer Motion (AnimatePresence + motion.div)
```

**FAQ 1**:
- Q: "Is there really no subscription?"
- A: "The lifetime plan is a one-time payment of $49. We never charge you again. No auto-renewals. No 'your plan expired' emails. No fine print. Check your bank statement in a year — you'll see nothing from us. If you choose monthly, it's $14.99/month and you can cancel with one click, anytime."

**FAQ 2**:
- Q: "What if I don't like it?"
- A: "Full refund within 7 days. No questions asked. No 'tell us why you're leaving' forms. No guilt trips. Email us, money back. We'd rather refund you than have an unhappy customer."

**FAQ 3**:
- Q: "Is my data safe?"
- A: "Your resume data is synced securely to the cloud with your account. We use industry-standard encryption. We don't sell your data. We don't run ads. We don't share your information with third parties. Your resume is yours."

**FAQ 4**:
- Q: "Can I use it on multiple devices?"
- A: "Yes. Sign in from any browser on any device — your resumes sync automatically. Desktop, laptop, tablet, phone. Start on one device, finish on another."

**FAQ 5**:
- Q: "Do the templates actually pass ATS systems?"
- A: "Every template generates real, parseable text — not images or graphics. ATS systems read them like a Word document. We also include a built-in ATS scorer so you can check your score before you submit. This is what separates Resumello from design tools like Canva, where 75% of resumes get auto-rejected."

**FAQ 6**:
- Q: "Can I import my existing resume?"
- A: "Yes. Upload a PDF or Word document and we'll parse it into the editor automatically. Your work history, education, skills — all extracted and ready to edit. You can also import from a JSON export."

**FAQ 7**:
- Q: "Why is this so much cheaper than other resume builders?"
- A: "No investors to repay. No sales team to fund. No recurring billing infrastructure to maintain. No dark patterns to engineer. We built a good product and priced it fairly. That's the whole story."

**FAQ 8**:
- Q: "What if I need help?"
- A: "Email us. We respond to every message. No chatbots. No ticket queues. A real person reads your email and writes back."

---

### SECTION 10: Final CTA + Footer

**Purpose**: Last conversion opportunity + required footer links.

#### Final CTA Block

**Background**: Dark gradient — same as hero (`bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900`).

**Layout**: Max-width container, py-20, text-center.

**Content**:
```
[Headline]
"Your next job deserves a real resume builder."
(text-3xl sm:text-4xl font-bold text-white)

[Subheadline]
"18 templates. ATS scoring. PDF + Word export. Cloud sync. $49. Once."
(text-lg text-gray-300 mt-4)

[CTA button]
"Get Resumello — $49"
(bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold
 rounded-xl px-8 py-4 shadow-lg shadow-blue-600/25 mt-8
 inline-flex items-center gap-2)

[Trust line below button]
"7-day money-back guarantee. No subscription. No tricks."
(text-sm text-gray-400 mt-4)
```

#### Footer

**Background**: Continues the dark background from Final CTA, or slightly darker (bg-slate-950).

**Layout**: Max-width container, py-12, border-t border-slate-800.

**Content** (flex justify-between items-center, or stacked on mobile):

**Left**:
```
"Resumello" (text-sm font-semibold text-gray-400)
"© 2026 Resumello. All rights reserved." (text-xs text-gray-500)
```

**Right** (flex gap-6):
```
Links (text-sm text-gray-400 hover:text-gray-300):
- "Terms of Service" (link to /terms)
- "Privacy Policy" (link to /privacy)
- "Contact" (link to mailto: or /contact)
```

---

## 8. Responsive Behavior

### Breakpoints (Tailwind defaults)
- **Mobile**: < 640px (default styles)
- **sm**: >= 640px
- **md**: >= 768px
- **lg**: >= 1024px
- **xl**: >= 1280px

### Key Responsive Rules

**Navbar**:
- Mobile: Logo + hamburger menu. Nav links hidden.
- md+: Logo + inline nav links + CTA button.

**Hero**:
- Mobile: Single column, text centered, stacked vertically. Headline text-4xl. CTA button full-width.
- lg+: Two columns (text left, screenshot right). Headline text-6xl.

**Anti-Competitor Strip**:
- Mobile: Single column, cards stacked vertically.
- md+: Three columns side by side.

**Template Showcase**:
- Mobile: 1 column grid (or 2 columns with smaller cards).
- sm: 2 columns.
- lg: 3-4 columns.
- Category tabs: horizontal scroll on mobile.

**Feature Grid**:
- Mobile: 1 column.
- sm: 2 columns.
- lg: 4 columns.

**ATS Section**:
- Mobile: Single column, text first, visual below.
- lg+: Two columns side by side.

**How It Works**:
- Mobile: Vertical stack. No connecting lines.
- md+: Horizontal row with connecting lines.

**Pricing**:
- Mobile: Single column, lifetime card first (on top — it's the hero).
- md+: Two columns side by side.

**FAQ**:
- Single column at all sizes. Full width within max-w-3xl container.

---

## 9. Animations and Interactions

### Animation Library: Framer Motion (already installed)

### General Principles
- Animations should feel subtle and professional. Not playful or bouncy.
- Use `ease: "easeOut"` for most animations.
- Duration: 0.3-0.5s for reveals, 0.15-0.2s for hover states.
- Stagger: 0.05-0.08s between items in grids/lists.

### Specific Animations

**Scroll-triggered reveals** (apply to all sections except hero):
```tsx
// Use Framer Motion's whileInView
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```

**Hero entrance** (on page load, no scroll trigger):
```tsx
// Badge fades in first
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1, duration: 0.5 }}

// Headline fades in second
transition={{ delay: 0.2, duration: 0.5 }}

// Subheadline third
transition={{ delay: 0.3, duration: 0.5 }}

// CTA buttons fourth
transition={{ delay: 0.4, duration: 0.5 }}

// Trust indicators last
transition={{ delay: 0.5, duration: 0.5 }}
```

**Template cards stagger**:
```tsx
// Parent container
<motion.div variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
  // Each card
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 }
    }}
  />
```

**Navbar scroll transition**:
```tsx
// On scroll past hero:
// Background: transparent → bg-white/80 backdrop-blur-xl
// Border: none → border-b border-gray-200/60
// Logo text: text-white → text-gray-900
// Nav links: text-gray-300 → text-gray-600
// Transition: transition-all duration-300
```

**FAQ accordion**:
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  )}
</AnimatePresence>
```

**Template card hover**:
```css
hover:shadow-lg hover:scale-[1.02] transition-all duration-300
```

**CTA button hover** (subtle glow effect):
```css
hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200
```

**Pricing card hover** (lifetime card only):
```css
hover:shadow-xl hover:scale-[1.01] transition-all duration-300
```

---

## 10. SEO Requirements

### Page Title
```html
<title>Resumello — Build Your Resume Once. Pay Once. Own It Forever.</title>
```

### Meta Description
```html
<meta name="description" content="18 ATS-optimized resume templates. PDF and Word export. Built-in ATS scoring. $49 one-time payment. No subscriptions. No trial traps. No paywall at download." />
```

### Open Graph Tags
```html
<meta property="og:title" content="Resumello — The Resume Builder That Doesn't Charge You Monthly" />
<meta property="og:description" content="18 professional templates. ATS scoring. PDF + Word export. $49 once. Forever." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://resumello.app" />
<meta property="og:image" content="https://resumello.app/og-image.png" />
<!-- OG image should be 1200x630px showing app screenshot + pricing -->
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Resumello — Build Your Resume Once. Pay Once. Own It Forever." />
<meta name="twitter:description" content="18 ATS-optimized templates. $49 one-time. No subscriptions." />
<meta name="twitter:image" content="https://resumello.app/og-image.png" />
```

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Resumello",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": [
    {
      "@type": "Offer",
      "price": "49.00",
      "priceCurrency": "USD",
      "description": "Lifetime access — one-time payment"
    },
    {
      "@type": "Offer",
      "price": "14.99",
      "priceCurrency": "USD",
      "description": "Monthly subscription"
    }
  ],
  "description": "Professional resume builder with 18 ATS-optimized templates, built-in ATS scoring, and PDF/Word export.",
  "url": "https://resumello.app"
}
```

### Target Keywords (incorporate naturally into copy)
**Primary** (highest intent):
- resume builder no subscription
- resume builder one time payment
- resume builder lifetime
- ATS friendly resume builder
- resume builder not a scam

**Secondary** (competitor comparison):
- resume builder alternative
- Zety alternative
- Resume.io alternative
- Novoresume alternative
- best resume builder 2026

**Long-tail**:
- resume builder $49 one time
- resume builder pay once
- ATS optimized resume templates
- resume builder with ATS scoring
- best one time purchase resume builder

### Semantic HTML
- Use `<header>` for navbar
- Use `<main>` for page content
- Use `<section>` for each content section with appropriate `id` attributes for anchor scrolling
- Use `<footer>` for footer
- Use `<h1>` only once (hero headline)
- Use `<h2>` for section headlines
- Use `<h3>` for sub-items like feature titles

### Section IDs (for navbar anchor scrolling)
```html
<section id="features">  <!-- Feature Grid -->
<section id="templates"> <!-- Template Showcase -->
<section id="pricing">   <!-- Pricing -->
<section id="faq">       <!-- FAQ -->
```

---

## 11. Assets Required

### Screenshots Needed
1. **Hero screenshot**: Full 3-panel editor view with a resume being edited. Show a complete, good-looking resume in the preview panel. This is the most important screenshot.
2. **Template screenshots**: All 18 templates rendered with sample resume data. Each should be a portrait-oriented image showing the full first page of the resume.
3. **ATS Score screenshot**: The ATS Score Card showing a score of 87/100 with the green ring and category breakdown.
4. **Mobile screenshot** (optional): The editor on a mobile device, showing the tab-based interface.

### Image Specifications
- Hero screenshot: 1400x900px minimum, WebP format, quality 85
- Template screenshots: 600x780px each (8.5:11 ratio), WebP format, quality 80
- ATS screenshot: 800x600px, WebP format, quality 85
- OG image: 1200x630px, PNG format

### Fallback Strategy (if screenshots are not yet available)
- Hero: Use a CSS-only mockup — a card with a fake browser chrome (three dots top-left) containing a simplified representation of the 3-panel layout using divs and placeholder text.
- Templates: Use the wireframe-style mini previews already built in the app (see HomePage.tsx CreateResumeDialog), but larger and with sample colored accents per category.
- ATS: Build the ATS score ring as a live component (adapt AtsScoreCard.tsx) with hardcoded score of 87.

---

## 12. Copy Bank

### Headlines (alternatives for A/B testing later)

**Hero headlines**:
- "Build your resume once. Pay once. Own it forever." (PRIMARY)
- "The resume builder that doesn't charge you monthly."
- "Stop renting your resume. Own it."
- "$49. 18 templates. No subscription. Ever."
- "One payment. Every template. Forever."

**Anti-competitor section**:
- "Tired of resume builders that waste your time?" (PRIMARY)
- "Sound familiar?"
- "We know. It happened to us too."

**Template section**:
- "18 professional templates. Every one included." (PRIMARY)
- "Templates for every industry. No 'premium' locks."
- "Pick any template. They're all yours."

**ATS section**:
- "75% of resumes are rejected before a human sees them." (PRIMARY)
- "Your resume might never be seen. Here's why."
- "ATS software is reading your resume first. Is it passing?"

**Pricing section**:
- "Simple pricing. No surprises." (PRIMARY)
- "One price. Everything included."
- "The math is simple."

**Final CTA**:
- "Your next job deserves a real resume builder." (PRIMARY)
- "Ready to build a resume that actually gets seen?"
- "Start building. Pay once. Done."

### Micro-copy

**CTA button text options**:
- "Get Lifetime Access — $49" (hero, primary)
- "Get Resumello — $49" (secondary placements)
- "Get Lifetime Access" (pricing card)
- "Get Monthly" (pricing card, monthly)
- "Get Started" (generic fallback)

**Trust indicator text**:
- "7-day money-back guarantee"
- "No auto-renewals"
- "Cancel monthly anytime"
- "No credit card tricks"
- "All features included"

**Badge/pill text**:
- "No subscriptions. No trial traps."
- "BEST VALUE" (lifetime pricing card)
- "NEW" (if launching)

### Words and Phrases to USE
- "once" / "one-time" / "forever" / "lifetime"
- "no subscription" / "no auto-renewal" / "no trial trap"
- "every template included" / "no premium locks"
- "ATS-optimized" / "ATS-tested" / "ATS-parseable"
- "real text-based PDF" (vs image-based)
- "your resume, your property"
- "no surprises"
- "simple" / "straightforward" / "honest"

### Words and Phrases to NEVER USE
- "revolutionary" / "game-changing" / "cutting-edge"
- "unlock your potential"
- "best-in-class"
- "join thousands" (unless you actually have thousands of users)
- "AI-powered" (the app doesn't have AI features yet)
- "free trial" (there is no free trial — this is intentional)
- "limited time offer" / "act now" / "don't miss out" (no fake urgency)
- "premium" (loaded word — competitors use it to gate features)
- Any emoji in headlines or body copy (brand voice is direct, not casual)

---

## Implementation Notes

### Routing Integration
The landing page should be accessible at the root `/` path for unauthenticated users. Update App.tsx routing:
- Unauthenticated visitors to `/` see the LandingPage
- Authenticated users at `/` see the HomePage (dashboard)
- The "Get Resumello" / "Get Lifetime Access" CTA buttons should link to `/login` (the sign-up page) OR to a payment flow (Stripe/LemonSqueezy checkout) — depending on what's implemented

### Payment Flow (when ready)
The CTA buttons should eventually link to a payment provider checkout (LemonSqueezy recommended). For now, they can link to `/login` with a query param indicating the plan:
- Lifetime: `/login?plan=lifetime`
- Monthly: `/login?plan=monthly`

### Smooth Scrolling
Navbar links should smooth-scroll to sections:
```tsx
const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
```

### External Links
- All external links should have `rel="noopener noreferrer"` and `target="_blank"`
- No external links in the main page content — keep users on Resumello.app

### Loading Performance
- The landing page should NOT load the heavy editor components, @react-pdf/renderer, or any template rendering code
- Only import what's needed: React, Framer Motion, Lucide icons, Tailwind
- Template preview images should be static assets (screenshots), not live-rendered components
- Use `<link rel="preload">` for the hero screenshot if using one

---

## Checklist for Agent

Before considering the landing page complete, verify:

- [ ] All 10 sections are present in the correct order
- [ ] Hero shows price ($49) above the fold — visitor sees it without scrolling
- [ ] Monthly price ($14.99) is visible but secondary to lifetime
- [ ] "7-day money-back guarantee" appears at least 3 times on the page
- [ ] No use of the word "free" anywhere (there is no free tier)
- [ ] No use of the word "premium" (competitor-loaded term)
- [ ] No emojis in any copy
- [ ] All 18 templates are listed or shown in the showcase section
- [ ] ATS rejection stat (75%) is present in the ATS section
- [ ] "They never saw you." line is present and emphasized
- [ ] FAQ has all 8 questions
- [ ] Navbar smooth-scrolls to sections
- [ ] Navbar transitions from transparent to solid on scroll
- [ ] Page is fully responsive (mobile, tablet, desktop)
- [ ] All animations use Framer Motion, not CSS-only
- [ ] Heading hierarchy is semantic (one h1, section h2s, feature h3s)
- [ ] All images have alt text
- [ ] SEO meta tags are set (title, description, OG, Twitter, JSON-LD)
- [ ] Page loads fast — no heavy dependencies imported
- [ ] CTA buttons link to /login (or payment flow when ready)
- [ ] Footer has Terms, Privacy, Contact links
- [ ] Color contrast meets WCAG AA standards
- [ ] Dark sections (hero, ATS, final CTA) use the same gradient for consistency
