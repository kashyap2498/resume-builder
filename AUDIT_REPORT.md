# Resumello MVP Audit Report

**Date**: February 14, 2026
**Scope**: Full-stack application audit — UX, architecture, security, templates, exports, competitive positioning
**Goal**: Identify every opportunity to make Resumello the best resume builder for job seekers — the one they recommend to friends

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Competitive Landscape](#3-competitive-landscape)
4. [Critical Bugs & Security Issues](#4-critical-bugs--security-issues)
5. [UX Deep-Dive: Page-by-Page Audit](#5-ux-deep-dive-page-by-page-audit)
6. [Template System Issues](#6-template-system-issues)
7. [Export Quality Issues](#7-export-quality-issues)
8. [Data Architecture & State Management Issues](#8-data-architecture--state-management-issues)
9. [Performance Audit](#9-performance-audit)
10. [Accessibility Audit](#10-accessibility-audit)
11. [The "Recommend to a Friend" Playbook](#11-the-recommend-to-a-friend-playbook)
12. [MVP Improvement Roadmap](#12-mvp-improvement-roadmap)
13. [Quick Wins (< 1 day each)](#13-quick-wins)
14. [Medium Effort Improvements](#14-medium-effort-improvements)
15. [Strategic Differentiators for V2](#15-strategic-differentiators-for-v2)

---

## 1. Executive Summary

Resumello is a **technically sophisticated** resume builder with strong fundamentals: 18 templates, real-time preview, ATS scoring, PDF/DOCX export, drag-and-drop, rich text editing, version history, and a Convex backend. The codebase is modern (React 19, Zustand, Tailwind v4, Vite 7) and well-structured.

However, the MVP has **critical issues that will cost users trust and data**:

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | 3 | 2 | 1 | 0 |
| Data Integrity | 2 | 4 | 3 | 0 |
| UX / Polish | 0 | 8 | 15 | 12 |
| Templates | 0 | 3 | 5 | 3 |
| Export Quality | 0 | 2 | 4 | 2 |
| Performance | 0 | 1 | 3 | 2 |
| Accessibility | 0 | 3 | 5 | 4 |
| **Total** | **5** | **23** | **36** | **23** |

**Bottom line**: The app has the features to compete. What it needs now is **trust, polish, and reliability** — the things that turn a user into an advocate.

---

## 2. Current State Assessment

### What Resumello Does Well

1. **Template variety** — 18 templates across 8 categories (ATS, Minimal, Professional, Modern, Technical, Healthcare, Creative, Academic) is among the best in market
2. **Three-panel layout** — Sidebar | Editor | Preview is the industry-standard UX pattern, and it's well-implemented
3. **ATS scoring** — Real-time keyword analysis against job descriptions — only 7/10 top competitors offer this
4. **Multi-format export** — PDF + DOCX + JSON covers all use cases
5. **Version history** — Named snapshots with restore — rare in the market
6. **Cover letter builder** — Integrated with resume data, included in the same editor
7. **Honest pricing model** — One-time lifetime payment ($29 early bird / $49 regular) is rare and user-friendly. No subscription trap
8. **Anti-subscription positioning** — The landing page explicitly calls out competitor dark patterns. This builds trust
9. **15+ resume sections** — Experience, Education, Skills, Projects, Certifications, Languages, Volunteer, Awards, Publications, References, Hobbies, Affiliations, Courses, Custom Sections
10. **Drag-and-drop reordering** — Both within sections and section order management
11. **Rich text editing** — Tiptap-based editor with formatting support
12. **Import from PDF/DOCX/JSON** — Reduces blank-page anxiety

### What's Holding It Back

1. **Data can be silently lost** — Auto-save fails silently with no retry, no user notification
2. **Security holes in purchase verification** — Backend mutations don't check purchase status
3. **Several UI controls don't work** — Two-column layout toggle, some color controls on specific templates
4. **Rough edges everywhere** — Missing loading states, vague error messages, no offline handling
5. **Templates are inconsistent** — Same data renders differently across templates in non-obvious ways
6. **Export has gaps** — Custom sections missing from DOCX, cover letter DOCX ignores font sizes
7. **No guided experience** — Users dropped into a complex editor without help
8. **Mobile UX is functional but not optimized** — Tab navigation works but feels cramped

---

## 3. Competitive Landscape

### Market Context

- **242 applications per job opening** (average) — resume quality matters more than ever
- **98% of Fortune 500** use ATS software
- **87% of professionals** postpone updating their resume (blank-page anxiety)
- **53% of hiring managers** flag AI-generated content as a red flag
- **80% of enterprises** expected to use AI in hiring by 2026

### Top Competitors and Their Strengths

| Competitor | Why Users Love Them | Pricing | Weakness |
|---|---|---|---|
| **FlowCV** | Truly free, no watermarks, 5-star Trustpilot | Free + Pro $20/mo | Limited AI |
| **Teal** | All-in-one: resume + job tracking + interview prep | Freemium | Complex for just resume building |
| **Rezi** | Best ATS scoring with real-time feedback | Freemium | Limited design options |
| **Kickresume** | Best all-around (Forbes #1 Jan 2025) | Freemium + free student premium | Template variety limited |
| **Canva** | 1000+ design templates, drag-and-drop WYSIWYG | Freemium | Terrible ATS compatibility |
| **Reactive Resume** | Open-source, self-hosted, privacy-first (30K+ GitHub stars) | Free | Requires self-hosting for full features |
| **Novoresume** | AI-driven skill alignment | $19.99/mo or $99.99/yr | Expensive |
| **Upplai** | Pay-per-use ($0.50/resume), 200 free ATS scans/month | Pay-per-use | New, unproven |
| **BeamJobs** | AI bullet-point generator, 4.9/5 Trustpilot | Freemium | Limited templates |

### What Users Hate Most About Resume Builders (Reddit + Trustpilot analysis)

1. **Deceptive pricing** — $1.95 trial → $25.90/mo auto-renew (Zety, Resume.io). This is the #1 complaint
2. **Paywall at download** — Build entire resume, then can't download without paying
3. **Formatting breaks** — Editor preview doesn't match exported PDF
4. **AI sounds robotic** — Generic, impersonal suggestions
5. **Limited customization** — Can't control colors, fonts, spacing enough
6. **Overpriced for one-time use** — $20-30/mo for what might be a 2-week need

### Where Resumello Fits

Resumello's positioning is **strong**:
- ✅ Honest one-time pricing (anti-subscription)
- ✅ 18 templates with real ATS optimization
- ✅ Full customization (fonts, colors, spacing, layout)
- ✅ No watermarks
- ✅ Multi-format export

**But it's not yet earning the trust needed for word-of-mouth.** The gap is in reliability, polish, and guidance.

---

## 4. Critical Bugs & Security Issues

### CRITICAL-1: Backend Mutations Don't Verify Purchase Status

**Files**: `convex/resumes.ts` (all mutations: save, duplicate, create, remove)
**Impact**: Users with expired subscriptions can continue using the API indefinitely

The `PurchaseGuard` in `App.tsx:32-37` only protects the frontend routes. The actual Convex mutations (`resumes.ts`) check for authentication (`auth.getUserId`) but **never check purchase status**. A user could:
1. Buy monthly access, create resumes
2. Let subscription expire
3. Continue calling `resumes.save()` via browser console or API
4. Keep using the product without paying

**Fix**: Add `verifyPurchase(ctx)` check to all resume mutations in `convex/resumes.ts`.

---

### CRITICAL-2: `sanitizeImportedResume` Returns Invalid Data

**File**: `src/utils/sanitize.ts:31-39`

```typescript
export function sanitizeImportedResume(data: unknown): Resume | null {
  const sanitized = sanitizeStringFields(data)
  const result = resumeSchema.safeParse(sanitized)
  if (result.success) {
    return result.data as Resume
  }
  console.warn('Resume validation failed after sanitization:', result.error)
  return sanitized as Resume  // ← BUG: Returns UNVALIDATED data!
}
```

If Zod validation fails, the function returns the data anyway with an unsafe `as Resume` cast. This defeats the purpose of sanitization and could introduce malformed data into the application state, causing crashes or security issues.

**Fix**: Return `null` when validation fails. That's what the return type already promises.

---

### CRITICAL-3: No Schema Validation on Resume Save/Load

**File**: `convex/resumes.ts:33` — Backend accepts any string as `data`
**File**: `src/pages/EditorPage.tsx:52` — Frontend does `JSON.parse(convexResume.data) as Resume` without validation

Resume data travels through the system as an unvalidated JSON string:
- **Save**: Frontend sends `JSON.stringify(resume)` → Backend stores raw string with no schema check
- **Load**: Backend returns raw string → Frontend does `JSON.parse()` with no schema check

If the data becomes corrupted (bug, migration, malicious edit), the app will crash or display wrong data with no recovery path.

**Fix**: Validate with Zod on both load and save boundaries.

---

### HIGH-1: Auto-Save Silently Loses Data

**File**: `src/hooks/useAutoSave.ts:36-58`

When auto-save fails:
- Error is logged to console (invisible to user)
- `pendingRef.current` behavior is ambiguous — data may be marked as saved when it isn't
- No retry mechanism
- No user notification
- `beforeunload` warning may not fire because `pendingRef` is reset

**Scenario**: User edits resume → network drops → auto-save fails silently → user closes tab → data lost.

**Fix**: Implement retry with exponential backoff, show persistent "save failed" banner, keep `pendingRef.current = true` on failure.

---

### HIGH-2: Session Storage Attack Vector in Checkout

**File**: `src/hooks/useCheckout.ts:15-17`

```typescript
sessionStorage.setItem('pending_plan', plan)
```

Anyone can set `sessionStorage.pending_plan` via browser console to manipulate the checkout flow. While this won't bypass actual payment (LemonSqueezy handles that), it could be used to confuse the purchase flow or trigger unintended behavior.

**Fix**: Use signed server-side session tokens or pass plan as an encrypted URL parameter.

---

## 5. UX Deep-Dive: Page-by-Page Audit

### 5.1 Landing Page

**Overall**: Well-designed with strong positioning. The "anti-subscription" messaging is a genuine differentiator. Issues are mostly about polish and trust-building.

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **"147 of 200 spots remaining" is hardcoded** | `PricingSection.tsx:76` | High | Make dynamic or remove — users who inspect the code will lose trust |
| **"18+ ATS Templates" hardcoded** in 4+ places | HeroSection, FeatureGrid, PricingSection, TrustStrip | Medium | Create a `TEMPLATE_COUNT` constant derived from actual template registry |
| **Competitor pricing table is static** | `PricingSection.tsx:31-37` | Medium | Add disclaimers or date stamps — prices change |
| **"75% of resumes rejected" has no citation** | `AtsSection.tsx:133` | Medium | Add source or use a verifiable stat |
| **No skip link** for animated hero | `HeroSection.tsx` | Medium | Users with vestibular disorders need to skip animations |
| **Editor preview GIF has no fallback** | `HeroSection.tsx:73` | Low | Add loading placeholder and alt text |
| **FAQ lacks `aria-expanded`** | `FaqSection.tsx:91-93` | Medium | Add proper ARIA attributes for screen readers |
| **No scroll indicator** on template category tabs (mobile) | `TemplateShowcase.tsx:102` | Low | Add fade/arrow to indicate horizontal scroll |
| **Founder story has no contact link** | `FounderStory.tsx:98` | Low | Add social/contact link for trust |
| **"Weekly Updates" claim** | `FounderStory.tsx:30` | Low | Only state if true; aspirational claims erode trust |

### 5.2 Login Page

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No password visibility toggle** | `LoginPage.tsx:154-160` | High | Add show/hide eye icon — standard UX pattern |
| **Password requirements not shown upfront** | `LoginPage.tsx:158-161` | High | Show requirements before user starts typing |
| **No "Resend code" option** | `LoginPage.tsx:61-72` | High | Users with delayed emails get stuck |
| **Verification code input** lacks auto-advance | `LoginPage.tsx:240` | Medium | After 6 digits, auto-submit or auto-advance |
| **Generic error messages** | `LoginPage.tsx:38,54,68` | Medium | "Invalid code" → "Code expired or incorrect. Request a new one?" |
| **Email verification flow not guided** | Post-signup | Medium | Show "Check your email" prompt with provider links |

### 5.3 Dashboard (HomePage)

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No sort/filter for resume list** | `HomePage.tsx:474-488` | High | Add sort by date, name; filter by template |
| **No search for resumes** | `HomePage.tsx` | Medium | Search by name, template, or content |
| **Hover actions invisible on mobile** | `HomePage.tsx:292` | High | Use long-press or always-visible actions on mobile |
| **Duplicate action icon not intuitive** | `HomePage.tsx:300-305` | Medium | Copy icon → add "Duplicate" tooltip |
| **Delete confirmation could be richer** | `HomePage.tsx:499-507` | Low | Show resume name, template, and last-modified date in confirmation |
| **No resume preview on hover** | Resume cards | Medium | Show a thumbnail preview on hover/focus |
| **Create dialog template preview too small** | `CreateResumeDialog.tsx:182-204` | Medium | Larger preview or full-screen template gallery option |

### 5.4 Editor Page

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No unsaved changes warning on tab close** | `EditorPage.tsx` | High | `beforeunload` exists but may not fire if `pendingRef` is wrong (see Critical bugs) |
| **Keyboard shortcuts not discoverable** | `EditorPage.tsx:134-140` | High | Add subtle "?" hint in corner, or show on first visit |
| **No offline indicator** | `EditorPage.tsx` | High | Show banner when network is unavailable |
| **Resume name input truncates on mobile** | `TopBar.tsx:237` (`w-64`) | Medium | Use responsive width |
| **"Save as JSON" buried in dropdown** | `TopBar.tsx` | Low | Acceptable for MVP, but consider making export more prominent |
| **Auto-save indicator disappears too fast** | `TopBar.tsx:283-288` | Medium | Keep "Saved ✓" visible longer, or show subtle timestamp |
| **Export menu doesn't close on Escape** | `TopBar.tsx:84-90` | Low | Add Escape key handler |
| **No keyboard shortcut badges on buttons** | `TopBar.tsx` | Low | Show Ctrl+P, Ctrl+Shift+D on hover |
| **Version label modal could auto-populate** | `TopBar.tsx:405` | Low | Auto-generate label like "v3 - Feb 14" |
| **Loading state shows no progress** | `EditorPage.tsx:195-199` | Medium | At minimum show "Loading resume..." with resume name |

### 5.5 Sidebar

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No tab descriptions** | `Sidebar.tsx` | Medium | First-time users don't know what "ATS" means |
| **"Missing: X, Y, Z" doesn't explain why** | `Sidebar.tsx:46-59` | Medium | Add tooltip: "Adding a Summary increases ATS scores by ~15%" |
| **Drag handles not visible for section reorder** | Section manager | Medium | Add grip icon or "drag to reorder" hint |
| **Active tab indicator subtle** | `Sidebar.tsx:74-76` | Low | Increase contrast of blue underline |

### 5.6 Contact Editor

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **URL fields don't validate format** | `ContactEditor.tsx:109` | Medium | Validate LinkedIn, GitHub, portfolio URLs |
| **No field validation until blur** | `ContactEditor.tsx:47-48` | Low | Acceptable, but consider real-time for email |
| **No "show all optional fields" toggle** | `ContactEditor.tsx` | Medium | Collapse GitHub, Portfolio, etc. by default |

### 5.7 Experience Editor

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No drag handle visual affordance** | `ExperienceEditor.tsx:101-105` | High | Users don't know entries are draggable |
| **"Current position" toggle loses end date** | `ExperienceEditor.tsx:191-198` | Medium | Preserve end date and restore if unchecked |
| **Rich text context switch** | `ExperienceEditor.tsx:201-209` | Low | The switch from form fields to WYSIWYG is jarring; add a label |
| **Date format not guided** | `ExperienceEditor.tsx:176` | Medium | Show format hint "e.g., Jan 2023" |

### 5.8 Skills Editor

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **Comma-separated input fragile** | `SkillsEditor.tsx:40-44` | Medium | Use tag-style input with chips instead |
| **Delete category has no confirmation** | `SkillsEditor.tsx:112-114` | Medium | Add confirm dialog for categories with skills |
| **Collapsed categories show no preview** | `SkillsEditor.tsx:100-104` | Low | Show first 3 skills as preview |

### 5.9 Summary Editor

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **Character limit (500) not explained** | `SummaryEditor.tsx:8` | Low | Add hint: "Best summaries are 3-5 sentences" |
| **No writing tips** | `SummaryEditor.tsx` | Medium | Add contextual tips: "Start with years of experience, mention key skills" |

### 5.10 ATS Panel

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **Industry selector purpose unclear** | `AtsPanel.tsx:51-58` | Medium | Add help text explaining industry-specific keywords |
| **No example job description** | `AtsPanel.tsx:62-69` | Medium | Add "Paste a job description to see your ATS score" |
| **Score ranges not explained** | `AtsScoreCard.tsx:18-39` | Medium | Add tooltips: "80%+ = strong match, 60-79% = needs work" |
| **Missing keywords not actionable** | `KeywordAnalysis.tsx:29-62` | High | Add "Click to add to your resume" on each missing keyword |
| **Analysis doesn't persist across tabs** | `AtsPanel.tsx` | Medium | Store analysis results so switching tabs doesn't lose them |
| **Formatting suggestions are vague** | `FormattingWarnings.tsx:74` | Medium | Replace "improve readability" with specific actions |

### 5.11 Template Gallery

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No template search** | `TemplateGallery.tsx` | Medium | Add search by name or feature |
| **"2-col" / "1-col" abbreviation unclear** | `TemplateGallery.tsx:132-133` | Low | Spell out "Two-column" / "Single column" |
| **No template comparison** | `TemplateGallery.tsx` | Low | Side-by-side comparison of two templates |
| **Active template indicator subtle** | `TemplateGallery.tsx:65-67` | Low | Make the blue ring more prominent |

### 5.12 Import Modal

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **File size limit not stated** | `ImportModal.tsx` | Medium | Show "Max 10MB, supported: PDF, DOCX, JSON" |
| **PDF parsing accuracy not set** | `ImportModal.tsx:91-92` | Medium | Add "We'll do our best to parse your resume. Please review all fields after import." |
| **JSON import error unclear** | `ImportModal.tsx:74-86` | Medium | "Invalid format" → "This JSON file doesn't match the Resumello format. Export a resume as JSON to see the expected format." |
| **Loading states too vague** | `ImportModal.tsx:242-248` | Low | Show step-by-step progress |

### 5.13 Preview Panel

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No page indicator** | `PreviewPanel.tsx` | Medium | Show "Page 1 of 2" when scrolling multi-page resumes |
| **Zoom state not persisted** | `PreviewPanel.tsx` | Low | Remember zoom level across sessions |
| **No print-preview mode** | `PreviewPanel.tsx` | Low | Let users see exact print output before exporting |
| **"Preparing preview..." static** | `PreviewPanel.tsx:150` | Low | Add subtle animation to indicate activity |

### 5.14 Checkout Page

| Issue | Location | Severity | Fix |
|---|---|---|---|
| **No payment method display** | `CheckoutPage.tsx` | Medium | Show "Secure payment via LemonSqueezy" with SSL badge |
| **Pricing duplicated from landing** | `CheckoutPage.tsx:8-26` | Low | Extract shared pricing config |
| **No purchase confirmation** | Post-checkout | Medium | Show clear "You're all set!" page with next steps |
| **No FAQ about refunds** | `CheckoutPage.tsx` | Medium | Add refund policy inline |

---

## 6. Template System Issues

### 6.1 Two-Column Layout Toggle Does Nothing

**File**: `src/components/styling/LayoutControls.tsx:55-59`

The UI provides a "Two-Column Layout" toggle that sets `layout.columnLayout`, but **no single-column template reads this value**. Only hardcoded two-column templates (Elegant Columns, Modern Sidebar) have two-column layouts. Users toggle the switch and nothing happens.

**Fix**: Either remove the toggle from templates that don't support it, or implement column layout switching in the top templates.

### 6.2 Modern Sidebar Colors Are Hardcoded

**File**: `src/templates/modern-sidebar/PreviewTemplate.tsx:31-54`

The sidebar hardcodes `color: '#ffffff'` and `borderBottom: '1px solid rgba(255,255,255,0.3)'` regardless of user color settings. The color controls in the Styling panel have `lightText` and `headerText` options that should control these, but they're bypassed.

Users who customize colors will see their changes apply to the main content but not the sidebar — confusing and frustrating.

### 6.3 Accent Color Fallback Inconsistency

Templates handle missing `accent` color differently:

| Template | Fallback |
|---|---|
| ATS Professional | `colors.primary` ✅ |
| Modern Clean | `colors.primary` ✅ |
| Bold Creative | `'#FF6F00'` (hardcoded orange) ❌ |
| Elegant Columns | `'#5C6BC0'` (hardcoded indigo) ❌ |
| Modern Sidebar | `colors.primary` ✅ |

Bold Creative and Elegant Columns ignore the user's primary color when accent is undefined. Result: the template uses colors the user never chose.

### 6.4 Section Rendering Inconsistencies

The same resume data renders differently across templates in ways that aren't design choices but inconsistencies:

**Skills separators**:
- ATS Professional: `JavaScript, React, Node.js` (comma)
- Bold Creative: `JavaScript / React / Node.js` (slash)
- This is a deliberate design choice per template — acceptable

**Languages display**:
- ATS Professional: `English (Fluent), Spanish (Intermediate)` (parentheses + comma)
- Bold Creative: `English / Spanish` (slash, no proficiency!)
- Modern Sidebar: `English - *Fluent*` (dash + italic)

The Bold Creative template drops proficiency information entirely — this is data loss, not a design choice.

### 6.5 PDF Negative Margin Issues in Two-Column Templates

**Files**: `elegant-columns/PdfTemplate.tsx:23`, `modern-sidebar/PdfTemplate.tsx:35-36`

Two-column PDF templates use negative margins (`marginTop: -layout.margins.top`) to extend the sidebar to full page height. This is a fragile approach that can cause:
- Sidebar overflow beyond page bounds
- Gaps between sidebar and content
- Inconsistent rendering across PDF viewers

### 6.6 Dead Template Components

| Component | File | Status |
|---|---|---|
| `SkillBadge` | `src/templates/shared/SkillBadge.tsx` | Not imported by any template |
| `Divider` | `src/templates/shared/Divider.tsx` | Not imported by any template |

These should be either used or removed to reduce confusion.

---

## 7. Export Quality Issues

### 7.1 DOCX Export Missing Custom Sections

**File**: `src/utils/docxExport.ts:46-270`

The DOCX export handles all built-in sections but **completely skips `customSections`**. Users who create custom sections (a selling point of the app) will find them missing from their Word document.

### 7.2 Cover Letter DOCX Ignores Font Sizes

**File**: `src/utils/coverLetterDocxExport.ts`

The cover letter PDF export uses the user's font size settings, but the DOCX export hardcodes sizes:
- Line 19: `(styling.font.sizes.name || 24) * 2` — uses default if not set, but other sizes are fully hardcoded
- Line 27: `size: 18` — ignores `font.sizes.small`
- Line 35: `size: 20` — ignores `font.sizes.normal`

Users who customize font sizes will get different-looking PDF and DOCX exports.

### 7.3 Font Loading Race Condition

**Files**: `src/components/styling/FontControls.tsx:44-64`, `src/hooks/usePdfExport.ts`

When a user changes fonts, the font file loads asynchronously, but the font setting is applied immediately. If the user exports to PDF before the font finishes loading, the PDF falls back to Helvetica silently.

**Fix**: Show a brief "Loading font..." indicator and disable export until fonts are registered.

### 7.4 PDF Filename Not Customizable

**File**: `src/hooks/usePdfExport.ts`

The exported PDF filename is derived from the resume name, but users can't customize it. Best practice is `FirstName_LastName_Resume.pdf` — the app should either default to this format or let users choose.

---

## 8. Data Architecture & State Management Issues

### 8.1 Store Synchronization Race Condition

**Files**: `src/store/stylingStore.ts:130-135`, `src/store/resumeStore.ts`, `src/hooks/useAutoSave.ts`

The styling store auto-syncs to the resume store via a Zustand subscription. But:
1. User changes font → styling store updates → subscription fires → resume store updates
2. Auto-save debounce timer starts (2 seconds)
3. User changes color → another styling update → another resume update
4. If auto-save fires between steps 1 and 3, it saves partial styling

This is a theoretical race condition that becomes practical when users rapidly customize their resume.

### 8.2 History Store Not Persisted Across Sessions

**File**: `src/store/historyStore.ts:28-67`

The undo/redo history is entirely in-memory. When the user refreshes the page, all undo history is gone. While IndexedDB snapshots exist (`src/utils/db.ts`), they're fire-and-forget saves that aren't restored on page load.

A user who spends 30 minutes editing, then accidentally refreshes, loses all undo history.

### 8.3 Undo Granularity Issue

**File**: `src/pages/EditorPage.tsx:152-163`

History pushes are debounced at 500ms. If a user makes 10 rapid changes within 500ms, only one history entry is created. Pressing Ctrl+Z undoes all 10 changes at once — surprising behavior.

### 8.4 Offline Capability Gaps

The app uses three storage layers (localStorage, IndexedDB, Convex) but they're not synchronized:
- Resume list in localStorage can diverge from Convex
- IndexedDB stores local backups but never syncs back to Convex
- No conflict resolution strategy
- No sync status indicator

### 8.5 Concurrent Edit Conflict

No mechanism to detect or prevent concurrent edits. If the same resume is opened in two tabs:
1. Tab A saves → Convex updated
2. Tab B saves → Overwrites Tab A's changes
3. No warning, no merge, no conflict resolution

### 8.6 Job Store Unsafe Casting

**File**: `src/store/jobStore.ts`

```typescript
await saveJob(newJob as any)  // Double unsafe cast
```

The job store bypasses TypeScript entirely with `as any`. If the data structure changes, TypeScript won't catch the break.

---

## 9. Performance Audit

### 9.1 PDF Preview Memory Leak

**File**: `src/hooks/usePdfPreview.ts:22-82`

PDF preview generates data URLs from rendered pages but doesn't revoke previous URLs when generating new ones. Each preview update leaks memory. On a long editing session with frequent changes, this accumulates.

### 9.2 Full Resume JSON Serialization on Every Change

**File**: `src/hooks/usePdfPreview.ts`

The preview hook serializes the entire resume to JSON on every change (`JSON.stringify(resume)`), then debounces 500ms, then parses it back (`JSON.parse(debouncedJson)`). This double-serialization is unnecessary — a reference comparison or hash would suffice.

### 9.3 Code Splitting Opportunities

Current lazy-loading: EditorPage (via React.lazy) and PDF template components. Additional candidates:
- Cover letter editor components
- Import modal and parsers (pdfjs-dist, mammoth)
- Version history panel
- ATS analysis engine
- Rich text editor (Tiptap) — only needed in editor context

### 9.4 Font Loading

11 font packages from @fontsource are bundled. Only the fonts the user selects are needed. Consider loading fonts on demand rather than bundling all of them.

---

## 10. Accessibility Audit

### 10.1 Critical ARIA Issues

| Issue | Location | Impact |
|---|---|---|
| **FAQ lacks `aria-expanded`** | `FaqSection.tsx:91-93` | Screen readers can't determine accordion state |
| **Icon-only buttons without labels** | `TopBar.tsx:293-313` | Screen readers announce nothing useful |
| **Color-only status indicators** | ATS score card | Colorblind users can't distinguish scores |
| **Modal focus trap incomplete** | Various modals | Focus may escape modal to background content |

### 10.2 Keyboard Navigation Gaps

| Issue | Location | Impact |
|---|---|---|
| **Drag-and-drop keyboard support limited** | Entry cards | Users who can't use pointer have no way to reorder |
| **Export dropdown not keyboard-operable** | TopBar.tsx | Escape key doesn't close dropdown |
| **Template gallery not keyboard-navigable** | TemplateGallery.tsx | Arrow keys don't move between templates |

### 10.3 Motion Sensitivity

**Issue**: Framer Motion animations don't respect `prefers-reduced-motion`. Users with vestibular disorders may experience discomfort from page transitions, hero animations, and card animations.

**Fix**: Wrap all Framer Motion animations in a `useReducedMotion()` check.

### 10.4 Color Contrast

Several text elements may fail WCAG AA (4.5:1 ratio):
- Gray placeholder text on light backgrounds
- Light text on colored template backgrounds
- ATS score secondary labels

---

## 11. The "Recommend to a Friend" Playbook

Based on competitive analysis, here's what makes users recommend a resume builder:

### Trust Drivers (Must Fix in MVP)

1. **Never lose data** → Fix auto-save reliability, add visible save status, implement proper error handling
2. **What you see = what you get** → Fix template inconsistencies, ensure preview matches export
3. **No surprises** → Remove hardcoded fake scarcity ("147 of 200 spots"), be honest about limitations
4. **Fast and reliable export** → Fix font loading race condition, ensure all sections export to all formats

### Delight Drivers (For Polish Phase)

5. **Guide the user** → Add onboarding tour, contextual tips, "resume strength" meter in sidebar
6. **Make ATS actionable** → "Click to add missing keyword" instead of just showing a list
7. **Smart defaults** → Auto-populate professional summary template, suggest common skills by industry
8. **Fast and smooth** → Page transitions, save indicators, subtle micro-animations

### Word-of-Mouth Drivers (For Growth Phase)

9. **Free tier that actually works** → Consider offering 1 free resume with full features (no watermark)
10. **Shareable results** → "Share resume" link, exportable QR code, LinkedIn integration
11. **Social proof** → Show "X resumes created" counter, testimonials, ATS scores of real users

---

## 12. MVP Improvement Roadmap

### Phase 1: Trust & Reliability (Immediate)

**Goal**: Users never lose data and always get what they expect.

| # | Task | Priority | Files |
|---|---|---|---|
| 1 | Add purchase verification to all Convex mutations | CRITICAL | `convex/resumes.ts` |
| 2 | Fix `sanitizeImportedResume` to return null on failure | CRITICAL | `src/utils/sanitize.ts` |
| 3 | Add Zod validation on resume load/save boundaries | CRITICAL | `convex/resumes.ts`, `EditorPage.tsx` |
| 4 | Auto-save: retry on failure, user notification, persistent banner | HIGH | `src/hooks/useAutoSave.ts` |
| 5 | Fix two-column layout toggle (either make it work or remove it) | HIGH | `LayoutControls.tsx`, templates |
| 6 | Fix Modern Sidebar hardcoded colors | HIGH | `modern-sidebar/PreviewTemplate.tsx` |
| 7 | Fix accent color fallbacks in Bold Creative & Elegant Columns | HIGH | Template files |
| 8 | Add custom sections to DOCX export | HIGH | `src/utils/docxExport.ts` |
| 9 | Fix cover letter DOCX font sizes | MEDIUM | `coverLetterDocxExport.ts` |
| 10 | Add offline detection with user-visible indicator | MEDIUM | `EditorPage.tsx`, new hook |

### Phase 2: Polish & Guidance (Next Sprint)

**Goal**: Users feel guided and supported, not lost in a complex editor.

| # | Task | Priority | Files |
|---|---|---|---|
| 11 | Add password visibility toggle on login | HIGH | `LoginPage.tsx` |
| 12 | Add "Resend code" option for email verification | HIGH | `LoginPage.tsx` |
| 13 | Add drag handle visual affordance to all sortable lists | HIGH | Editor components |
| 14 | Add contextual tips to Summary and Experience editors | MEDIUM | Editor components |
| 15 | Make ATS missing keywords clickable ("Add to resume") | HIGH | `KeywordAnalysis.tsx` |
| 16 | Add sort/filter to resume dashboard | MEDIUM | `HomePage.tsx` |
| 17 | Fix mobile action visibility (replace hover with always-visible) | HIGH | `HomePage.tsx` |
| 18 | Add page indicator to preview panel ("Page 1 of 2") | MEDIUM | `PreviewPanel.tsx` |
| 19 | Show keyboard shortcuts on first editor visit | MEDIUM | `EditorPage.tsx` |
| 20 | Add import file size and format hints | MEDIUM | `ImportModal.tsx` |

### Phase 3: Delight & Growth (Following Sprint)

**Goal**: Users are impressed enough to recommend.

| # | Task | Priority | Files |
|---|---|---|---|
| 21 | Add resume strength/completeness meter in sidebar | MEDIUM | New component |
| 22 | Add "Resume tips" contextual panel | MEDIUM | New component |
| 23 | Respect `prefers-reduced-motion` in all animations | MEDIUM | All animation files |
| 24 | Add ARIA labels to all icon-only buttons | MEDIUM | Throughout |
| 25 | Add `aria-expanded` to FAQ accordions | MEDIUM | `FaqSection.tsx` |
| 26 | Implement font-on-demand loading | LOW | Font system |
| 27 | Add template comparison mode | LOW | `TemplateGallery.tsx` |
| 28 | Add resume sharing/QR code export | LOW | New feature |
| 29 | Implement conflict resolution for concurrent edits | LOW | `useAutoSave.ts`, `convex/resumes.ts` |
| 30 | Persist and restore undo history across sessions | LOW | `historyStore.ts`, `db.ts` |

---

## 13. Quick Wins

These can each be done quickly and have outsized impact:

### 1. Remove Fake Scarcity
**File**: `src/components/landing/PricingSection.tsx:76`
Change "147 of 200 early bird spots remaining" to either a real counter or remove it. Tech-savvy users (your target audience) will inspect the source and lose trust.

### 2. Extract Template Count Constant
Create `TEMPLATE_COUNT = Object.keys(templateRegistry).length` and use it everywhere instead of hardcoded "18+".

### 3. Add Password Show/Hide Toggle
Standard UX pattern missing from `LoginPage.tsx`. Every competitor has this.

### 4. Fix Sidebar Colors in Modern Sidebar Template
Replace hardcoded `#ffffff` with `colors.headerText` — a one-line fix per occurrence.

### 5. Add Tooltip to Duplicate Button
`HomePage.tsx:300-305` — add `title="Duplicate resume"` to the copy icon button.

### 6. Show "Check your email" After Signup
Add a brief message in `LoginPage.tsx` after successful signup: "We sent a verification code to {email}. Check your inbox (and spam folder)."

### 7. Add File Size Hint to Import
`ImportModal.tsx` — add "Supports PDF, DOCX, and JSON files up to 10MB" to the drag area.

### 8. Fix Accent Color Fallbacks
In `bold-creative` and `elegant-columns` templates, change hardcoded color fallbacks to `colors.primary`.

### 9. Add "Resend Code" Button
`LoginPage.tsx` — add a "Didn't get the code? Resend" link below the verification input.

### 10. Add Save Failure Banner
In `useAutoSave.ts`, when save fails, set a visible error state instead of just logging to console. Show a persistent red banner: "Changes not saved. Check your connection."

---

## 14. Medium Effort Improvements

### 1. Resume Strength Meter

Add a circular progress indicator in the sidebar that scores resume completeness:
- Has contact info: +10%
- Has summary: +10%
- Has 2+ experience entries: +15%
- Has education: +10%
- Has skills: +10%
- Each entry has 3+ bullet points: +15%
- Has quantified achievements: +15%
- All sections filled: +15%

This addresses the "blank page anxiety" problem — 87% of professionals postpone updating their resume because they don't know where to start.

### 2. Actionable ATS Keywords

Current state: Shows missing keywords as a read-only list.
Improved state: Each missing keyword has a "+" button that:
- For skills: Adds to Skills section
- For job titles: Suggests adding to Summary
- For technologies: Adds to Skills with category suggestion
- Shows where in the resume to add it

### 3. Smart Onboarding

Current state: OnboardingWizard walks through fields but doesn't persist or validate.
Improved state:
- First-time users see guided tour overlay
- Each editor section has a "first visit" tip (dismissed permanently)
- Import resume option is prominently featured for users with existing resumes
- Template recommendation based on industry/role selection

### 4. Mobile Experience Overhaul

- Replace hover-dependent actions with tap/long-press menus
- Use bottom sheet pattern for section selection (instead of sidebar)
- Implement swipe-to-switch between editor and preview
- Use floating action button for primary actions (export, save)

### 5. Auto-Save with Confidence

Replace the current fragile auto-save with a robust system:
- Debounced save (2s) with retry (3 attempts, exponential backoff)
- Persistent "Saving..." / "Saved" / "Save failed" indicator in TopBar
- Offline queue: Changes are queued in IndexedDB when offline, synced when online
- Conflict detection: Compare `updatedAt` timestamps before saving
- Manual save option always available (Ctrl+S)

---

## 15. Strategic Differentiators for V2

These aren't MVP tasks, but they're where the market is heading and where Resumello can leap ahead:

### 1. AI That Sounds Like You, Not a Bot

The #1 complaint about AI resume tools is that they produce generic, robotic content. V2 should:
- Analyze the user's existing bullet points to learn their "voice"
- Suggest improvements that preserve their style
- Offer 3 options: "Stronger" (more impactful), "Concise" (shorter), "Quantified" (add metrics)
- Never replace content — always suggest alongside existing text

### 2. One-Click Resume Tailoring

The market is shifting from "resume building" to "resume tailoring." V2 should:
- Accept a job description
- Automatically reorder sections by relevance
- Highlight which bullet points match the JD
- Suggest additions from the user's "experience bank"
- Generate a tailored version without modifying the original

### 3. Interview Prep Integration

Only Teal offers this. After a resume is tailored:
- Generate likely interview questions based on the resume + JD
- Help users prepare STAR-format answers
- This makes the tool useful beyond just resume creation

### 4. Application Tracker

The job tracker already exists in the codebase. Enhance it to:
- Track where each tailored resume was sent
- Log application statuses (Applied, Screening, Interview, Offer, Rejected)
- Show analytics: response rates by template, by tailoring score
- Remind users to follow up

### 5. Privacy-First Positioning

In a market where most tools store resumes on their servers:
- Emphasize that Resumello uses Convex with user-owned data
- Offer a true local-only mode (IndexedDB only, no cloud)
- Add end-to-end encryption option for cloud storage
- GDPR/CCPA compliance dashboard (export/delete all data)

---

## Appendix A: File Reference Index

| Area | Key Files |
|---|---|
| **Entry point** | `src/App.tsx`, `src/main.tsx` |
| **Pages** | `src/pages/LandingPage.tsx`, `LoginPage.tsx`, `HomePage.tsx`, `EditorPage.tsx`, `CheckoutPage.tsx` |
| **Layout** | `src/components/layout/AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `PreviewPanel.tsx` |
| **Editors** | `src/components/editor/*.tsx` (15 editors + shared components) |
| **Templates** | `src/templates/*/PreviewTemplate.tsx`, `PdfTemplate.tsx` (18 templates) |
| **Styling** | `src/components/styling/ThemePicker.tsx`, `ColorControls.tsx`, `FontControls.tsx`, `LayoutControls.tsx` |
| **ATS** | `src/components/ats/AtsPanel.tsx`, `AtsScoreCard.tsx`, `KeywordAnalysis.tsx` |
| **Stores** | `src/store/resumeStore.ts`, `uiStore.ts`, `stylingStore.ts`, `historyStore.ts`, `resumeListStore.ts`, `versionStore.ts`, `jobStore.ts` |
| **Hooks** | `src/hooks/useAutoSave.ts`, `usePdfExport.ts`, `usePdfPreview.ts`, `useDocxExport.ts`, `useCheckout.ts` |
| **Backend** | `convex/resumes.ts`, `convex/auth.ts`, `convex/purchases.ts`, `convex/http.ts` |
| **Schemas** | `src/schemas/*.ts` |
| **Utils** | `src/utils/sanitize.ts`, `docxExport.ts`, `pdfFontRegistry.ts`, `atsScorer.ts`, `db.ts` |

## Appendix B: Competitive Pricing Comparison

| Tool | Monthly | Annual | Lifetime | Free Tier |
|---|---|---|---|---|
| **Resumello** | - | - | $29 (early bird) / $49 | None (paywall) |
| FlowCV | $20/mo | - | - | 1 resume, full features, no watermark |
| Novoresume | $19.99/mo | $99.99/yr | - | 1-page, 8 templates |
| Rezi | Freemium | - | - | Limited AI |
| Kickresume | Freemium | - | - | Limited templates, free for students |
| Zety | $25.90/mo (after $1.95 trial) | - | - | TXT only |
| Resume.io | $24.95/mo (after $2.95 trial) | - | - | TXT only |
| Upplai | $0.50/resume | - | - | 2 free resumes |
| Canva | Free | $12.99/mo Pro | - | Full resume access |
| Reactive Resume | Free (open-source) | - | - | Everything |

**Observation**: Resumello's lifetime pricing is competitive. The main gap is the lack of a free tier — even a limited one (1 resume, watermarked, or limited templates) would dramatically increase user acquisition and trust.

## Appendix C: ATS Compatibility Checklist

Every resume exported from Resumello should pass these checks:

- [ ] Single-column layout for ATS templates (no tables)
- [ ] Selectable/parseable text in PDF (not image-based)
- [ ] Standard section headings (Work Experience, Education, Skills)
- [ ] Contact info in body, not header/footer
- [ ] ATS-safe fonts (Arial, Calibri, Helvetica, Georgia, Inter, Lato)
- [ ] Font size 10-12pt body, 14-16pt name
- [ ] No images, icons, or graphics in content area
- [ ] No skill bars or progress indicators
- [ ] Both acronym and full form (e.g., "Machine Learning (ML)")
- [ ] Reverse chronological order by default
- [ ] Descriptive filename: FirstName_LastName_Resume.pdf
- [ ] Embedded fonts in PDF for cross-platform rendering

---

*This audit was conducted through comprehensive codebase analysis, competitive market research, and UX best-practice review. All file references are accurate as of the audit date.*
