// =============================================================================
// Resume Builder - ATS Scoring Algorithm
// =============================================================================
// Computes an ATS compatibility score (0-100) across ten categories:
//   1. Hard Skill Match (25 pts)    - Technical skills from JD found in resume
//   2. Soft Skill Match (5 pts)     - Soft skills from JD found in resume
//   3. Experience Alignment (15 pts)- Years + seniority match
//   4. Education Fit (5 pts)        - Degree level + field match
//   5. Keyword Optimization (10 pts)- Keyword placement quality
//   6. Content Impact (15 pts)      - Quantified achievements + action verbs
//   7. ATS Parseability (10 pts)    - Format safety: sections, dates, contact
//   8. Section Structure (5 pts)    - Essential + bonus sections present
//   9. Readability (5 pts)          - Bullet count, length, experience count
//  10. Tailoring Signals (5 pts)    - Resume customized for specific job
//
// Returns a detailed breakdown with per-category scores and suggestions.

import type { ResumeData, ExperienceEntry } from '@/types/resume';
import { getKeywordsByIndustry, type IndustryId } from '@/constants/atsKeywords';
import { resolveSynonyms, getCanonicalForm, SOFT_SKILL_CANONICALS } from '@/constants/atsSynonyms';
import { parseJobDescription, type ParsedJobDescription } from '@/utils/jdParser';
import { extractSkillsFromText, SKILL_DB } from '@/constants/skillDatabase';

// -- Types --------------------------------------------------------------------

export interface CategoryScore {
  score: number;
  maxScore: number;
  suggestions: string[];
}

export type ResumeTextLocation =
  | 'title'
  | 'summary'
  | 'skills'
  | 'experience_recent'
  | 'experience_old'
  | 'education'
  | 'projects'
  | 'certifications';

export type SeniorityLevel =
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'staff'
  | 'principal'
  | 'director'
  | 'vp'
  | 'cxo';

export type DegreeLevel = 'associate' | 'bachelor' | 'master' | 'phd';

export interface AtsScoreBreakdown {
  hardSkillMatch: CategoryScore;        // max 25
  softSkillMatch: CategoryScore;        // max 5
  experienceAlignment: CategoryScore;   // max 15
  educationFit: CategoryScore;          // max 5
  keywordOptimization: CategoryScore;   // max 10
  contentImpact: CategoryScore;         // max 15
  atsParseability: CategoryScore;       // max 10
  sectionStructure: CategoryScore;      // max 5
  readability: CategoryScore;           // max 5
  tailoringSignals: CategoryScore;      // max 5
}

export interface KeywordMatchDetail {
  keyword: string;
  status: 'matched' | 'missing' | 'partial';
  source: 'required' | 'preferred' | 'responsibilities' | 'title' | 'general';
  synonymUsed?: string;
  isPhrase: boolean;
  skillType: 'hard_skill' | 'soft_skill';
  locations?: ResumeTextLocation[];
}

export interface PrioritizedAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  action: string;
  impact: string;
  section: string;
}

export interface AtsScoreResult {
  score: number;
  breakdown: AtsScoreBreakdown;
  keywords: {
    matched: string[];
    missing: string[];
    partial: string[];
    matchDetails: KeywordMatchDetail[];
  };
  passLikelihood: string;
  prioritizedActions: PrioritizedAction[];
  parsedJd: ParsedJobDescription | null;
  confidence: 'high' | 'medium' | 'low';
  requirements: {
    yearsRequired: number | null;
    yearsOnResume: number;
    degreeRequired: string | null;
    degreeOnResume: string | null;
  };
}

// -- Constants ----------------------------------------------------------------

const ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'built', 'collaborated',
  'conducted', 'coordinated', 'created', 'delivered', 'designed',
  'developed', 'directed', 'drove', 'enhanced', 'established',
  'executed', 'generated', 'implemented', 'improved', 'increased',
  'initiated', 'launched', 'led', 'managed', 'mentored',
  'negotiated', 'optimized', 'orchestrated', 'organized', 'oversaw',
  'pioneered', 'planned', 'produced', 'reduced', 'resolved',
  'revamped', 'spearheaded', 'streamlined', 'supervised', 'transformed',
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'can', 'need', 'must', 'it', 'its', 'this', 'that', 'these',
  'those', 'i', 'we', 'you', 'he', 'she', 'they', 'me', 'us',
  'him', 'her', 'them', 'my', 'our', 'your', 'his', 'their',
  'what', 'which', 'who', 'whom', 'where', 'when', 'how', 'why',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
  'as', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'up', 'down', 'out', 'off', 'over',
  'under', 'each', 'every', 'all', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'only', 'own', 'same', 'also', 'just',
]);

const SENIORITY_RANK: Record<SeniorityLevel, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  staff: 5,
  principal: 6,
  director: 7,
  vp: 8,
  cxo: 9,
};

const LOCATION_MULTIPLIERS: Record<ResumeTextLocation, number> = {
  title: 3.0,
  summary: 2.5,
  skills: 2.0,
  experience_recent: 1.5,
  projects: 1.2,
  certifications: 1.5,
  experience_old: 1.0,
  education: 1.0,
};

const DEGREE_RANK: Record<DegreeLevel, number> = {
  associate: 0,
  bachelor: 1,
  master: 2,
  phd: 3,
};

const RELATED_FIELDS: string[][] = [
  ['computer science', 'software engineering', 'information technology', 'informatics', 'computer engineering', 'computing'],
  ['economics', 'finance', 'accounting', 'business administration', 'business'],
  ['electrical engineering', 'electronics', 'electronic engineering'],
  ['mechanical engineering', 'mechatronics', 'aerospace engineering'],
  ['mathematics', 'applied mathematics', 'statistics', 'data science'],
  ['biology', 'biochemistry', 'biomedical science', 'biotechnology'],
  ['chemistry', 'chemical engineering'],
  ['physics', 'applied physics', 'engineering physics'],
  ['marketing', 'communications', 'public relations', 'advertising'],
  ['psychology', 'cognitive science', 'behavioral science'],
  ['graphic design', 'visual design', 'interaction design', 'industrial design'],
  ['nursing', 'healthcare administration', 'public health'],
  ['civil engineering', 'structural engineering', 'environmental engineering'],
  ['political science', 'international relations', 'public policy', 'public administration'],
];

// -- Helper Functions ---------------------------------------------------------

/**
 * Builds a single string from all resume text content for keyword matching.
 */
