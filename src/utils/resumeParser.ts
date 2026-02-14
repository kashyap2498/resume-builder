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
} from '@/types/resume';


// -- Regex Patterns -----------------------------------------------------------

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX =
  /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_REGEX =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;
const GITHUB_REGEX =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i;
const URL_REGEX =
  /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/i;
const DATE_REGEX =
  /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/gi;
const DATE_RANGE_REGEX =
  /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|[Pp]resent|[Cc]urrent)/gi;

// -- Section Heading Detection ------------------------------------------------

interface SectionMatch {
  type: string;
  startIndex: number;
  endIndex: number;
  content: string;
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
};

function detectSections(text: string): SectionMatch[] {
  const lines = text.split('\n');
  const sections: SectionMatch[] = [];
  let currentSection: SectionMatch | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Normalize line for heading matching: strip common decorators
    const normalized = line.replace(/^[-=_*|:]+\s*/, '').replace(/\s*[-=_*|:]+$/, '').trim();

    for (const [type, regex] of Object.entries(SECTION_HEADINGS)) {
      if ((regex.test(line) || regex.test(normalized)) && line.length < 80) {
        // Close previous section
        if (currentSection) {
          currentSection.endIndex = i - 1;
          currentSection.content = lines
            .slice(currentSection.startIndex + 1, i)
            .join('\n');
          sections.push(currentSection);
        }

        currentSection = {
          type,
          startIndex: i,
          endIndex: -1,
          content: '',
        };
        break;
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

  // Try to extract a name from the first few lines
  const firstLines = text.split('\n').slice(0, 5);
  for (const line of firstLines) {
    const trimmed = line.trim();
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
        break;
      } else if (parts.length === 1 && /^[A-Z]/.test(parts[0])) {
        contact.firstName = parts[0];
        break;
      }
    }
  }

  return contact;
}

// -- Experience Extraction ----------------------------------------------------

function extractExperience(content: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const allLines = content.split('\n').map((l) => l.trim());

  // First, try splitting by double newlines (paragraph breaks)
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());

  // If we got multiple blocks, process each as a potential entry
  if (blocks.length > 1) {
    for (const block of blocks) {
      const entry = parseExperienceBlock(block);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  // No paragraph breaks — detect entry boundaries by scanning lines
  // for date ranges. A date-range line only starts a NEW entry if the
  // current block already contains a date range (meaning we've already
  // seen the previous job's dates). Otherwise the date belongs to the
  // current entry's header.
  const entryBlocks: string[][] = [];
  let currentBlock: string[] = [];

  const blockHasDateRange = (block: string[]): boolean =>
    block.some((l) => {
      DATE_RANGE_REGEX.lastIndex = 0;
      const has = DATE_RANGE_REGEX.test(l);
      DATE_RANGE_REGEX.lastIndex = 0;
      return has;
    });

  for (const line of allLines) {
    if (!line) {
      if (currentBlock.length > 0) {
        entryBlocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }

    const isBullet = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014]/.test(line);
    DATE_RANGE_REGEX.lastIndex = 0;
    const hasDateRange = DATE_RANGE_REGEX.test(line);
    DATE_RANGE_REGEX.lastIndex = 0;

    if (hasDateRange && !isBullet && currentBlock.length > 0 && blockHasDateRange(currentBlock)) {
      // Current block already has a date range — this date starts a new entry.
      // Check if the last line in the current block is a job title that
      // belongs with this new date line (e.g. "Developer at ACME" followed
      // by "Jan 2020 - Present").
      const lastLine = currentBlock[currentBlock.length - 1];
      const lastIsBullet = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014]/.test(lastLine);
      DATE_RANGE_REGEX.lastIndex = 0;
      const lastHasDate = DATE_RANGE_REGEX.test(lastLine);
      DATE_RANGE_REGEX.lastIndex = 0;

      if (!lastIsBullet && !lastHasDate && lastLine.length < 80) {
        // Move the title from the old block to the new one
        currentBlock.pop();
        if (currentBlock.length > 0) entryBlocks.push(currentBlock);
        currentBlock = [lastLine, line];
      } else {
        entryBlocks.push(currentBlock);
        currentBlock = [line];
      }
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    entryBlocks.push(currentBlock);
  }

  // If we still got just one big block, try splitting on non-bullet
  // lines that are short (look like titles/positions)
  if (entryBlocks.length === 1 && allLines.filter(Boolean).length > 3) {
    const lines = allLines.filter(Boolean);
    const subBlocks: string[][] = [];
    let sub: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBullet = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014]/.test(line);
      const prevIsBullet = i > 0 && /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014]/.test(lines[i - 1]);

      // If we transition from bullet to non-bullet and the line looks like
      // a new entry header (contains a date range or has a second non-bullet
      // line following it that does), split here.
      DATE_RANGE_REGEX.lastIndex = 0;
      const lineHasDate = DATE_RANGE_REGEX.test(line);
      DATE_RANGE_REGEX.lastIndex = 0;
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const nextHasDate = DATE_RANGE_REGEX.test(nextLine);
      DATE_RANGE_REGEX.lastIndex = 0;
      if (!isBullet && prevIsBullet && line.length < 80 && sub.length > 0 && (lineHasDate || nextHasDate)) {
        subBlocks.push(sub);
        sub = [line];
      } else {
        sub.push(line);
      }
    }
    if (sub.length > 0) subBlocks.push(sub);

    if (subBlocks.length > 1) {
      for (const block of subBlocks) {
        const entry = parseExperienceBlock(block.join('\n'));
        if (entry) entries.push(entry);
      }
      return entries;
    }
  }

  // Process each detected block
  for (const block of entryBlocks) {
    const entry = parseExperienceBlock(block.join('\n'));
    if (entry) entries.push(entry);
  }

  return entries;
}

