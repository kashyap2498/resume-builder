// =============================================================================
// Resume Builder - Resume Text Parser
// =============================================================================
// Heuristic parser that takes raw text extracted from a PDF or DOCX and
// attempts to map it to structured ResumeData fields. The result is a partial
// ResumeData that the user can review and edit before finalizing.

import type {
  ResumeData,
  ContactData,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  CertificationEntry,
  ProjectEntry,
  LanguageEntry,
  LanguageProficiency,
  VolunteerEntry,
  AwardEntry,
  PublicationEntry,
  ReferenceEntry,
  AffiliationEntry,
  CourseEntry,
} from '@/types/resume';


// -- Regex Patterns -----------------------------------------------------------

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX =
  /(?:\+?1\s*[-.]?\s*)?(?:\(\d{3}\)|\d{3})\s*[-.\s]\s*\d{3}\s*[-.\s]\s*\d{4}|\b\d{10}\b/;
const LINKEDIN_REGEX =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;
const GITHUB_REGEX =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i;
const URL_REGEX =
  /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/i;
const DATE_REGEX =
  /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/i;
const DATE_RANGE_REGEX =
  /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|[Pp]resent|[Cc]urrent)/i;

// -- Source Range Types -------------------------------------------------------

export interface SourceRange {
  startOffset: number;
  endOffset: number;
}

export interface ParseMetadata {
  sectionRanges: Map<string, SourceRange>;
  unmatchedRanges: SourceRange[];
}

// -- Section Heading Detection ------------------------------------------------

interface SectionMatch {
  type: string;
  startIndex: number;
  endIndex: number;
  content: string;
  matchType?: 'exact' | 'fuzzy';
}

const SECTION_HEADINGS: Record<string, RegExp> = {
  summary: /^(?:summary|profile|objective|about\s*me|professional\s*summary|career\s*(?:summary|objective|profile)|executive\s*summary)\s*:?\s*$/i,
  experience:
    /^(?:experience|work\s*experience|employment(?:\s*history)?|professional\s*experience|work\s*history|relevant\s*experience)\s*:?\s*$/i,
  education: /^(?:education|academic(?:s|\s*background)?|educational\s*background)\s*:?\s*$/i,
  skills:
    /^(?:skills|technical\s*skills|core\s*skills|core\s*competencies|competencies|areas\s*of\s*expertise|proficiencies|key\s*skills|skills\s*(?:&|and)\s*(?:competencies|expertise)|skills\s*summary)\s*:?\s*$/i,
  projects: /^(?:projects|personal\s*projects|key\s*projects|selected\s*projects)\s*:?\s*$/i,
  certifications:
    /^(?:certifications?|licenses?|credentials|certifications?\s*(?:&|and)\s*licenses?)\s*:?\s*$/i,
  languages: /^(?:languages?)\s*:?\s*$/i,
  volunteer:
    /^(?:volunteer(?:\s*(?:experience|work))?|volunteering|community\s*(?:service|involvement))\s*:?\s*$/i,
  awards: /^(?:awards?|honors?|achievements?|awards?\s*(?:&|and)\s*honors?)\s*:?\s*$/i,
  publications: /^(?:publications?|papers?|research)\s*:?\s*$/i,
  references: /^(?:references?)\s*:?\s*$/i,
  interests: /^(?:interests?|hobbies(?:\s*(?:&|and)\s*interests?)?|activities)\s*:?\s*$/i,
  affiliations: /^(?:affiliations?|professional\s*affiliations?|memberships?|professional\s*memberships?|associations?)\s*:?\s*$/i,
  courses: /^(?:courses?|coursework|training|professional\s*development|workshops?|continuing\s*education)\s*:?\s*$/i,
};

// -- Fuzzy Section Heading Matching -------------------------------------------

const SECTION_KEYWORDS: Record<string, string[]> = {
  summary: ['summary', 'profile', 'objective', 'about', 'overview', 'introduction', 'statement'],
  experience: ['experience', 'employment', 'work', 'history', 'professional', 'career', 'background'],
  education: ['education', 'academic', 'credentials', 'qualification', 'degree', 'university', 'school'],
  skills: ['skills', 'technical', 'competencies', 'proficiencies', 'expertise', 'abilities', 'technologies', 'tools', 'stack'],
  projects: ['projects', 'personal', 'key', 'selected', 'portfolio'],
  certifications: ['certifications', 'certification', 'licenses', 'credentials', 'accreditation'],
  languages: ['languages', 'language', 'linguistic'],
  volunteer: ['volunteer', 'volunteering', 'community', 'service', 'involvement', 'civic'],
  awards: ['awards', 'honors', 'achievements', 'recognition', 'distinctions'],
  publications: ['publications', 'papers', 'research', 'articles', 'authored'],
  references: ['references', 'referees', 'recommendations'],
  interests: ['interests', 'hobbies', 'activities', 'passions', 'pursuits'],
  affiliations: ['affiliations', 'memberships', 'associations', 'organizations', 'professional'],
  courses: ['courses', 'coursework', 'training', 'development', 'workshops', 'continuing'],
};

function computeWordOverlapScore(heading: string, keywords: string[]): number {
  const words = heading.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let matching = 0;
  for (const word of words) {
    // Skip very short words (articles, prepositions) to avoid false matches
    if (word.length < 3) continue;
    if (keywords.some((kw) => word === kw || (word.length >= 4 && kw.length >= 4 && (word.includes(kw) || kw.includes(word))))) {
      matching++;
    }
  }
  // Use total heading words (including short ones) as denominator for conservative scoring
  return matching / words.length;
}

function looksLikeHeading(line: string, lines: string[], lineIndex: number): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Never treat bullet lines as headings
  if (BULLET_RE.test(trimmed)) return false;

  // Never treat date lines as headings
  if (DATE_RANGE_REGEX.test(trimmed)) return false;

  // All caps (at least 2 letters)
  if (/^[A-Z\s&\-/]+$/.test(trimmed) && trimmed.length >= 2 && /[A-Z]{2,}/.test(trimmed)) return true;

  // Title case: most words start with uppercase
  const words = trimmed.split(/\s+/);
  if (words.length >= 1 && words.length <= 6) {
    const capitalizedWords = words.filter((w) => /^[A-Z]/.test(w));
    if (capitalizedWords.length / words.length >= 0.5) {
      // Adjacent to blank line (before or after)
      const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
      const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1] : '';
      if (!prevLine.trim() || !nextLine.trim()) return true;
    }
  }

  return false;
}

function closePreviousSection(
  currentSection: SectionMatch | null,
  lines: string[],
  endLineIndex: number,
  sections: SectionMatch[],
): void {
  if (currentSection) {
    currentSection.endIndex = endLineIndex;
    currentSection.content = lines
      .slice(currentSection.startIndex + 1, endLineIndex + 1)
      .join('\n');
    sections.push(currentSection);
  }
}

function detectSections(text: string): SectionMatch[] {
  const lines = text.split('\n');
  const sections: SectionMatch[] = [];
  let currentSection: SectionMatch | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Normalize line for heading matching: strip common decorators
    const normalized = line.replace(/^[-=_*|:]+\s*/, '').replace(/\s*[-=_*|:]+$/, '').trim();

    let matched = false;

    // Pass 1: exact regex match
    for (const [type, regex] of Object.entries(SECTION_HEADINGS)) {
      if ((regex.test(line) || regex.test(normalized)) && line.length < 80) {
        closePreviousSection(currentSection, lines, i - 1, sections);

        currentSection = {
          type,
          startIndex: i,
          endIndex: -1,
          content: '',
          matchType: 'exact',
        };
        matched = true;
        break;
      }
    }

    // Pass 2: fuzzy matching fallback (skip obvious content lines)
    if (!matched && line.length < 80 && !BULLET_RE.test(line) && !DATE_RANGE_REGEX.test(line)) {
      let bestType: string | null = null;
      let bestScore = 0;

      for (const [type, keywords] of Object.entries(SECTION_KEYWORDS)) {
        const score = computeWordOverlapScore(normalized, keywords);
        if (score > bestScore) {
          bestScore = score;
          bestType = type;
        }
      }

      if (bestType && bestScore >= 0.6 && looksLikeHeading(line, lines, i)) {
        closePreviousSection(currentSection, lines, i - 1, sections);

        currentSection = {
          type: bestType,
          startIndex: i,
          endIndex: -1,
          content: '',
          matchType: 'fuzzy',
        };
      }
    }
  }

  // Close the last section
  if (currentSection) {
    currentSection.endIndex = lines.length - 1;
    currentSection.content = lines
      .slice(currentSection.startIndex + 1)
      .join('\n');
    sections.push(currentSection);
  }

  return sections;
}