function getResumeFullText(data: ResumeData): string {
  const parts: string[] = [];

  // Contact
  parts.push(data.contact.title);

  // Summary
  parts.push(data.summary.text);

  // Experience
  for (const exp of data.experience) {
    parts.push(exp.company, exp.position, exp.description);
    parts.push(...exp.highlights);
  }

  // Education
  for (const edu of data.education) {
    parts.push(edu.institution, edu.degree, edu.field, edu.description);
    parts.push(...edu.highlights);
  }

  // Skills
  for (const cat of data.skills) {
    parts.push(cat.category);
    parts.push(...cat.items);
  }

  // Projects
  for (const proj of data.projects) {
    parts.push(proj.name, proj.description);
    parts.push(...proj.technologies);
    parts.push(...proj.highlights);
  }

  // Certifications
  for (const cert of data.certifications) {
    parts.push(cert.name, cert.issuer);
  }

  // Languages
  for (const lang of data.languages) {
    parts.push(lang.name);
  }

  // Volunteer
  for (const vol of data.volunteer) {
    parts.push(vol.organization, vol.role, vol.description);
    parts.push(...vol.highlights);
  }

  // Awards
  for (const award of data.awards) {
    parts.push(award.title, award.description);
  }

  // Publications
  for (const pub of data.publications) {
    parts.push(pub.title, pub.description);
  }

  // Custom Sections
  for (const cs of data.customSections) {
    parts.push(cs.title);
    if (cs.content) {
      // Strip HTML tags to extract plain text
      parts.push(cs.content.replace(/<[^>]*>/g, ' '));
    }
    for (const entry of cs.entries) {
      parts.push(entry.title, entry.subtitle, entry.description);
      parts.push(...entry.highlights);
    }
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Collects all bullet points / highlights from the resume.
 */
function getAllHighlights(data: ResumeData): string[] {
  const highlights: string[] = [];
  for (const exp of data.experience) highlights.push(...exp.highlights);
  for (const edu of data.education) highlights.push(...edu.highlights);
  for (const proj of data.projects) highlights.push(...proj.highlights);
  for (const vol of data.volunteer) highlights.push(...vol.highlights);
  for (const cs of data.customSections) {
    for (const entry of cs.entries) highlights.push(...entry.highlights);
  }
  return highlights;
}

/**
 * Checks if resume text contains a keyword or any of its synonyms.
 * Returns the synonym that matched, or null if no match.
 */
function findSynonymMatch(keyword: string, resumeTextLower: string): string | null {
  const synonyms = resolveSynonyms(keyword);
  for (const syn of synonyms) {
    if (syn === keyword.toLowerCase()) continue; // skip the original — that's a direct match
    // Use word-boundary-aware check for short keywords to avoid false matches
    if (syn.length <= 3) {
      const regex = new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(resumeTextLower)) return syn;
    } else {
      if (resumeTextLower.includes(syn)) return syn;
    }
  }
  return null;
}

/**
 * Checks if resume text contains a keyword directly (exact or includes).
 */
function directMatch(keyword: string, resumeTextLower: string): boolean {
  const kw = keyword.toLowerCase();
  if (kw.length <= 3) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(resumeTextLower);
  }
  return resumeTextLower.includes(kw);
}

// -- Skill Classification -----------------------------------------------------

/**
 * Classifies a keyword as hard_skill or soft_skill.
 * Primary: SKILL_DB lookup. Fallback: SOFT_SKILL_CANONICALS.
 */
export function classifySkillType(keyword: string): 'hard_skill' | 'soft_skill' {
  const record = SKILL_DB.get(keyword.toLowerCase());
  if (record) return record.type === 'soft' ? 'soft_skill' : 'hard_skill';
  // Existing fallback
  const canonical = getCanonicalForm(keyword);
  if (SOFT_SKILL_CANONICALS.has(canonical)) return 'soft_skill';
  if (SOFT_SKILL_CANONICALS.has(keyword.toLowerCase())) return 'soft_skill';
  return 'hard_skill';
}

// -- Experience Year Calculator -----------------------------------------------

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parses a date string from resume experience entries.
 * Handles: "Jan 2020", "2020-01", "01/2020", "2020", "January 2020"
 */
export function parseResumeDate(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const s = dateStr.trim().toLowerCase();

  // "Jan 2020" or "January 2020"
  const monthYearMatch = s.match(/^([a-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const month = MONTH_MAP[monthYearMatch[1]];
    if (month !== undefined) {
      return new Date(parseInt(monthYearMatch[2], 10), month, 1);
    }
  }

  // "2020-01" or "01/2020"
  const dashMatch = s.match(/^(\d{4})-(\d{1,2})$/);
  if (dashMatch) {
    return new Date(parseInt(dashMatch[1], 10), parseInt(dashMatch[2], 10) - 1, 1);
  }
  const slashMatch = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[2], 10), parseInt(slashMatch[1], 10) - 1, 1);
  }

  // "2020" (year only)
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1], 10), 0, 1);
  }

  return null;
}

/**
 * Calculates total years of experience from experience entries.
 * Handles current=true as today, merges overlapping periods.
 */
export function calculateExperienceYears(experience: ExperienceEntry[]): number {
  if (experience.length === 0) return 0;

  const intervals: [number, number][] = [];
  const now = Date.now();

  for (const entry of experience) {
    const start = parseResumeDate(entry.startDate);
    if (!start) continue;

    let end: Date;
    if (entry.current || !entry.endDate?.trim()) {
      end = new Date(now);
    } else {
      const parsed = parseResumeDate(entry.endDate);
      if (!parsed) continue;
      end = parsed;
    }

    if (end.getTime() < start.getTime()) continue;
    intervals.push([start.getTime(), end.getTime()]);
  }

  if (intervals.length === 0) return 0;

  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);

  // Merge overlapping intervals
  const merged: [number, number][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }

  // Sum total ms
  let totalMs = 0;
  for (const [s, e] of merged) {
    totalMs += e - s;
  }

  // Convert to years (decimal)
  const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(years * 10) / 10; // round to 1 decimal
}

// -- Seniority Detection ------------------------------------------------------

const SENIORITY_PATTERNS: [SeniorityLevel, RegExp][] = [
  ['cxo', /\b(?:ceo|cto|cfo|coo|cio|cmo|chief)\b/i],
  ['vp', /\b(?:vice\s+president|vp)\b/i],
  ['director', /\b(?:director)\b/i],
  ['principal', /\b(?:principal)\b/i],
  ['staff', /\b(?:staff)\b/i],
  ['lead', /\b(?:lead|team\s+lead|tech\s+lead)\b/i],
  ['senior', /\b(?:senior|sr\.?)\b/i],
  ['mid', /\b(?:mid-?level|mid\s+level)\b/i],
  ['junior', /\b(?:junior|jr\.?)\b/i],
  ['intern', /\b(?:intern|internship)\b/i],
];

/**
 * Detects seniority level from a job title.
 */
export function detectSeniorityLevel(title: string): SeniorityLevel | null {
  if (!title) return null;
  for (const [level, pattern] of SENIORITY_PATTERNS) {
    if (pattern.test(title)) return level;
  }
  return null;
}

// -- Education Matching -------------------------------------------------------

/**
 * Parses degree level from a degree string like "Bachelor of Science".
 */
