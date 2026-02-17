# ATS Scoring System - Master Upgrade Plan

> **Purpose**: This document is the single source of truth for the ATS scoring upgrade.
> Read this file at the start of EVERY phase to restore full context.
> Last updated: 2026-02-16

---

## TABLE OF CONTENTS

1. [App Overview](#app-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Current ATS Implementation (What Exists)](#current-ats-implementation)
4. [Complete Gap Analysis](#complete-gap-analysis)
5. [New Architecture (Target State)](#new-architecture)
6. [Phase 1: Implementation Plan](#phase-1-implementation-plan)
7. [Phase 2: Implementation Plan](#phase-2-implementation-plan)
8. [Phase 3: Implementation Plan](#phase-3-implementation-plan)
9. [Key File Locations](#key-file-locations)
10. [Data Models & Types](#data-models--types)
11. [Testing Strategy](#testing-strategy)
12. [Phase Completion Tracker](#phase-completion-tracker)

---

## APP OVERVIEW

**What is this app?**
A production-ready, full-featured Resume Builder web app with:
- 16 section types (Contact, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Volunteer, Awards, Publications, References, Hobbies, Affiliations, Courses, Custom Sections)
- 18 professional resume templates (2 ATS-optimized, 3 professional, 3 modern, 3 technical, 2 creative, 3 specialized, 2 academic)
- Real-time PDF preview + PDF/DOCX export
- Resume import from PDF/DOCX
- Cover letter editor + export
- ATS compatibility scoring (the system we're upgrading)
- Version control (snapshots, undo/redo)
- Job application tracker
- Cloud backend (Convex) with Google OAuth
- LemonSqueezy payment (monthly/lifetime plans)
- Full test suite (Vitest + Playwright)

**Our Role**: We are the ATS industry expert building an industry-leading scoring system that helps users pass through any major ATS (Taleo, Workday, iCIMS, Greenhouse, Lever, BambooHR, SmartRecruiters, Jobvite).

---

## TECH STACK & ARCHITECTURE

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| State | Zustand (7 stores) |
| Styling | Tailwind CSS 4 |
| PDF Export | @react-pdf/renderer |
| PDF Preview | pdfjs-dist |
| DOCX | docx (export) + mammoth (import) |
| Rich Text | Tiptap |
| Drag & Drop | @dnd-kit |
| Validation | Zod + react-hook-form |
| Backend | Convex (serverless) |
| Auth | Convex Auth (Google OAuth) |
| Payment | LemonSqueezy |
| Animations | Framer Motion |
| Testing | Vitest + @testing-library/react + Playwright |
| Analytics | Plausible + Sentry |

**Key Architecture Decisions:**
- All ATS scoring runs CLIENT-SIDE (no API calls) — privacy first
- Resume data stored in IndexedDB (client) + Convex (server sync)
- Templates are lazy-loaded React components
- State management via Zustand with middleware (history, persistence)

---

## CURRENT ATS IMPLEMENTATION

### Files That Exist

| File | Lines | Purpose |
|------|-------|---------|
| `src/utils/atsScorer.ts` | 595 | Core scoring algorithm (5 categories) |
| `src/constants/atsKeywords.ts` | 307 | 5 industry dictionaries + action verbs + best practices |
| `src/hooks/useAtsScore.ts` | 72 | React hook (debounce, memoize, loading state) |
| `src/components/ats/AtsPanel.tsx` | 119 | Main ATS sidebar panel (JD input, industry select, results) |
| `src/components/ats/AtsScoreCard.tsx` | ~60 | Circular SVG progress ring (0-100) |
| `src/components/ats/KeywordAnalysis.tsx` | 66 | Matched (green) / Missing (red) keyword badges |
| `src/components/ats/FormattingWarnings.tsx` | 98 | 5-category breakdown with progress bars + suggestions |
| `src/components/ats/index.ts` | ~5 | Barrel exports |
| `src/utils/__tests__/atsScorer.test.ts` | 229 | Unit tests for scoring |

### Current Scoring Model (100 points total)

| Category | Max Pts | How It Works |
|----------|---------|-------------|
| Keyword Match | 40 | `extractKeywords()` splits JD on whitespace, filters stop words (>2 chars), matches against `getResumeFullText()`. Uses TF-IDF. Falls back to industry keywords if no JD. |
| Formatting | 20 | Checks: experience/education/skills/summary sections exist (8 pts), any dates present (6 pts), email/phone/location exist (6 pts) |
| Content Quality | 20 | Summary length (5 pts), quantified achievements via regex (8 pts), action verb count (7 pts) |
| Section Completeness | 10 | Essential sections: name + experience + education + skills (8 pts), bonus sections 2+ of 6 types (2 pts) |
| Readability | 10 | Bullet count >= 6 (4 pts), avg bullet length 40-150 chars (3 pts), experience entries 2-6 (3 pts) |

### Current Constants
- **40 action verbs** (achieved, administered, analyzed, built, collaborated...)
- **70+ stop words** (a, an, the, and, or, but...)
- **5 industry keyword dictionaries** (mechanical, healthcare, electrical, software, creative) with 45-60 keywords each
- **12 ATS best practices** (single-column, standard headings, no images, etc.)

### Current Types

```typescript
// In atsScorer.ts
interface CategoryScore {
  score: number;
  maxScore: number;
  suggestions: string[];
}

interface AtsScoreBreakdown {
  keywordMatch: CategoryScore;
  formatting: CategoryScore;
  contentQuality: CategoryScore;
  sectionCompleteness: CategoryScore;
  readability: CategoryScore;
}

interface AtsScoreResult {
  score: number;           // 0-100
  breakdown: AtsScoreBreakdown;
  keywords: {
    matched: string[];     // Simple string arrays
    missing: string[];
  };
}
```

### Current extractKeywords() Logic (THE CORE PROBLEM)

```typescript
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)                          // ← PROBLEM: splits on whitespace only
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));  // ← PROBLEM: single words only
  return [...new Set(words)];
}
```

This means:
- "project management" → ["project", "management"] (2 separate words, not 1 phrase)
- "machine learning" → ["machine", "learning"] (2 separate words)
- "React Native" → ["react", "native"] ("native" matches anything)
- No synonym handling: "JS" in resume won't match "JavaScript" in JD

### Current getResumeFullText() - Collects All Resume Text

Concatenates: contact.title + summary.text + all experience (company, position, description, highlights) + all education + all skills (category + items) + all projects (name, description, technologies, highlights) + all certifications + all languages + all volunteer + all awards + all publications. Returns single string.

### Current UI Flow

1. User opens ATS tab in sidebar (`sidebarTab: 'ats'` in uiStore)
2. AtsPanel renders: industry dropdown + JD textarea + Analyze button
3. On "Analyze" click → sets `analyzedDescription` → triggers `useAtsScore` hook
4. Hook debounces (500ms) → calls `computeAtsScore()` → returns result
5. UI renders: AtsScoreCard (circle) + KeywordAnalysis (badges) + FormattingWarnings (breakdown)

---

## COMPLETE GAP ANALYSIS

### CRITICAL GAPS (Breaking Accuracy)

**GAP 1: No Multi-Word Phrase Matching**
- "project management" should be ONE skill, not two words
- "machine learning", "data analysis", "React Native", "Amazon Web Services" are all compound phrases
- Need: bigram + trigram extraction from JD, matched as complete phrases against resume

**GAP 2: No Synonym / Abbreviation Resolution**
- JS ↔ JavaScript, TS ↔ TypeScript, ML ↔ Machine Learning, k8s ↔ Kubernetes
- AWS ↔ Amazon Web Services, GCP ↔ Google Cloud Platform, UI ↔ User Interface
- DB ↔ Database, CI/CD ↔ Continuous Integration/Continuous Deployment
- PM ↔ Project Management, QA ↔ Quality Assurance, OOP ↔ Object-Oriented Programming
- Need: 500+ bidirectional synonym mappings

**GAP 3: No JD Section Parsing**
- All JD text treated as flat bag of words — no structure parsing
- Need: detect "Required:", "Preferred:", "Responsibilities:", "Qualifications:" sections
- Weight: required keywords 3x, title keywords 4x, preferred 1x, responsibilities 1.5x

### HIGH SEVERITY GAPS

**GAP 4: No Experience Year Calculation**
- JD says "5+ years of Python" — we never check if resume shows 5 years
- Need: calculate total years from date ranges, compare against JD requirements
- Detect seniority level mismatches

**GAP 5: No Education Requirement Matching**
- JD says "Bachelor's required, Master's preferred" — we never check
- Need: extract degree level + field from both JD and resume, compare

**GAP 6: No Hard Skill vs Soft Skill Differentiation**
- "Kubernetes" and "leadership" weighted equally — wrong
- Hard skills should be 3-4x weight of soft skills in ATS context
- Need: skill classification into hard/soft/certification/education categories

### MEDIUM SEVERITY GAPS

**GAP 7: No Keyword Placement Scoring**
- Keyword in title/summary should be worth 2-3x keyword buried in old experience
- Need: track WHERE each keyword appears, apply location multipliers

**GAP 8: No Accomplishment vs Responsibility Detection**
- "Responsible for managing team" (weak) vs "Led team of 8 to deliver $2M project" (strong)
- Need: detect STAR pattern, passive vs active voice, duty vs achievement language

**GAP 9: Only 5 Industries**
- Missing: Finance, Marketing, Legal, Education, Data Science, HR, Sales, Operations, Consulting, Government, Product Management, Cybersecurity, Biotech, Hospitality, Retail, Construction
- Need: 20+ industry dictionaries

**GAP 10: No ATS Parseability Warnings**
- No Unicode character warnings, special bullet characters, page count analysis
- No template-specific ATS compatibility warnings
- Need: format safety checks that mirror what real ATS parsers choke on

### LOW SEVERITY GAPS

**GAP 11: No Recency Weighting** — recent skills/experience should count more
**GAP 12: No Score Contextualization** — no "what this score means" or priority-ranked actions

---

## NEW ARCHITECTURE

### New Scoring Model: 10 Dimensions, 100 Points

| # | Dimension | Max Pts | Replaces/Extends |
|---|-----------|---------|-----------------|
| 1 | Hard Skill Match | 25 | Part of old keywordMatch (40) |
| 2 | Soft Skill Match | 5 | Part of old keywordMatch (40) |
| 3 | Experience Alignment | 15 | NEW |
| 4 | Education Fit | 5 | NEW |
| 5 | Keyword Optimization | 10 | Enhanced from old keywordMatch |
| 6 | Content Impact | 15 | Enhanced from old contentQuality (20) |
| 7 | ATS Parseability | 10 | Enhanced from old formatting (20) |
| 8 | Section Structure | 5 | From old sectionCompleteness (10) |
| 9 | Readability | 5 | From old readability (10) |
| 10 | Tailoring Signals | 5 | NEW |

### New Types (Target State)

```typescript
// Keyword with rich metadata
interface KeywordMatch {
  keyword: string;
  category: 'hard_skill' | 'soft_skill' | 'certification' | 'education' | 'industry_term';
  source: 'required' | 'preferred' | 'responsibilities' | 'title' | 'general';
  frequency: number;           // Times found in resume
  locations: string[];         // 'title' | 'summary' | 'skills' | 'experience_recent' | 'experience_old' | 'education' | 'projects' | 'certifications'
  weight: number;              // Computed importance (source weight × category weight × location multiplier)
  synonymUsed?: string;        // If matched via synonym (e.g., keyword="JavaScript", synonymUsed="JS")
  isPhrase: boolean;           // True if multi-word (e.g., "project management")
}

// Priority-ranked action item
interface PrioritizedAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;            // Which scoring dimension
  action: string;              // What to do
  impact: string;              // "Could improve score by ~X points"
  section: string;             // Which resume section to edit
}

// Enhanced result
interface AtsScoreResult {
  score: number;               // 0-100
  confidence: 'high' | 'medium' | 'low';   // Based on JD quality/length
  passLikelihood: string;      // "Strong pass", "Likely pass", "At risk", "Unlikely to pass"
  breakdown: AtsScoreBreakdown;             // 10 categories
  keywords: {
    matched: KeywordMatch[];
    missing: KeywordMatch[];
    partial: KeywordMatch[];   // Synonym matches
  };
  requirements: {
    yearsRequired: number | null;
    yearsOnResume: number;
    degreeRequired: string | null;
    degreeOnResume: string | null;
    certificationsRequired: string[];
    certificationsMatched: string[];
    certificationsMissing: string[];
  };
  prioritizedActions: PrioritizedAction[];
}
```

### Backward Compatibility Strategy

The existing UI components (AtsScoreCard, KeywordAnalysis, FormattingWarnings) expect:
- `score: number`
- `breakdown` with 5 named categories, each having `score`, `maxScore`, `suggestions`
- `keywords.matched: string[]` and `keywords.missing: string[]`

**Strategy**: The new scorer returns the enhanced result. We add an adapter function `toLegacyBreakdown()` that maps the 10 new categories into the 5 old ones for the existing UI. Then we incrementally upgrade the UI components to use the richer data.

OR (better): We update the UI at the same time — the FormattingWarnings component already reads from `breakdown` dynamically via the `CATEGORIES` array config. We just change that config to have 10 entries instead of 5.

---

## PHASE 1: IMPLEMENTATION PLAN

**Goal**: Fix the 3 most critical scoring accuracy issues + expand industries + add priority suggestions.

### Phase 1 Deliverables

#### 1.1 N-Gram Phrase Matching (`atsScorer.ts`)
- New function: `extractPhrases(text: string): string[]`
  - Extract 1-grams, 2-grams, and 3-grams
  - Normalize whitespace, lowercase, trim
  - Filter against known skill phrases from a curated list
  - Return unique phrases
- Update `scoreKeywordMatch()` to match phrases, not just single words
- Match logic: exact phrase match > partial word match

#### 1.2 Synonym Dictionary (`src/constants/atsSynonyms.ts`)
- New file with 500+ bidirectional mappings organized by category
- Structure: `Map<string, string[]>` where key = canonical form, values = all synonyms
- Helper: `resolvesynonyms(keyword: string): string[]` — returns all forms of a keyword
- Categories: Programming languages, frameworks, tools, methodologies, certifications, soft skills, industry terms
- Integration: when matching keyword X from JD, also check all synonyms of X in resume

#### 1.3 JD Section Parser (`src/utils/jdParser.ts`)
- New file: parses job description into structured sections
- Detect sections via regex patterns:
  - Title: first line or "Job Title:", "Position:", "Role:"
  - Required: "Required", "Must Have", "Requirements", "Qualifications", "What You Need"
  - Preferred: "Preferred", "Nice to Have", "Bonus", "Plus", "Desired"
  - Responsibilities: "Responsibilities", "What You'll Do", "Duties", "Role Overview"
  - About: "About Us", "Company", "Who We Are"
- Return: `ParsedJobDescription` with title, sections, and extracted requirements
- Extract: years of experience ("5+ years", "3-5 years"), degree requirements, certification requirements

#### 1.4 Expanded Industry Keywords (`atsKeywords.ts`)
- Add 15+ new industries:
  - Finance & Banking
  - Marketing & Digital Marketing
  - Data Science & Analytics
  - Human Resources
  - Sales & Business Development
  - Legal
  - Education & Teaching
  - Product Management
  - Cybersecurity
  - Operations & Supply Chain
  - Consulting
  - Government & Public Sector
  - Biotech & Pharmaceutical
  - Hospitality & Food Service
  - Retail & E-commerce
  - Construction & Trades

#### 1.5 Priority-Ranked Suggestions
- New function: `prioritizeActions(breakdown, keywords, requirements): PrioritizedAction[]`
- Priority logic:
  - CRITICAL: Missing required keywords, missing required degree, years gap
  - HIGH: Low keyword match ratio, no quantified achievements, missing essential sections
  - MEDIUM: Missing preferred keywords, few action verbs, bullet length issues
  - LOW: Missing bonus sections, minor formatting improvements
- Each action includes: what to do, which section to edit, estimated impact

#### 1.6 Updated Scoring Weights
- Adjust the 5-category model to account for new capabilities:
  - Keyword Match stays 40 but now uses phrases + synonyms + JD section weights
  - All other categories stay the same for Phase 1
- The 10-category model is for Phase 2

#### 1.7 Updated UI Components
- KeywordAnalysis: add "Partial Matches" section (synonym matches) with blue badges
- FormattingWarnings: add priority indicators (colored dots) next to suggestions
- AtsPanel: show pass likelihood label under score
- AtsPanel: show JD parsing quality indicator ("We detected X required skills, Y preferred")

#### 1.8 Updated Tests
- New tests for n-gram extraction
- New tests for synonym matching
- New tests for JD parsing
- New tests for priority ranking
- Update existing tests that may break with new logic

### Phase 1 Files to Create
- `src/constants/atsSynonyms.ts` (synonym dictionary)
- `src/utils/jdParser.ts` (JD section parser)

### Phase 1 Files to Modify
- `src/utils/atsScorer.ts` (core scoring — major rewrite of keyword matching)
- `src/constants/atsKeywords.ts` (add 15+ industries)
- `src/hooks/useAtsScore.ts` (pass new data types through)
- `src/components/ats/AtsPanel.tsx` (show new UI elements)
- `src/components/ats/KeywordAnalysis.tsx` (add partial matches section)
- `src/components/ats/FormattingWarnings.tsx` (add priority indicators)
- `src/components/ats/AtsScoreCard.tsx` (add pass likelihood label)
- `src/utils/__tests__/atsScorer.test.ts` (update + add tests)

---

## PHASE 2: IMPLEMENTATION PLAN

**Goal**: Add experience/education matching, skill classification, keyword placement scoring, expand to 10-dimension model.

### Phase 2 Deliverables
- 2.1: Experience year calculator + JD year requirement matching
- 2.2: Education requirement matching (degree level + field)
- 2.3: Hard skill vs soft skill classifier
- 2.4: Keyword placement/location scoring (title > summary > skills > experience)
- 2.5: Migrate from 5-category to 10-category scoring model
- 2.6: Update all UI components for 10 categories
- 2.7: Score confidence level + contextualized labels
- 2.8: Full test coverage for new dimensions

---

## PHASE 3: IMPLEMENTATION PLAN

**Goal**: Advanced content analysis, parseability warnings, recency weighting, polish.

### Phase 3 Deliverables
- 3.1: STAR pattern detection in bullet points
- 3.2: Accomplishment vs responsibility language detection
- 3.3: ATS parseability warnings (Unicode, special chars, page count, template compatibility)
- 3.4: Keyword density scoring (multiple mentions across contexts)
- 3.5: Recency weighting for experience and skills
- 3.6: Passive voice detection + suggestions
- 3.7: Final UI polish (animated transitions, tooltips, help text)
- 3.8: Comprehensive E2E tests

---

## KEY FILE LOCATIONS

### ATS-Specific Files
```
src/utils/atsScorer.ts              ← Core scoring algorithm
src/constants/atsKeywords.ts        ← Industry keyword dictionaries
src/hooks/useAtsScore.ts            ← React hook for ATS scoring
src/components/ats/AtsPanel.tsx     ← Main ATS sidebar UI
src/components/ats/AtsScoreCard.tsx ← Circular score display
src/components/ats/KeywordAnalysis.tsx ← Keyword badges
src/components/ats/FormattingWarnings.tsx ← Category breakdown
src/components/ats/index.ts         ← Barrel exports
src/utils/__tests__/atsScorer.test.ts ← Tests
```

### Supporting Files
```
src/types/resume.ts                 ← ResumeData, ContactData, ExperienceEntry, etc.
src/types/styling.ts                ← ResumeStyling types
src/store/resumeStore.ts            ← Zustand store (currentResume state)
src/store/uiStore.ts                ← UI state (sidebarTab: 'ats')
src/components/layout/Sidebar.tsx   ← Contains ATS tab trigger
src/components/ui/Badge.tsx         ← Used for keyword badges
src/components/ui/ProgressRing.tsx  ← Used in score card
src/test/fixtures.ts                ← Test data (mockResumeData, createEmptyResumeData)
src/hooks/useDebounce.ts            ← Used by useAtsScore
```

### Resume Data Type Reference (`src/types/resume.ts`)

```typescript
interface ResumeData {
  contact: {
    firstName: string; lastName: string; email: string; phone: string;
    location: string; website: string; linkedin: string; github: string;
    portfolio: string; title: string;
  };
  summary: { text: string };
  experience: Array<{
    id: string; company: string; position: string; location: string;
    startDate: string; endDate: string; current: boolean;
    description: string; highlights: string[];
  }>;
  education: Array<{
    id: string; institution: string; degree: string; field: string;
    startDate: string; endDate: string; gpa: string;
    description: string; highlights: string[];
  }>;
  skills: Array<{ id: string; category: string; items: string[] }>;
  projects: Array<{
    id: string; name: string; description: string;
    technologies: string[]; url: string;
    startDate: string; endDate: string; highlights: string[];
  }>;
  certifications: Array<{
    id: string; name: string; issuer: string;
    date: string; expiryDate: string; credentialId: string; url: string;
  }>;
  languages: Array<{ id: string; name: string; proficiency: string }>;
  volunteer: Array<{
    id: string; organization: string; role: string;
    startDate: string; endDate: string;
    description: string; highlights: string[];
  }>;
  awards: Array<{ id: string; title: string; issuer: string; date: string; description: string }>;
  publications: Array<{ id: string; title: string; publisher: string; date: string; url: string; description: string }>;
  references: Array<{ id: string; name: string; title: string; company: string; email: string; phone: string; relationship: string }>;
  hobbies: { items: string[] };
  affiliations: Array<{ id: string; organization: string; role: string; startDate: string; endDate: string }>;
  courses: Array<{ id: string; name: string; institution: string; completionDate: string; description: string }>;
  customSections: Array<{ id: string; title: string; entries: Array<{ id: string; subtitle: string; date: string; description: string; highlights: string[] }> }>;
}
```

---

## DATA MODELS & TYPES

### IndustryId Type (Current → Will Expand)

```typescript
// Current (5)
type IndustryId = 'mechanical' | 'healthcare' | 'electrical' | 'software' | 'creative';

// Target (20+)
type IndustryId =
  | 'mechanical' | 'healthcare' | 'electrical' | 'software' | 'creative'
  | 'finance' | 'marketing' | 'data_science' | 'human_resources' | 'sales'
  | 'legal' | 'education' | 'product_management' | 'cybersecurity'
  | 'operations' | 'consulting' | 'government' | 'biotech'
  | 'hospitality' | 'retail' | 'construction';
```

### Synonym Dictionary Structure

```typescript
// Each entry: canonical form → all synonyms (including itself)
const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
  'typescript': ['typescript', 'ts'],
  'python': ['python', 'py', 'python3'],
  'kubernetes': ['kubernetes', 'k8s'],
  'machine learning': ['machine learning', 'ml', 'machine-learning'],
  'artificial intelligence': ['artificial intelligence', 'ai', 'a.i.'],
  // ... 500+ more
};
```

### JD Parser Output Structure

```typescript
interface ParsedJobDescription {
  title: string;
  sections: {
    required: string;
    preferred: string;
    responsibilities: string;
    about: string;
    fullText: string;
  };
  extractedRequirements: {
    yearsOfExperience: number | null;   // e.g., 5 from "5+ years"
    degreeLevel: string | null;          // "bachelor" | "master" | "phd" | "associate"
    degreeField: string | null;          // "computer science", "engineering", etc.
    certifications: string[];            // ["PMP", "AWS Certified", etc.]
  };
}
```

---

## TESTING STRATEGY

### Existing Test Infrastructure
- **Framework**: Vitest
- **Test file**: `src/utils/__tests__/atsScorer.test.ts` (229 lines, 13 tests)
- **Fixtures**: `src/test/fixtures.ts` (mockResumeData, createEmptyResumeData)
- **Run**: `npm test` or `npx vitest run`

### New Tests Needed (Phase 1)

```
src/utils/__tests__/atsScorer.test.ts     ← Update existing + add new
src/utils/__tests__/jdParser.test.ts       ← NEW: JD parsing tests
src/constants/__tests__/atsSynonyms.test.ts ← NEW: Synonym resolution tests
```

### Test Scenarios for Phase 1
1. N-gram: "project management" matches as phrase, not separate words
2. N-gram: "machine learning engineer" extracts ["machine learning", "engineer", "machine learning engineer"]
3. Synonym: resume says "JS", JD says "JavaScript" → matched
4. Synonym: resume says "k8s", JD says "Kubernetes" → matched
5. Synonym: bidirectional — both directions work
6. JD Parser: detects "Required Qualifications:" section
7. JD Parser: detects "Nice to Have:" section
8. JD Parser: extracts "5+ years" as yearsOfExperience: 5
9. JD Parser: extracts "Bachelor's degree in Computer Science" correctly
10. JD Parser: handles JDs without clear section headers (graceful fallback)
11. Priority: missing required keyword = critical priority
12. Priority: missing preferred keyword = medium priority
13. Scoring: phrase match gives higher score than word-only match
14. Scoring: synonym match counts toward score
15. Industries: all 20+ industries have valid keyword arrays
16. Backward compat: old test cases still pass (scores may change slightly but structure intact)

---

## PHASE COMPLETION TRACKER

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| Phase 1 | NOT STARTED | - | - | N-grams, synonyms, JD parser, industries, priority suggestions |
| Phase 2 | NOT STARTED | - | - | Experience/education matching, skill classification, 10-dim model |
| Phase 3 | NOT STARTED | - | - | STAR detection, parseability, recency, polish |

### Phase 1 Sub-task Tracker

| Task | Status | Notes |
|------|--------|-------|
| 1.1 N-Gram Phrase Matching | NOT STARTED | |
| 1.2 Synonym Dictionary | NOT STARTED | |
| 1.3 JD Section Parser | NOT STARTED | |
| 1.4 Expanded Industries (15+) | NOT STARTED | |
| 1.5 Priority-Ranked Suggestions | NOT STARTED | |
| 1.6 Updated Scoring Weights | NOT STARTED | |
| 1.7 Updated UI Components | NOT STARTED | |
| 1.8 Updated Tests | NOT STARTED | |

---

## IMPORTANT IMPLEMENTATION NOTES

1. **All scoring is client-side** — no API calls, no network requests. Users paste sensitive JDs.
2. **Performance target**: Full scoring computation under 50ms for typical resume + JD.
3. **Synonym dictionary is a static Map** — O(1) lookup, no runtime cost.
4. **N-gram extraction is O(n)** where n = word count. Pre-filter against known phrases for efficiency.
5. **Backward compatibility**: The `useAtsScore` hook return type must remain compatible with existing UI components during transition. Add new fields, don't remove old ones.
6. **The ATS panel is in the sidebar** — limited width (~300px). UI must be compact.
7. **Badge component** supports variants: green, red, blue, yellow, gray. We can use blue for synonym/partial matches.
8. **ProgressRing** component is already used for the circular score display.
9. **Test fixtures** in `src/test/fixtures.ts` — `mockResumeData` has a full resume (software engineer) with experience, education, skills, projects, certs, volunteer, awards, publications.
10. **Dates in resume** are strings like "2020-01", "2023-06", "Present" or empty string.
11. **Rich text**: Some fields (description, highlights) may contain HTML from Tiptap editor. Strip HTML tags before keyword matching.
12. **The `getResumeFullText()` function** already collects all text — extend it, don't replace it.