// -- Contact Extraction -------------------------------------------------------

const LOCATION_REGEX = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\b/;
const JOB_TITLE_WORDS = /\b(?:engineer|developer|manager|director|analyst|architect|lead|senior|junior|designer|consultant|specialist|coordinator|administrator|scientist|researcher|professor|teacher|nurse|doctor|attorney|accountant|marketing|sales|product|program|project|data|software|web|full[\s-]?stack|front[\s-]?end|back[\s-]?end|devops|cloud|machine\s*learning|ai|ux|ui)\b/i;

function extractContact(text: string): Partial<ContactData> {
  const contact: Partial<ContactData> = {};

  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) contact.email = emailMatch[0];

  const phoneMatch = text.match(PHONE_REGEX);
  if (phoneMatch) contact.phone = phoneMatch[0].trim();

  const linkedinMatch = text.match(LINKEDIN_REGEX);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];

  const githubMatch = text.match(GITHUB_REGEX);
  if (githubMatch) contact.github = githubMatch[0];

  // Try to extract location from first 10 lines
  const first10Lines = text.split('\n').slice(0, 10);
  for (const line of first10Lines) {
    const locMatch = line.match(LOCATION_REGEX);
    if (locMatch) {
      contact.location = locMatch[0];
      break;
    }
  }

  // Try to extract website (and portfolio) from first 10 lines (exclude LinkedIn and GitHub)
  for (const line of first10Lines) {
    const urlMatch = line.match(URL_REGEX);
    if (urlMatch) {
      const url = urlMatch[0];
      if (!LINKEDIN_REGEX.test(url) && !GITHUB_REGEX.test(url)) {
        if (!contact.website) {
          contact.website = url;
        } else if (!contact.portfolio) {
          contact.portfolio = url;
          break;
        }
      }
    }
  }

  // Try to extract a name from the first few lines
  const firstLines = text.split('\n').slice(0, 5);
  let nameLineIndex = -1;
  for (let i = 0; i < firstLines.length; i++) {
    const trimmed = firstLines[i].trim();
    // A name line is typically short, has no special chars, and appears before contact info
    if (
      trimmed &&
      trimmed.length < 50 &&
      !EMAIL_REGEX.test(trimmed) &&
      !PHONE_REGEX.test(trimmed) &&
      !URL_REGEX.test(trimmed) &&
      !/^\d/.test(trimmed)
    ) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2 && parts.length <= 4) {
        contact.firstName = parts[0];
        contact.lastName = parts.slice(1).join(' ');
        nameLineIndex = i;
        break;
      } else if (parts.length === 1 && /^[A-Z]/.test(parts[0])) {
        contact.firstName = parts[0];
        nameLineIndex = i;
        break;
      }
    }
  }

  // Title detection: check line after name for job-title words
  if (nameLineIndex >= 0 && nameLineIndex + 1 < firstLines.length) {
    const nextLine = firstLines[nameLineIndex + 1].trim();
    if (
      nextLine &&
      nextLine.length < 60 &&
      !EMAIL_REGEX.test(nextLine) &&
      !PHONE_REGEX.test(nextLine) &&
      !URL_REGEX.test(nextLine) &&
      !DATE_REGEX.test(nextLine)
    ) {
      if (JOB_TITLE_WORDS.test(nextLine)) {
        // Known title keywords
        contact.title = nextLine;
      } else if (nameLineIndex + 2 < firstLines.length) {
        // Heuristic: if the line after the potential title contains contact info
        // (email/phone), treat this short non-contact line as a title
        const lineAfterTitle = firstLines[nameLineIndex + 2].trim();
        if (
          nextLine.length < 60 &&
          !/^\d/.test(nextLine) &&
          (EMAIL_REGEX.test(lineAfterTitle) || PHONE_REGEX.test(lineAfterTitle) || LOCATION_REGEX.test(lineAfterTitle))
        ) {
          contact.title = nextLine;
        }
      }
    }
  }

  return contact;
}

// -- Experience Extraction ----------------------------------------------------

const BULLET_RE = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]/;

const COMPANY_INDICATORS = /\b(?:Inc\.?|LLC|Corp(?:oration)?\.?|Ltd\.?|Limited|Technologies|Solutions|Systems|Group|Associates|Partners|Consulting|Services|Company|Co\.?|Foundation|Institute|University|College|Hospital|Bank|Agency|Studio|Labs?|Ventures?|Capital|Holdings?|International|Global|Enterprises?)\b/i;

interface RunningDateRange {
  lastEndDate: string | null;
}

function scoreBoundarySignals(
  line: string,
  prevLine: string | null,
  isBullet: boolean,
  runningDates?: RunningDateRange,
): number {
  let score = 0;

  // Non-bullet with date range: +3
  if (!isBullet && DATE_RANGE_REGEX.test(line)) {
    score += 3;
  }

  // Date discontinuity: if we had a running date range and this line has a
  // different date range, it's likely a new entry: +3
  if (runningDates?.lastEndDate && !isBullet && DATE_RANGE_REGEX.test(line)) {
    const match = line.match(DATE_RANGE_REGEX);
    if (match && !match[0].includes(runningDates.lastEndDate)) {
      score += 3;
    }
  }

  // Two consecutive short non-bullet lines after a bullet = strong header signal: +3
  // (Only applies when the line two positions back was a bullet, so we don't
  //  trigger on the very first header lines of a section.)
  if (
    prevLine !== null &&
    !isBullet &&
    !BULLET_RE.test(prevLine) &&
    line.length < 60 &&
    !line.endsWith('.') &&
    prevLine.length < 60 &&
    !prevLine.endsWith('.')
  ) {
    // This signal only fires when prevPrevLine was a bullet or long text
    // (indicating we were in content territory and are now seeing new headers)
    if (runningDates?.lastEndDate) {
      score += 3;
    }
  }

  // Short (<60 chars), non-bullet, no period: +1
  if (!isBullet && line.length < 60 && !line.endsWith('.')) {
    score += 1;
  }

  // Contains company indicators: +2
  if (COMPANY_INDICATORS.test(line)) {
    score += 2;
  }

  // Previous line was bullet, this is not: +2 (increased from +1)
  if (prevLine !== null && BULLET_RE.test(prevLine) && !isBullet) {
    score += 2;
  }

  // Bullet containing a date range = likely misclassified entry header: +5
  if (isBullet) {
    const stripped = line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/, '');
    if (DATE_RANGE_REGEX.test(stripped) && stripped.length < 100) {
      score += 5;
    }
    // Bullet containing "at [Company]" + date pattern = misclassified header: +2
    const atCompanyDate = /\bat\s+[A-Z][a-zA-Z\s]+/.test(line) && DATE_REGEX.test(line);
    if (atCompanyDate) {
      score += 2;
    }
  }

  // Non-bullet line with a date range AND a title-like phrase = entry header: +5
  if (!isBullet && DATE_RANGE_REGEX.test(line) && line.length < 80) {
    const beforeDate = line.replace(DATE_RANGE_REGEX, '').trim();
    if (beforeDate.length > 2 && /^[A-Z]/.test(beforeDate)) {
      score += 5;
    }
  }

  // Title-cased (>=70% words capitalized), 2-6 words: +1
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 6) {
    const capitalizedCount = words.filter((w) => /^[A-Z]/.test(w)).length;
    if (capitalizedCount / words.length >= 0.7) {
      score += 1;
    }
  }

  return score;
}