export function parseDegreeLevel(degreeStr: string): DegreeLevel | null {
  if (!degreeStr) return null;
  const lower = degreeStr.toLowerCase();
  if (/ph\.?d|doctor/i.test(lower)) return 'phd';
  if (/master|m\.?s\.?|m\.?b\.?a|m\.?a\b/i.test(lower)) return 'master';
  if (/bachelor|b\.?s\.?|b\.?a\b/i.test(lower)) return 'bachelor';
  if (/associate/i.test(lower)) return 'associate';
  return null;
}

/**
 * Checks if two fields of study are related.
 */
export function areFieldsRelated(field1: string, field2: string): boolean {
  if (!field1 || !field2) return false;
  const f1 = field1.toLowerCase().trim();
  const f2 = field2.toLowerCase().trim();
  if (f1 === f2) return true;
  for (const group of RELATED_FIELDS) {
    const hasF1 = group.some((g) => f1.includes(g) || g.includes(f1));
    const hasF2 = group.some((g) => f2.includes(g) || g.includes(f2));
    if (hasF1 && hasF2) return true;
  }
  return false;
}

// -- Section-Aware Text Extraction --------------------------------------------

/**
 * Returns resume text partitioned into 8 locations for keyword placement scoring.
 */
export function getResumeSectionTexts(data: ResumeData): Record<ResumeTextLocation, string> {
  const sections: Record<ResumeTextLocation, string[]> = {
    title: [],
    summary: [],
    skills: [],
    experience_recent: [],
    experience_old: [],
    education: [],
    projects: [],
    certifications: [],
  };

  // Title
  sections.title.push(data.contact.title);

  // Summary
  sections.summary.push(data.summary.text);

  // Skills
  for (const cat of data.skills) {
    sections.skills.push(cat.category);
    sections.skills.push(...cat.items);
  }

  // Experience: first 2 = recent, rest = old
  for (let i = 0; i < data.experience.length; i++) {
    const exp = data.experience[i];
    const target = i < 2 ? 'experience_recent' : 'experience_old';
    sections[target].push(exp.company, exp.position, exp.description);
    sections[target].push(...exp.highlights);
  }

  // Education
  for (const edu of data.education) {
    sections.education.push(edu.institution, edu.degree, edu.field, edu.description);
    sections.education.push(...edu.highlights);
  }

  // Projects
  for (const proj of data.projects) {
    sections.projects.push(proj.name, proj.description);
    sections.projects.push(...proj.technologies);
    sections.projects.push(...proj.highlights);
  }

  // Certifications
  for (const cert of data.certifications) {
    sections.certifications.push(cert.name, cert.issuer);
  }

  const result = {} as Record<ResumeTextLocation, string>;
  for (const [key, parts] of Object.entries(sections)) {
    result[key as ResumeTextLocation] = parts.filter(Boolean).join(' ').toLowerCase();
  }
  return result;
}

/**
 * Finds all resume sections where a keyword appears.
 */
function findKeywordLocations(
  keyword: string,
  sectionTexts: Record<ResumeTextLocation, string>
): ResumeTextLocation[] {
  const locations: ResumeTextLocation[] = [];
  for (const [loc, text] of Object.entries(sectionTexts)) {
    if (directMatch(keyword, text)) {
      locations.push(loc as ResumeTextLocation);
    }
  }
  return locations;
}

// -- Scoring Functions --------------------------------------------------------

/**
 * Classify JD keyword source based on parsed sections.
 */
function classifyKeywordSource(
  keyword: string,
  parsedJd: ParsedJobDescription
): KeywordMatchDetail['source'] {
  const kw = keyword.toLowerCase();
  if (parsedJd.title.toLowerCase().includes(kw)) return 'title';
  if (parsedJd.sections.required.toLowerCase().includes(kw)) return 'required';
  if (parsedJd.sections.responsibilities.toLowerCase().includes(kw)) return 'responsibilities';
  if (parsedJd.sections.preferred.toLowerCase().includes(kw)) return 'preferred';
  return 'general';
}

/**
 * Weight multiplier for keyword source.
 */
function sourceWeight(source: KeywordMatchDetail['source']): number {
  switch (source) {
    case 'title': return 4;
    case 'required': return 3;
    case 'responsibilities': return 1.5;
    case 'preferred': return 1;
    case 'general': return 1;
  }
}

/**
 * 1+2. Keyword Match Split — Hard Skills (max 25) + Soft Skills (max 5)
 * Reuses ALL existing keyword extraction, phrase matching, synonym resolution.
 */
