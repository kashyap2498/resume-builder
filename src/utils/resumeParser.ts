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
  summary: /^(?:summary|profile|objective|about\s*me|professional\s*summary|career\s*objective)/i,
  experience:
    /^(?:experience|work\s*experience|employment|professional\s*experience|work\s*history)/i,
  education: /^(?:education|academic|academics|educational\s*background)/i,
  skills:
    /^(?:skills|technical\s*skills|core\s*competencies|competencies|areas\s*of\s*expertise|proficiencies)/i,
  projects: /^(?:projects|personal\s*projects|key\s*projects)/i,
  certifications:
    /^(?:certifications?|licenses?|credentials|certifications?\s*(?:&|and)\s*licenses?)/i,
  languages: /^(?:languages?)/i,
  volunteer:
    /^(?:volunteer|volunteering|community\s*(?:service|involvement))/i,
  awards: /^(?:awards?|honors?|achievements?|awards?\s*(?:&|and)\s*honors?)/i,
  publications: /^(?:publications?|papers?|research)/i,
  references: /^(?:references?)/i,
  interests: /^(?:interests?|hobbies|activities)/i,
};

function detectSections(text: string): SectionMatch[] {
  const lines = text.split('\n');
  const sections: SectionMatch[] = [];
  let currentSection: SectionMatch | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    for (const [type, regex] of Object.entries(SECTION_HEADINGS)) {
      if (regex.test(line) && line.length < 60) {
        // Close previous section
        if (currentSection) {
          currentSection.endIndex = i - 1;
          currentSection.content = lines
            .slice(
              lines.indexOf(lines[currentSection.startIndex + 1]) > -1
                ? currentSection.startIndex + 1
                : currentSection.startIndex,
              i
            )
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
  const blocks = content.split(/\n{2,}/);

  let currentEntry: Partial<ExperienceEntry> | null = null;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Check if this block starts a new entry (has a date range)
    const blockText = lines.join(' ');
    const dateRangeMatch = blockText.match(DATE_RANGE_REGEX);

    if (dateRangeMatch || (lines[0] && lines[0].length < 80 && !lines[0].startsWith('-') && !lines[0].startsWith('*'))) {
      // Save previous entry
      if (currentEntry && (currentEntry.company || currentEntry.position)) {
        entries.push(buildExperienceEntry(currentEntry));
      }

      currentEntry = {};

      // Try to extract company and position from the first couple of lines
      if (lines.length >= 1) {
        // Common formats:
        // "Company Name" on one line, "Position" on next
        // "Position at Company"
        // "Position | Company | Date Range"
        const firstLine = lines[0];
        const atMatch = firstLine.match(/^(.+?)\s+at\s+(.+?)$/i);
        if (atMatch) {
          currentEntry.position = atMatch[1].trim();
          currentEntry.company = atMatch[2].trim();
        } else {
          currentEntry.position = firstLine;
          if (lines.length > 1 && !lines[1].startsWith('-') && !lines[1].startsWith('*')) {
            currentEntry.company = lines[1].replace(DATE_RANGE_REGEX, '').trim();
          }
        }
      }

      // Extract dates
      if (dateRangeMatch) {
        const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim());
        if (dateParts.length >= 2) {
          currentEntry.startDate = dateParts[0];
          const endPart = dateParts[dateParts.length - 1].toLowerCase();
          if (endPart === 'present' || endPart === 'current') {
            currentEntry.current = true;
            currentEntry.endDate = '';
          } else {
            currentEntry.endDate = dateParts[dateParts.length - 1];
          }
        }
      }

      // Extract bullet points as highlights
      const highlights: string[] = [];
      for (const line of lines) {
        if (line.startsWith('-') || line.startsWith('*') || line.startsWith('\u2022')) {
          highlights.push(line.replace(/^[-*\u2022]\s*/, ''));
        }
      }
      currentEntry.highlights = highlights;
    } else if (currentEntry) {
      // Add bullet points to the current entry
      for (const line of lines) {
        if (line.startsWith('-') || line.startsWith('*') || line.startsWith('\u2022')) {
          currentEntry.highlights = currentEntry.highlights || [];
          currentEntry.highlights.push(line.replace(/^[-*\u2022]\s*/, ''));
        }
      }
    }
  }

  // Don't forget the last entry
  if (currentEntry && (currentEntry.company || currentEntry.position)) {
    entries.push(buildExperienceEntry(currentEntry));
  }

  return entries;
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
  const blocks = content.split(/\n{2,}/);

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
    const dateRangeMatch = blockText.match(DATE_RANGE_REGEX);
    if (dateRangeMatch) {
      const dateParts = dateRangeMatch[0].split(/[-–—]|to/i).map((d) => d.trim());
      if (dateParts.length >= 2) {
        entry.startDate = dateParts[0];
        entry.endDate = dateParts[dateParts.length - 1];
      }
    } else {
      const singleDate = blockText.match(DATE_REGEX);
      if (singleDate) {
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
      // If we already found the degree, first line is probably the institution
      entry.institution = lines[0].replace(degreeMatch?.[0] || '', '').trim();
      if (!entry.institution && lines.length > 1) {
        entry.institution = lines[1];
      }
    }

    // Extract highlights
    const highlights: string[] = [];
    for (const line of lines) {
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('\u2022')) {
        highlights.push(line.replace(/^[-*\u2022]\s*/, ''));
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
    const categoryMatch = line.match(/^(.+?)[:\-–]\s*(.+)$/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1].trim();
      const skillNames = categoryMatch[2]
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

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

      case 'interests':
        result.hobbies = {
          items: section.content
            .split(/[,\n]/)
            .map((s) => s.replace(/^[-*\u2022]\s*/, '').trim())
            .filter(Boolean),
        };
        break;

      // Other sections can be added here as needed
      default:
        break;
    }
  }

  return result;
}