function extractExperience(content: string): ExperienceEntry[] {
  // 1. Try paragraph-break split first
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  if (blocks.length > 1) {
    return blocks
      .map((b) => parseExperienceBlock(b))
      .filter((e): e is ExperienceEntry => e !== null);
  }

  // 2. No paragraph breaks — boundary scoring
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  // Track running date range for discontinuity detection
  const runningDates: RunningDateRange = { lastEndDate: null };

  const rawBoundaries: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const isBullet = BULLET_RE.test(lines[i]);
    const prevLine = i > 0 ? lines[i - 1] : null;
    const score = scoreBoundarySignals(lines[i], prevLine, isBullet, runningDates);
    if (score >= 3 && i > 0) {
      rawBoundaries.push(i);
    }

    // Update running date range when we encounter date ranges
    if (!isBullet) {
      const dateRangeMatch = lines[i].match(DATE_RANGE_REGEX);
      if (dateRangeMatch) {
        const parts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
        if (parts.length >= 2) {
          runningDates.lastEndDate = parts[parts.length - 1];
        }
      }
    }
  }

  // Second pass: detect absorbed entry headers within bullet lists.
  // If a bullet contains a date range and is short, it's likely a missed boundary.
  const BULLET_RE_FULL = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/;
  for (let i = 1; i < lines.length; i++) {
    if (BULLET_RE.test(lines[i])) {
      const stripped = lines[i].replace(BULLET_RE_FULL, '');
      if (DATE_RANGE_REGEX.test(stripped) && stripped.length < 100) {
        if (!rawBoundaries.includes(i)) {
          rawBoundaries.push(i);
        }
      }
    }
    // Also check non-bullet lines within content that have date ranges
    if (!BULLET_RE.test(lines[i]) && DATE_RANGE_REGEX.test(lines[i]) && lines[i].length < 100) {
      const textBeforeDate = lines[i].replace(DATE_RANGE_REGEX, '').trim();
      if (textBeforeDate.length > 2 && /[A-Z]/.test(textBeforeDate)) {
        if (!rawBoundaries.includes(i)) {
          rawBoundaries.push(i);
        }
      }
    }
  }
  rawBoundaries.sort((a, b) => a - b);

  // Consolidate boundaries that are within 2 lines of each other (same entry header)
  const boundaries: number[] = [];
  for (const b of rawBoundaries) {
    if (boundaries.length === 0 || b - boundaries[boundaries.length - 1] > 2) {
      boundaries.push(b);
    }
  }

  if (boundaries.length === 0) {
    const entry = parseExperienceBlock(content);
    return entry ? [entry] : [];
  }

  // Build entry blocks: each boundary starts a new entry, with look-back for headers
  const entryStarts: number[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    let startIdx = boundaries[i];

    // Look back 1-2 lines for title/company headers before the boundary line
    const minBound = i > 0 ? boundaries[i - 1] : 0;
    for (let back = 1; back <= 2; back++) {
      const prevIdx = startIdx - back;
      if (prevIdx < minBound) break;
      const prevLine = lines[prevIdx];
      if (BULLET_RE.test(prevLine)) break;
      if (DATE_RANGE_REGEX.test(prevLine)) break;
      if (prevLine.length >= 50 || prevLine.endsWith('.')) break;
      startIdx = prevIdx;
    }

    entryStarts.push(startIdx);
  }

  // Split lines into blocks
  const entryBlocks: string[][] = [];
  for (let i = 0; i < entryStarts.length; i++) {
    const start = i === 0 ? 0 : entryStarts[i];
    const end = i + 1 < entryStarts.length ? entryStarts[i + 1] : lines.length;
    entryBlocks.push(lines.slice(start, end));
  }

  return entryBlocks
    .map((block) => parseExperienceBlock(block.join('\n')))
    .filter((e): e is ExperienceEntry => e !== null);
}

function parseExperienceBlock(blockText: string): ExperienceEntry | null {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const entry: Partial<ExperienceEntry> = {};

  // Find the first date-range line — divides headers from content
  let dateLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (DATE_RANGE_REGEX.test(lines[i])) { dateLineIdx = i; break; }
  }

  // Extract dates
  const fullText = lines.join(' ');
  const dateRangeMatch = fullText.match(DATE_RANGE_REGEX);
  if (dateRangeMatch) {
    const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
    if (dateParts.length >= 2) {
      entry.startDate = dateParts[0];
      const endPart = dateParts[dateParts.length - 1].toLowerCase();
      if (endPart === 'present' || endPart === 'current') {
        entry.current = true;
        entry.endDate = '';
      } else {
        entry.endDate = dateParts[dateParts.length - 1];
      }
    }
  }

  // Split into headers (up to date line) and content (after date line)
  let headerEnd = dateLineIdx >= 0 ? dateLineIdx + 1 : Math.min(2, lines.length);
  const headerLines = lines.slice(0, headerEnd);
  let contentLines = lines.slice(headerEnd);

  // Clean date ranges from headers
  const cleanHeaders = headerLines
    .map((l) => l.replace(DATE_RANGE_REGEX, '').trim())
    .filter((l) => l.length > 0);

  // Parse position and company from headers
  if (cleanHeaders.length >= 1) {
    const first = cleanHeaders[0];
    const atMatch = first.match(/^(.+?)\s+at\s+(.+?)$/i);
    const sepMatch = first.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
    if (atMatch) {
      entry.position = atMatch[1].trim();
      entry.company = atMatch[2].trim();
    } else if (sepMatch) {
      entry.position = sepMatch[1].trim();
      entry.company = sepMatch[2].trim();
    } else {
      entry.position = first;
      if (cleanHeaders.length >= 2) {
        const second = cleanHeaders[1];
        const compSep = second.match(/^(.+?)\s*[|,]\s*(.+?)$/);
        if (compSep) {
          entry.company = compSep[1].trim();
          entry.location = compSep[2].trim();
        } else {
          entry.company = second;
        }
      }
    }
  }

  // If company not found in headers, check first content line for company name
  if (!entry.company && contentLines.length > 0) {
    const firstContent = contentLines[0];
    // Promote first non-bullet, short line to company (with or without separator)
    if (!BULLET_RE.test(firstContent) && firstContent.length < 80) {
      const compSep = firstContent.match(/^(.+?)\s*[|,]\s*(.+?)$/);
      if (compSep) {
        entry.company = compSep[1].trim();
        entry.location = compSep[2].trim();
      } else {
        // Plain company name (no separator) — promote as company
        entry.company = firstContent.trim();
      }
      contentLines = contentLines.slice(1);
    }
  }

  // Parse highlights from remaining content
  const BULLET_PREFIX = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/;
  const highlights: string[] = [];
  for (const line of contentLines) {
    const cleaned = line.replace(BULLET_PREFIX, '').trim();
    if (cleaned.length > 0) highlights.push(cleaned);
  }
  entry.highlights = highlights;

  if (!entry.company && !entry.position && highlights.length === 0) return null;

  const built = buildExperienceEntry(entry);
  return maybeSwapPositionCompany(built);
}

function buildExperienceEntry(partial: Partial<ExperienceEntry>): ExperienceEntry {
  return {
    id: generateId(),
    company: partial.company || '',
    position: partial.position || '',
    location: partial.location || '',
    startDate: partial.startDate || '',
    endDate: partial.endDate || '',
    current: partial.current || false,
    description: partial.description || '',
    highlights: partial.highlights || [],
  };
}

function maybeSwapPositionCompany(entry: ExperienceEntry): ExperienceEntry {
  if (
    entry.position &&
    entry.company &&
    COMPANY_INDICATORS.test(entry.position) &&
    !COMPANY_INDICATORS.test(entry.company)
  ) {
    return {
      ...entry,
      position: entry.company,
      company: entry.position,
    };
  }
  return entry;
}

// -- Education Extraction -----------------------------------------------------