function scoreKeywordMatchSplit(
  data: ResumeData,
  jobDescription: string,
  industryId?: IndustryId
): {
  hardSkillScore: CategoryScore;
  softSkillScore: CategoryScore;
  matched: string[];
  missing: string[];
  partial: string[];
  matchDetails: KeywordMatchDetail[];
  parsedJd: ParsedJobDescription | null;
} {
  // No JD + no industry → baselines
  if (!jobDescription.trim() && !industryId) {
    return {
      hardSkillScore: {
        score: 12,
        maxScore: 25,
        suggestions: ['Provide a job description to get a detailed keyword match analysis.'],
      },
      softSkillScore: {
        score: 3,
        maxScore: 5,
        suggestions: [],
      },
      matched: [],
      missing: [],
      partial: [],
      matchDetails: [],
      parsedJd: null,
    };
  }

  // Industry-only path (no JD)
  if (!jobDescription.trim() && industryId) {
    const industryKeywords = getKeywordsByIndustry(industryId);
    if (industryKeywords.length === 0) {
      return {
        hardSkillScore: { score: 12, maxScore: 25, suggestions: ['Provide a job description to get a detailed keyword match analysis.'] },
        softSkillScore: { score: 3, maxScore: 5, suggestions: [] },
        matched: [], missing: [], partial: [], matchDetails: [], parsedJd: null,
      };
    }

    const resumeText = getResumeFullText(data).toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];
    const partial: string[] = [];
    const matchDetails: KeywordMatchDetail[] = [];

    for (const kw of industryKeywords) {
      const skillType = classifySkillType(kw);
      if (directMatch(kw, resumeText)) {
        matched.push(kw);
        matchDetails.push({ keyword: kw, status: 'matched', source: 'general', isPhrase: kw.includes(' '), skillType });
      } else {
        const synMatch = findSynonymMatch(kw, resumeText);
        if (synMatch) {
          partial.push(kw);
          matchDetails.push({ keyword: kw, status: 'partial', source: 'general', synonymUsed: synMatch, isPhrase: kw.includes(' '), skillType });
        } else {
          missing.push(kw);
          matchDetails.push({ keyword: kw, status: 'missing', source: 'general', isPhrase: kw.includes(' '), skillType });
        }
      }
    }

    // Split by skill type
    const hardDetails = matchDetails.filter((d) => d.skillType === 'hard_skill');
    const softDetails = matchDetails.filter((d) => d.skillType === 'soft_skill');

    const hardTotal = hardDetails.length || 1;
    const hardMatched = hardDetails.filter((d) => d.status === 'matched').length +
      hardDetails.filter((d) => d.status === 'partial').length * 0.5;
    const hardScore = Math.round(Math.min(hardMatched / hardTotal, 1) * 25);

    const softTotal = softDetails.length || 1;
    const softMatched = softDetails.filter((d) => d.status === 'matched').length +
      softDetails.filter((d) => d.status === 'partial').length * 0.5;
    const softScore = Math.round(Math.min(softMatched / softTotal, 1) * 5);

    const hardSuggestions: string[] = [];
    const hardMissing = hardDetails.filter((d) => d.status === 'missing');
    if (hardMissing.length > 0) {
      hardSuggestions.push(`Top industry hard skills to add: ${hardMissing.slice(0, 6).map((d) => d.keyword).join(', ')}.`);
    }

    return {
      hardSkillScore: { score: hardScore, maxScore: 25, suggestions: hardSuggestions },
      softSkillScore: { score: softScore, maxScore: 5, suggestions: [] },
      matched, missing, partial, matchDetails, parsedJd: null,
    };
  }

  // Full JD path
  const parsedJd = parseJobDescription(jobDescription);

  // Extract only real skills from JD using skill database lookup
  const jdSkills = extractSkillsFromText(jobDescription);
  const uniqueJdKeywords = jdSkills.map(s => s.canonicalName.toLowerCase());
  // Build a map for quick type lookup
  const skillTypeMap = new Map(jdSkills.map(s => [s.canonicalName.toLowerCase(), s.type]));

  const resumeText = getResumeFullText(data);
  const resumeTextLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];
  const partial: string[] = [];
  const matchDetails: KeywordMatchDetail[] = [];

  let hardWeightedMatched = 0;
  let hardWeightedTotal = 0;
  let softWeightedMatched = 0;
  let softWeightedTotal = 0;

  for (const keyword of uniqueJdKeywords) {
    const source = classifyKeywordSource(keyword, parsedJd);
    const weight = sourceWeight(source);
    const isPhrase = keyword.includes(' ');
    const dbType = skillTypeMap.get(keyword.toLowerCase());
    const skillType: 'hard_skill' | 'soft_skill' = dbType === 'soft' ? 'soft_skill' : 'hard_skill';

    if (skillType === 'hard_skill') {
      hardWeightedTotal += weight;
    } else {
      softWeightedTotal += weight;
    }

    if (directMatch(keyword, resumeTextLower)) {
      matched.push(keyword);
      if (skillType === 'hard_skill') {
        hardWeightedMatched += weight;
      } else {
        softWeightedMatched += weight;
      }
      matchDetails.push({ keyword, status: 'matched', source, isPhrase, skillType });
    } else {
      const synMatch = findSynonymMatch(keyword, resumeTextLower);
      if (synMatch) {
        partial.push(keyword);
        if (skillType === 'hard_skill') {
          hardWeightedMatched += weight * 0.7;
        } else {
          softWeightedMatched += weight * 0.7;
        }
        matchDetails.push({ keyword, status: 'partial', source, synonymUsed: synMatch, isPhrase, skillType });
      } else {
        missing.push(keyword);
        matchDetails.push({ keyword, status: 'missing', source, isPhrase, skillType });
      }
    }
  }

  const hardRatio = hardWeightedTotal > 0 ? Math.min(hardWeightedMatched / hardWeightedTotal, 1) : 0;
  const hardScore = Math.round(hardRatio * 25);
  const softRatio = softWeightedTotal > 0 ? Math.min(softWeightedMatched / softWeightedTotal, 1) : 0;
  const softScore = Math.round(softRatio * 5);

  const hardSuggestions: string[] = [];
  const softSuggestions: string[] = [];

  const hardMissing = matchDetails.filter((d) => d.status === 'missing' && d.skillType === 'hard_skill');
  const softMissing = matchDetails.filter((d) => d.status === 'missing' && d.skillType === 'soft_skill');

  if (hardRatio < 0.5) {
    hardSuggestions.push(
      `Your resume matches only ${Math.round(hardRatio * 100)}% of hard skills from the job description.`
    );
  }
  if (hardMissing.length > 0) {
    hardSuggestions.push(`Add these technical skills: ${hardMissing.slice(0, 8).map((d) => d.keyword).join(', ')}.`);
  }
  if (softMissing.length > 0) {
    softSuggestions.push(`Consider highlighting: ${softMissing.slice(0, 4).map((d) => d.keyword).join(', ')}.`);
  }

  return {
    hardSkillScore: { score: hardScore, maxScore: 25, suggestions: hardSuggestions },
    softSkillScore: { score: softScore, maxScore: 5, suggestions: softSuggestions },
    matched, missing, partial, matchDetails, parsedJd,
  };
}

/**
 * 3. Experience Alignment (max 15 pts)
 */
function scoreExperienceAlignment(
  data: ResumeData,
  parsedJd: ParsedJobDescription | null
): CategoryScore {
  const suggestions: string[] = [];
  let score = 0;

  const yearsOnResume = calculateExperienceYears(data.experience);
  const yearsRequired = parsedJd?.extractedRequirements.yearsOfExperience ?? null;

  // Years match (10 pts)
  if (yearsRequired === null) {
    // No requirement detected → baseline 7
    score += yearsOnResume > 0 ? 7 : 3;
    if (yearsOnResume === 0) {
      suggestions.push('Add dates to your experience entries to show years of experience.');
    }
  } else {
    if (yearsOnResume >= yearsRequired) {
      score += 10;
    } else if (yearsOnResume >= yearsRequired - 1) {
      score += 7;
      suggestions.push(`You have ~${yearsOnResume} years; the JD asks for ${yearsRequired}+. Close but consider highlighting transferable experience.`);
    } else if (yearsOnResume >= yearsRequired - 2) {
      score += 4;
      suggestions.push(`You have ~${yearsOnResume} years of experience but the JD requires ${yearsRequired}+. Emphasize relevant projects and skills.`);
    } else {
      score += 2;
      suggestions.push(`The JD requires ${yearsRequired}+ years of experience. Your resume shows ~${yearsOnResume} years.`);
    }
  }

  // Seniority match (5 pts)
  const resumeTitle = data.experience.length > 0 ? data.experience[0].position : data.contact.title;
  const resumeSeniority = detectSeniorityLevel(resumeTitle);
  const jdSeniority = parsedJd ? detectSeniorityLevel(parsedJd.title) : null;

  if (jdSeniority === null) {
    // No detectable seniority → baseline 3
    score += resumeSeniority ? 3 : 2;
  } else if (resumeSeniority === null) {
    score += 2;
    suggestions.push('Consider adding a seniority indicator to your job title (e.g., Senior, Lead).');
  } else {
    const resumeRank = SENIORITY_RANK[resumeSeniority];
    const jdRank = SENIORITY_RANK[jdSeniority];
    if (resumeRank >= jdRank) {
      score += 5;
    } else if (resumeRank >= jdRank - 1) {
      score += 3;
    } else {
      score += 1;
      suggestions.push(`The role appears to be ${jdSeniority}-level, but your most recent title suggests ${resumeSeniority}-level.`);
    }
  }

  return { score: Math.min(score, 15), maxScore: 15, suggestions };
}