function parseExperienceBlock(blockText: string): ExperienceEntry | null {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const entry: Partial<ExperienceEntry> = {};
  const fullText = lines.join(' ');

  // Reset global regex
  DATE_RANGE_REGEX.lastIndex = 0;
  const dateRangeMatch = fullText.match(DATE_RANGE_REGEX);

  // Extract dates
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

  // Separate header lines (position, company, dates) from content lines (highlights)
  // Header lines are the first few short non-bullet lines; everything else is a highlight.
  const BULLET_RE = /^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]/;
  const headerLines: string[] = [];
  const highlights: string[] = [];
  let doneWithHeaders = false;

  for (const line of lines) {
    const isBullet = BULLET_RE.test(line);

    if (isBullet) {
      doneWithHeaders = true;
      highlights.push(line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB\u2013\u2014\u25BA\u25B8\u25B6\u2023\u27A4\u2192>\u2605\u2606\u203A\u276F]\s*/, ''));
    } else if (!doneWithHeaders && headerLines.length < 3 && line.length < 80) {
      // First few short non-bullet lines are headers (titles, company, dates)
      headerLines.push(line);
    } else {
      // Non-bullet line after headers or after bullets started — treat as highlight
      // (many resumes use plain text descriptions without bullets)
      doneWithHeaders = true;
      if (line.length > 15) {
        highlights.push(line);
      }
    }
  }

  // Parse header lines for position and company
  if (headerLines.length >= 1) {
    const firstLine = headerLines[0];

    // Remove date range from the line for cleaner extraction
    DATE_RANGE_REGEX.lastIndex = 0;
    const cleanFirst = firstLine.replace(DATE_RANGE_REGEX, '').trim();

    // "Position at Company" pattern
    const atMatch = cleanFirst.match(/^(.+?)\s+at\s+(.+?)$/i);
    // "Position | Company" or "Position - Company" pattern
    const separatorMatch = cleanFirst.match(/^(.+?)\s*[|–—]\s*(.+?)$/);

    if (atMatch) {
      entry.position = atMatch[1].trim();
      entry.company = atMatch[2].trim();
    } else if (separatorMatch) {
      entry.position = separatorMatch[1].trim();
      entry.company = separatorMatch[2].trim();
    } else {
      entry.position = cleanFirst;

      if (headerLines.length >= 2) {
        DATE_RANGE_REGEX.lastIndex = 0;
        entry.company = headerLines[1].replace(DATE_RANGE_REGEX, '').trim();
      }
    }
  }

  entry.highlights = highlights;

  // Only create an entry if we found meaningful content
  if (!entry.company && !entry.position && highlights.length === 0) {
    return null;
  }

  return buildExperienceEntry(entry);
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
        DATE_REGEX.lastIndex = 0;
        const currentHasDate = DATE_REGEX.test(currentText) || DATE_RANGE_REGEX.test(currentText);
        DATE_REGEX.lastIndex = 0;
        DATE_RANGE_REGEX.lastIndex = 0;
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

    // Try to detect degree
    const degreeMatch = blockText.match(
      /(?:Bachelor|Master|Doctor|Ph\.?D|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Associate)[^,\n]*/i
    );
    if (degreeMatch) {
      entry.degree = degreeMatch[0].trim();
    }

    // Try to extract dates
    DATE_RANGE_REGEX.lastIndex = 0;
    const dateRangeMatch = blockText.match(DATE_RANGE_REGEX);
    if (dateRangeMatch) {
      const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim()).filter(Boolean);
      if (dateParts.length >= 2) {
        entry.startDate = dateParts[0];
        entry.endDate = dateParts[dateParts.length - 1];
      }
    } else {
      DATE_REGEX.lastIndex = 0;
      const singleDate = blockText.match(DATE_REGEX);
      if (singleDate) {
        // Single date (e.g. graduation year) — use as endDate but also
        // set startDate so formatDateRange doesn't produce "- Aug 2022"
        entry.startDate = singleDate[0];
        entry.endDate = singleDate[0];
      }
    }

    // GPA extraction
    const gpaMatch = blockText.match(/GPA[:\s]*(\d+\.?\d*)\s*(?:\/\s*\d+\.?\d*)?/i);
    if (gpaMatch) {
      entry.gpa = gpaMatch[1];
    }

    // First line is usually institution or degree
    if (lines.length >= 1 && !entry.degree) {
      entry.institution = lines[0];
    } else if (lines.length >= 1) {
      // If we found the degree inline, first line is probably the institution
      DATE_RANGE_REGEX.lastIndex = 0;
      entry.institution = lines[0]
        .replace(degreeMatch?.[0] || '', '')
        .replace(DATE_RANGE_REGEX, '')
        .trim();
      if (!entry.institution && lines.length > 1) {
        entry.institution = lines[1];
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

function extractSkills(content: string): SkillCategory[] {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

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

      // Save any accumulated general skills before starting a new category
      if (currentCategory && currentCategory.items.length > 0) {
        categories.push(currentCategory);
        currentCategory = null;
      }

      categories.push({
        id: generateId(),
        category: categoryName,
        items: skillNames.map((name) => ({ name, proficiency: 3 as const })),
      });
    } else {
      // Treat as comma-separated list or bullet points
      const cleanedLine = line.replace(/^[-*\u2022]\s*/, '');
      const skills = cleanedLine
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

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
          currentCategory.items.push({ name: skill, proficiency: 3 as const });
        }
      } else if (skills.length === 1 && skills[0]) {
        if (!currentCategory) {
          currentCategory = {
            id: generateId(),
            category: 'General',
            items: [],
          };
        }
        currentCategory.items.push({ name: skills[0], proficiency: 3 as const });
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
  // certification entries using date boundaries.
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  let items: string[];
  if (blocks.length > 1) {
    items = blocks;
  } else {
    // Group lines: a new certification starts after we've seen a date line
    const allLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const grouped: string[][] = [];
    let current: string[] = [];
    let seenDate = false;

    for (const line of allLines) {
      const cleanLine = line.replace(/^[-*\u2022\u25CF\u25CB\u25AA\u25AB]\s*/, '');
      DATE_REGEX.lastIndex = 0;
      const stripped = cleanLine.replace(DATE_REGEX, '').trim();
      DATE_REGEX.lastIndex = 0;
      const isDateLine = stripped.length < 5 && DATE_REGEX.test(cleanLine);
      DATE_REGEX.lastIndex = 0;
      const isCredLine = /(?:credential\s*(?:id)?|id)[:\s]/i.test(cleanLine);
      const isUrlLine = URL_REGEX.test(cleanLine);

      if (seenDate && !isDateLine && !isCredLine && !isUrlLine && current.length > 0) {
        grouped.push(current);
        current = [line];
        seenDate = false;
      } else {
        current.push(line);
        if (isDateLine) seenDate = true;
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
    DATE_REGEX.lastIndex = 0;
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

// -- Helpers ------------------------------------------------------------------

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `imported-${Date.now()}-${idCounter}`;
}

// -- Main Parser --------------------------------------------------------------

/**
 * Parses raw resume text into a partial ResumeData structure.
 * The result is heuristic and should be reviewed by the user.
 */
export function parseResumeText(text: string): Partial<ResumeData> {
  const result: Partial<ResumeData> = {};

  // Extract contact info from the full text (usually at the top)
  const contactInfo = extractContact(text);
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
  const sections = detectSections(text);

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
      const lines = text.split('\n');
      const candidateLines: string[] = [];
      // Start after the likely contact area (first ~5 lines) and before the first section
      const startLine = Math.min(5, firstSectionStart);
      for (let i = startLine; i < firstSectionStart; i++) {
        const line = lines[i]?.trim();
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

  return result;
}