function extractEducation(content: string): EducationEntry[] {
  const entries: EducationEntry[] = [];

  // Split on paragraph breaks first, then fall back to detecting entry boundaries
  let blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  // If only one block, try to split on lines that look like institution names
  // (non-bullet, short, contain degree keywords or capitalized words)
  if (blocks.length <= 1) {
    const allLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const degreePattern = /(?:Bachelor|Master|Doctor|Ph\.?D|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Associate|University|College|Institute|School)/i;
    const subBlocks: string[][] = [];
    let current: string[] = [];

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      const isBullet = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB]/.test(line);

      // Start new block if this non-bullet line has degree/institution keywords
      // and the current block already looks like a complete education entry
      // (has both degree/institution keywords AND a date).
      if (!isBullet && current.length > 0 && degreePattern.test(line)) {
        const currentText = current.join(' ');
        const currentHasDate = DATE_REGEX.test(currentText) || DATE_RANGE_REGEX.test(currentText);
        if (degreePattern.test(currentText) && currentHasDate) {
          subBlocks.push(current);
          current = [line];
          continue;
        }
      }
      current.push(line);
    }
    if (current.length > 0) subBlocks.push(current);

    if (subBlocks.length > 1) {
      blocks = subBlocks.map((b) => b.join('\n'));
    }
  }

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const entry: Partial<EducationEntry> = {};
    const blockText = lines.join(' ');

    // Try to detect degree — two-step: match keyword, then capture "of/in Field"
    // but stop at institution keywords or year patterns
    const degreeKeywordMatch = blockText.match(
      /(?:Bachelor|Master|Doctor|Ph\.?D|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Associate)/i
    );
    if (degreeKeywordMatch) {
      const degreeStart = degreeKeywordMatch.index!;
      const afterKeyword = blockText.substring(degreeStart + degreeKeywordMatch[0].length);
      // Stop at institution name (word + keyword) or 4-digit year
      const stopMatch = afterKeyword.match(/\s+[A-Z][a-zA-Z'-]*\s+(?:University|College|Institute|School|Academy)|\s+\b\d{4}\b/i);
      if (stopMatch) {
        entry.degree = blockText.substring(degreeStart, degreeStart + degreeKeywordMatch[0].length + stopMatch.index!).trim();
      } else {
        const commaIdx = afterKeyword.indexOf(',');
        entry.degree = blockText.substring(degreeStart, degreeStart + degreeKeywordMatch[0].length + (commaIdx >= 0 ? commaIdx : afterKeyword.length)).trim();
      }
    }

    // Try to extract dates
    const dateRangeMatch = blockText.match(DATE_RANGE_REGEX);
    if (dateRangeMatch) {
      const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
      if (dateParts.length >= 2) {
        entry.startDate = dateParts[0];
        entry.endDate = dateParts[dateParts.length - 1];
      }
    } else {
      const singleDate = blockText.match(DATE_REGEX);
      if (singleDate) {
        // Single date (e.g. graduation year) — only set as endDate (graduation date).
        // formatDateRange already handles empty startDate correctly.
        entry.startDate = '';
        entry.endDate = singleDate[0];
      }
    }

    // GPA extraction
    const gpaMatch = blockText.match(/GPA[:\s]*(\d+\.?\d*)\s*(?:\/\s*\d+\.?\d*)?/i);
    if (gpaMatch) {
      entry.gpa = gpaMatch[1];
    }

    // Extract institution from remainder after degree, or from lines
    if (lines.length >= 1 && !entry.degree) {
      entry.institution = lines[0];
    } else if (lines.length >= 1 && entry.degree) {
      // Find institution in text around the degree
      const degreePos = blockText.indexOf(entry.degree);
      if (degreePos >= 0) {
        const degreeEnd = degreePos + entry.degree.length;
        const remainder = blockText.substring(degreeEnd).replace(DATE_RANGE_REGEX, '').replace(DATE_REGEX, '').trim();
        // Look for institution keyword in remainder
        const instMatch = remainder.match(/([A-Z][A-Za-z\s]+(?:University|College|Institute|School|Academy)[A-Za-z\s]*)/i);
        if (instMatch) {
          entry.institution = instMatch[0].trim();
        } else if (remainder.length > 0 && remainder.length < 80) {
          entry.institution = remainder.replace(/^[-–—,]\s*/, '').trim();
        }
        // Also check text BEFORE the degree keyword
        if (!entry.institution) {
          const beforeDegree = blockText.substring(0, degreePos).replace(/[-–—,]\s*$/, '').trim();
          if (beforeDegree && beforeDegree.length < 80) entry.institution = beforeDegree;
        }
        // Fallback: check subsequent lines
        if (!entry.institution && lines.length > 1) {
          for (let li = 1; li < lines.length; li++) {
            const candidate = lines[li].replace(DATE_RANGE_REGEX, '').replace(DATE_REGEX, '').trim();
            if (candidate && candidate !== entry.degree && !/^[-*\u2022]/.test(candidate)) {
              entry.institution = candidate;
              break;
            }
          }
        }
      } else {
        // Degree found elsewhere in block text — first line is institution
        entry.institution = lines[0].replace(DATE_RANGE_REGEX, '').trim();
        if (!entry.institution && lines.length > 1) {
          entry.institution = lines[1].replace(DATE_RANGE_REGEX, '').trim();
        }
      }
    }

    // Extract field of study from degree string
    if (entry.degree) {
      const fieldMatch = entry.degree.match(/(?:in|of)\s+(.+)$/i);
      if (fieldMatch) {
        entry.field = fieldMatch[1].trim();
      }
    }

    // Extract highlights
    const highlights: string[] = [];
    for (const line of lines) {
      if (/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]/.test(line)) {
        highlights.push(line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, ''));
      }
    }

    if (entry.institution || entry.degree) {
      entries.push({
        id: generateId(),
        institution: entry.institution || '',
        degree: entry.degree || '',
        field: entry.field || '',
        startDate: entry.startDate || '',
        endDate: entry.endDate || '',
        gpa: entry.gpa || '',
        description: entry.description || '',
        highlights,
      });
    }
  }

  return entries;
}

// -- Skills Extraction --------------------------------------------------------

function isValidSkillItem(s: string): boolean {
  // Filter out fragments shorter than 2 chars
  if (s.length < 2) return false;
  // Filter out common sentence fragments that aren't real skills
  if (/^(?:to|of|and|the|in|for|with|a|an)\s/i.test(s)) return false;
  return true;
}

function extractSkills(content: string): SkillCategory[] {
  // Split on newlines, then also split each line on inline bullet markers
  const rawLines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const lines: string[] = [];
  for (const line of rawLines) {
    // Split on inline bullet markers (mid-line bullets)
    const parts = line.split(/\s*\u2022\s*/);
    lines.push(...parts.filter(Boolean));
  }

  const categories: SkillCategory[] = [];
  let currentCategory: SkillCategory | null = null;

  for (const line of lines) {
    // Check for "Category: skill1, skill2, skill3" format
    // Only match on colon separator (not bare hyphens which appear in skill names)
    const categoryMatch = line.match(/^(.+?):\s*(.+)$/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1].trim();
      const skillNames = categoryMatch[2]
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Strip leading "and " from last item (e.g. "and organizational skills")
      if (skillNames.length > 1 && /^and\s+/i.test(skillNames[skillNames.length - 1])) {
        skillNames[skillNames.length - 1] = skillNames[skillNames.length - 1].replace(/^and\s+/i, '').trim();
      }

      // Save any accumulated general skills before starting a new category
      if (currentCategory && currentCategory.items.length > 0) {
        categories.push(currentCategory);
        currentCategory = null;
      }

      categories.push({
        id: generateId(),
        category: categoryName,
        items: skillNames.filter(isValidSkillItem),
      });
    } else {
      // Treat as comma-separated list or bullet points
      const cleanedLine = line.replace(/^[-*\u2022]\s*/, '');
      const skills = cleanedLine
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Strip leading "and " from last item (e.g. "and organizational skills")
      if (skills.length > 1 && /^and\s+/i.test(skills[skills.length - 1])) {
        skills[skills.length - 1] = skills[skills.length - 1].replace(/^and\s+/i, '').trim();
      }

      if (skills.length > 1) {
        // Multiple skills on one line -- group them
        if (!currentCategory) {
          currentCategory = {
            id: generateId(),
            category: 'General',
            items: [],
          };
        }
        for (const skill of skills) {
          if (isValidSkillItem(skill)) {
            currentCategory.items.push(skill);
          }
        }
      } else if (skills.length === 1 && skills[0]) {
        if (!currentCategory) {
          currentCategory = {
            id: generateId(),
            category: 'General',
            items: [],
          };
        }
        if (isValidSkillItem(skills[0])) {
          currentCategory.items.push(skills[0]);
        }
      }
    }
  }

  if (currentCategory && currentCategory.items.length > 0) {
    categories.push(currentCategory);
  }

  return categories;
}

// -- Certification Extraction -------------------------------------------------