/**
 * 4. Education Fit (max 5 pts)
 */
function scoreEducationFit(
  data: ResumeData,
  parsedJd: ParsedJobDescription | null
): CategoryScore {
  const suggestions: string[] = [];
  let score = 0;

  const requiredLevel = parsedJd?.extractedRequirements.degreeLevel ?? null;
  const requiredField = parsedJd?.extractedRequirements.degreeField ?? null;

  // Find highest degree on resume
  let bestDegree: DegreeLevel | null = null;
  let bestField: string | null = null;
  for (const edu of data.education) {
    const level = parseDegreeLevel(edu.degree);
    if (level !== null) {
      if (bestDegree === null || DEGREE_RANK[level] > DEGREE_RANK[bestDegree]) {
        bestDegree = level;
        bestField = edu.field || null;
      }
    }
  }

  // Degree level (3 pts)
  if (requiredLevel === null) {
    // No requirement → baseline 2
    score += bestDegree ? 2 : 1;
  } else {
    const reqDegree = parseDegreeLevel(requiredLevel);
    if (reqDegree === null) {
      score += bestDegree ? 2 : 1;
    } else if (bestDegree === null) {
      score += 0;
      suggestions.push(`The JD requires a ${requiredLevel}'s degree. Add your education to your resume.`);
    } else if (DEGREE_RANK[bestDegree] >= DEGREE_RANK[reqDegree]) {
      score += 3;
    } else if (DEGREE_RANK[bestDegree] >= DEGREE_RANK[reqDegree] - 1) {
      score += 1;
      suggestions.push(`The JD prefers a ${requiredLevel}'s degree; your highest is a ${bestDegree}'s.`);
    } else {
      score += 0;
      suggestions.push(`The JD requires a ${requiredLevel}'s degree; your highest is a ${bestDegree}'s.`);
    }
  }

  // Field match (2 pts)
  if (requiredField === null) {
    score += bestField ? 1 : 0;
  } else if (bestField === null) {
    score += 0;
    if (data.education.length > 0) {
      suggestions.push(`Add your field of study to match the JD requirement (${requiredField}).`);
    }
  } else {
    const f1 = bestField.toLowerCase();
    const f2 = requiredField.toLowerCase();
    if (f1.includes(f2) || f2.includes(f1)) {
      score += 2; // exact match
    } else if (areFieldsRelated(bestField, requiredField)) {
      score += 1; // related field
    } else {
      score += 0;
      suggestions.push(`Your degree is in ${bestField}, but the JD asks for ${requiredField}.`);
    }
  }

  return { score: Math.min(score, 5), maxScore: 5, suggestions };
}

/**
 * 5. Keyword Optimization (max 10 pts) — placement quality scoring
 */
function scoreKeywordOptimization(
  matchedKeywords: KeywordMatchDetail[],
  sectionTexts: Record<ResumeTextLocation, string>
): CategoryScore {
  const suggestions: string[] = [];
  const matchedOrPartial = matchedKeywords.filter(
    (d) => d.status === 'matched' || d.status === 'partial'
  );

  if (matchedOrPartial.length === 0) {
    return { score: 0, maxScore: 10, suggestions: ['Add keywords from the job description to your resume.'] };
  }

  let totalLocationScore = 0;
  let maxPossibleScore = 0;
  const bestMultiplier = LOCATION_MULTIPLIERS.title; // 3.0

  const keywordsOnlyInOld: string[] = [];
  const keywordsMissingSummary: string[] = [];

  for (const detail of matchedOrPartial) {
    const keyword = detail.synonymUsed ?? detail.keyword;
    const locations = findKeywordLocations(keyword, sectionTexts);

    // Also update the detail with locations
    detail.locations = locations;

    maxPossibleScore += bestMultiplier;

    if (locations.length === 0) {
      // Synonym match but not directly in any section by exact match
      totalLocationScore += 0.5;
    } else {
      // Find best location multiplier
      let bestScore = 0;
      for (const loc of locations) {
        bestScore = Math.max(bestScore, LOCATION_MULTIPLIERS[loc]);
      }
      totalLocationScore += bestScore;

      // Track placement issues
      if (locations.length === 1 && locations[0] === 'experience_old') {
        keywordsOnlyInOld.push(detail.keyword);
      }
      if (!locations.includes('summary') && !locations.includes('title')) {
        keywordsMissingSummary.push(detail.keyword);
      }
    }
  }

  const placementRatio = maxPossibleScore > 0 ? totalLocationScore / maxPossibleScore : 0;
  const score = Math.round(placementRatio * 10);

  if (keywordsMissingSummary.length > 3) {
    suggestions.push('Add more keywords to your summary or title for better visibility.');
  }
  if (keywordsOnlyInOld.length > 0) {
    suggestions.push(`Keywords like "${keywordsOnlyInOld[0]}" only appear in older experience. Add them to recent roles or skills.`);
  }

  return { score: Math.min(score, 10), maxScore: 10, suggestions };
}

/**
 * 6. Content Impact (max 15 pts) — was contentQuality
 */
function scoreContentImpact(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Professional summary present and meaningful (4 pts)
  const summaryLength = data.summary.text.trim().length;
  if (summaryLength > 100) {
    score += 4;
  } else if (summaryLength > 30) {
    score += 2;
    suggestions.push('Expand your professional summary to 2-3 sentences.');
  } else if (summaryLength > 0) {
    score += 1;
    suggestions.push('Your summary is very short. Aim for 2-3 impactful sentences.');
  } else {
    suggestions.push('Add a professional summary to make a strong first impression.');
  }

  // Quantified achievements (6 pts)
  const highlights = getAllHighlights(data);
  const quantifiedCount = highlights.filter((h) =>
    /\d+%|\$[\d,]+|\d+\+?\s*(?:years?|months?|clients?|projects?|team|people|users?|customers?|revenue|increase|decrease|reduction|improvement)/i.test(h)
  ).length;

  if (highlights.length === 0) {
    suggestions.push('Add bullet points to your experience entries with quantified achievements.');
  } else {
    const quantifiedRatio = quantifiedCount / highlights.length;
    if (quantifiedRatio >= 0.5) {
      score += 6;
    } else if (quantifiedRatio >= 0.25) {
      score += 4;
      suggestions.push('Add more numbers and metrics to your bullet points (e.g., "Increased sales by 25%").');
    } else if (quantifiedCount > 0) {
      score += 2;
      suggestions.push('Most of your bullet points lack quantified results. Use numbers, percentages, or dollar amounts.');
    } else {
      suggestions.push('None of your bullet points include quantified achievements. Add metrics to demonstrate impact.');
    }
  }

  // Action verbs (5 pts)
  const highlightsText = highlights.join(' ').toLowerCase();
  const usedActionVerbs = ACTION_VERBS.filter((v) => highlightsText.includes(v));

  if (usedActionVerbs.length >= 8) {
    score += 5;
  } else if (usedActionVerbs.length >= 5) {
    score += 3;
    suggestions.push('Use more varied action verbs to start your bullet points.');
  } else if (usedActionVerbs.length >= 2) {
    score += 2;
    suggestions.push('Start each bullet point with a strong action verb (e.g., "Developed", "Managed", "Implemented").');
  } else {
    suggestions.push('Your bullet points should start with action verbs. Examples: Achieved, Developed, Led, Streamlined.');
  }

  return { score: Math.min(score, 15), maxScore: 15, suggestions };
}

