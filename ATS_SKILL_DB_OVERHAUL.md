# ATS Scoring Engine — Phase 3: Skill Database Overhaul

## Full Context Document for AI Agent Handoff

> **Purpose**: This document contains EVERYTHING an AI agent needs to understand the current state of the ATS scoring system, the critical bug that was diagnosed, the research findings, and the exact implementation plan. Read this entire document before writing any code.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [What Has Been Built (Phase 1 + Phase 2)](#2-what-has-been-built)
3. [The Critical Bug — Root Cause Analysis](#3-the-critical-bug)
4. [Industry Research — How Competitors Do It](#4-industry-research)
5. [Available Skill Databases (Free, Usable Now)](#5-available-skill-databases)
6. [Architecture Decision: What We're Building](#6-architecture-decision)
7. [Implementation Plan — Step by Step](#7-implementation-plan)
8. [Key File Locations and Current State](#8-key-file-locations)
9. [Current Code That Must Change (with line numbers)](#9-current-code-that-must-change)
10. [Current Code That Stays Unchanged](#10-current-code-that-stays-unchanged)
11. [Data Model and Type Changes](#11-data-model-and-type-changes)
12. [Testing Strategy](#12-testing-strategy)
13. [Verification Checklist](#13-verification-checklist)

---

## 1. PROJECT OVERVIEW

**App**: Resume Builder — a production React web app with 18 templates, PDF/DOCX export, ATS scoring, cover letters, job tracker, cloud sync.

**Tech Stack**: React 19 + TypeScript + Vite + Zustand + Tailwind CSS 4 + Vitest

**ATS System**: Scores resume compatibility (0-100) against job descriptions. Runs entirely CLIENT-SIDE (no API calls — privacy first). User pastes a job description, clicks "Analyze", sees score breakdown with actionable suggestions.

**Current State**: Phase 1 (synonym matching, JD parsing, 21 industries) and Phase 2 (10-category scoring model, experience/education matching) are complete. 571 tests pass. Build is clean. But the fundamental keyword extraction is broken.

---

## 2. WHAT HAS BEEN BUILT

### Phase 1 (Complete)
- N-gram phrase matching (bigrams, trigrams)
- Synonym dictionary: ~200 canonical entries, ~500 total forms in `atsSynonyms.ts`
- JD section parser (`jdParser.ts`): detects Required/Preferred/Responsibilities sections, extracts years of experience, degree requirements, certifications
- 21 industry keyword dictionaries in `atsKeywords.ts` (~60 keywords each, ~1,200 total)
- Priority-ranked suggestion engine
- Pass likelihood labels (Strong pass / Likely pass / Uncertain / At risk / Unlikely)
- Partial match display (synonym matches shown in blue)

### Phase 2 (Complete)
- 10-category scoring model (replacing old 5-category):
  1. Hard Skill Match (25 pts)
  2. Soft Skill Match (5 pts)
  3. Experience Alignment (15 pts)
  4. Education Fit (5 pts)
  5. Keyword Optimization (10 pts)
  6. Content Impact (15 pts)
  7. ATS Parseability (10 pts)
  8. Section Structure (5 pts)
  9. Readability (5 pts)
  10. Tailoring Signals (5 pts)
- Experience year calculator with overlapping date merging
- Seniority level detection (intern → CxO)
- Education matching (degree level + field relatedness)
- Section-aware keyword placement scoring (title > summary > skills > experience)
- Score confidence indicator (high/medium/low based on JD quality)
- Soft skill classification via `SOFT_SKILL_CANONICALS` set

---

## 3. THE CRITICAL BUG — ROOT CAUSE ANALYSIS

### The Problem
When a user pastes a real job description and clicks Analyze, the system shows random garbage words as "matched keywords" and "hard skills" — words like "building", "team", "strong", "working", "environment", "ability", "excellent". These are NOT skills. The system is useless because of this.

### Root Cause: `extractKeywords()` in `atsScorer.ts` (line 189-197)

```typescript
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}
```

This function takes the ENTIRE job description text and treats EVERY WORD longer than 2 characters (that isn't a stop word) as a "keyword." So when a JD says:

> "We are looking for a strong team player who enjoys building scalable applications"

The system extracts: `looking`, `strong`, `team`, `player`, `enjoys`, `building`, `scalable`, `applications` — ALL treated as "keywords" to match against the resume.

### How It Gets Worse: `scoreKeywordMatchSplit()` (line 655-861)

The function `extractPhrasesAndKeywords()` (line 203-238) does two things:
1. Extracts known phrases (bigrams/trigrams that exist in synonym dictionary) — this part is CORRECT
2. Calls `extractKeywords()` which dumps ALL individual words — this part is BROKEN

Then `scoreKeywordMatchSplit()` combines both into `uniqueJdKeywords` and matches ALL of them against the resume. The garbage words flood the results.

### Why This Architecture is Fundamentally Wrong

**Our approach (broken)**: Extract every word from JD → assume they're all skills → match against resume
**Industry approach (correct)**: Maintain a curated skill database → scan JD to find which known skills are mentioned → match only those against resume

The difference: industry tools ONLY report words that exist in their skill database. If "building" isn't in the skill DB, it's ignored — it's just prose, not a skill. Our system has no filter.

---

## 4. INDUSTRY RESEARCH — HOW COMPETITORS DO IT

### How Jobscan, SkillSyncer, Resume Worded Work

**Architecture**: Curated skill database lookup (primary) + NLP entity extraction (secondary) + N-gram fallback (tertiary)

**Step 1 — Skill Database Lookup (Primary)**
They maintain large, hand-curated databases of known skills:
- **Lightcast/EMSI**: 33,000+ skills, used by 6,000+ companies
- **LinkedIn Skills Graph**: 39,000+ skills, 374,000+ aliases
- **Jobscan**: proprietary DB built from 10M+ job descriptions

When a JD is pasted, the system does a trie-based or hash-map lookup against this database. If a word/phrase is in the DB, it's a skill. If not, it's ignored.

**Step 2 — Skill Classification**
Every skill in the DB is pre-classified:
- Hard Skill (technical: Python, React, SQL)
- Soft Skill (people: leadership, communication)
- Tool (software: Jira, Salesforce, Excel)
- Certification (credential: PMP, CPA, AWS Certified)
- Methodology (process: Agile, Six Sigma, Lean)

Generic words like "building", "team", "strong", "working" are simply ABSENT from the database. That's the entire solution.

**Step 3 — Source-Weighted Scoring**
Keywords from "Required" sections get 3x weight, from "Title" get 4x, from "Preferred" get 1x. We already implement this correctly in `sourceWeight()`.

**Key Insight**: The deterministic keyword list IS the product. Users need to see "You are missing React, AWS, Docker" — not "You are missing building, team, environment." This requires exact + synonym matching against a known skill DB, not semantic/fuzzy matching of random words.

### What Databases They Use
| Database | Size | Used By |
|----------|------|---------|
| Lightcast Open Skills | 33,000+ skills | SkillNER, 6000+ orgs |
| LinkedIn Skills Graph | 39,000+ skills, 374K aliases | LinkedIn only (proprietary) |
| ESCO (EU Commission) | ~13,485 skills | European HR systems |
| O*NET (US Dept of Labor) | 35 core + 32,627 tech skills | Government tools, academic |

---

## 5. AVAILABLE SKILL DATABASES (FREE, USABLE NOW)

### Primary Source: SkillNER's EMSI/Lightcast Snapshot

- **What**: Python package that bundles a snapshot of the EMSI/Lightcast skill database (~30,000 skills)
- **Install**: `pip install skillNer`
- **Extract**:
```python
import json
from skillNer.general_params import SKILL_DB

with open("emsi_skills_snapshot.json", "w") as f:
    json.dump(SKILL_DB, f, indent=2)
```
- **Data format per skill**:
```json
{
  "KS126XS6CQCFGC3NG79X": {
    "skill_name": ".NET Assemblies",
    "skill_cleaned": ".net assemblies",
    "skill_len": 2,
    "skill_type": "Hard Skill",
    "unique_token": true,
    "match_on_stemmed": false
  }
}
```
- **Skill types**: "Hard Skill", "Soft Skill", "Certification"
- **License**: Open source
- **Why this is best**: Immediate access, ~30K skills, already classified by type, Lightcast IDs

### Supplementary Source: ESCO

- **Download**: https://esco.ec.europa.eu/en/use-esco/download
- **Format**: CSV with columns: `preferredLabel`, `altLabels` (pipe-separated synonyms), `skillType`, `reuseLevel`, `description`
- **Size**: ~13,485 skills
- **Value**: Rich synonym/alias data (each skill has multiple "alternative labels")
- **License**: CC BY 4.0 (fully open, commercial OK)

### Supplementary Source: MIND Tech Ontology

- **GitHub**: `github.com/MIND-TechAI/MIND-tech-ontology`
- **Size**: 3,333 tech skills with synonyms, types, implied skills, domain mappings
- **License**: MIT
- **Value**: Rich tech skill synonyms + "implies knowing" relationships (Next.js implies React implies JavaScript)

### Supplementary Source: O*NET Technology Skills

- **Download**: https://www.onetcenter.org/database.html
- **Size**: 32,627 technology skill entries + "Hot Technology" flags
- **License**: CC BY 4.0

---

## 6. ARCHITECTURE DECISION: WHAT WE'RE BUILDING

### The Core Change

**BEFORE** (current broken flow):
```
User pastes JD
  → extractKeywords() splits JD into ALL words > 2 chars
  → extractPhrasesAndKeywords() adds known phrases on top
  → 200+ "keywords" including garbage like "building", "team", "strong"
  → Match all against resume
  → Garbage results
```

**AFTER** (new flow):
```
User pastes JD
  → Scan JD text against SKILL_DATABASE (30,000+ real skills)
  → Only words/phrases that exist in the DB become keywords
  → ~10-40 real skills detected (React, Python, project management, etc.)
  → Match those against resume
  → Accurate results
```

### Skill Database Structure (TypeScript)

```typescript
// Compact format for bundling (~80-100KB gzipped)
interface SkillRecord {
  name: string;           // Display name: "React"
  type: 'hard' | 'soft' | 'cert';  // Hard Skill, Soft Skill, Certification
}

// The main lookup map: lowercase form → SkillRecord
// Built at module load time from the raw skill array
// Includes all aliases so "reactjs", "react.js", "react" all map to the same record
type SkillDatabase = Map<string, SkillRecord>;
```

### File Size Budget
- 30,000 skills × ~30 bytes average = ~900KB raw
- Compact array encoding: ~400KB raw
- Gzipped: ~80-100KB
- This is fine for a web app (fonts in this project are already 10MB+)

### Industry Selector: REMOVED (when JD is provided)
- With 30K skills covering all industries, the system auto-detects skills from any JD
- The industry dropdown becomes unnecessary when a JD is provided
- Keep it ONLY as an optional fallback for "score my resume without a JD" — but it moves from primary to secondary
- The UI should make "paste JD" the primary workflow, industry selector is just a backup

---

## 7. IMPLEMENTATION PLAN — STEP BY STEP

### Step 0: Extract and Process Skill Database

**Action**: Run Python script to extract SkillNER's EMSI database, then process into TypeScript.

```bash
pip install skillNer
python3 extract_skills.py  # Script that dumps SKILL_DB to JSON
```

Then process the JSON into a compact TypeScript file:

**Create**: `src/constants/skillDatabase.ts`

Structure:
```typescript
// Raw skill data in compact format: [name, type_code, ...aliases]
// type_code: 0=hard, 1=soft, 2=cert
const RAW_SKILLS: (string | number)[][] = [
  ["React", 0, "reactjs", "react.js"],
  ["Python", 0, "py", "python3"],
  ["Project Management", 1, "pm", "project mgmt"],
  ["PMP", 2, "project management professional"],
  // ... ~30,000 entries
];

// Built at module load: Map<lowercase_form, {name, type}>
export const SKILL_DB: Map<string, {name: string; type: 'hard'|'soft'|'cert'}> = new Map();

// Also build a phrase set for multi-word skill lookup
export const KNOWN_SKILL_PHRASES: Set<string> = new Set();

// Initialize on import
for (const entry of RAW_SKILLS) {
  const name = entry[0] as string;
  const typeCode = entry[1] as number;
  const type = typeCode === 0 ? 'hard' : typeCode === 1 ? 'soft' : 'cert';
  const record = { name, type };

  // Register canonical name
  SKILL_DB.set(name.toLowerCase(), record);

  // Register all aliases
  for (let i = 2; i < entry.length; i++) {
    SKILL_DB.set((entry[i] as string).toLowerCase(), record);
  }

  // Track multi-word skills for phrase matching
  if (name.includes(' ')) {
    KNOWN_SKILL_PHRASES.set(name.toLowerCase());
  }
}
```

**Merge our existing synonym entries**: Our `atsSynonyms.ts` has ~200 entries with ~500 forms that may not all be in EMSI. Merge them in. Any synonym alias that maps to a known EMSI skill gets added as an additional alias.

### Step 1: Rewrite Keyword Extraction in `atsScorer.ts`

**DELETE**: `extractKeywords()` function (line 189-197) — this is the root cause of the bug

**DELETE**: `extractPhrasesAndKeywords()` function (line 203-238) — this calls extractKeywords

**REPLACE WITH**: `extractSkillsFromText(text: string): SkillMatch[]`

```typescript
import { SKILL_DB, KNOWN_SKILL_PHRASES } from '@/constants/skillDatabase';

interface SkillMatch {
  canonicalName: string;        // "React"
  matchedForm: string;          // "reactjs" (what was found in text)
  type: 'hard' | 'soft' | 'cert';
}

function extractSkillsFromText(text: string): SkillMatch[] {
  const textLower = text.toLowerCase();
  const found = new Map<string, SkillMatch>(); // dedup by canonical name

  // 1. Check multi-word phrases first (trigrams, then bigrams)
  //    This prevents "machine" and "learning" from matching separately
  //    when "machine learning" is a known skill
  const words = textLower.split(/\s+/);
  const consumedRanges: [number, number][] = []; // track matched word positions

  // Trigrams
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i+1]} ${words[i+2]}`;
    const record = SKILL_DB.get(trigram);
    if (record && !found.has(record.name)) {
      found.set(record.name, { canonicalName: record.name, matchedForm: trigram, type: record.type });
      consumedRanges.push([i, i+2]);
    }
  }

  // Bigrams (skip positions consumed by trigrams)
  for (let i = 0; i < words.length - 1; i++) {
    if (isConsumed(i, consumedRanges) || isConsumed(i+1, consumedRanges)) continue;
    const bigram = `${words[i]} ${words[i+1]}`;
    const record = SKILL_DB.get(bigram);
    if (record && !found.has(record.name)) {
      found.set(record.name, { canonicalName: record.name, matchedForm: bigram, type: record.type });
      consumedRanges.push([i, i+1]);
    }
  }

  // Unigrams (skip consumed positions)
  for (let i = 0; i < words.length; i++) {
    if (isConsumed(i, consumedRanges)) continue;
    const word = words[i].replace(/[^a-z0-9+#./-]/g, ''); // clean punctuation
    if (word.length < 2) continue;
    const record = SKILL_DB.get(word);
    if (record && !found.has(record.name)) {
      found.set(record.name, { canonicalName: record.name, matchedForm: word, type: record.type });
    }
  }

  return [...found.values()];
}
```

The key difference: **only words/phrases that exist in SKILL_DB get through**. "building", "team", "strong" are NOT in SKILL_DB → they get ignored.

### Step 2: Update `scoreKeywordMatchSplit()` in `atsScorer.ts`

The "Full JD path" (currently line 750-861) needs to:

1. Call `extractSkillsFromText(jobDescription)` instead of `extractPhrasesAndKeywords()`
2. Use the returned `SkillMatch[]` as the keyword list
3. For each skill, classify source (required/preferred/title/etc) using existing `classifyKeywordSource()`
4. Match against resume text using existing `directMatch()` + `findSynonymMatch()`
5. Everything else (weighted scoring, hard/soft split) stays the same

### Step 3: Update Industry-Only Path

When no JD is provided but industry is selected:
- Keep current behavior: match against industry keyword list
- BUT: the industry keyword list should also be validated against SKILL_DB for consistency

When no JD AND no industry:
- Could now do something smarter: scan resume against SKILL_DB, report what skills were detected
- But this is optional — baseline behavior is fine

### Step 4: Remove Industry Selector as Primary Requirement

**In `AtsPanel.tsx`**:
- Make "Paste JD" the primary/prominent workflow
- Move industry selector to a secondary/collapsed position
- Label it something like "No job description? Select an industry for general scoring"
- The Analyze button should work WITHOUT selecting an industry (it already does if JD is pasted)

### Step 5: Update `atsSynonyms.ts`

The existing synonym dictionary becomes supplementary:
- Keep `SYNONYM_MAP` for the synonym resolution logic (`findSynonymMatch()`)
- Keep `SOFT_SKILL_CANONICALS` (but it may become redundant since EMSI already classifies soft skills)
- Merge any synonym entries that aren't covered by SKILL_DB
- `getKnownPhrases()` may become redundant (replaced by `KNOWN_SKILL_PHRASES` from skillDatabase.ts)

### Step 6: Update Existing Synonym/Phrase Matching

The `findSynonymMatch()` function (line 338-351) stays — it's used when matching resume text against keywords. But it should also check SKILL_DB aliases:
- If keyword is "JavaScript" and resume has "JS", SKILL_DB knows both map to the same skill
- The existing SYNONYM_MAP can be merged into SKILL_DB's alias system

### Step 7: Update Tests

- All existing tests that test keyword extraction need updating
- New tests for `extractSkillsFromText()`:
  - "We need a strong React developer with team building skills" → should extract "React" and "developer" (if in DB), NOT "strong", "team", "building"
  - "Experience with machine learning and Python required" → should extract "machine learning" and "Python", NOT "experience", "required"
  - "5+ years of project management experience" → should extract "project management", NOT "years", "experience"
  - Known aliases: "JS" → "JavaScript", "k8s" → "Kubernetes"
  - Multi-word priority: "machine learning" detected as phrase, not "machine" + "learning" separately

### Step 8: Build and Verify

1. `npx vitest run` — all tests pass
2. `npm run build` — TypeScript compiles clean
3. Manual test: paste a real JD → verify only real skills appear as keywords, no garbage words

---

## 8. KEY FILE LOCATIONS AND CURRENT STATE

### Files to CREATE
| File | Purpose |
|------|---------|
| `src/constants/skillDatabase.ts` | 30K skill database with lookup map |
| `scripts/extract_skills.py` | One-time Python script to extract EMSI data (can be deleted after) |

### Files to MODIFY
| File | Lines | What Changes |
|------|-------|-------------|
| `src/utils/atsScorer.ts` | ~1720 | Delete `extractKeywords()`, delete `extractPhrasesAndKeywords()`, rewrite `scoreKeywordMatchSplit()` JD path to use skill DB lookup |
| `src/components/ats/AtsPanel.tsx` | ~191 | De-emphasize industry selector, make JD-paste the primary workflow |
| `src/constants/atsSynonyms.ts` | ~300+ | Merge relevant entries into skill DB, keep SYNONYM_MAP for backward compat |
| `src/utils/__tests__/atsScorer.test.ts` | ~500+ | Update keyword extraction tests, add new tests for skill DB matching |

### Files that DON'T change
| File | Why |
|------|-----|
| `src/utils/jdParser.ts` | JD section parsing is correct and unrelated to keyword extraction |
| `src/hooks/useAtsScore.ts` | Hook interface stays the same |
| `src/components/ats/AtsScoreCard.tsx` | Score display unchanged |
| `src/components/ats/FormattingWarnings.tsx` | 10-category breakdown unchanged |
| `src/components/ats/KeywordAnalysis.tsx` | Still uses matched/missing/partial string[] |
| `src/types/resume.ts` | Resume types unchanged |

---

## 9. CURRENT CODE THAT MUST CHANGE (with line numbers)

### `src/utils/atsScorer.ts`

**DELETE — `extractKeywords()` (lines 189-197)**:
```typescript
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}
```
This is the ROOT CAUSE of the bug. It treats every word as a keyword.

**DELETE — `extractPhrasesAndKeywords()` (lines 203-238)**:
This function calls `extractKeywords()` and adds known phrases. The phrase part is fine but the approach is backward. Replace entirely with `extractSkillsFromText()` that scans against skill DB.

**REWRITE — Inside `scoreKeywordMatchSplit()`, the "Full JD path" (lines 750-861)**:
Currently builds `uniqueJdKeywords` from `extractPhrasesAndKeywords()`. Must instead call `extractSkillsFromText(jobDescription)` to get only real skills.

Lines 764-781 specifically:
```typescript
// This block extracts garbage keywords — REPLACE IT
const { phrases: jdPhrases, words: jdWordKeywords } = extractPhrasesAndKeywords(
  jobDescription,
  jdPhraseSet
);
const phraseSet = new Set(jdPhrases);
const allJdKeywords = [
  ...jdPhrases,
  ...jdWordKeywords.filter((w) => {
    for (const phrase of jdPhrases) {
      if (phrase.includes(w)) return false;
    }
    return true;
  }),
];
const uniqueJdKeywords = [...new Set(allJdKeywords)];
```

**KEEP** — Everything else in the file:
- `directMatch()` (line 356-363) — still used for matching keywords against resume text
- `findSynonymMatch()` (line 338-351) — still used for synonym resolution
- `classifyKeywordSource()` (line 626-636) — still used for source weighting
- `sourceWeight()` (line 641-649) — still used
- `classifySkillType()` (line 371-377) — MAY become redundant since EMSI classifies skills, but keep for backward compat
- All 10 scoring functions — unchanged
- `computeAtsScore()` orchestrator — unchanged (it calls `scoreKeywordMatchSplit` which is what we're fixing)
- `getResumeFullText()` — unchanged
- `getResumeSectionTexts()` — unchanged

### `src/components/ats/AtsPanel.tsx`

The industry selector (lines 75-83) should be de-emphasized. The JD textarea (lines 86-103) should be the primary element. The industry selector should be shown below the analyze button as an optional secondary feature, perhaps in a collapsible section.

---

## 10. CURRENT CODE THAT STAYS UNCHANGED

These are CORRECT and should not be touched:

- **10-category scoring model** — all 10 scoring functions work correctly once they receive real keywords
- **JD section parser** (`jdParser.ts`) — correctly detects Required/Preferred sections
- **Source weighting** — title=4x, required=3x, responsibilities=1.5x, preferred=1x
- **Experience year calculator** — merges overlapping date ranges correctly
- **Education matching** — degree level + field relatedness checking
- **Keyword placement scoring** — section-aware multipliers (title > summary > skills > experience)
- **Tailoring signals** — title alignment, summary density, skills match
- **Score confidence** — JD quality assessment
- **Priority action ranking** — critical/high/medium/low suggestions
- **React hook** (`useAtsScore.ts`) — debouncing, memoization, loading states
- **UI components** — AtsScoreCard, KeywordAnalysis, FormattingWarnings all work correctly

---

## 11. DATA MODEL AND TYPE CHANGES

### New Types (in `atsScorer.ts` or `skillDatabase.ts`)

```typescript
interface SkillMatch {
  canonicalName: string;    // "React" (display name from DB)
  matchedForm: string;      // "reactjs" (what was found in the text)
  type: 'hard' | 'soft' | 'cert';
}
```

### Existing Types That DON'T Change

```typescript
// These all stay exactly as they are
interface CategoryScore { score: number; maxScore: number; suggestions: string[]; }
interface AtsScoreBreakdown { /* 10 categories — unchanged */ }
interface KeywordMatchDetail { /* unchanged */ }
interface PrioritizedAction { /* unchanged */ }
interface AtsScoreResult { /* unchanged */ }
```

### `classifySkillType()` Update

Currently uses `SOFT_SKILL_CANONICALS` set. With EMSI data, each skill already has a type ('Hard Skill' | 'Soft Skill' | 'Certification'). The function can first check the SKILL_DB, then fall back to `SOFT_SKILL_CANONICALS`:

```typescript
export function classifySkillType(keyword: string): 'hard_skill' | 'soft_skill' {
  const record = SKILL_DB.get(keyword.toLowerCase());
  if (record) {
    return record.type === 'soft' ? 'soft_skill' : 'hard_skill';
  }
  // Fall back to existing logic
  const canonical = getCanonicalForm(keyword);
  if (SOFT_SKILL_CANONICALS.has(canonical)) return 'soft_skill';
  if (SOFT_SKILL_CANONICALS.has(keyword.toLowerCase())) return 'soft_skill';
  return 'hard_skill';
}
```

---

## 12. TESTING STRATEGY

### Tests to UPDATE (existing)

All tests in `src/utils/__tests__/atsScorer.test.ts` that reference keyword matching:
- Tests that check `keywords.matched` and `keywords.missing` arrays
- Tests that check `breakdown.hardSkillMatch` scores
- Score threshold tests may need adjustment since keyword extraction will be more precise

### Tests to ADD (new)

```
describe('extractSkillsFromText', () => {
  // Core functionality
  it('should extract known hard skills from text')
  it('should extract known soft skills from text')
  it('should extract certifications from text')
  it('should NOT extract generic words like building, team, strong')
  it('should NOT extract common verbs and adjectives')

  // Phrase matching
  it('should match multi-word skills as phrases (machine learning)')
  it('should prefer trigram matches over bigram + unigram')
  it('should prefer bigram matches over separate unigrams')
  it('should not double-count words consumed by phrases')

  // Alias resolution
  it('should match skill aliases (JS → JavaScript)')
  it('should match skill aliases (k8s → Kubernetes)')
  it('should match case-insensitively')

  // Edge cases
  it('should handle empty text')
  it('should handle text with no known skills')
  it('should handle text with special characters in skill names (C++, C#, .NET)')
  it('should deduplicate skills found multiple times')
});

describe('SKILL_DB', () => {
  it('should contain 25000+ skills')
  it('should have hard, soft, and cert types')
  it('should have multi-word phrases in KNOWN_SKILL_PHRASES')
  it('should map aliases to canonical names')
});

describe('scoreKeywordMatchSplit with skill DB', () => {
  it('should only match real skills from JD, not random words')
  it('should classify hard vs soft skills correctly using DB type')
  it('should handle JD with no detectable skills gracefully')
});
```

### Running Tests

```bash
npx vitest run                           # All tests
npx vitest run src/utils/__tests__/atsScorer.test.ts  # Just ATS tests
npm run build                            # TypeScript compilation check
```

---

## 13. VERIFICATION CHECKLIST

After implementation, verify ALL of these:

- [ ] `npx vitest run` — all tests pass (no regressions)
- [ ] `npm run build` — TypeScript compiles clean, no errors
- [ ] Paste a real software engineering JD → only real skills show as keywords (React, Python, AWS — NOT building, team, strong)
- [ ] Paste a real marketing JD → marketing skills detected (SEO, Google Analytics, CRM — NOT looking, fast-paced, excellent)
- [ ] Paste a JD with synonyms: "JS experience required" → should show "JavaScript" as matched
- [ ] Multi-word skills: "machine learning experience" → "machine learning" as one skill, NOT "machine" + "learning"
- [ ] Without JD, with industry selected → falls back to industry keyword list (existing behavior)
- [ ] Without JD, without industry → shows baseline scores with appropriate message
- [ ] Score makes sense: a well-matched resume should score 70+, a mismatched one should score below 40
- [ ] All 10 category breakdowns still display correctly in the UI
- [ ] Confidence indicator still works
- [ ] Priority actions still generate meaningful suggestions
- [ ] Bundle size increase is reasonable (<200KB gzipped for the skill database)
- [ ] App loads without noticeable delay from skill DB initialization

---

## APPENDIX: Resume Data Type Reference

```typescript
interface ResumeData {
  contact: { firstName, lastName, email, phone, location, website, linkedin, github, portfolio, title };
  summary: { text: string };
  experience: Array<{ id, company, position, location, startDate, endDate, current, description, highlights[] }>;
  education: Array<{ id, institution, degree, field, startDate, endDate, gpa, description, highlights[] }>;
  skills: Array<{ id, category, items: string[] }>;
  projects: Array<{ id, name, description, technologies[], url, startDate, endDate, highlights[] }>;
  certifications: Array<{ id, name, issuer, date, expiryDate, credentialId, url }>;
  languages: Array<{ id, name, proficiency }>;
  volunteer: Array<{ id, organization, role, startDate, endDate, description, highlights[] }>;
  awards: Array<{ id, title, issuer, date, description }>;
  publications: Array<{ id, title, publisher, date, url, description }>;
  // + references, hobbies, affiliations, courses, customSections
}
```

## APPENDIX: How to Extract SkillNER Database

```python
# extract_skills.py — Run once, then delete
import json

# Option 1: Direct import (if skillNer installed)
try:
    from skillNer.general_params import SKILL_DB
    with open("emsi_skills_raw.json", "w") as f:
        json.dump(SKILL_DB, f, indent=2)
    print(f"Extracted {len(SKILL_DB)} skills")
except ImportError:
    print("Install skillNer first: pip install skillNer")

# Option 2: If Option 1 fails, check for the file directly
# The database file is usually at:
# <python-site-packages>/skillNer/data/skills_processed.json
```

After extraction, process into TypeScript:
```python
# process_to_typescript.py
import json

with open("emsi_skills_raw.json") as f:
    raw = json.load(f)

# Convert to compact TypeScript array format
entries = []
for skill_id, data in raw.items():
    name = data["skill_name"]
    skill_type = data["skill_type"]  # "Hard Skill", "Soft Skill", or "Certification"
    type_code = 0 if skill_type == "Hard Skill" else (1 if skill_type == "Soft Skill" else 2)
    cleaned = data["skill_cleaned"]

    # Entry: [name, type_code, ...aliases]
    aliases = []
    if cleaned != name.lower():
        aliases.append(cleaned)

    entries.append([name, type_code] + aliases)

# Sort alphabetically
entries.sort(key=lambda e: e[0].lower())

# Write TypeScript
with open("src/constants/skillDatabase.ts", "w") as f:
    f.write("// Auto-generated from EMSI/Lightcast skill database via SkillNER\n")
    f.write(f"// {len(entries)} skills\n\n")
    f.write("const RAW: (string|number)[][] = ")
    f.write(json.dumps(entries, ensure_ascii=False))
    f.write(";\n\n")
    f.write("// ... rest of TypeScript initialization code ...\n")

print(f"Processed {len(entries)} skills")
```

---

**END OF CONTEXT DOCUMENT**

This document should give any AI agent complete context to implement the skill database overhaul. The critical files to read first are `src/utils/atsScorer.ts` (the scorer) and `src/constants/atsSynonyms.ts` (current synonym system).