function extractCertifications(content: string): CertificationEntry[] {
  const entries: CertificationEntry[] = [];

  // Split on paragraph breaks; if none, group consecutive lines into
  // certification entries using entry boundaries.
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  let items: string[];
  if (blocks.length > 1) {
    items = blocks;
  } else {
    // Group lines: a new certification starts when a non-bullet, non-detail line
    // appears after the first entry has accumulated at least 2 lines.
    const allLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const grouped: string[][] = [];
    let current: string[] = [];

    for (const line of allLines) {
      const cleanLine = line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');
      const isBullet = BULLET_RE.test(line);
      const isCredLine = /(?:credential\s*(?:id)?|id)[:\s]/i.test(cleanLine);
      const isUrlLine = URL_REGEX.test(cleanLine);
      const isDateLine = DATE_REGEX.test(cleanLine);

      // Split when we have accumulated at least 2 lines and this is a new entry
      // (non-bullet, non-detail line)
      if (
        current.length >= 2 &&
        !isBullet &&
        !isCredLine &&
        !isUrlLine &&
        !isDateLine
      ) {
        grouped.push(current);
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) grouped.push(current);

    items = grouped.map((g) => g.join('\n'));
  }

  for (const item of items) {
    const lines = item.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const entry: Partial<CertificationEntry> = {};

    // Clean bullet prefix
    const firstLine = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');

    // Try "Name - Issuer" or "Name | Issuer" or "Name, Issuer"
    const separatorMatch = firstLine.match(/^(.+?)\s*[|\u2013\u2014,]\s*(.+?)$/);
    if (separatorMatch) {
      entry.name = separatorMatch[1].trim();
      entry.issuer = separatorMatch[2].replace(DATE_REGEX, '').trim();
    } else {
      entry.name = firstLine;
    }

    // Try to find issuer on second line if not found
    if (!entry.issuer && lines.length >= 2) {
      entry.issuer = lines[1].replace(/^[-*\u2022]\s*/, '').replace(DATE_REGEX, '').trim();
    }

    // Extract date
    const blockText = lines.join(' ');
    const dateMatch = blockText.match(DATE_REGEX);
    if (dateMatch) {
      entry.date = dateMatch[0];
    }

    // Extract credential ID
    const credMatch = blockText.match(/(?:credential\s*(?:id)?|id)[:\s]*([A-Za-z0-9_-]+)/i);
    if (credMatch) {
      entry.credentialId = credMatch[1];
    }

    // Extract URL
    const urlMatch = blockText.match(URL_REGEX);
    if (urlMatch) {
      entry.url = urlMatch[0];
    }

    if (entry.name) {
      entries.push({
        id: generateId(),
        name: entry.name,
        issuer: entry.issuer || '',
        date: entry.date || '',
        expiryDate: entry.expiryDate || '',
        credentialId: entry.credentialId || '',
        url: entry.url || '',
      });
    }
  }

  return entries;
}

// -- Projects Extraction ------------------------------------------------------

function extractProjects(content: string): ProjectEntry[] {
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  if (blocks.length <= 1 && content.trim()) {
    // Try per-line splitting if no paragraph breaks
    const allLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (allLines.length > 0) {
      return [parseProjectBlock(allLines)].filter((e): e is ProjectEntry => e !== null);
    }
  }

  return blocks
    .map((b) => {
      const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
      return parseProjectBlock(lines);
    })
    .filter((e): e is ProjectEntry => e !== null);
}

function parseProjectBlock(lines: string[]): ProjectEntry | null {
  if (lines.length === 0) return null;

  const BULLET_PREFIX = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/;
  const entry: Partial<ProjectEntry> = {};

  // First line = name
  entry.name = lines[0].replace(BULLET_PREFIX, '').trim();

  const highlights: string[] = [];
  const technologies: string[] = [];
  let url = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for technologies line
    const techMatch = line.match(/^(?:Technologies|Tech\s*Stack|Built\s*with)[:\s]*(.+)$/i);
    if (techMatch) {
      const techs = techMatch[1].split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
      technologies.push(...techs);
      continue;
    }

    // Check for URL
    const urlMatch = line.match(URL_REGEX);
    if (urlMatch && !url) {
      url = urlMatch[0];
      // If the line is just a URL, skip adding to highlights
      if (line.trim() === url) continue;
    }

    // Remaining bullets = highlights
    const cleaned = line.replace(BULLET_PREFIX, '').trim();
    if (cleaned.length > 0) highlights.push(cleaned);
  }

  // Extract dates from name or full text
  const fullText = lines.join(' ');
  const dateRangeMatch = fullText.match(DATE_RANGE_REGEX);
  if (dateRangeMatch) {
    const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
    if (dateParts.length >= 2) {
      entry.startDate = dateParts[0];
      entry.endDate = dateParts[dateParts.length - 1];
    }
    // Clean date from name
    entry.name = entry.name.replace(DATE_RANGE_REGEX, '').trim();
  }

  if (!entry.name) return null;

  return {
    id: generateId(),
    name: entry.name,
    description: '',
    technologies,
    url,
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    highlights,
  };
}

// -- Languages Extraction -----------------------------------------------------

const PROFICIENCY_MAP: Record<string, LanguageProficiency> = {
  'native': 'native',
  'mother tongue': 'native',
  'native speaker': 'native',
  'fluent': 'fluent',
  'proficient': 'fluent',
  'advanced': 'advanced',
  'professional working': 'advanced',
  'full professional': 'advanced',
  'intermediate': 'intermediate',
  'conversational': 'intermediate',
  'limited working': 'intermediate',
  'beginner': 'beginner',
  'elementary': 'beginner',
  'basic': 'beginner',
};

function matchProficiency(text: string): LanguageProficiency {
  const lower = text.toLowerCase().trim();
  for (const [key, value] of Object.entries(PROFICIENCY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return 'intermediate';
}

function extractLanguages(content: string): LanguageEntry[] {
  const entries: LanguageEntry[] = [];
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const cleaned = line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');

    // Try patterns: "Language - Proficiency", "Language: Proficiency", "Language (Proficiency)"
    const dashMatch = cleaned.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    const colonMatch = cleaned.match(/^(.+?):\s*(.+)$/);
    const parenMatch = cleaned.match(/^(.+?)\s*\((.+?)\)\s*$/);

    if (dashMatch) {
      entries.push({
        id: generateId(),
        name: dashMatch[1].trim(),
        proficiency: matchProficiency(dashMatch[2]),
      });
    } else if (colonMatch) {
      entries.push({
        id: generateId(),
        name: colonMatch[1].trim(),
        proficiency: matchProficiency(colonMatch[2]),
      });
    } else if (parenMatch) {
      entries.push({
        id: generateId(),
        name: parenMatch[1].trim(),
        proficiency: matchProficiency(parenMatch[2]),
      });
    } else {
      // Simple bullet list of language names — could be comma-separated
      const names = cleaned.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
      for (const name of names) {
        if (name.length > 0 && name.length < 40) {
          entries.push({
            id: generateId(),
            name,
            proficiency: 'intermediate',
          });
        }
      }
    }
  }

  return entries;
}

// -- Volunteer Extraction -----------------------------------------------------

function extractVolunteer(content: string): VolunteerEntry[] {
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  if (blocks.length > 1) {
    return blocks
      .map((b) => parseVolunteerBlock(b))
      .filter((e): e is VolunteerEntry => e !== null);
  }

  // Single block — try boundary scoring like experience
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const boundaries: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const isBullet = BULLET_RE.test(lines[i]);
    const prevLine = i > 0 ? lines[i - 1] : null;
    const score = scoreBoundarySignals(lines[i], prevLine, isBullet);
    if (score >= 3 && i > 0) {
      boundaries.push(i);
    }
  }

  if (boundaries.length === 0) {
    const entry = parseVolunteerBlock(content);
    return entry ? [entry] : [];
  }

  const entryBlocks: string[][] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const blockStart = i === 0 ? 0 : boundaries[i];
    const blockEnd = i + 1 < boundaries.length ? boundaries[i + 1] : lines.length;
    entryBlocks.push(lines.slice(blockStart, blockEnd));
  }

  return entryBlocks
    .map((block) => parseVolunteerBlock(block.join('\n')))
    .filter((e): e is VolunteerEntry => e !== null);
}