/**
 * 7. ATS Parseability (max 10 pts) — was formatting
 */
function scoreAtsParseability(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Standard section headings present (up to 4 pts)
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasSkills = data.skills.length > 0;
  const hasSummary = data.summary.text.trim().length > 0;

  const headingCount = [hasExperience, hasEducation, hasSkills, hasSummary].filter(Boolean).length;
  score += headingCount; // 1 pt each, max 4

  if (!hasExperience) suggestions.push('Add a Work Experience section.');
  if (!hasEducation) suggestions.push('Add an Education section.');
  if (!hasSkills) suggestions.push('Add a Skills section.');
  if (!hasSummary) suggestions.push('Add a Professional Summary section.');

  // Consistent date formatting (up to 3 pts)
  const allDates: string[] = [];
  for (const exp of data.experience) {
    if (exp.startDate) allDates.push(exp.startDate);
    if (exp.endDate) allDates.push(exp.endDate);
  }
  for (const edu of data.education) {
    if (edu.startDate) allDates.push(edu.startDate);
    if (edu.endDate) allDates.push(edu.endDate);
  }

  if (allDates.length > 0) {
    score += 3;
  } else {
    suggestions.push('Add dates to your experience and education entries.');
  }

  // Contact info completeness (up to 3 pts)
  const hasEmail = !!data.contact.email;
  const hasPhone = !!data.contact.phone;
  const hasLocation = !!data.contact.location;

  if (hasEmail) score += 1;
  else suggestions.push('Add your email address.');
  if (hasPhone) score += 1;
  else suggestions.push('Add your phone number.');
  if (hasLocation) score += 1;
  else suggestions.push('Add your location.');

  return { score: Math.min(score, 10), maxScore: 10, suggestions };
}

/**
 * 8. Section Structure (max 5 pts) — was sectionCompleteness
 */
function scoreSectionStructure(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Essential sections (1 pt each, max 4)
  if (data.contact.firstName || data.contact.lastName) score += 1;
  else suggestions.push('Add your name to the contact section.');

  if (data.experience.length > 0) score += 1;
  else suggestions.push('Add at least one work experience entry.');

  if (data.education.length > 0) score += 1;
  else suggestions.push('Add your education background.');

  if (data.skills.length > 0) score += 1;
  else suggestions.push('Add a skills section to highlight your competencies.');

  // Bonus: extra sections (1 pt)
  const bonusSections = [
    data.certifications.length > 0,
    data.projects.length > 0,
    data.volunteer.length > 0,
    data.awards.length > 0,
    data.languages.length > 0,
    data.publications.length > 0,
  ].filter(Boolean).length;

  if (bonusSections >= 2) {
    score += 1;
  } else if (bonusSections === 0) {
    suggestions.push('Add supplementary sections like projects, certifications, or volunteer experience.');
  }

  return { score: Math.min(score, 5), maxScore: 5, suggestions };
}

/**
 * 9. Readability (max 5 pts) — reduced from 10
 */
function scoreReadability(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  const highlights = getAllHighlights(data);

  // Bullet points usage (2 pts)
  if (highlights.length >= 6) {
    score += 2;
  } else if (highlights.length >= 3) {
    score += 1;
    suggestions.push('Add more bullet points to your experience entries (3-5 per role).');
  } else {
    suggestions.push('Use bullet points to describe your experience. Aim for 3-5 bullets per role.');
  }

  // Bullet point length (1.5 pts)
  if (highlights.length > 0) {
    const avgLength = highlights.reduce((sum, h) => sum + h.length, 0) / highlights.length;

    if (avgLength >= 40 && avgLength <= 150) {
      score += 1.5;
    } else if (avgLength < 40) {
      score += 0.5;
      suggestions.push('Your bullet points are quite short. Provide more detail about your accomplishments.');
    } else {
      score += 0.5;
      suggestions.push('Some bullet points are too long. Keep each to 1-2 lines for easy scanning.');
    }
  }

  // Experience entry count (1.5 pts)
  const expCount = data.experience.length;
  if (expCount >= 2 && expCount <= 6) {
    score += 1.5;
  } else if (expCount === 1) {
    score += 1;
    suggestions.push('Consider adding more work experience if available.');
  } else if (expCount > 6) {
    score += 1;
    suggestions.push('You have many experience entries. Consider focusing on the most recent and relevant roles.');
  } else {
    suggestions.push('Add work experience to your resume.');
  }

  return { score: Math.min(Math.round(score * 2) / 2, 5), maxScore: 5, suggestions };
}

/**
 * 10. Tailoring Signals (max 5 pts) — resume appears customized for this job
 */
