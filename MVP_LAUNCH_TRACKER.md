# Resumello MVP Launch Reference

## Project Overview
- **Product:** Resumello — professional resume builder with ATS scoring
- **Domain:** resumello.app
- **Stack:** React 19 + Convex (BaaS) + Tailwind CSS 4 + Vite 7 + LemonSqueezy payments
- **Auth:** Convex Auth (email OTP via Resend + Google OAuth)
- **State:** Zustand (6 stores: resumeStore, uiStore, resumeListStore, stylingStore, historyStore, versionStore, jobStore)
- **Templates:** 18 resume templates across 8 categories in src/templates/
- **Build:** `npm run build` — compiles in ~13s, code-split (react-pdf, dnd-kit, framer, docx, tiptap chunks)

## Key File Locations
- Entry: src/main.tsx, src/App.tsx
- Pages: src/pages/ (LandingPage, LoginPage, HomePage, EditorPage, CheckoutPage)
- Components: src/components/ (ui/, editor/, landing/, layout/, styling/, ats/, templates/, versioning/, import/, onboarding/)
- Stores: src/store/ (resumeStore.ts, uiStore.ts, resumeListStore.ts, stylingStore.ts, historyStore.ts, versionStore.ts, jobStore.ts)
- Types: src/types/ (resume.ts, styling.ts, coverLetter.ts, versioning.ts, template.ts)
- Schemas: src/schemas/ (Zod validation for all 16 sections + index.ts)
- Utils: src/utils/ (db.ts, fileIO.ts, docxParser.ts, docxExport.ts, pdfParser.ts, atsScorer.ts, analytics.ts, etc.)
- Hooks: src/hooks/ (useAutoSave, usePdfExport, useDocxExport, useCheckout, usePurchase, useAtsScore, etc.)
- Backend: convex/ (schema.ts, resumes.ts, purchases.ts, auth.ts, http.ts)
- Constants: src/constants/ (sectionDefaults.ts, colorThemes.ts, fonts.ts, atsKeywords.ts, sampleData.ts)
- Landing sections: src/components/landing/ (Navbar, HeroSection, PricingSection, FeatureGrid, AtsSection, FounderStory, FaqSection, Footer, etc.)

## Routes
- / → LandingPage (PublicRoute)
- /login → LoginPage (PublicRoute)
- /checkout → CheckoutPage (AuthGuard)
- /dashboard → HomePage (AuthGuard + PurchaseGuard)
- /editor/:resumeId → EditorPage (AuthGuard + PurchaseGuard, lazy-loaded)

## Payment Flow
- LemonSqueezy checkout IDs in src/hooks/useCheckout.ts
- Monthly: $12.99/month | Lifetime: $29 (early bird, regular $49)
- Webhook at convex/http.ts → /webhooks/lemonsqueezy
- Purchase status via convex/purchases.ts → getActivePurchase query

---

## MVP LAUNCH TASK TRACKER

### TIER 1 — LAUNCH BLOCKERS (must complete before launch)

- [ ] **1.3 — Create /terms page** (~2hr)
  - Create src/pages/TermsPage.tsx, add route in App.tsx
  - Must include: service description, payment terms (one-time = lifetime, month pass = monthly), refund policy (7-day, max 1 per payment method), account terms, content policy, data deletion rights, liability limitation, AI disclaimer (V2), termination clause, modification clause (30-day notice)

- [ ] **1.4 — Create /privacy page** (~2hr)
  - Create src/pages/PrivacyPage.tsx, add route in App.tsx
  - Must include: data collected (name, email, resume content, payment metadata), storage (Convex, encrypted at rest), no selling/ads/cross-tracking, Plausible analytics (cookie-free), third-party services (Convex, LemonSqueezy, Sentry, Cloudflare), retention policy, GDPR rights, CCPA rights, deletion process (email hello@resumello.app or in-app), breach notification (72hr GDPR), contact info, effective date

- [ ] **1.5 — Add 404 catch-all route** (~20min)
  - Create src/pages/NotFoundPage.tsx
  - Add `<Route path="*" element={<NotFoundPage />} />` in App.tsx
  - Style: "Page not found" heading, brief message, "Go to homepage" button

- [ ] **1.6 — Fix index.html title** (~2min)
  - File: index.html line 6
  - Change: `<title>Resume Builder</title>` → `<title>Resumello — Professional Resume Builder</title>`
  - Add: `<meta name="description" content="ATS-optimized resume templates. PDF and Word export. Built-in ATS scoring. One-time payment. No subscriptions.">`

- [ ] **1.7 — Fix analytics domain** (~2min)
  - File: src/utils/analytics.ts line 9
  - Change: `'resume-builder.app'` → `'resumello.app'`

- [ ] **1.8 — Fix or remove early bird counter** (~30min)
  - Files: src/components/landing/HeroSection.tsx, PricingSection.tsx, FinalCta.tsx
  - "147 of 200 spots remaining" is hardcoded — never updates, provably fake after sales
  - Recommendation: Option B — keep early bird pricing, remove counter, say "Early bird pricing — limited time"