function parseVolunteerBlock(blockText: string): VolunteerEntry | null {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const entry: Partial<VolunteerEntry> = {};
  const BULLET_PREFIX = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/;

  // Extract dates
  const fullText = lines.join(' ');
  const dateRangeMatch = fullText.match(DATE_RANGE_REGEX);
  if (dateRangeMatch) {
    const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
    if (dateParts.length >= 2) {
      entry.startDate = dateParts[0];
      entry.endDate = dateParts[dateParts.length - 1];
    }
  }

  // Find the first date-range line
  let dateLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (DATE_RANGE_REGEX.test(lines[i])) { dateLineIdx = i; break; }
  }

  const headerEnd = dateLineIdx >= 0 ? dateLineIdx + 1 : Math.min(2, lines.length);
  const headerLines = lines.slice(0, headerEnd);
  const contentLines = lines.slice(headerEnd);

  const cleanHeaders = headerLines
    .map((l) => l.replace(DATE_RANGE_REGEX, '').trim())
    .filter((l) => l.length > 0);

  // Parse organization and role (maps to company/position pattern)
  if (cleanHeaders.length >= 1) {
    const first = cleanHeaders[0];
    const atMatch = first.match(/^(.+?)\s+at\s+(.+?)$/i);
    const sepMatch = first.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
    if (atMatch) {
      entry.role = atMatch[1].trim();
      entry.organization = atMatch[2].trim();
    } else if (sepMatch) {
      entry.role = sepMatch[1].trim();
      entry.organization = sepMatch[2].trim();
    } else {
      entry.role = first;
      if (cleanHeaders.length >= 2) {
        entry.organization = cleanHeaders[1];
      }
    }
  }

  // Parse highlights
  const highlights: string[] = [];
  for (const line of contentLines) {
    const cleaned = line.replace(BULLET_PREFIX, '').trim();
    if (cleaned.length > 0) highlights.push(cleaned);
  }

  if (!entry.organization && !entry.role && highlights.length === 0) return null;

  return {
    id: generateId(),
    organization: entry.organization || '',
    role: entry.role || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    description: '',
    highlights,
  };
}

// -- Awards Extraction --------------------------------------------------------

function extractAwards(content: string): AwardEntry[] {
  const entries: AwardEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  const items = blocks.length > 1 ? blocks : content.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l);

  // If we split per-line, process each line
  if (blocks.length <= 1) {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const cleaned = line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');
      const entry: Partial<AwardEntry> = {};

      // Parse "Title - Issuer" or "Title | Issuer"
      const sepMatch = cleaned.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
      if (sepMatch) {
        entry.title = sepMatch[1].replace(DATE_REGEX, '').trim();
        entry.issuer = sepMatch[2].replace(DATE_REGEX, '').trim();
      } else {
        entry.title = cleaned.replace(DATE_REGEX, '').trim();
      }

      const dateMatch = cleaned.match(DATE_REGEX);
      if (dateMatch) entry.date = dateMatch[0];

      if (entry.title) {
        entries.push({
          id: generateId(),
          title: entry.title,
          issuer: entry.issuer || '',
          date: entry.date || '',
          description: '',
        });
      }
    }
    return entries;
  }

  // Process paragraph blocks
  for (const block of items) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const entry: Partial<AwardEntry> = {};
    const firstLine = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');

    const sepMatch = firstLine.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
    if (sepMatch) {
      entry.title = sepMatch[1].replace(DATE_REGEX, '').trim();
      entry.issuer = sepMatch[2].replace(DATE_REGEX, '').trim();
    } else {
      entry.title = firstLine.replace(DATE_REGEX, '').trim();
    }

    const blockText = lines.join(' ');
    const dateMatch = blockText.match(DATE_REGEX);
    if (dateMatch) entry.date = dateMatch[0];

    // Remaining lines = description
    if (lines.length > 1) {
      entry.description = lines.slice(1).map((l) => l.replace(/^[-*\u2022]\s*/, '')).join(' ').trim();
    }

    if (entry.title) {
      entries.push({
        id: generateId(),
        title: entry.title,
        issuer: entry.issuer || '',
        date: entry.date || '',
        description: entry.description || '',
      });
    }
  }

  return entries;
}

// -- Publications Extraction --------------------------------------------------

function extractPublications(content: string): PublicationEntry[] {
  const entries: PublicationEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  const items = blocks.length > 1 ? blocks : [content.trim()];

  const PUBLISHER_WORDS = /\b(?:journal|conference|published|proceedings|press|ieee|acm|springer|elsevier|wiley|nature|science)\b/i;

  for (const block of items) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const entry: Partial<PublicationEntry> = {};
    entry.title = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '').trim();

    const blockText = lines.join(' ');

    // Look for publisher words
    for (let i = 1; i < lines.length; i++) {
      if (PUBLISHER_WORDS.test(lines[i])) {
        entry.publisher = lines[i].replace(/^[-*\u2022]\s*/, '').trim();
        break;
      }
    }

    // Extract URL
    const urlMatch = blockText.match(URL_REGEX);
    if (urlMatch) entry.url = urlMatch[0];

    // Extract date
    const dateMatch = blockText.match(DATE_REGEX);
    if (dateMatch) entry.date = dateMatch[0];

    // Description from remaining lines
    const descLines = lines.slice(1).filter(
      (l) => l !== entry.publisher && (!entry.url || !l.includes(entry.url))
    );
    if (descLines.length > 0) {
      entry.description = descLines.map((l) => l.replace(/^[-*\u2022]\s*/, '')).join(' ').trim();
    }

    if (entry.title) {
      entries.push({
        id: generateId(),
        title: entry.title,
        publisher: entry.publisher || '',
        date: entry.date || '',
        url: entry.url || '',
        description: entry.description || '',
      });
    }
  }

  return entries;
}

// -- References Extraction ----------------------------------------------------

function extractReferences(content: string): ReferenceEntry[] {
  // Check for "Available upon request"
  if (/available\s+upon\s+request/i.test(content)) return [];

  const entries: ReferenceEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  const items = blocks.length > 1 ? blocks : [content.trim()];

  for (const block of items) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const entry: Partial<ReferenceEntry> = {};

    // Name = first line
    entry.name = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '').trim();

    const blockText = lines.join(' ');

    // Parse "Title at Company" or "Title, Company"
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const atMatch = line.match(/^(.+?)\s+at\s+(.+?)$/i);
      const commaMatch = line.match(/^(.+?),\s+(.+?)$/);
      if (atMatch) {
        entry.title = atMatch[1].trim();
        entry.company = atMatch[2].trim();
        break;
      } else if (commaMatch && !EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line)) {
        entry.title = commaMatch[1].trim();
        entry.company = commaMatch[2].trim();
        break;
      }
    }

    // Extract email and phone
    const emailMatch = blockText.match(EMAIL_REGEX);
    if (emailMatch) entry.email = emailMatch[0];

    const phoneMatch = blockText.match(PHONE_REGEX);
    if (phoneMatch) entry.phone = phoneMatch[0].trim();

    if (entry.name) {
      entries.push({
        id: generateId(),
        name: entry.name,
        title: entry.title || '',
        company: entry.company || '',
        email: entry.email || '',
        phone: entry.phone || '',
        relationship: '',
      });
    }
  }

  return entries;
}

// -- Affiliations Extraction --------------------------------------------------

function extractAffiliations(content: string): AffiliationEntry[] {
  const entries: AffiliationEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  const items = blocks.length > 1 ? blocks : content.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l);

  for (const item of (blocks.length > 1 ? items : [])) {
    const lines = item.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const entry = parseAffiliationLine(lines);
    if (entry) entries.push(entry);
  }

  if (blocks.length <= 1) {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const entry = parseAffiliationLine([line]);
      if (entry) entries.push(entry);
    }
  }

  return entries;
}

function parseAffiliationLine(lines: string[]): AffiliationEntry | null {
  if (lines.length === 0) return null;

  const firstLine = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');
  const entry: Partial<AffiliationEntry> = {};

  // "Organization - Role" or "Organization | Role"
  const sepMatch = firstLine.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
  if (sepMatch) {
    entry.organization = sepMatch[1].replace(DATE_REGEX, '').trim();
    entry.role = sepMatch[2].replace(DATE_REGEX, '').trim();
  } else {
    // Try "Organization, Role"
    const commaMatch = firstLine.match(/^(.+?),\s+(.+?)$/);
    if (commaMatch) {
      entry.organization = commaMatch[1].replace(DATE_REGEX, '').trim();
      entry.role = commaMatch[2].replace(DATE_REGEX, '').trim();
    } else {
      entry.organization = firstLine.replace(DATE_REGEX, '').trim();
    }
  }

  // Extract dates
  const fullText = lines.join(' ');
  const dateRangeMatch = fullText.match(DATE_RANGE_REGEX);
  if (dateRangeMatch) {
    const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
    if (dateParts.length >= 2) {
      entry.startDate = dateParts[0];
      entry.endDate = dateParts[dateParts.length - 1];
    }
  }

  if (!entry.organization) return null;

  return {
    id: generateId(),
    organization: entry.organization,
    role: entry.role || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
  };
}

