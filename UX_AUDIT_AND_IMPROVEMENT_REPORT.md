# Resume Builder — Comprehensive UX Audit & Improvement Report

**Date:** February 11, 2026
**Scope:** Full UI/UX audit of the Resume Builder application — design, user experience, user flows, accessibility, and competitive positioning.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Competitive Landscape Analysis](#3-competitive-landscape-analysis)
4. [Critical UX Issues (Must Fix)](#4-critical-ux-issues-must-fix)
5. [High-Impact Improvements](#5-high-impact-improvements)
6. [Design System & Visual Overhaul](#6-design-system--visual-overhaul)
7. [User Flow Improvements](#7-user-flow-improvements)
8. [Mobile Experience Redesign](#8-mobile-experience-redesign)
9. [Feature Gap Analysis](#9-feature-gap-analysis)
10. [Accessibility Compliance](#10-accessibility-compliance)
11. [Micro-Interactions & Polish](#11-micro-interactions--polish)
12. [Implementation Priority Matrix](#12-implementation-priority-matrix)

---

## 1. Executive Summary

This resume builder is architecturally solid — React 19, Zustand, Tailwind CSS, 18 templates, real-time PDF preview, ATS scoring, drag-and-drop, and auto-save. The engineering foundations are strong. However, from a **paid product UX standpoint**, there are significant gaps that will cause churn and prevent users from feeling the premium value they're paying for.

### The Three Biggest Problems

1. **The editor feels like a form, not a creative tool.** Every section is an accordion of input fields. There's no sense of building something — no visual momentum, no delight, no "wow" moment. Paid users expect a Canva-like or Notion-like experience, not a government form.

2. **The onboarding-to-value pipeline is too slow.** A new user must: sign up → land on an empty dashboard → click "Create" → pick a template → see an empty editor → start filling fields one by one. The "aha moment" (seeing their resume look professional) takes too long.

3. **The three-panel layout wastes cognitive bandwidth.** Sidebar (section navigation) + Editor (forms) + Preview (PDF) is the right architecture, but the current implementation makes users constantly context-switch between panels without clear visual hierarchy or guidance on what to do next.

### What This Report Covers

This report contains **72 specific, actionable improvements** organized by priority. Each recommendation includes the problem it solves, the expected user impact, and implementation guidance. The improvements span design, interaction patterns, user flows, accessibility, and missing features that are now table-stakes for paid resume builders in 2026.

---

## 2. Current State Assessment

### What's Working Well

| Aspect | Assessment |
|--------|-----------|
| **Architecture** | Clean 3-panel layout (sidebar/editor/preview) follows industry standard |
| **Template variety** | 18 templates across 7 categories is above average |
| **ATS scoring** | Real-time scoring with 5 categories and keyword analysis is a strong differentiator |
| **Auto-save** | 2-second debounced save with 30-second backup is well-implemented |
| **Export options** | PDF + DOCX + JSON covers all user needs |
| **Drag-and-drop** | Section and entry reordering via dnd-kit works smoothly |
| **Error handling** | ErrorBoundary wrapping of each panel is production-ready |
| **Responsive breakpoints** | Desktop/tablet/mobile layouts exist (though quality varies) |
| **Version history** | Named versions with restore is a paid-tier feature |
| **Job tracker** | Application tracking with status pipeline is a retention feature |
| **Cover letter** | Separate editor + export is a strong upsell feature |

### What Needs Work

| Aspect | Issue | Severity |
|--------|-------|----------|
| **Visual design** | Generic gray/blue/white palette; no visual identity | High |
| **Editor UX** | Accordion-of-forms pattern creates cognitive overload | High |
| **Onboarding** | Wizard exists but doesn't accelerate time-to-value | High |
| **Dark mode** | Not available — now expected as standard | Medium |
| **Empty states** | Functional but uninspiring; don't guide users forward | Medium |
| **Mobile editing** | 3-tab mobile layout is usable but cramped | Medium |
| **Template gallery** | No preview with user's own data; no ATS badges | Medium |
| **Keyboard shortcuts** | No keyboard shortcuts for common actions | Medium |
| **Loading states** | Basic spinners; no skeleton screens or progressive loading | Low |
| **Animations** | Framer Motion is installed but underutilized | Low |
| **Typography hierarchy** | Inconsistent text sizing across panels | Low |

---

## 3. Competitive Landscape Analysis

### Where This App Stands vs. Market Leaders (2026)

| Feature | This App | Teal | Kickresume | Rezi | Enhancv |
|---------|----------|------|------------|------|---------|
| Templates | 18 | 5 | 1500+ | 20+ | 30+ |
| AI writing assistance | No | Yes | Yes (GPT-4) | Yes | Yes |
| ATS scoring | Yes (5-cat) | Yes | Yes | Yes (23-metric) | Yes |
| Job description tailoring | Partial | Yes | Yes | Yes | Yes |
| LinkedIn import | No | Yes | Yes | Yes | No |
| Dark mode | No | Yes | Yes | No | Yes |
| Application tracking | Yes (basic) | Yes (advanced) | No | No | No |
| Cover letter | Yes | Yes | Yes | Yes | Yes |
| Real-time preview | Yes | Yes | Yes | Yes | Yes |
| Collaboration | No | No | No | Yes (links) | No |
| Voice input | No | No | No | No | No |
| Web resume/portfolio | No | No | Yes | No | No |
| Gamification | No | No | Yes | Partial | No |

### Key Takeaway

The app has a **solid feature set** but lacks the two differentiators that define paid tools in 2026: **AI-powered content assistance** and a **polished, delightful editing experience**. The template count (18) is competitive for quality-focused builders (vs. Kickresume's 1500 quantity approach). The path forward is **quality of experience**, not quantity of features.

---

## 4. Critical UX Issues (Must Fix)

These issues directly cause user frustration, abandonment, or failure to perceive paid value.

---

### 4.1 — The Editor Panel Needs a Complete Interaction Redesign

**Current problem:** The `EditorPanel.tsx` renders every visible section as a stacked accordion. Collapsed sections show a dashed border with "Click to expand and edit this section." This creates several UX failures:

- **Wall of accordions.** With 8+ sections enabled, users see a long scrollable list of collapsed gray boxes. It looks empty and overwhelming simultaneously.
- **No visual preview of content.** Collapsed sections don't show a summary of what's already been entered (e.g., "3 jobs listed" or "John Doe, john@email.com").
- **Single-section focus model.** Only one section can be open at a time. Users can't glance at their Experience while editing Skills.
- **No progress indication per section.** The badges show counts but not completeness.

**Recommended redesign:**

```
┌────────────────────────────────────────────────────┐
│ ● Contact ✓                        [John Doe]     │
│   john@email.com · San Francisco · (555) 123-4567  │
├────────────────────────────────────────────────────┤
│ ● Summary ✓                                        │
│   "Experienced software engineer with 8+ years..." │
├────────────────────────────────────────────────────┤
│ ● Experience (3)                    ▼ Expanded     │
│   ┌──────────────────────────────────────────────┐ │
│   │ Acme Inc. · Software Engineer · 2020-Present │ │
│   │ [Company] [Position] [Location]              │ │
│   │ [Start Date] [End Date] [✓ Current]          │ │
│   │ [Description textarea]                       │ │
│   │ [+ Add Highlight]                            │ │
│   └──────────────────────────────────────────────┘ │
│   ┌──────────────────────────────────────────────┐ │
│   │ Previous Corp · Junior Dev · 2018-2020       │ │
│   └──────────────────────────────────────────────┘ │
│   [+ Add Experience]                               │
├────────────────────────────────────────────────────┤
│ ● Education (1)                                    │
│   MIT · B.S. Computer Science · 2018               │
├────────────────────────────────────────────────────┤
│ ○ Skills                          [Click to add]   │
└────────────────────────────────────────────────────┘
```

**Key changes:**

1. **Collapsed sections show a content summary** (first line of data, key fields), not a "click to expand" placeholder.
2. **Empty sections show a clear call-to-action** with a description of what to add, not a dashed box.
3. **Filled (●) vs. empty (○) indicators** replace the current identical collapsed state.
4. **Section completion rings or progress bars** show 0-100% completeness (based on field population).
5. **Allow multiple sections to be expanded simultaneously** — users frequently reference one section while editing another.

**Files to modify:** `EditorPanel.tsx`, `EntryCard.tsx`, `SortableEntryCard.tsx`

---

### 4.2 — The Onboarding Flow Doesn't Deliver an "Aha Moment" Fast Enough

**Current problem:** The `OnboardingWizard.tsx` with `WizardStep.tsx` and `SampleDataPrompt.tsx` asks users to pick a template and optionally load sample data. This is functional but doesn't create the emotional hook that converts trial users into paying customers.

**The science:** Users need to see their name on a professional-looking resume within 30 seconds of starting. This is the "aha moment" — the instant they think "this looks great, I need this tool." Every second before that moment is churn risk.

**Recommended redesign:**

**Step 1 — "Let's build your resume" (5 seconds)**
- Only ask: First name, Last name, Email, Job title
- Show the preview panel updating in real-time as they type
- Auto-select a clean template (e.g., "modern-clean") so they see results immediately

**Step 2 — "Choose your look" (10 seconds)**
- Show 4-6 curated templates with the user's actual name/title rendered
- One-tap selection, not a full gallery
- "Browse all 18 templates" link for power users

**Step 3 — "Import or start fresh" (10 seconds)**
- Three options: Upload existing resume (PDF/DOCX), Import from LinkedIn (future), Start from scratch
- If they upload, parse and pre-fill all fields immediately
- If they start fresh, drop them into the editor with Contact pre-filled from Step 1

**Step 4 — They're in the editor with a resume that already has their name on it**

Total time to "aha moment": ~25 seconds.

**Files to modify:** `OnboardingWizard.tsx`, `WizardStep.tsx`, `SampleDataPrompt.tsx`

---

### 4.3 — The Sidebar Navigation Is Overloaded

**Current problem:** The `Sidebar.tsx` handles four different tab views via the `sidebarTab` state: sections list, styling controls, ATS panel, and versions/jobs. This packs too many unrelated concerns into a single 300px column.

**Specific issues:**

- **Sections tab:** Lists all 16 possible section types with toggle switches. Users must scroll to find what they need. The section list doesn't indicate which sections have content.
- **Styling tab:** Font controls, color controls, layout controls, and section manager are stacked vertically. Users must scroll extensively to find a specific setting.
- **ATS tab:** The analysis panel with job description textarea, industry selector, and results is cramped in 300px width.
- **Versions tab:** Version history + job tracker are combined, making neither feel complete.

**Recommended redesign:**

1. **Move section navigation into the editor panel** as a left-margin sticky nav (icon-only, like VS Code's activity bar). Remove it from the sidebar entirely.

2. **Repurpose the sidebar for contextual tools:**
   - When editing a section → show section-specific tips, AI suggestions, and ATS keyword hints
   - When in styling mode → show full styling controls (current behavior, but improved layout)
   - When in ATS mode → full-width analysis (consider making this a modal or slide-over instead)

3. **Add a floating action button or command palette** (Cmd+K / Ctrl+K) for quick access to: switch template, export, save version, toggle sections, keyboard shortcuts.

**Files to modify:** `Sidebar.tsx`, `EditorPanel.tsx`, `AppShell.tsx`, `uiStore.ts`

---

### 4.4 — Template Gallery Shows Placeholder Data, Not User's Data

**Current problem:** `TemplateGallery.tsx` shows template previews, but users can't see how their own resume will look in each template until they switch. Template switching is a high-anxiety action — "will I lose my formatting?"

**Recommended fix:**

1. **Render template thumbnails using the user's actual resume data.** Show their name, their job titles, their education — not generic "John Doe / Software Engineer" placeholders.
2. **Add a "Preview" hover state** that shows a larger preview without committing to the switch.
3. **Add clear ATS compatibility badges** (green checkmark for ATS-safe, orange warning for design-heavy templates).
4. **Add category filter tabs** at the top: All, ATS-Optimized, Professional, Creative, Technical, Healthcare, Academic.
5. **Show a "Currently using" indicator** on the active template.

**Files to modify:** `TemplateGallery.tsx`, `templates/index.ts`

---

### 4.5 — Date Inputs Are Plain Text Fields

**Current problem:** In `ExperienceEditor.tsx`, `EducationEditor.tsx`, and other editors, date fields are plain `<Input>` components with placeholder text like "Jan 2020." This creates several issues:

- Users enter dates in inconsistent formats ("January 2020" vs "01/2020" vs "2020-01")
- No date validation
- No date picker UI
- The "current" toggle for end dates works but feels disconnected from the date field

**Recommended fix:**

1. **Replace text inputs with a Month/Year picker component.** Two dropdowns side-by-side: one for month (Jan-Dec), one for year (range: current year back to ~50 years).
2. **Visually connect the "I currently work here" toggle** to the end date field (e.g., toggle replaces the end date picker when active).
3. **Add validation** — start date must be before end date; show inline error if not.
4. **Store dates in a consistent format** (e.g., "YYYY-MM") and let templates format for display.

**Files to modify:** `ExperienceEditor.tsx`, `EducationEditor.tsx`, `VolunteerEditor.tsx`, `CertificationsEditor.tsx`, `CoursesEditor.tsx`, new `MonthYearPicker.tsx` UI component.

---

## 5. High-Impact Improvements

These improvements significantly elevate the perceived quality and value of the product.

---

### 5.1 — Add Dark Mode

**Why it matters:** Dark mode is no longer a luxury — it's expected. Users editing resumes in the evening, users with light sensitivity, and users who simply prefer dark interfaces will be frustrated by its absence. Every major competitor (Teal, Kickresume, Enhancv) offers it.

**Implementation approach:**

1. Add a `theme` field to `uiStore.ts` with values: `'light' | 'dark' | 'system'`.
2. Use Tailwind's `dark:` variant classes throughout the component library.
3. Add a theme toggle to the TopBar (sun/moon icon).
4. Respect the user's OS preference via `prefers-color-scheme` media query when set to `'system'`.
5. **Important:** The PDF preview panel should always render on a white background regardless of app theme — the resume itself should look like a printed page.

**Files to modify:** `uiStore.ts`, `index.css`, all `ui/` components, `AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `EditorPanel.tsx`.

---

### 5.2 — Add a Resume Completeness Score & Progress System

**Why it matters:** Users don't know when their resume is "done." This causes anxiety and reduces confidence. A completeness score gives users a clear target and a sense of accomplishment as they fill sections.

**Design:**

```
┌─────────────────────────────────────────┐
│  Resume Strength   ██████████░░  78%    │
│                                         │
│  ✓ Contact info complete                │
│  ✓ Summary added (good length)          │
│  ✓ 3 work experiences                   │
│  ⚠ Education missing GPA/honors         │
│  ✗ No skills added                      │
│  ✗ No projects listed                   │
│  💡 Tip: Add 2-3 projects to stand out  │
└─────────────────────────────────────────┘
```

**Scoring criteria:**
- Contact: All 5 core fields filled (20%)
- Summary: 50-200 words (15%)
- Experience: At least 2 entries with highlights (25%)
- Education: At least 1 entry (15%)
- Skills: At least 1 category with 3+ skills (15%)
- Bonus sections: Projects, certs, languages (10%)

**Placement:** Show as a card at the top of the editor panel or as a collapsible section in the sidebar.

**Files to create:** `useResumeCompleteness.ts` hook, `CompletenessCard.tsx` component.

---

### 5.3 — Inline Content Tips & Writing Guidance

**Why it matters:** The biggest user frustration with resume builders is "I don't know what to write." Even without AI generation, contextual writing tips dramatically improve content quality and reduce abandonment.

**Implementation:**

1. **Placeholder text that teaches.** Replace generic placeholders with specific, instructive examples:
   - Current: `placeholder="Describe your role, responsibilities, and impact..."`
   - Better: `placeholder="Led a team of 5 engineers to deliver a $2M platform migration, reducing deployment time by 60%..."`

2. **Contextual tip cards.** Below each textarea, show a collapsible "Writing tips" section:
   - Experience: "Start bullets with action verbs. Quantify results (%, $, time saved). Use the XYZ formula: Accomplished [X] as measured by [Y] by doing [Z]."
   - Summary: "Keep it 2-4 sentences. Mention years of experience, key skill areas, and your career goal."
   - Skills: "Match skills to the job description. List technical skills before soft skills."

3. **Weak bullet detection.** Highlight bullets that start with "Responsible for" or "Helped with" and suggest action verb alternatives.

**Files to modify:** `ExperienceEditor.tsx`, `SummaryEditor.tsx`, `SkillsEditor.tsx`, and all section editors. New `WritingTips.tsx` component.

---

### 5.4 — Keyboard Shortcuts & Command Palette

**Why it matters:** Power users (the most likely to pay) expect keyboard-driven workflows. Currently there are zero keyboard shortcuts in the app.

**Essential shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save version |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + E` | Export PDF |
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + T` | Open template gallery |
| `Ctrl/Cmd + I` | Open import modal |
| `Escape` | Close modals / collapse sections |
| `Tab` | Next section |
| `Shift + Tab` | Previous section |

**Command palette (Ctrl+K):**
A searchable modal (like VS Code's command palette or Linear's Cmd+K) that lets users quickly access any action: switch template, export, navigate to a section, toggle dark mode, etc. This is becoming a standard pattern in productivity apps.

**Files to create:** `useKeyboardShortcuts.ts` hook, `CommandPalette.tsx` component.

---

### 5.5 — Redesign the TopBar for Clarity

**Current problem:** The TopBar crams 8+ buttons into a single row: Back, Resume name, Save JSON, PDF, DOCX, Import, Version, Templates. On smaller screens, button labels hide, leaving only icons with no tooltips. The "Save" button saves as JSON (a developer action), which is confusing — users expect "Save" to save their resume (which already happens via auto-save).

**Recommended redesign:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back   My Resume Name (edit)  ·  Modern Clean template                    │
│                                                                              │
│                              ○ Saved 2s ago    [Import] [Templates]  [⬇ Export ▾] │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key changes:**

1. **Remove the "Save" (JSON) button from the primary toolbar.** Move it into an overflow menu or the command palette. JSON export is a power-user action, not a primary workflow.
2. **Consolidate exports into a single dropdown.** One "Export" button with a dropdown: PDF, DOCX, JSON. This reduces button count from 3 to 1.
3. **Move the version save button** into the dropdown or command palette. Keep the auto-save indicator prominent.
4. **Add proper Tooltips** to all icon-only buttons (the `Tooltip` component exists in `ui/` but isn't used on the TopBar).
5. **Make the template name clickable** to open the template gallery (reduces one button).

**Files to modify:** `TopBar.tsx`

---

### 5.6 — Improve the ATS Panel UX

**Current problem:** The ATS panel in the sidebar requires users to: (1) paste a job description, (2) optionally select an industry, (3) click "Analyze," then (4) scroll through results. The analysis only runs on-demand, not in real-time.

**Recommended improvements:**

1. **Always show a baseline ATS score** based on resume content alone (formatting, section completeness, content quality) — no job description required.
2. **Make keyword analysis real-time.** As soon as a job description is pasted, start analyzing without requiring a button click. Use the existing `useDebounce` hook.
3. **Show keyword matches inline in the editor.** When a job description is loaded, highlight matching keywords in green and missing keywords with a subtle underline in the editor panel — not just in the sidebar.
4. **Add a "quick add" button next to missing keywords.** If "Python" is missing, show a button that adds it to the Skills section.
5. **Show the ATS score as a persistent badge** in the TopBar or editor panel header, so users always know where they stand without switching sidebar tabs.
6. **Add score history** — show how the score changes over time as the user edits.

**Files to modify:** `AtsPanel.tsx`, `AtsScoreCard.tsx`, `KeywordAnalysis.tsx`, `useAtsScore.ts`, `TopBar.tsx`, `EditorPanel.tsx`

---

## 6. Design System & Visual Overhaul

### 6.1 — Establish a Stronger Visual Identity

**Current state:** The app uses a generic Tailwind palette — gray-50 backgrounds, gray-200 borders, blue-600 accents. It looks clean but indistinguishable from any other Tailwind app. For a paid product, the UI needs to feel premium.

**Recommended design tokens:**

```css
/* Brand colors — shift from generic blue to a richer, more distinctive palette */
--brand-50: #f0f4ff;    /* Lightest tint */
--brand-100: #dbe4ff;
--brand-500: #4c6ef5;   /* Primary — slightly warmer blue, less corporate */
--brand-600: #3b5bdb;   /* Primary hover */
--brand-700: #364fc7;   /* Primary active */

/* Neutral palette — warmer grays instead of pure gray */
--gray-50: #f8f9fa;     /* Background */
--gray-100: #f1f3f5;    /* Card backgrounds */
--gray-200: #e9ecef;    /* Borders */
--gray-500: #868e96;    /* Secondary text */
--gray-700: #495057;    /* Primary text */
--gray-900: #212529;    /* Headings */

/* Semantic colors */
--success: #40c057;
--warning: #fab005;
--danger: #fa5252;

/* Shadows — layered for depth */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 20px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04);
```

### 6.2 — Typography Hierarchy

**Current issue:** The app uses `text-xs`, `text-sm`, `text-base`, and `text-lg` inconsistently across panels. Section headers in the editor are `text-sm font-semibold` while sidebar headers are `text-lg font-semibold`.

**Recommended type scale:**

| Element | Current | Recommended |
|---------|---------|-------------|
| Page heading (TopBar resume name) | `text-sm font-semibold` | `text-base font-semibold` |
| Panel heading (Sidebar section titles) | `text-lg font-semibold` | `text-sm font-bold uppercase tracking-wider text-gray-500` |
| Section card title | `text-sm font-semibold` | `text-sm font-semibold` (keep) |
| Section description | `text-xs text-gray-400` | `text-xs text-gray-500` (slightly more readable) |
| Form labels | `text-sm font-medium text-gray-700` | `text-xs font-medium text-gray-600 uppercase tracking-wide` |
| Body text | `text-sm text-gray-500` | `text-sm text-gray-600` (more contrast) |
| Helper text / hints | `text-xs text-gray-400` | `text-xs text-gray-500` |

### 6.3 — Card & Container Design

**Current state:** Section cards use `rounded-xl border bg-white p-6`. Active sections get `border-blue-400 ring-2 ring-blue-200`. This is clean but flat.

**Recommended improvements:**

1. **Add subtle shadows instead of ring indicators.** Replace the active ring with: `shadow-md border-brand-200 bg-white` for active, `border-transparent bg-white shadow-sm hover:shadow-md` for inactive.
2. **Use a slight left-border accent** for active sections (3px solid brand-500) — this is more scannable than ring highlights.
3. **Increase border-radius consistency.** Use `rounded-xl` (12px) for all major cards, `rounded-lg` (8px) for inner elements, `rounded-md` (6px) for form inputs.

### 6.4 — Spacing & Density

**Current state:** The editor uses `space-y-4` between section cards and `p-6` inside cards. This creates a lot of vertical scrolling.

**Recommended approach:**

1. **Reduce card padding** from `p-6` to `p-4` for collapsed sections, keep `p-5` for expanded.
2. **Reduce inter-card spacing** from `space-y-4` to `space-y-3`.
3. **Add a compact mode toggle** in the sidebar for users who want maximum information density. This can reduce font sizes by 1 step and tighten all spacing by ~25%.

### 6.5 — Icon Consistency

**Current state:** The app uses Lucide React icons throughout, which is good. But icon sizing is inconsistent:
- TopBar buttons: `h-4 w-4` and `h-5 w-5` mixed
- Section icons: `h-4.5 w-4.5` (non-standard)
- Sidebar headers: `h-5 w-5`
- Inline actions: `h-3.5 w-3.5`

**Recommended standard:**
- Navigation/header icons: `h-5 w-5` (20px)
- Button icons: `h-4 w-4` (16px)
- Inline/small icons: `h-3.5 w-3.5` (14px)
- No custom sizes like `h-4.5`

---

## 7. User Flow Improvements

### 7.1 — Dashboard (HomePage) Improvements

**Current state:** The homepage shows a grid of resume cards with create/duplicate/delete actions. This is functional but misses opportunities for engagement and guidance.

**Recommended additions:**

1. **Add a "Quick Start" hero section** for users with 0-1 resumes:
   ```
   ┌──────────────────────────────────────────────────────┐
   │  🚀 Create your professional resume in minutes       │
   │                                                      │
   │  [Start from scratch]  [Upload existing]  [Use AI]   │
   └──────────────────────────────────────────────────────┘
   ```

2. **Show resume thumbnails** on dashboard cards — render a tiny preview of the actual resume, not just a name and date.

3. **Add a "Last edited X ago" relative timestamp** and sort by most recent.

4. **Add a search/filter bar** for users with many resumes.

5. **Show the ATS score badge** on each resume card (e.g., "ATS: 72%").

6. **Add a "Duplicate for job" action** that duplicates a resume and immediately opens it for tailoring to a specific job posting.

### 7.2 — The "New Resume" Flow

**Current state:** Creating a new resume opens a dialog to choose a template, then creates the resume and redirects to the editor.

**Recommended flow:**

1. Click "New Resume" → Open a full-screen wizard (not a small dialog)
2. Step 1: Enter basic info (name, email, title) — preview updates live
3. Step 2: Choose template (with user's actual data shown)
4. Step 3: Choose starting point (blank, sample data, import, or duplicate from existing)
5. Land in the editor with the first incomplete section auto-focused

### 7.3 — The Export Flow

**Current state:** Export buttons in the TopBar trigger immediate download. No preview step, no format options, no filename control.

**Recommended flow:**

1. Click "Export" → Open an export modal
2. Show a final preview of the document
3. Let users choose format (PDF recommended, DOCX, Plain Text)
4. Let users customize the filename (default: `{resumeName}_{date}`)
5. Show a "Pro tip" about ATS-friendly formats
6. Download with a success confirmation toast

### 7.4 — Section Reordering Flow

**Current state:** Sections can be reordered via drag-and-drop in the `SectionManager.tsx` (sidebar Styling tab). This is hidden and non-discoverable.

**Recommended improvements:**

1. **Add drag handles directly on section cards** in the editor panel. Users should be able to reorder sections from where they see them, not from a separate panel.
2. **Show a subtle "grip" icon** on the left edge of each section card on hover.
3. **Add an animation** when sections are reordered — smooth position transitions make the action feel responsive.
4. **Keep the SectionManager as a secondary option** for users who want to bulk-reorder or toggle visibility.

---

## 8. Mobile Experience Redesign

### 8.1 — Current Mobile Issues

The current mobile layout (`AppShell.tsx` mobile branch) uses 3 tabs: Sections, Editor, Preview. This is the right approach but has issues:

1. **Tab switching is jarring.** No transition animation between tabs.
2. **The "Sections" tab duplicates sidebar functionality** — on mobile, this is wasted space. Users should see the editor directly.
3. **Preview is render-only.** No zoom gesture support, no pinch-to-zoom.
4. **The TopBar buttons overflow** on small screens (many buttons with hidden labels).

### 8.2 — Recommended Mobile Redesign

1. **Reduce to 2 primary tabs:** Edit and Preview. Move section navigation into the editor as a horizontal scrollable chip bar at the top.

   ```
   ┌──────────────────────────────────────────────┐
   │ ← My Resume              [⋯ More]  [Export]  │
   ├──────────────────────────────────────────────┤
   │  [Edit]  [Preview]                            │
   ├──────────────────────────────────────────────┤
   │ Contact | Summary | Experience | Education ►  │
   ├──────────────────────────────────────────────┤
   │                                              │
   │  ┌────────────────────────────────────────┐  │
   │  │  Work Experience                        │  │
   │  │                                        │  │
   │  │  [Company]  [Position]                 │  │
   │  │  [Start Date]  [End Date]              │  │
   │  │  ...                                   │  │
   │  └────────────────────────────────────────┘  │
   │                                              │
   └──────────────────────────────────────────────┘
   ```

2. **Add swipe gestures** to switch between Edit and Preview tabs.

3. **Add a floating "Preview" button** (bottom-right FAB) when in edit mode, so users can quickly check their changes without tab-switching.

4. **Collapse the TopBar** on scroll to maximize editing space.

5. **Use bottom sheet modals** for template gallery, export options, and styling controls — this is the native mobile pattern.

6. **Increase all touch targets** to minimum 44x44px (Apple HIG / WCAG 2.5.8).

### 8.3 — Tablet-Specific Improvements

1. **Show sidebar + editor side-by-side** (current behavior) but add a "Preview" floating panel that can be pulled up from the bottom as a half-sheet.
2. **Support landscape orientation** with a true 3-panel layout (mini sidebar + editor + preview).

---

## 9. Feature Gap Analysis

Features that are expected by paid users in 2026 but currently missing.

### 9.1 — AI Writing Assistance (Highest Priority Gap)

**Impact: Critical** — This is the single biggest reason users pay for resume builders in 2026.

**Minimum viable implementation:**

1. **"Improve this bullet" button** next to every highlight/description field. Sends the current text + job title to an AI endpoint and returns an improved version with action verbs and quantified results.
2. **"Generate bullet points" button** in the Experience section. Takes company, role, and description, generates 3-5 achievement-focused bullet points.
3. **"Write summary" button** that generates a professional summary from the user's experience and skills data.
4. **"Tailor to job" feature** that takes a pasted job description and suggests specific edits across all sections.

**UI pattern:** Inline suggestion cards that appear below input fields with "Accept" / "Edit" / "Regenerate" buttons.

**Technical approach:** Add an API endpoint (Convex action) that calls Claude API. Stream responses for a responsive feel.

### 9.2 — LinkedIn Profile Import

**Impact: High** — Eliminates the biggest friction point: entering all data manually.

**Implementation:** Use LinkedIn's public profile data (via URL scraping or official API if available). Parse into the resume data structure and pre-fill all sections.

### 9.3 — Job Description Paste-and-Tailor

**Impact: High** — The ATS panel already accepts job descriptions but only scores. It should also suggest changes.

**Implementation:** When a job description is pasted:
1. Show missing keywords with "Add to resume" actions
2. Suggest reworded bullets that incorporate target keywords
3. Recommend sections to add/remove based on the job
4. Save the job description as a linked "target job" for this resume version

### 9.4 — Shareable Web Resume Link

**Impact: Medium** — Generates a unique URL (e.g., `resume.app/u/john-doe`) that renders the resume as a responsive web page.

### 9.5 — Resume Analytics

**Impact: Medium** — For shared links: view count, unique visitors, average time spent, geographic data. Helps users understand which resume versions perform better.

### 9.6 — Collaborative Review

**Impact: Medium** — Share a resume with a mentor/friend for feedback. They can leave comments on specific sections without needing an account.

### 9.7 — Multi-Language Support

**Impact: Medium** — Allow users to create resumes in different languages. Enhancv supports 30+ languages. At minimum, support interface translation for the top 10 languages.

---

## 10. Accessibility Compliance

The app needs WCAG 2.2 Level AA compliance. This is both a legal requirement (ADA, European Accessibility Act 2025) and a competitive advantage.

### 10.1 — Keyboard Navigation

**Current gaps:**
- Section cards in the editor are clickable `<div>`s, not `<button>`s or elements with proper `role` and `tabIndex`
- Drag-and-drop has no keyboard alternative for reordering
- Modal focus trapping may be incomplete
- No visible focus indicators on many interactive elements

**Required fixes:**
1. Add `role="button"` and `tabIndex={0}` to all clickable section cards, or convert them to semantic `<button>` elements.
2. Add `onKeyDown` handlers for Enter/Space on all clickable non-button elements.
3. Ensure all modals trap focus and return focus to the trigger element on close.
4. Add visible focus rings to all interactive elements (Tailwind's `focus-visible:ring-2` pattern).
5. Implement keyboard reordering for drag-and-drop (up/down arrow keys with `aria-live` announcements).

### 10.2 — Screen Reader Support

**Current gaps:**
- The editor panel's section collapse/expand state isn't announced
- The ATS score changes aren't announced via `aria-live`
- The preview panel's image-only rendering is inaccessible
- Form inputs may lack proper `aria-describedby` links to hint text

**Required fixes:**
1. Add `aria-expanded` to section card headers.
2. Add `aria-live="polite"` to the ATS score display and auto-save indicator.
3. Add descriptive `aria-label` to the preview panel images (e.g., "Resume preview, page 1 of 2").
4. Link all input hints to their inputs via `aria-describedby`.
5. Add `role="status"` to the toast notification container.

### 10.3 — Visual Accessibility

**Current gaps:**
- Color contrast may not meet 4.5:1 ratio for `text-gray-400` on white backgrounds (gray-400 = #9CA3AF ≈ 2.9:1 — fails)
- The ATS score uses color alone to indicate good/bad (green/red)
- No support for `prefers-reduced-motion`

**Required fixes:**
1. **Increase minimum text color** from `text-gray-400` to `text-gray-500` (#6B7280 ≈ 4.6:1) for all informational text. Reserve `text-gray-400` only for placeholder text inside inputs.
2. **Add text labels alongside color indicators** for ATS scores (e.g., "Good", "Needs improvement", not just green/red).
3. **Wrap all Framer Motion animations** in a `prefers-reduced-motion` check:
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   ```
4. **Ensure all color theme options** for resume styling produce accessible output (minimum contrast in the generated PDF).

### 10.4 — Accessible PDF Output

**Current gap:** PDF accessibility is not addressed. Screen readers cannot parse the generated PDFs.

**Required for full compliance:**
1. Add PDF tagging (heading structure, reading order) to `@react-pdf/renderer` output.
2. Ensure all generated PDFs have a logical reading order (especially for 2-column templates).
3. Add alt text for any decorative elements in templates.
4. Offer a "plain text" export option as an accessible alternative.

---

## 11. Micro-Interactions & Polish

Small details that elevate the experience from "functional" to "premium."

### 11.1 — Loading & Transition States

| Current | Recommended |
|---------|-------------|
| Spinner on PDF generation | Skeleton screen that matches the resume layout, then crossfade to the real preview |
| No animation on section expand | Smooth height animation (already using Framer Motion — tune the spring) |
| Hard cut between mobile tabs | Slide-left/slide-right transition based on tab direction |
| No feedback on successful save | Subtle green pulse on the save indicator, or a brief checkmark animation |
| No feedback on template switch | Crossfade animation on the preview panel |

### 11.2 — Drag-and-Drop Polish

1. **Add a ghost/shadow effect** to the dragged item (currently uses dnd-kit defaults).
2. **Add placeholder indicators** showing where the item will land.
3. **Animate list reflow** when items are reordered.
4. **Add a subtle "picked up" scale effect** (1.02x) and drop shadow on the dragged card.

### 11.3 — Form Interaction Polish

1. **Auto-grow textareas** — `TextArea` components should expand as users type, eliminating the need to scroll within the field.
2. **Character/word count** on summary and description fields (with a recommended range indicator).
3. **Inline validation** — show green checkmarks next to completed required fields.
4. **Smart suggestions** — auto-capitalize city names, auto-format phone numbers.
5. **Undo on destructive actions** — when deleting an experience entry, show a toast with "Undo" button for 5 seconds instead of a confirmation dialog. Toasts are faster and less disruptive.

### 11.4 — Toast Notification Improvements

**Current state:** `Toast.tsx` exists with basic success/error states.

**Improvements:**
1. Add an "Undo" action button to toasts for destructive actions.
2. Stack multiple toasts vertically with stagger animation.
3. Add progress bar to toasts showing auto-dismiss timer.
4. Position toasts at bottom-center on mobile (more thumb-friendly) instead of top-right.

### 11.5 — Empty State Illustrations

**Current state:** Empty states use small Lucide icons with text. This is functional but misses an opportunity to delight.

**Recommendation:** Replace icon-only empty states with simple, branded SVG illustrations. Don't need to be elaborate — even a styled line drawing of a resume with a sparkle effect communicates "something great is about to happen here."

---

## 12. Implementation Priority Matrix

### Tier 1 — Critical (Do First) — Impact: 🔴 Revenue & Retention

| # | Improvement | Effort | Impact |
|---|------------|--------|--------|
| 1 | Editor panel redesign (collapsed content summaries, multi-expand, progress) | Large | Very High |
| 2 | Onboarding flow speedup (30-second aha moment) | Medium | Very High |
| 3 | AI writing assistance (improve bullets, generate summaries) | Large | Very High |
| 4 | Dark mode | Medium | High |
| 5 | Fix accessibility contrast issues (gray-400 → gray-500) | Small | High |

### Tier 2 — High Impact (Do Next) — Impact: 🟠 User Satisfaction

| # | Improvement | Effort | Impact |
|---|------------|--------|--------|
| 6 | Resume completeness score & progress system | Medium | High |
| 7 | Template gallery with user data preview + ATS badges | Medium | High |
| 8 | Date picker components (replace text inputs) | Small | High |
| 9 | TopBar consolidation (export dropdown, remove JSON save) | Small | Medium |
| 10 | Keyboard shortcuts + command palette (Cmd+K) | Medium | Medium |
| 11 | Inline writing tips & placeholder improvements | Small | Medium |
| 12 | ATS panel real-time analysis + inline keyword highlighting | Medium | High |

### Tier 3 — Polish (Do After) — Impact: 🟡 Perceived Quality

| # | Improvement | Effort | Impact |
|---|------------|--------|--------|
| 13 | Mobile experience redesign (2-tab, swipe, FAB) | Large | Medium |
| 14 | Visual identity overhaul (design tokens, warmer palette) | Medium | Medium |
| 15 | Typography hierarchy standardization | Small | Low |
| 16 | Micro-interactions (skeleton loading, drag polish, auto-grow textareas) | Medium | Medium |
| 17 | Empty state illustrations | Small | Low |
| 18 | Toast improvements (undo actions, progress bars) | Small | Low |
| 19 | Dashboard improvements (resume thumbnails, ATS badges, search) | Medium | Medium |

### Tier 4 — Strategic (Plan For) — Impact: 🟢 Market Differentiation

| # | Improvement | Effort | Impact |
|---|------------|--------|--------|
| 20 | Job description paste-and-tailor (AI-powered) | Large | Very High |
| 21 | LinkedIn import | Large | High |
| 22 | Shareable web resume link | Large | Medium |
| 23 | Resume analytics (view tracking) | Medium | Medium |
| 24 | Collaborative review (comments) | Large | Medium |
| 25 | Full WCAG 2.2 AA compliance (keyboard nav, screen readers, tagged PDFs) | Large | High |
| 26 | Multi-language interface support | Large | Medium |

---

## Appendix A — Files Index (Key Files to Modify)

| File | Related Improvements |
|------|---------------------|
| `src/components/layout/AppShell.tsx` | Mobile redesign, sidebar refactor |
| `src/components/layout/EditorPanel.tsx` | Editor interaction redesign, section summaries |
| `src/components/layout/PreviewPanel.tsx` | Skeleton loading, zoom gestures |
| `src/components/layout/TopBar.tsx` | TopBar consolidation, dark mode toggle |
| `src/components/layout/Sidebar.tsx` | Sidebar refactor, contextual tools |
| `src/components/editor/ExperienceEditor.tsx` | Writing tips, date pickers, AI buttons |
| `src/components/editor/SummaryEditor.tsx` | AI summary generation, word count |
| `src/components/editor/SkillsEditor.tsx` | ATS keyword quick-add |
| `src/components/editor/EntryCard.tsx` | Drag-and-drop polish, undo delete |
| `src/components/ats/AtsPanel.tsx` | Real-time analysis, persistent score badge |
| `src/components/ats/KeywordAnalysis.tsx` | Inline highlighting, quick-add |
| `src/components/onboarding/OnboardingWizard.tsx` | Accelerated onboarding flow |
| `src/components/templates/TemplateGallery.tsx` | User data preview, ATS badges, filters |
| `src/components/ui/*.tsx` | Dark mode variants, contrast fixes |
| `src/store/uiStore.ts` | Dark mode state, compact mode |
| `src/index.css` | Design tokens, dark mode CSS |
| `src/pages/HomePage.tsx` | Dashboard improvements |

---

## Appendix B — Metrics to Track Post-Implementation

| Metric | Target | Tool |
|--------|--------|------|
| Time to first meaningful preview | < 30 seconds | Plausible custom event |
| Onboarding completion rate | > 80% | Plausible funnel |
| Resume completeness score average | > 70% | Analytics |
| Export rate (resumes exported / resumes created) | > 60% | Plausible custom event |
| Session duration | > 15 minutes | Plausible |
| Return visits (7-day retention) | > 40% | Plausible |
| ATS panel usage rate | > 50% | Plausible custom event |
| Template switch rate | > 30% | Plausible custom event |
| Mobile session share | Track trend | Plausible |
| WCAG automated audit score | > 95% | Lighthouse |

---

*End of Report*