- [ ] **1.9 — Fix reorder non-null assertions** (~15min)
  - File: src/store/resumeStore.ts lines 211, 251, 299, 339
  - Current: `ids.map((id) => r.data.experience.find((e) => e.id === id)!)`
  - Fix: `ids.map((id) => r.data.experience.find((e) => e.id === id)).filter((e): e is ExperienceEntry => e !== undefined)`
  - Affects: experience, education, projects, volunteer reorder functions

- [ ] **1.10 — Add portfolio URL to PDF and DOCX export** (~1-2hr)
  - All 18 PDF templates in src/templates/*/PdfTemplate.tsx — add portfolio alongside website/LinkedIn/GitHub
  - src/utils/docxExport.ts line ~27 — add portfolio to contact info string
  - Check each template individually

### TIER 2 — SHOULD FIX BEFORE LAUNCH

- [ ] **2.1 — Custom section support in DOCX export** (~1-2hr) — File: src/utils/docxExport.ts
- [ ] **2.2 — File size validation on imports** (~30min) — File: src/hooks/useFileImport.ts — max 25MB
- [ ] **2.3 — Enforce JSON import schema validation** (~30min) — File: src/utils/fileIO.ts lines 64-71
- [ ] **2.4 — Toast notifications on export failure** (~15min) — File: src/pages/EditorPage.tsx lines 100, 109
- [ ] **2.5 — Add favicon** (~15min) — Add favicon.ico + favicon.svg to public/, link in index.html
- [ ] **2.6 — Add OG image for social sharing** (~1hr) — 1200x630 og-image.png in public/, meta tags in LandingPage.tsx
- [ ] **2.7 — Content Security Policy headers** (~30min) — via Cloudflare or meta tag in index.html
- [ ] **2.8 — Fix unsafe JSON.parse in EditorPage** (~30min) — File: src/pages/EditorPage.tsx line 52 — wrap in try/catch + safeParse
- [ ] **2.9 — Update structured data pricing** (~5min) — File: src/pages/LandingPage.tsx line 82 — "Monthly subscription" → "Monthly pass"
- [ ] **2.10 — Create .env.example** (~10min)

### TIER 3 — FIX WITHIN FIRST WEEK POST-LAUNCH

- [ ] **3.1 — Memoize template components** (~1-2hr) — React.memo() on all 36 template components
- [ ] **3.2 — Lazy-load templates** (~2-3hr) — Dynamic imports in src/templates/index.ts
- [ ] **3.3 — Auto-save retry mechanism** (~1-2hr) — 3 retries with exponential backoff in useAutoSave.ts
- [ ] **3.4 — localStorage quota warning** (~30min) — Toast on quota exceeded in resumeListStore.ts
- [ ] **3.5 — Increase error toast timeout** (~5min) — Error toasts 6s, warning 5s, success 3s
- [ ] **3.6 — Capitalize mobile tab names** (~5min) — File: src/components/layout/AppShell.tsx line 103
- [ ] **3.7 — Null-checks on DOCX date fields** (~30min) — File: src/utils/docxExport.ts lines 63, 70, 96
- [ ] **3.8 — Fix IndexedDB history deletion** (~1hr) — File: src/utils/db.ts lines 82-94
- [ ] **3.9 — Version history pagination** (~1-2hr) — Load last 20 versions, add "Load more"

### TIER 4 — SECURITY (pre-launch critical items marked with *)

- [ ] ***4.1 — Cap resumes per account** (~30min) — convex/resumes.ts create mutation, max 25
- [ ] **4.3 — Rate limit signups by IP** (~1hr) — Cloudflare rate limiting rule
- [ ] **4.4 — Email verification before full access** (~1-2hr)
- [ ] **4.5 — Consistent login error messages** (~30min) — "Invalid email or password" for all cases
- [ ] **4.6 — Server-side price enforcement** (~30min verification) — Confirm LemonSqueezy handles pricing server-side
- [ ] **4.7 — Limit concurrent sessions** (~1-2hr) — Max 3 sessions per user
- [ ] **4.8 — "Delete my account" button** (~1-2hr) — GDPR requirement
- [ ] **4.9-4.18 — Post-launch security items** (see LAUNCH_CHECKLIST.md for details)

### TIER 5 — MEDIUM-TERM (first month post-launch)
- [ ] 5.1 Dark mode | 5.2 Date pickers | 5.3 Collapsed section summaries | 5.4 Faster onboarding | 5.5 Resume completeness score

---

## Completed Items
- [x] 1.1 — Reframe monthly subscription messaging
- [x] 1.2 — Fix founder name (changed to "Kashyap")

## Working Order (suggested)
1. Quick wins: 1.6 (title), 1.7 (analytics), 1.5 (404), 1.9 (reorder fix)
2. Legal: 1.3 (terms), 1.4 (privacy)
3. Data integrity: 1.10 (portfolio export), 2.8 (safe JSON.parse)
4. Credibility: 1.8 (early bird counter)
5. Polish: 2.4 (export toasts), 2.5 (favicon), 2.9 (structured data)
6. Security: 4.1 (resume cap), 2.2 (file size validation)
7. Remaining Tier 2 items
8. Tier 3 post-launch items