// -- Courses Extraction -------------------------------------------------------

function extractCourses(content: string): CourseEntry[] {
  const entries: CourseEntry[] = [];
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  const items = blocks.length > 1 ? blocks : content.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l);

  for (const item of (blocks.length > 1 ? items : [])) {
    const lines = item.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const entry = parseCourseLine(lines);
    if (entry) entries.push(entry);
  }

  if (blocks.length <= 1) {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const entry = parseCourseLine([line]);
      if (entry) entries.push(entry);
    }
  }

  return entries;
}

function parseCourseLine(lines: string[]): CourseEntry | null {
  if (lines.length === 0) return null;

  const firstLine = lines[0].replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');
  const entry: Partial<CourseEntry> = {};

  // "Course Name - Institution"
  const sepMatch = firstLine.match(/^(.+?)\s*[|–—]\s*(.+?)$/);
  if (sepMatch) {
    entry.name = sepMatch[1].replace(DATE_REGEX, '').trim();
    entry.institution = sepMatch[2].replace(DATE_REGEX, '').trim();
  } else {
    // Try "Course Name, Institution"
    const commaMatch = firstLine.match(/^(.+?),\s+(.+?)$/);
    if (commaMatch) {
      entry.name = commaMatch[1].replace(DATE_REGEX, '').trim();
      entry.institution = commaMatch[2].replace(DATE_REGEX, '').trim();
    } else {
      entry.name = firstLine.replace(DATE_REGEX, '').trim();
    }
  }

  // Extract date
  const fullText = lines.join(' ');
  const dateMatch = fullText.match(DATE_REGEX);
  if (dateMatch) entry.completionDate = dateMatch[0];

  // Description from remaining lines
  if (lines.length > 1) {
    entry.description = lines.slice(1).map((l) => l.replace(/^[-*\u2022]\s*/, '')).join(' ').trim();
  }

  if (!entry.name) return null;

  return {
    id: generateId(),
    name: entry.name,
    institution: entry.institution || '',
    completionDate: entry.completionDate || '',
    description: entry.description || '',
  };
}

// -- Helpers ------------------------------------------------------------------

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `imported-${Date.now()}-${idCounter}`;
}

// -- Section Content Extraction -----------------------------------------------

/**
 * Maps a section type string to the correct extraction function.
 * Returns extracted entries/data for the given section type.
 */
export function extractSectionContent(sectionType: string, content: string): unknown {
  switch (sectionType) {
    case 'experience':
      return extractExperience(content);
    case 'education':
      return extractEducation(content);
    case 'skills':
      return extractSkills(content);
    case 'certifications':
      return extractCertifications(content);
    case 'projects':
      return extractProjects(content);
    case 'languages':
      return extractLanguages(content);
    case 'volunteer':
      return extractVolunteer(content);
    case 'awards':
      return extractAwards(content);
    case 'publications':
      return extractPublications(content);
    case 'references':
      return extractReferences(content);
    case 'affiliations':
      return extractAffiliations(content);
    case 'courses':
      return extractCourses(content);
    case 'interests':
    case 'hobbies':
      return {
        items: content
          .split(/[,\n]/)
          .map((s) => s.replace(/^[-*\u2022]\s*/, '').trim())
          .filter(Boolean),
      };
    case 'summary':
      return { text: content.trim() };
    default:
      return null;
  }
}

// -- Post-Parse Auto-Cleanup --------------------------------------------------

/**
 * Catches edge cases the parser misses: promotes company-like first bullets,
 * normalizes ALL CAPS names, filters placeholder data and bad skill fragments.
 */