function scoreTailoringSignals(
  data: ResumeData,
  parsedJd: ParsedJobDescription | null,
  matchedKeywords: KeywordMatchDetail[]
): CategoryScore {
  const suggestions: string[] = [];

  if (!parsedJd) {
    // No JD → baseline 2
    return { score: 2, maxScore: 5, suggestions: ['Provide a job description to check tailoring signals.'] };
  }

  let score = 0;

  // Title mirrors JD (1.5 pts)
  const resumeTitle = data.contact.title.toLowerCase();
  const jdTitle = parsedJd.title.toLowerCase();
  if (jdTitle && resumeTitle) {
    const jdTitleWords = jdTitle.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const matchingWords = jdTitleWords.filter((w) => resumeTitle.includes(w));
    if (jdTitleWords.length > 0 && matchingWords.length / jdTitleWords.length >= 0.5) {
      score += 1.5;
    } else if (matchingWords.length > 0) {
      score += 0.5;
      suggestions.push('Consider aligning your resume title more closely with the job title.');
    } else {
      suggestions.push('Your resume title doesn\'t match the job title. Consider updating it.');
    }
  } else if (!resumeTitle) {
    suggestions.push('Add a professional title to your resume that matches the target role.');
  }

  // Summary keyword density (1.5 pts)
  const summaryLower = data.summary.text.toLowerCase();
  if (summaryLower.length > 20) {
    const matchedInSummary = matchedKeywords.filter(
      (d) => (d.status === 'matched' || d.status === 'partial') && d.skillType === 'hard_skill'
    ).filter((d) => {
      const kw = d.synonymUsed ?? d.keyword;
      return directMatch(kw, summaryLower);
    });

    const hardMatched = matchedKeywords.filter((d) =>
      (d.status === 'matched' || d.status === 'partial') && d.skillType === 'hard_skill'
    );

    if (hardMatched.length > 0) {
      const density = matchedInSummary.length / hardMatched.length;
      if (density >= 0.3) {
        score += 1.5;
      } else if (density > 0) {
        score += 0.5;
        suggestions.push('Include more key skills from the job description in your summary.');
      } else {
        suggestions.push('Your summary doesn\'t mention any skills from the job description.');
      }
    }
  }

  // Top skills match JD (1 pt)
  const allSkillItems = data.skills.flatMap((s) => s.items.map((i) => i.toLowerCase()));
  const matchedHardKeywords = matchedKeywords.filter(
    (d) => d.status === 'matched' && d.skillType === 'hard_skill'
  );
  const skillsInList = matchedHardKeywords.filter((d) =>
    allSkillItems.some((s) => s.includes(d.keyword) || d.keyword.includes(s))
  );
  if (matchedHardKeywords.length > 0 && skillsInList.length / matchedHardKeywords.length >= 0.5) {
    score += 1;
  } else if (skillsInList.length > 0) {
    score += 0.5;
  }

  // Seniority alignment (0.5 pts)
  const jdSeniority = detectSeniorityLevel(parsedJd.title);
  const resumeSeniority = detectSeniorityLevel(
    data.experience.length > 0 ? data.experience[0].position : data.contact.title
  );
  if (jdSeniority && resumeSeniority && SENIORITY_RANK[resumeSeniority] >= SENIORITY_RANK[jdSeniority]) {
    score += 0.5;
  }

  return { score: Math.min(Math.round(score * 2) / 2, 5), maxScore: 5, suggestions };
}

// -- Score Confidence ---------------------------------------------------------

/**
 * Computes confidence level based on JD quality.
 */
function computeConfidence(
  jobDescription: string,
  parsedJd: ParsedJobDescription | null
): 'high' | 'medium' | 'low' {
  if (!jobDescription.trim()) return 'low';

  let qualityScore = 0;

  // Word count
  const wordCount = jobDescription.trim().split(/\s+/).length;
  if (wordCount >= 200) qualityScore += 2;
  else if (wordCount >= 100) qualityScore += 1;

  if (parsedJd) {
    // Detected sections count (up to 3)
    const sectionCount = [
      parsedJd.sections.required,
      parsedJd.sections.preferred,
      parsedJd.sections.responsibilities,
      parsedJd.sections.about,
    ].filter((s) => s.length > 0).length;
    qualityScore += Math.min(sectionCount, 3);

    // Has specific requirements
    if (parsedJd.extractedRequirements.yearsOfExperience !== null) qualityScore += 1;
    if (parsedJd.extractedRequirements.degreeLevel !== null) qualityScore += 1;
    if (parsedJd.extractedRequirements.certifications.length > 0) qualityScore += 1;

    // Has title
    if (parsedJd.title.length > 0) qualityScore += 1;
  }

  if (qualityScore >= 6) return 'high';
  if (qualityScore >= 3) return 'medium';
  return 'low';
}

// -- Priority Actions ---------------------------------------------------------

function computePassLikelihood(score: number): string {
  if (score >= 85) return 'Strong pass';
  if (score >= 70) return 'Likely pass';
  if (score >= 55) return 'Uncertain';
  if (score >= 40) return 'At risk';
  return 'Unlikely to pass';
}

