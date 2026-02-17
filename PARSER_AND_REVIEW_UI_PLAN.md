# Resume Parser Upgrade + Import Review UI — Master Plan

> **Purpose**: This document provides complete context for implementing parser improvements and a new import review UI. Read this document at the start of each session to understand the full scope, current state, design decisions, and implementation details.

---

## Table of Contents

1. [Why This Exists](#1-why-this-exists)
2. [Current Import Flow (Before)](#2-current-import-flow-before)
3. [Current Parser Problems](#3-current-parser-problems)
4. [Parser Improvements (Phase 1)](#4-parser-improvements-phase-1)
5. [Review UI Design (Phases 2-4)](#5-review-ui-design-phases-2-4)
6. [The Merged Job Problem](#6-the-merged-job-problem)
7. [Phasing & Implementation Order](#7-phasing--implementation-order)
8. [File Map & Architecture](#8-file-map--architecture)
9. [Type Definitions Reference](#9-type-definitions-reference)
10. [Design Principles & UX Rules](#10-design-principles--ux-rules)
11. [Implementation Details Per Phase](#11-implementation-details-per-phase)
12. [Verification Checklist](#12-verification-checklist)

---

## 1. Why This Exists

The resume import feature lets users upload a PDF/DOCX and have it parsed into structured resume data. The current parser is a 723-line regex/heuristic-based system (`src/utils/resumeParser.ts`) that:

- **Misses data silently** — 6 section types are detected but never extracted (projects, volunteer, awards, publications, languages, references)
- **Misclassifies fields** — swaps position/company, merges separate jobs into one entry, loses contact info
- **Has no way to recover** — once data is parsed wrong, the user must manually re-enter it in the main editor
- **No dark mode** on the import preview

The fix is two-pronged:
1. **Make the parser smarter** — fuzzy matching, better heuristics, handle more sections
2. **Make mistakes fixable** — a new review UI where users can see what was parsed, fix errors, rescue dropped content, split/merge entries

**No AI/LLM is used** — this is an MVP launch without AI integration.

---

## 2. Current Import Flow (Before)

### User Journey
```
User clicks "Import" in TopBar
  → ImportModal opens (drag-and-drop upload)
  → User drops PDF/DOCX file
  → useFileImport hook reads file → extracts text → parses → sanitizes
  → ImportPreview component shows parsed data in form fields
  → User edits fields manually
  → User clicks "Apply to Resume"
  → Data merged into resumeStore → modal closes
```

### Files Involved (current)
| File | Role | Lines |
|---|---|---|
| `src/components/layout/TopBar.tsx` | Triggers ImportModal via uiStore | ~line 33, 67, 195 |
| `src/components/import/ImportModal.tsx` | Upload UI + drag-and-drop + orchestration | 336 lines |
| `src/components/import/ImportPreview.tsx` | Editable form for parsed data | 575 lines |
| `src/hooks/useFileImport.ts` | File reading + text extraction + parsing pipeline | 150 lines |
| `src/utils/resumeParser.ts` | Heuristic text → ResumeData parser | 723 lines |
| `src/utils/pdfParser.ts` | PDF → text extraction via pdfjs-dist | 89 lines |
| `src/utils/docxParser.ts` | DOCX → text extraction via mammoth | 28 lines |
| `src/utils/sanitize.ts` | DOMPurify sanitization of parsed data | 40 lines |
| `src/store/resumeStore.ts` | `setResume()` action applies imported data | ~line 152-194 |

### How Data Flows
```
File (PDF/DOCX)
  → extractTextFromPdf() / extractTextFromDocx()    [pdfParser.ts / docxParser.ts]
  → returns rawText: string
  → parseResumeText(rawText)                         [resumeParser.ts]
  → returns Partial<ResumeData>
  → sanitizeResumeData(parsedData)                   [sanitize.ts]
  → returns Partial<ResumeData> (sanitized)
  → ImportPreview receives parsedData                [ImportPreview.tsx]
  → User edits → clicks Apply
  → handleApplyData() merges with currentResume      [ImportModal.tsx line 142-193]
  → setResume() updates Zustand store                [resumeStore.ts]
```

### Current ImportPreview Limitations
- Only handles: contact, summary, experience, education, skills, certifications
- Skills shown as comma-separated text inputs (not chips/tags)
- No source text reference — user can't see original text alongside parsed fields
- No unmatched content display — dropped data is invisible
- No split/merge entries — structural mistakes require manual re-entry
- No confidence indicators — everything looks equally correct
- No dark mode support
- Renders inside a modal with `max-h-[60vh]` scroll area (cramped)

### Current handleApplyData Limitations (ImportModal.tsx:142-193)
- Only merges: contact, summary, experience, education, skills, certifications
- Only auto-enables those 5 section types in `sectionDataMap`
- Missing: projects, volunteer, awards, publications, languages, references, hobbies, affiliations, courses

---

## 3. Current Parser Problems

### 3.1 Silent Section Dropping
`detectSections()` at line 62 detects 11 section types via regex headings:
- summary, experience, education, skills, projects, certifications, languages, volunteer, awards, publications, references, interests

But `parseResumeText()` at line 639 only processes 6 in its switch statement:
- summary, experience, education, skills, certifications, interests

**Dropped silently**: projects, languages, volunteer, awards, publications, references

### 3.2 Rigid Section Heading Matching
Section headings use exact regex patterns (line 43-60). Examples of what FAILS:
- "Professional Background" (not in experience regex)
- "Technical Proficiencies" (not in skills regex)
- "Academic Credentials" (not in education regex)
- "Key Achievements" (not in awards regex)
- "Relevant Coursework" (not in any regex)
- Any heading with extra words like "Summary of Qualifications"

### 3.3 Contact Extraction Gaps
`extractContact()` at line 110:
- **No location detection** — never sets `contact.location`. City/state/zip/country patterns not matched
- **No title detection** — never sets `contact.title`. The line after the name (e.g., "Senior Software Engineer") is ignored
- **No website extraction** — only extracts LinkedIn and GitHub URLs, ignores personal websites
- **Phone regex too aggressive** — `PHONE_REGEX` at line 22 matches any 7-10 digit sequence, including zip codes and ID numbers
- **Name detection fragile** — only works if name is 2-4 words in the first 5 lines, starting with a capital letter

### 3.4 Experience Entry Merging (The Biggest Problem)
When there's no paragraph break between jobs, `extractExperience()` at line 155 tries date-anchored splitting (line 164-218). This frequently fails:

**What happens**: Job B's title/company/dates become bullet points under Job A. The user sees 1 job with 6+ bullets instead of 2 jobs with 3 bullets each. Job B effectively vanishes.

**Why it happens**:
- Date line isn't recognized (unusual format)
- Company/position line is too long (>50 chars, rejected at line 201)
- No paragraph break between entries
- Multi-column PDF layout interleaves text from different columns

### 3.5 Position/Company Swap
`parseExperienceBlock()` at line 221 assumes:
- First header line = position
- Second header line = company

Many resumes flip this (company first, then position). The parser has no way to tell which is which.

### 3.6 Education Parser Issues
`extractEducation()` at line 329:
- Degree regex (line 376) is very specific — misses "Diploma", "Certificate", "Honours", non-US formats
- Institution detection is position-based (first line), not content-based
- Can't handle "University of X, B.S. in Computer Science" format (institution + degree on one line)

---

## 4. Parser Improvements (Phase 1)

### 4.1 Fuzzy Section Heading Matching
**Replace rigid regex with word-overlap scoring.**

Instead of:
```typescript
const SECTION_HEADINGS: Record<string, RegExp> = {
  skills: /^(?:skills|technical\s*skills|...)\s*:?\s*$/i,
};
```

Use keyword sets with similarity scoring:
```typescript
const SECTION_KEYWORDS: Record<string, string[]> = {
  skills: ['skills', 'technical', 'competencies', 'proficiencies', 'expertise', 'abilities', 'stack', 'technologies'],
  experience: ['experience', 'employment', 'work', 'history', 'professional', 'career', 'background'],
  education: ['education', 'academic', 'credentials', 'qualifications', 'university', 'degree'],
  // ... etc
};
```

Score = (matching words / total heading words). Threshold > 0.4 = match. This catches:
- "Technical Proficiencies" → matches skills (technical + proficiencies overlap)
- "Professional Background" → matches experience (professional + background overlap)
- "Academic Credentials" → matches education (academic + credentials overlap)

**Keep the regex as a fast path** — try exact regex first, fall back to fuzzy matching.

### 4.2 Missing Section Extractors
Add extractors for all 6 missing section types in the `parseResumeText()` switch:

| Section | Extractor Function | Structure | Complexity |
|---|---|---|---|
| **projects** | `extractProjects()` | Similar to experience: name, technologies, dates, description, highlights | Medium — reuse experience block parsing |
| **volunteer** | `extractVolunteer()` | Similar to experience: role, organization, dates, description, highlights | Low — almost identical to experience |
| **awards** | `extractAwards()` | Simple: title, issuer, date, description | Low |
| **publications** | `extractPublications()` | Simple: title, publisher, date, url, description | Low |
| **languages** | `extractLanguages()` | Flat list or "Language (Proficiency)" pairs | Low |
| **references** | `extractReferences()` | Name, title, company, email, phone per entry | Medium |

Also update `handleApplyData()` in ImportModal.tsx to merge all these new section types and update the `sectionDataMap` to auto-enable them.

### 4.3 Better Contact Extraction

**Location detection** — add patterns:
```typescript
const LOCATION_PATTERNS = [
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/,         // City, ST
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\s+\d{5}\b/, // City, ST ZIP
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*[A-Z][a-z]+\b/,        // City, Country
];
```

**Title detection** — the line after the name that:
- Is short (< 60 chars)
- Contains no email/phone/URL
- Contains common title words: Engineer, Manager, Developer, Designer, Analyst, Director, Lead, Senior, Junior, etc.
- OR is title-cased and short

**Website extraction** — URLs that aren't LinkedIn or GitHub:
```typescript
const websiteUrl = text.match(URL_REGEX);
if (websiteUrl && !LINKEDIN_REGEX.test(websiteUrl[0]) && !GITHUB_REGEX.test(websiteUrl[0])) {
  contact.website = websiteUrl[0];
}
```

**Tighter phone regex** — require at least one common phone format indicator:
- Parentheses: `(555) 123-4567`
- Dashes/dots: `555-123-4567`, `555.123.4567`
- Country code: `+1 555-123-4567`
- At least 10 digits total

### 4.4 Entry Boundary Scoring System
**Replace rigid date-anchored splitting with a scoring system.**

For each non-bullet line in an experience section, compute a score:
```typescript
function entryBoundaryScore(line: string, prevLine: string | null, nextLine: string | null): number {
  let score = 0;
  if (DATE_RANGE_REGEX.test(line)) score += 3;
  if (line.length < 50 && !BULLET_RE.test(line)) score += 2;
  if (COMPANY_WORDS_RE.test(line)) score += 2;    // Inc, LLC, Corp, Ltd, Technologies, University...
  if (isTitleCase(line)) score += 1;
  if (prevLine && prevLine.endsWith('.')) score += 1;
  if (!prevLine || prevLine.trim() === '') score += 3; // follows blank line
  if (DATE_RANGE_REGEX.test(line) && COMPANY_WORDS_RE.test(line)) score += 1; // date + company on same line
  return score;
}
```

Score > 4 → new entry boundary. This catches many more cases than the current approach.

### 4.5 Company/Position Swap Detection
Add heuristics to `parseExperienceBlock()`:

```typescript
const COMPANY_INDICATORS = /\b(?:Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Company|Co\.?|Group|Technologies|Tech|Solutions|Consulting|Services|Partners|Associates|University|College|Institute|Hospital|Foundation|Agency|Bank|Studio|Labs?)\b/i;

// If first header line looks like a company and second looks like a position, swap them
if (cleanHeaders.length >= 2) {
  const firstIsCompany = COMPANY_INDICATORS.test(cleanHeaders[0]);
  const secondIsCompany = COMPANY_INDICATORS.test(cleanHeaders[1]);
  if (firstIsCompany && !secondIsCompany) {
    // Swap: first line is company, second is position
    entry.company = cleanHeaders[0];
    entry.position = cleanHeaders[1];
  }
}
```

### 4.6 Tighter Phone Regex
Replace the current overly broad `PHONE_REGEX` with:
```typescript
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?(?:\d{3})\)?[-.\s]\d{3}[-.\s]\d{4}/;
```
Requires at least one separator (dash, dot, space, or parens) so it doesn't match random number strings like zip codes or IDs.

---

## 5. Review UI Design (Phases 2-4)

### 5.1 Overall Architecture Decision

**The review UI replaces `ImportPreview.tsx` inside the existing `ImportModal`.** It is NOT a separate page/route. Reasons:
- Import flow stays self-contained in the modal
- No navigation state to manage
- User can cancel easily
- But the modal should be made larger (close to full-screen) to give enough room

The modal size should change from `size="lg"` to a near-full-screen overlay when showing the review UI.

### 5.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Import Resume                                    [Import ↓] [X]│
│                                                                 │
│ ┌─ Original Text ─────────────────── [Show/Hide] ────────────┐ │
│ │ (collapsible panel showing raw text with colored highlights │ │
│ │  linking to parsed sections below — each section type gets  │ │
│ │  a different subtle background color in the source text)    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ── Contact ✓ ───────────────────────────────────────────────── │
│ [John Smith     ] [Software Engineer  ]                        │
│ [john@email.com ] [555-123-4567       ] [San Francisco, CA]    │
│ [linkedin.com/in/john] [github.com/john]                       │
│                                                                 │
│ ── Experience (3 entries) ✓ ──────────────────────────────────  │
│ ┌ Senior Engineer              Jan 2022 – Present  ─────────┐ │
│ │ Google  [⇅]  Mountain View, CA                             │ │
│ │ • Led team of 5 engineers on search infrastructure         │ │
│ │ • Reduced latency by 40% through caching redesign          │ │
│ │ • ⚠ Software Engineer                     [✂ Split here]  │ │
│ │ • Meta · Menlo Park                                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ── Skills ✓ ──────────────────────────────────────────────────  │
│ [JavaScript ×] [React ×] [Node.js ×] [Python ×] [Go ×]        │
│                                                                 │
│ ── Education (1 entry) ⚠ ────────────────────────────────────  │
│ ┌ B.S. Computer Science       2015 – 2019  ─────────────────┐ │
│ │ [                    ] ← institution missing (yellow bg)    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ── Unmatched Content ─────────────────────────────────────────  │
│ ┌ "AWS Solutions Architect – Associate, 2023                ─┐ │
│ │  Amazon Web Services"                                      │ │
│ │                        [Add as ▾ Certification]   [Skip]   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                            [Import Resume →]   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Interaction Patterns

**Inline editing**: Every text field is a borderless input that looks like plain text. On focus, it gets a subtle border/background to show it's editable. No "Edit" buttons or modals.

**Confidence indicators**:
- **Green ✓** on section headers = all fields populated, parser is confident
- **Yellow ⚠** on section headers = some fields empty or parser guessed
- **Yellow background** on individual fields that are empty but expected (e.g., institution in education)
- No red/error states — nothing should feel "broken"

**Collapsible sections**: Each section header is a toggle. Click to collapse/expand. Sections with warnings auto-expand. Sections that look correct can be collapsed.

**Swap button [⇅]**: Appears between position/company fields. One click swaps their values. Most common fix for misclassified entries.

**Split entry [✂ Split here]**: Appears on hover over bullet points that look suspicious (see section 6). Clicking splits the entry at that point — everything from that bullet down becomes a new entry, and the parser re-runs on just that text chunk.

**Merge entries**: Drag one entry card onto another (or use a "Merge with previous" button). The second entry's highlights are appended to the first.

**Drag-and-drop reordering**: Entries within a section can be dragged to reorder. Uses the same `@dnd-kit/core` library already used in section editors.

**Unmatched content**: Text chunks that the parser couldn't categorize appear in an "Unmatched Content" area at the bottom. Each chunk has:
- The original text displayed
- A dropdown: "Add as → Experience / Education / Skills / Certification / Project / Volunteer / Award / Publication / Skip"
- Selecting a type attempts to parse that chunk with the appropriate extractor and adds the result to the corresponding section above

**Import button**: Appears at both top-right (sticky) and bottom of the page. User shouldn't have to scroll to find it.

### 5.4 Source Text Panel

**Collapsible panel** at the top showing the raw extracted text. Features:
- Toggle button: "Show Original" / "Hide Original"
- Text is read-only
- **Colored highlights** link source text regions to parsed sections:
  - Blue = Contact info
  - Green = Experience
  - Purple = Education
  - Orange = Skills
  - etc.
- Unmatched text (not highlighted) is visually distinct — slightly dimmed or with a dashed underline
- Clicking a highlighted region scrolls to the corresponding section in the review UI below

### 5.5 Dark Mode Support
All review UI components must support dark mode via Tailwind `dark:` variants, consistent with the rest of the app.

---

## 6. The Merged Job Problem

### What Happens
```
Resume text (no paragraph break between jobs):
  Senior Engineer
  Google · Mountain View
  Jan 2022 – Present
  • Led search infrastructure team
  • Reduced latency by 40%
  Software Engineer              ← NOT recognized as new entry
  Meta · Menlo Park              ← becomes bullet under Google
  Jun 2019 – Dec 2021            ← becomes bullet under Google
  • Built notification system    ← becomes bullet under Google
```

Result: 1 entry with 6 bullets instead of 2 entries with 2-3 bullets each.

### Parser-Side Prevention (Phase 1)
The entry boundary scoring system (section 4.4) catches this more often by scoring each line for "new entry probability."

### Review UI Fix (Phase 4)

**Suspicious bullet detection**: In the review UI, scan each bullet point for signs it might be a misclassified entry:
```typescript
function isSuspiciousBullet(bullet: string): boolean {
  const isShort = bullet.length < 60;
  const noEndPeriod = !bullet.endsWith('.');
  const isTitleCased = /^[A-Z][a-z]/.test(bullet);
  const hasDate = DATE_RANGE_REGEX.test(bullet) || DATE_REGEX.test(bullet);
  const hasCompanyWord = COMPANY_INDICATORS.test(bullet);
  const looksLikeTitle = TITLE_WORDS_RE.test(bullet); // Engineer, Manager, Developer...

  return (isShort && noEndPeriod && (hasDate || hasCompanyWord || (isTitleCased && looksLikeTitle)));
}
```

Suspicious bullets get:
- A subtle yellow left-border highlight
- A "✂ Split here" button that appears on hover

**Split action**: When user clicks "✂ Split here" on a bullet:
1. All bullets from that point down are removed from the current entry
2. Those bullets are joined into a text block
3. `parseExperienceBlock()` is called on that text block
4. The resulting new entry is inserted after the current entry
5. The review UI re-renders with the new entry visible

**Merge action**: When user wants to combine two entries:
- A "Merge with above" button appears in the entry header (for entries after the first)
- Clicking it appends entry B's description + highlights to entry A
- Entry B is removed

---

## 7. Phasing & Implementation Order

### Phase 1: Parser Improvements
**Goal**: Better parsing accuracy. No UI changes.

| Task | File(s) | Effort |
|---|---|---|
| Fuzzy section heading matching | `resumeParser.ts` | Medium |
| Add 6 missing section extractors | `resumeParser.ts` | Medium |
| Better contact extraction (location, title, website) | `resumeParser.ts` | Low |
| Company/position swap detection | `resumeParser.ts` | Low |
| Entry boundary scoring system | `resumeParser.ts` | Medium |
| Tighter phone regex | `resumeParser.ts` | Low |
| Update `handleApplyData()` to merge all sections | `ImportModal.tsx` | Low |
| Update `sectionDataMap` for auto-enable | `ImportModal.tsx` | Low |

**Verification**: Import a variety of real resumes (PDF + DOCX) and check that more data is captured correctly.

### Phase 2: Review UI Core
**Goal**: Replace ImportPreview with a usable review interface.

| Task | File(s) | Effort |
|---|---|---|
| New `ImportReview.tsx` component (replaces ImportPreview) | New file | High |
| Single scrollable layout with all parsed sections | New file | Medium |
| Inline editing (click-to-edit fields) | New file | Medium |
| Confidence indicators (green ✓ / yellow ⚠) | New file | Low |
| Collapsible section headers | New file | Low |
| Import button at top + bottom | New file | Low |
| Dark mode support throughout | New file | Medium |
| Update ImportModal to use new component | `ImportModal.tsx` | Low |
| Make modal larger when showing review | `ImportModal.tsx` | Low |
| Handle all section types in review (not just 6) | New file | Medium |

### Phase 3: Source Text Panel + Unmatched Content
**Goal**: Help users see what was missed and rescue it.

| Task | File(s) | Effort |
|---|---|---|
| Collapsible source text panel | `ImportReview.tsx` | Medium |
| Colored highlights linking source to parsed sections | `ImportReview.tsx` | High |
| Click highlight → scroll to section | `ImportReview.tsx` | Low |
| Parser returns source text ranges per section | `resumeParser.ts` | Medium |
| Unmatched content display area | `ImportReview.tsx` | Medium |
| "Add as [type]" dropdown on unmatched chunks | `ImportReview.tsx` | Medium |
| Re-parse chunk with selected extractor | `ImportReview.tsx` + `resumeParser.ts` | Medium |

**Parser change needed**: `parseResumeText()` must return source text character ranges for each section so the review UI can create colored highlights. Add a `sourceRanges` field to the return type.

### Phase 4: Split/Merge/Swap/Drag
**Goal**: Fix structural mistakes without re-entering data.

| Task | File(s) | Effort |
|---|---|---|
| Swap button [⇅] for position/company | `ImportReview.tsx` | Low |
| Suspicious bullet detection + yellow highlight | `ImportReview.tsx` | Medium |
| Split entry action (✂) | `ImportReview.tsx` | High |
| Merge entries action | `ImportReview.tsx` | Medium |
| Drag-and-drop entry reordering (dnd-kit) | `ImportReview.tsx` | Medium |
| Drag-and-drop for unmatched chunks to sections | `ImportReview.tsx` | High |

---

## 8. File Map & Architecture

### Files to Modify
```
src/utils/resumeParser.ts          — Parser improvements (Phase 1, 3)
src/components/import/ImportModal.tsx — Update to use new review, handle all sections (Phase 1, 2)
src/hooks/useFileImport.ts          — May need to return rawText alongside parsed data (already does)
```

### Files to Create
```
src/components/import/ImportReview.tsx  — New review UI component (Phase 2, 3, 4)
```

### Files to Delete/Replace
```
src/components/import/ImportPreview.tsx — Replaced by ImportReview.tsx (keep until Phase 2 complete)
```

### Files for Reference (do not modify)
```
src/types/resume.ts                — Type definitions for all section entries
src/utils/pdfParser.ts             — PDF text extraction (no changes needed)
src/utils/docxParser.ts            — DOCX text extraction (no changes needed)
src/utils/sanitize.ts              — Data sanitization (no changes needed)
src/store/resumeStore.ts           — setResume() action (no changes needed)
src/App.tsx                        — Routes (no changes needed — review stays in modal)
src/utils/atsScorer.ts             — ATS scoring (no changes needed)
```

### Key Dependencies Already in Project
- `@dnd-kit/core`, `@dnd-kit/sortable` — drag-and-drop (used in section editors)
- `lucide-react` — icons
- `dompurify` — HTML sanitization
- Tailwind CSS — styling + dark mode
- `pdfjs-dist` — PDF parsing
- `mammoth` — DOCX parsing

---

## 9. Type Definitions Reference

### What the Parser Currently Returns
```typescript
// From parseResumeText() → Partial<ResumeData>
{
  contact?: ContactData;      // firstName, lastName, email, phone, location, title, website, linkedin, github, portfolio
  summary?: SummaryData;      // { text: string }
  experience?: ExperienceEntry[];   // { id, company, position, location, startDate, endDate, current, description, highlights[] }
  education?: EducationEntry[];     // { id, institution, degree, field, startDate, endDate, gpa, description, highlights[] }
  skills?: SkillCategory[];         // { id, category, items[] }
  certifications?: CertificationEntry[]; // { id, name, issuer, date, expiryDate, credentialId, url }
  hobbies?: HobbiesData;           // { items: string[] }
}
```

### What the Parser SHOULD Return (after Phase 1)
```typescript
{
  contact?: ContactData;
  summary?: SummaryData;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: SkillCategory[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];            // NEW: { id, name, description, technologies[], url, startDate, endDate, highlights[] }
  languages?: LanguageEntry[];          // NEW: { id, name, proficiency }
  volunteer?: VolunteerEntry[];         // NEW: { id, organization, role, startDate, endDate, description, highlights[] }
  awards?: AwardEntry[];               // NEW: { id, title, issuer, date, description }
  publications?: PublicationEntry[];    // NEW: { id, title, publisher, date, url, description }
  references?: ReferenceEntry[];       // NEW: { id, name, title, company, email, phone, relationship }
  hobbies?: HobbiesData;
}
```

### Phase 3 Addition: Source Ranges
```typescript
interface ParseResult {
  data: Partial<ResumeData>;
  sourceRanges: SectionSourceRange[];   // NEW
  unmatchedChunks: UnmatchedChunk[];    // NEW
}

interface SectionSourceRange {
  type: string;         // 'contact' | 'experience' | 'education' | ...
  startOffset: number;  // character offset in raw text
  endOffset: number;
}

interface UnmatchedChunk {
  text: string;
  startOffset: number;
  endOffset: number;
}
```

---

## 10. Design Principles & UX Rules

### Core Principles
1. **Single scrollable page** — no wizard/stepper/tabs. Everything visible at once.
2. **Inline editing** — click any field to edit. No modals. No "Edit" buttons.
3. **No data silently disappears** — unmatched content is always shown.
4. **Mistakes are one-click fixes** — swap, split, merge, drag. Not re-type.
5. **Confidence, not errors** — green/yellow indicators, not red error states.
6. **Minimal friction** — if everything looks right, user can import in 2 seconds. Review is optional.
7. **Dark mode native** — uses Tailwind `dark:` variants throughout.

### UX Anti-Patterns to AVOID
- Multi-step wizards ("Step 1 of 5")
- Modals-within-modals
- Required fields that block import
- Empty states that scream "MISSING" in red
- Forcing users to fill in fields they don't care about
- Making the review feel like data entry
- Complex drag-and-drop that's not discoverable

### Visual Language
- **Section headers**: `text-sm font-semibold` with collapse toggle and confidence icon
- **Entry cards**: Subtle border (`border-gray-200 dark:border-gray-700`), rounded corners, minimal padding
- **Inline inputs**: Borderless, same font/size as display text, subtle focus ring
- **Confidence green**: `text-green-600 dark:text-green-400` / `bg-green-50 dark:bg-green-900/20`
- **Warning yellow**: `text-amber-600 dark:text-amber-400` / `bg-amber-50 dark:bg-amber-900/20`
- **Suspicious bullets**: `border-l-2 border-amber-400` left accent
- **Unmatched content**: `bg-gray-100 dark:bg-gray-800` with dashed border

---

## 11. Implementation Details Per Phase

### Phase 1: Parser Changes (resumeParser.ts)

**A. Fuzzy section matching — new function `fuzzyMatchSection()`**
```
Add after line 60 in resumeParser.ts.
Called as fallback when no exact regex match in detectSections().
Input: normalized heading string
Output: section type string or null
Uses word overlap scoring against SECTION_KEYWORDS map.
Threshold: > 0.4 match score
```

**B. Missing extractors — 6 new functions**
```
Add before the Main Parser section (line 633).
Follow the pattern of existing extractors.
- extractProjects(content): nearly identical to extractExperience but maps to ProjectEntry
- extractVolunteer(content): nearly identical to extractExperience but maps to VolunteerEntry
- extractAwards(content): simple block parser → AwardEntry[]
- extractPublications(content): simple block parser → PublicationEntry[]
- extractLanguages(content): "Language (Proficiency)" pair parser → LanguageEntry[]
- extractReferences(content): multi-line entry parser → ReferenceEntry[]
```

**C. Better contact extraction**
```
Modify extractContact() at line 110.
Add location, title, website detection.
Tighten phone regex.
```

**D. Entry boundary scoring**
```
Modify extractExperience() at line 155.
Replace date-anchored splitting (lines 164-218) with scoring system.
New helper: entryBoundaryScore(line, prevLine, nextLine)
```

**E. Company/position swap**
```
Modify parseExperienceBlock() at line 221.
Add COMPANY_INDICATORS regex.
After initial assignment, check if swap is needed.
```

**F. Update ImportModal.tsx**
```
Modify handleApplyData() at line 142.
Add merging for: projects, languages, volunteer, awards, publications, references, hobbies, affiliations, courses.
Update sectionDataMap to auto-enable all section types.
```

### Phase 2: Review UI Core (new ImportReview.tsx)

**Component structure**:
```
ImportReview (main container)
├── StickyHeader (title + Import button)
├── SourceTextPanel (collapsible — Phase 3)
├── ContactSection (inline editable fields)
├── SummarySection (inline editable textarea)
├── ExperienceSection (collapsible, entry cards)
│   └── ExperienceCard (inline fields + highlights + swap button + split)
├── EducationSection (collapsible, entry cards)
│   └── EducationCard (inline fields)
├── SkillsSection (tag/chip display)
├── ProjectsSection
├── CertificationsSection
├── LanguagesSection
├── VolunteerSection
├── AwardsSection
├── PublicationsSection
├── ReferencesSection
├── HobbiesSection
├── UnmatchedContentSection (Phase 3)
└── BottomActions (Import button)
```

**State management**: All in local React state (same pattern as current ImportPreview). No Zustand needed until the user clicks "Import."

### Phase 3: Source Text + Unmatched Content

**Parser changes**: `parseResumeText()` returns `{ data, sourceRanges, unmatchedChunks }` instead of just `Partial<ResumeData>`.

**Source panel**: Uses `sourceRanges` to render the raw text with `<span>` elements that have colored backgrounds per section type. Each span is clickable — scrolls to the corresponding section below.

**Unmatched chunks**: Text segments not covered by any `sourceRange`. Displayed at the bottom with "Add as" dropdown.

### Phase 4: Split/Merge/Swap/Drag

**Split**: When clicked, creates a new entry from the bullet text + all subsequent bullets. Calls `parseExperienceBlock()` on the extracted text to get structured fields. Inserts after current entry.

**Merge**: Removes entry B, appends its highlights/description to entry A.

**Swap**: Swaps `position` and `company` field values on an experience entry. One click.

**Drag**: Uses `@dnd-kit/core` + `@dnd-kit/sortable`. Same pattern as `ExperienceEditor.tsx` in the main editor.

---

## 12. Verification Checklist

### Phase 1 (Parser)
- [ ] Fuzzy matching catches "Technical Proficiencies" → skills
- [ ] Fuzzy matching catches "Professional Background" → experience
- [ ] Projects section is extracted and populated
- [ ] Volunteer section is extracted and populated
- [ ] Awards section is extracted and populated
- [ ] Publications section is extracted and populated
- [ ] Languages section is extracted and populated
- [ ] References section is extracted and populated
- [ ] Contact location is detected (City, ST format)
- [ ] Contact title is detected (line after name)
- [ ] Contact website is detected (non-LinkedIn/GitHub URLs)
- [ ] Phone regex doesn't match zip codes or random numbers
- [ ] Position/company swap detected for company-first resumes
- [ ] Entry boundary scoring prevents merged jobs (test with no-paragraph-break resumes)
- [ ] All new sections auto-enabled after import
- [ ] All new sections merged into resume store
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — clean build
- [ ] `npx vitest run` — all tests pass

### Phase 2 (Review UI Core)
- [ ] Review UI renders all section types
- [ ] All fields are inline-editable
- [ ] Confidence indicators show green/yellow correctly
- [ ] Sections are collapsible
- [ ] Empty sections are hidden
- [ ] Import button at top + bottom works
- [ ] Dark mode works throughout
- [ ] Modal is properly sized (near full-screen)
- [ ] Cancel resets state and closes modal
- [ ] Build + type check passes

### Phase 3 (Source Text + Unmatched)
- [ ] Source text panel shows raw text
- [ ] Colored highlights correspond to parsed sections
- [ ] Clicking a highlight scrolls to section
- [ ] Unmatched text chunks are displayed
- [ ] "Add as" dropdown creates entries in correct section
- [ ] "Skip" removes unmatched chunk from display
- [ ] Dark mode works on source panel

### Phase 4 (Split/Merge/Swap/Drag)
- [ ] Swap button swaps position/company values
- [ ] Suspicious bullets get yellow highlight
- [ ] Split creates a new well-formed entry
- [ ] Merge combines two entries correctly
- [ ] Drag-and-drop reorders entries within section
- [ ] All operations update state correctly for import

---

## Appendix: Current File Contents Reference

### resumeParser.ts key line numbers
- Regex patterns: lines 20-32
- Section heading regexes: lines 43-60
- `detectSections()`: lines 62-106
- `extractContact()`: lines 110-151
- `extractExperience()`: lines 155-219
- `parseExperienceBlock()`: lines 221-311
- `buildExperienceEntry()`: lines 313-325
- `extractEducation()`: lines 329-453
- `extractSkills()`: lines 457-526
- `extractCertifications()`: lines 530-623
- `generateId()`: lines 627-631
- `parseResumeText()`: lines 639-722

### ImportModal.tsx key line numbers
- `handleApplyData()`: lines 142-193
- `sectionDataMap` (auto-enable): lines 167-173
- Preview rendering: lines 209-221

### ImportPreview.tsx key line numbers
- `CommaSeparatedInput` component: lines 14-63
- Local state setup: lines 77-115
- Contact form: lines 151-213
- Summary textarea: lines 216-226
- Experience cards: lines 229-325
- Education cards: lines 328-435
- Skills categories: lines 438-477
- Certifications cards: lines 480-561
- Action buttons: lines 563-571

### useFileImport.ts key line numbers
- `FileImportResult` type: lines 18-23
- Pipeline (read → extract → parse → sanitize): lines 101-137
- rawText is already available in result: line 131-132

### Types (resume.ts) key line numbers
- `SectionType`: lines 10-26
- `ContactData`: lines 38-49
- `ExperienceEntry`: lines 59-69
- `EducationEntry`: lines 73-83
- `SkillCategory`: lines 89-93
- `ProjectEntry`: lines 97-106
- `CertificationEntry`: lines 110-118
- `LanguageEntry`: lines 129-133
- `VolunteerEntry`: lines 137-145
- `AwardEntry`: lines 149-155
- `PublicationEntry`: lines 159-166
- `ReferenceEntry`: lines 170-178
- `HobbiesData`: lines 182-184
- `AffiliationEntry`: lines 188-194
- `CourseEntry`: lines 198-204
- `CustomSection`: lines 217-222
- `ResumeData`: lines 226-245
- `Resume`: lines 249-259