function postProcessParseResult(result: Partial<ResumeData>): Partial<ResumeData> {
  // 1. Normalize ALL CAPS names to title case
  if (result.contact) {
    if (result.contact.firstName && result.contact.firstName === result.contact.firstName.toUpperCase() && result.contact.firstName.length > 1) {
      result.contact.firstName = result.contact.firstName.charAt(0).toUpperCase() + result.contact.firstName.slice(1).toLowerCase();
    }
    if (result.contact.lastName && result.contact.lastName === result.contact.lastName.toUpperCase() && result.contact.lastName.length > 1) {
      // Handle multi-word last names
      result.contact.lastName = result.contact.lastName
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // 2. Auto-promote first bullet to company for experience entries
  if (result.experience) {
    for (const entry of result.experience) {
      if (!entry.company && entry.highlights.length > 0) {
        const firstBullet = entry.highlights[0];
        // Check if first bullet looks like a company name:
        // short, mostly capitalized, no period at end
        if (
          firstBullet.length < 60 &&
          !firstBullet.endsWith('.') &&
          !firstBullet.endsWith(',')
        ) {
          const words = firstBullet.split(/\s+/).filter(Boolean);
          if (words.length >= 1 && words.length <= 6) {
            const capCount = words.filter(w => /^[A-Z]/.test(w)).length;
            if (capCount / words.length >= 0.6) {
              entry.company = firstBullet;
              entry.highlights = entry.highlights.slice(1);
            }
          }
        }
      }
    }
  }

  // 3. Filter placeholder credential IDs, URLs, and issuers from certifications
  if (result.certifications) {
    const PLACEHOLDER_IDS = /^(?:ABC123|XYZ789|123456|PLACEHOLDER|N\/A|TBD|NA)$/i;
    const PLACEHOLDER_URLS = /^https?:\/\/(?:\.{3}|example\.com|www\.example\.com|placeholder)\/?$/i;
    const PLACEHOLDER_ISSUERS = /^(?:issuing\s*organization|organization|issuer|company\s*name|n\/a|tbd)$/i;
    for (const cert of result.certifications) {
      if (cert.credentialId && PLACEHOLDER_IDS.test(cert.credentialId.trim())) {
        cert.credentialId = '';
      }
      if (cert.url && PLACEHOLDER_URLS.test(cert.url.trim())) {
        cert.url = '';
      }
      if (cert.issuer && PLACEHOLDER_ISSUERS.test(cert.issuer.trim())) {
        cert.issuer = '';
      }
    }
  }

  // 4. Auto-format phone numbers
  if (result.contact?.phone) {
    const digits = result.contact.phone.replace(/\D/g, '');
    if (digits.length === 10) {
      result.contact.phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      result.contact.phone = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  }

  // 5. Split concatenated URLs in contact fields (PDF extraction artifact)
  if (result.contact) {
    const urlFields: (keyof typeof result.contact)[] = ['website', 'portfolio', 'linkedin', 'github'];
    for (const field of urlFields) {
      const val = result.contact[field];
      if (val && typeof val === 'string') {
        // Detect concatenated URLs: "https://...https://..." or "http://...http://..."
        const splitMatch = val.match(/^(https?:\/\/.+?)(?=https?:\/\/)(https?:\/\/.+)$/i);
        if (splitMatch) {
          result.contact[field] = splitMatch[1]; // Keep first URL in current field
          // Try to place second URL in an empty field
          const secondUrl = splitMatch[2];
          if (field === 'website' && !result.contact.portfolio) {
            result.contact.portfolio = secondUrl;
          } else if (field === 'portfolio' && !result.contact.website) {
            result.contact.website = secondUrl;
          }
          // For linkedin/github, just keep the first URL
        }
      }
    }
  }

  // 6. Filter bad skill fragments (backup for anything Layer 2C missed)
  if (result.skills) {
    for (const cat of result.skills) {
      cat.items = cat.items.filter(s => s.length >= 2);
    }
    // Remove empty categories
    result.skills = result.skills.filter(cat => cat.items.length > 0);
  }

  return result;
}

// -- Pre-Parse Text Normalization ---------------------------------------------

/**
 * Cleans up raw PDF/DOCX text extraction artifacts before parsing.
 * Fixes hyphenated line breaks, joins continuation lines, and normalizes
 * inline bullet markers so downstream parsers see clean semantic boundaries.
 */
function normalizeRawText(text: string): string {
  let result = text;

  // 0. Split concatenated URLs (PDF artifact): "https://a.comhttps://b.com" -> two lines
  result = result.replace(/(https?:\/\/\S+?)(https?:\/\/)/gi, '$1\n$2');

  // 1. Join hyphenated line breaks: "moni-\n  toring" -> "monitoring"
  result = result.replace(/(\w)-\n\s*(\w)/g, '$1$2');

  // 2. Join continuation lines: if a line ends mid-sentence (no period, colon,
  //    not a bullet start, not a heading) and the next line starts lowercase or
  //    continues a sentence, join them with a space.
  const lines = result.split('\n');
  const joined: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const trimmed = current.trimEnd();

    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const nextTrimmed = nextLine.trim();

      // Skip joining if current line is blank or next line is blank
      if (!trimmed.trim() || !nextTrimmed) {
        joined.push(current);
        continue;
      }

      // Skip if next line starts with a bullet marker
      if (BULLET_RE.test(nextTrimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if current line ends with sentence-terminating punctuation
      if (/[.!?:]\s*$/.test(trimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if next line looks like a heading (all caps, short, title-cased)
      if (/^[A-Z\s&\-/]+$/.test(nextTrimmed) && nextTrimmed.length >= 2 && /[A-Z]{2,}/.test(nextTrimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if next line contains a date range (entry header)
      if (DATE_RANGE_REGEX.test(nextTrimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if next line starts with a date
      if (DATE_REGEX.test(nextTrimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if next line contains contact info (email, phone, URL)
      if (EMAIL_REGEX.test(nextTrimmed) || PHONE_REGEX.test(nextTrimmed) || URL_REGEX.test(nextTrimmed) || /^https?:\/\//i.test(nextTrimmed)) {
        joined.push(current);
        continue;
      }

      // Skip if current line contains contact info
      if (EMAIL_REGEX.test(trimmed) || PHONE_REGEX.test(trimmed) || URL_REGEX.test(trimmed)) {
        joined.push(current);
        continue;
      }

      // Skip join if the combined text would create a date range (split across lines)
      // e.g. "Physiotherapist Aug 2024" + "– Feb 2025" => entry header, not continuation
      if (/[A-Z][a-z]/.test(nextTrimmed) && !DATE_RANGE_REGEX.test(nextTrimmed)) {
        const combined = trimmed + ' ' + nextTrimmed;
        if (DATE_RANGE_REGEX.test(combined) && !DATE_RANGE_REGEX.test(trimmed)) {
          joined.push(current);
          continue;
        }
      }

      // Join if next line starts lowercase or looks like a sentence continuation
      if (/^[a-z]/.test(nextTrimmed) || /,\s*$/.test(trimmed)) {
        joined.push(trimmed + ' ' + nextTrimmed);
        i++; // skip next line since we merged it
        continue;
      }
    }

    joined.push(current);
  }
  result = joined.join('\n');

  // 3. Normalize inline bullet markers: " • " mid-line -> newline + "• "
  result = result.replace(/ \u2022 /g, '\n\u2022 ');

  return result;
}

// -- Main Parser --------------------------------------------------------------

/**
 * Parses raw resume text into a partial ResumeData structure.
 * The result is heuristic and should be reviewed by the user.
 */
export function parseResumeText(text: string): Partial<ResumeData> {
  const result: Partial<ResumeData> = {};

  // Normalize raw text to fix PDF extraction artifacts
  const normalized = normalizeRawText(text);

  // Extract contact info from the full text (usually at the top)
  const contactInfo = extractContact(normalized);
  result.contact = {
    firstName: contactInfo.firstName || '',
    lastName: contactInfo.lastName || '',
    email: contactInfo.email || '',
    phone: contactInfo.phone || '',
    location: contactInfo.location || '',
    website: contactInfo.website || '',
    linkedin: contactInfo.linkedin || '',
    github: contactInfo.github || '',
    portfolio: contactInfo.portfolio || '',
    title: contactInfo.title || '',
  };

  // Detect and extract sections
  const sections = detectSections(normalized);

  for (const section of sections) {
    switch (section.type) {
      case 'summary':
        result.summary = {
          text: section.content.trim(),
        };
        break;

      case 'experience':
        result.experience = extractExperience(section.content);
        break;

      case 'education':
        result.education = extractEducation(section.content);
        break;

      case 'skills':
        result.skills = extractSkills(section.content);
        break;

      case 'certifications':
        result.certifications = extractCertifications(section.content);
        break;

      case 'projects':
        result.projects = extractProjects(section.content);
        break;

      case 'languages':
        result.languages = extractLanguages(section.content);
        break;

      case 'volunteer':
        result.volunteer = extractVolunteer(section.content);
        break;

      case 'awards':
        result.awards = extractAwards(section.content);
        break;

      case 'publications':
        result.publications = extractPublications(section.content);
        break;

      case 'references':
        result.references = extractReferences(section.content);
        break;

      case 'affiliations':
        result.affiliations = extractAffiliations(section.content);
        break;

      case 'courses':
        result.courses = extractCourses(section.content);
        break;

      case 'interests':
        result.hobbies = {
          items: section.content
            .split(/[,\n]/)
            .map((s) => s.replace(/^[-*\u2022]\s*/, '').trim())
            .filter(Boolean),
        };
        break;

      default:
        break;
    }
  }

  // If no explicit summary section was found, try to extract summary text
  // from between the contact info area and the first detected section heading.
  if (!result.summary) {
    const firstSectionStart = sections.length > 0 ? sections[0].startIndex : -1;
    if (firstSectionStart > 3) {
      // There's content between the header area and the first section
      const normLines = normalized.split('\n');
      const candidateLines: string[] = [];
      // Start after the likely contact area (first ~5 lines) and before the first section
      const startLine = Math.min(5, firstSectionStart);
      for (let i = startLine; i < firstSectionStart; i++) {
        const line = normLines[i]?.trim();
        if (line && !EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) && !URL_REGEX.test(line)) {
          candidateLines.push(line);
        }
      }
      const summaryText = candidateLines.join(' ').trim();
      if (summaryText.length > 20) {
        result.summary = { text: summaryText };
      }
    }
  }

  return postProcessParseResult(result);
}

export function parseResumeTextWithMetadata(text: string): { data: Partial<ResumeData>; metadata: ParseMetadata } {
  const data = parseResumeText(text);

  // Build line-offset lookup for O(1) character position computation
  const lines = text.split('\n');
  const lineOffsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1; // +1 for the newline character
  }

  // Run detectSections again to get line ranges
  const sections = detectSections(text);

  const sectionRanges = new Map<string, SourceRange>();
  const coveredRanges: SourceRange[] = [];

  for (const section of sections) {
    const startOffset = lineOffsets[section.startIndex] ?? 0;
    const endLineIdx = Math.min(section.endIndex, lines.length - 1);
    const endOffset = lineOffsets[endLineIdx] + lines[endLineIdx].length;
    const range = { startOffset, endOffset };
    sectionRanges.set(section.type, range);
    coveredRanges.push(range);
  }

  // Add contact area (lines before first section) if any
  if (sections.length > 0 && sections[0].startIndex > 0) {
    const contactEnd = lineOffsets[sections[0].startIndex];
    const contactRange = { startOffset: 0, endOffset: contactEnd > 0 ? contactEnd - 1 : 0 };
    sectionRanges.set('contact', contactRange);
    coveredRanges.push(contactRange);
  }

  // Sort covered ranges by start offset
  coveredRanges.sort((a, b) => a.startOffset - b.startOffset);

  // Find unmatched ranges (gaps between covered ranges)
  const unmatchedRanges: SourceRange[] = [];
  let cursor = 0;
  for (const range of coveredRanges) {
    if (range.startOffset > cursor) {
      const gapText = text.substring(cursor, range.startOffset).trim();
      if (gapText.length > 0) {
        unmatchedRanges.push({ startOffset: cursor, endOffset: range.startOffset });
      }
    }
    cursor = Math.max(cursor, range.endOffset);
  }
  // Check for trailing unmatched content
  if (cursor < text.length) {
    const gapText = text.substring(cursor).trim();
    if (gapText.length > 0) {
      unmatchedRanges.push({ startOffset: cursor, endOffset: text.length });
    }
  }

  return { data, metadata: { sectionRanges, unmatchedRanges } };
}