function prioritizeActions(
  breakdown: AtsScoreBreakdown,
  keywords: { matched: string[]; missing: string[]; partial: string[]; matchDetails: KeywordMatchDetail[] },
  parsedJd: ParsedJobDescription | null,
  _score: number
): PrioritizedAction[] {
  const actions: PrioritizedAction[] = [];

  // -- CRITICAL ---------------------------------------------------------------
  // Missing required JD keywords
  const missingRequired = keywords.matchDetails.filter(
    (d) => d.status === 'missing' && d.source === 'required'
  );
  if (missingRequired.length > 0) {
    actions.push({
      priority: 'critical',
      category: 'Keywords',
      action: `Add required skills: ${missingRequired.slice(0, 5).map((d) => d.keyword).join(', ')}`,
      impact: 'These are listed as required in the job description',
      section: 'skills',
    });
  }

  // Very low hard skill match
  const hardPercentage = (breakdown.hardSkillMatch.score / breakdown.hardSkillMatch.maxScore) * 100;
  if (hardPercentage < 30) {
    actions.push({
      priority: 'critical',
      category: 'Keywords',
      action: 'Resume has very low keyword match with the job description',
      impact: 'Most ATS systems will filter out resumes below 30% match',
      section: 'skills',
    });
  }

  // Missing essential sections
  if (breakdown.sectionStructure.score <= 2) {
    actions.push({
      priority: 'critical',
      category: 'Sections',
      action: 'Missing essential resume sections (experience or skills)',
      impact: 'ATS requires standard sections to parse your resume',
      section: 'experience',
    });
  }

  // -- HIGH -------------------------------------------------------------------
  if (hardPercentage < 50 && hardPercentage >= 30) {
    actions.push({
      priority: 'high',
      category: 'Keywords',
      action: 'Hard skill match is below 50%. Tailor your resume to the job description',
      impact: 'Improving keyword match is the highest-impact change',
      section: 'skills',
    });
  }

  // No quantified achievements
  const contentPercentage = (breakdown.contentImpact.score / breakdown.contentImpact.maxScore) * 100;
  if (contentPercentage < 40) {
    actions.push({
      priority: 'high',
      category: 'Content',
      action: 'Add quantified achievements with numbers and metrics',
      impact: 'Quantified results make your experience more compelling',
      section: 'experience',
    });
  }

  // Summary missing or too short
  if (breakdown.contentImpact.suggestions.some((s) => s.includes('summary'))) {
    actions.push({
      priority: 'high',
      category: 'Content',
      action: 'Add or expand your professional summary',
      impact: 'A strong summary helps both ATS and human reviewers',
      section: 'summary',
    });
  }

  // Missing 5+ keywords
  if (keywords.missing.length >= 5) {
    actions.push({
      priority: 'high',
      category: 'Keywords',
      action: `${keywords.missing.length} keywords are missing from your resume`,
      impact: 'Adding relevant keywords will significantly improve your match score',
      section: 'skills',
    });
  }

  // Experience alignment issues
  if (breakdown.experienceAlignment.score <= 5) {
    actions.push({
      priority: 'high',
      category: 'Experience',
      action: 'Experience level doesn\'t match job requirements',
      impact: 'Highlight transferable experience and relevant projects',
      section: 'experience',
    });
  }

  // -- MEDIUM -----------------------------------------------------------------
  // Missing preferred keywords
  const missingPreferred = keywords.matchDetails.filter(
    (d) => d.status === 'missing' && d.source === 'preferred'
  );
  if (missingPreferred.length > 0) {
    actions.push({
      priority: 'medium',
      category: 'Keywords',
      action: `Add preferred skills: ${missingPreferred.slice(0, 5).map((d) => d.keyword).join(', ')}`,
      impact: 'Preferred skills can set you apart from other candidates',
      section: 'skills',
    });
  }

  // Few action verbs
  if (breakdown.contentImpact.suggestions.some((s) => s.includes('action verb'))) {
    actions.push({
      priority: 'medium',
      category: 'Content',
      action: 'Use more varied action verbs in bullet points',
      impact: 'Strong action verbs improve readability and impact',
      section: 'experience',
    });
  }

  // Keyword placement issues
  if (breakdown.keywordOptimization.score <= 4) {
    actions.push({
      priority: 'medium',
      category: 'Optimization',
      action: 'Improve keyword placement — add keywords to summary and title',
      impact: 'Keywords in prominent sections carry more weight with ATS',
      section: 'summary',
    });
  }

  // Bullet length issues
  if (breakdown.readability.suggestions.some((s) => s.includes('bullet points'))) {
    actions.push({
      priority: 'medium',
      category: 'Readability',
      action: 'Adjust bullet point length (aim for 1-2 lines each)',
      impact: 'Properly sized bullets are easier for both ATS and humans to scan',
      section: 'experience',
    });
  }

  // Missing bonus sections
  if (breakdown.sectionStructure.suggestions.some((s) => s.includes('supplementary') || s.includes('more sections'))) {
    actions.push({
      priority: 'medium',
      category: 'Sections',
      action: 'Add supplementary sections (certifications, projects, volunteer)',
      impact: 'Additional sections strengthen your overall profile',
      section: 'projects',
    });
  }

  // -- LOW --------------------------------------------------------------------
  // Formatting suggestions
  if (breakdown.atsParseability.suggestions.some((s) => s.includes('date'))) {
    actions.push({
      priority: 'low',
      category: 'Formatting',
      action: 'Ensure consistent date formatting throughout resume',
      impact: 'Consistent dates help ATS parse your timeline correctly',
      section: 'experience',
    });
  }

  if (breakdown.readability.suggestions.some((s) => s.includes('more work experience'))) {
    actions.push({
      priority: 'low',
      category: 'Content',
      action: 'Consider adding more work experience entries',
      impact: 'Multiple roles show career progression',
      section: 'experience',
    });
  }

  // Tailoring signals
  if (breakdown.tailoringSignals.score <= 2 && parsedJd) {
    actions.push({
      priority: 'low',
      category: 'Tailoring',
      action: 'Resume doesn\'t appear customized for this specific role',
      impact: 'Tailored resumes perform significantly better with recruiters',
      section: 'summary',
    });
  }

  // Sort by priority order
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

// -- Main Scoring Function ----------------------------------------------------

/**
 * Computes the ATS compatibility score for the given resume data.
 *
 * @param data - The resume data to score
 * @param jobDescription - Optional job description text for keyword matching
 * @returns Detailed score result with breakdown and keyword analysis
 */
export function computeAtsScore(
  data: ResumeData,
  jobDescription: string = '',
  industryId?: IndustryId
): AtsScoreResult {
  // 1+2: Keyword match split
  const keywordResult = scoreKeywordMatchSplit(data, jobDescription, industryId);

  // 3: Experience alignment
  const experienceAlignment = scoreExperienceAlignment(data, keywordResult.parsedJd);

  // 4: Education fit
  const educationFit = scoreEducationFit(data, keywordResult.parsedJd);

  // 5: Keyword optimization
  const sectionTexts = getResumeSectionTexts(data);
  const keywordOptimization = scoreKeywordOptimization(keywordResult.matchDetails, sectionTexts);

  // 6: Content impact (was contentQuality)
  const contentImpact = scoreContentImpact(data);

  // 7: ATS parseability (was formatting)
  const atsParseability = scoreAtsParseability(data);

  // 8: Section structure (was sectionCompleteness)
  const sectionStructure = scoreSectionStructure(data);

  // 9: Readability
  const readability = scoreReadability(data);

  // 10: Tailoring signals
  const tailoringSignals = scoreTailoringSignals(data, keywordResult.parsedJd, keywordResult.matchDetails);

  const totalScore =
    keywordResult.hardSkillScore.score +
    keywordResult.softSkillScore.score +
    experienceAlignment.score +
    educationFit.score +
    keywordOptimization.score +
    contentImpact.score +
    atsParseability.score +
    sectionStructure.score +
    readability.score +
    tailoringSignals.score;

  const finalScore = Math.min(Math.round(totalScore), 100);

  const breakdown: AtsScoreBreakdown = {
    hardSkillMatch: keywordResult.hardSkillScore,
    softSkillMatch: keywordResult.softSkillScore,
    experienceAlignment,
    educationFit,
    keywordOptimization,
    contentImpact,
    atsParseability,
    sectionStructure,
    readability,
    tailoringSignals,
  };

  const keywordsResult = {
    matched: keywordResult.matched,
    missing: keywordResult.missing,
    partial: keywordResult.partial,
    matchDetails: keywordResult.matchDetails,
  };

  const passLikelihood = computePassLikelihood(finalScore);
  const confidence = computeConfidence(jobDescription, keywordResult.parsedJd);
  const prioritizedActions = prioritizeActions(
    breakdown,
    keywordsResult,
    keywordResult.parsedJd,
    finalScore
  );

  // Requirements summary
  const yearsOnResume = calculateExperienceYears(data.experience);
  const bestDegree = data.education.reduce<string | null>((best, edu) => {
    const level = parseDegreeLevel(edu.degree);
    if (!level) return best;
    if (!best) return level;
    return DEGREE_RANK[level as DegreeLevel] > DEGREE_RANK[best as DegreeLevel] ? level : best;
  }, null);

  return {
    score: finalScore,
    breakdown,
    keywords: keywordsResult,
    passLikelihood,
    prioritizedActions,
    parsedJd: keywordResult.parsedJd,
    confidence,
    requirements: {
      yearsRequired: keywordResult.parsedJd?.extractedRequirements.yearsOfExperience ?? null,
      yearsOnResume,
      degreeRequired: keywordResult.parsedJd?.extractedRequirements.degreeLevel ?? null,
      degreeOnResume: bestDegree,
    },
  };
}
