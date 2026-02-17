// =============================================================================
// Resume Builder - Job Description Parser
// =============================================================================
// Parses a raw job description string into structured sections and extracts
// concrete requirements (years of experience, degree, certifications).

export interface ParsedJobDescription {
  title: string;
  sections: {
    required: string;
    preferred: string;
    responsibilities: string;
    about: string;
    fullText: string;
  };
  extractedRequirements: {
    yearsOfExperience: number | null;
    degreeLevel: string | null;
    degreeField: string | null;
    certifications: string[];
  };
}

// -- Section header patterns ---------------------------------------------------

const SECTION_PATTERNS: { key: keyof ParsedJobDescription['sections']; regex: RegExp }[] = [
  {
    key: 'required',
    regex: /^(?:required|must\s+have|minimum\s+qualifications?|qualifications?|requirements?|what\s+we(?:'re|\s+are)\s+looking\s+for|essential)/im,
  },
  {
    key: 'preferred',
    regex: /^(?:preferred|nice\s+to\s+have|bonus|desired|plus|additional\s+qualifications?|nice-to-have)/im,
  },
  {
    key: 'responsibilities',
    regex: /^(?:responsibilities|what\s+you'?ll\s+do|duties|role\s+description|key\s+responsibilities|the\s+role|about\s+the\s+role|your\s+responsibilities)/im,
  },
  {
    key: 'about',
    regex: /^(?:about\s+us|company\s+overview|who\s+we\s+are|our\s+company|about\s+the\s+company|about\s+the\s+team)/im,
  },
];

// -- Known certification patterns ----------------------------------------------

const KNOWN_CERTS = [
  'PMP', 'CSM', 'CISSP', 'CEH', 'CPA', 'CFA', 'AWS Certified',
  'Azure Certified', 'Google Cloud Certified', 'GCP Certified',
  'CompTIA Security+', 'Security+', 'CompTIA Network+',
  'CCNA', 'CCNP', 'CCIE', 'ITIL', 'TOGAF',
  'Certified Kubernetes Administrator', 'CKA',
  'Certified Kubernetes Application Developer', 'CKAD',
  'Six Sigma Green Belt', 'Six Sigma Black Belt',
  'PHR', 'SPHR', 'SHRM-CP', 'SHRM-SCP',
  'Series 7', 'Series 63', 'Series 66',
  'PE', 'EIT', 'FE',
  'RN', 'BSN', 'NP', 'APRN',
  'GMP', 'GLP', 'GCP',
  'LEED', 'OSHA 30', 'OSHA 10',
];

// -- Parsing helpers -----------------------------------------------------------

function extractTitle(text: string): string {
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';

  // If first line looks like a title (short, no colon-heavy structure)
  const firstLine = lines[0].trim();
  if (firstLine.length <= 100 && !firstLine.includes(':')) {
    return firstLine;
  }

  // Try "Title: ..." or "Position: ..." pattern
  const titleMatch = text.match(/(?:title|position|job\s+title|role)\s*:\s*(.+)/i);
  if (titleMatch) return titleMatch[1].trim();

  return firstLine.length <= 100 ? firstLine : '';
}

function extractYearsOfExperience(text: string): number | null {
  // Match patterns like "3-5 years", "5+ years", "minimum 5 years", "at least 3 years"
  // Range pattern first to capture the lower bound
  const patterns = [
    /(\d+)\s*-\s*\d+\s*(?:years?|yrs?)/i,
    /(?:minimum|at\s+least|min\.?)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }

  return null;
}

function extractDegree(text: string): { level: string | null; field: string | null } {
  const degreePattern = /(?:bachelor'?s?|master'?s?|ph\.?d\.?|associate'?s?|b\.?s\.?|m\.?s\.?|m\.?b\.?a\.?)\s*(?:degree)?\s*(?:in\s+)?([a-zA-Z\s&,]+)?/i;
  const match = text.match(degreePattern);
  if (!match) return { level: null, field: null };

  const raw = match[0].toLowerCase();
  let level: string | null = null;

  if (/ph\.?d/i.test(raw)) level = 'phd';
  else if (/master|m\.?s\.?|m\.?b\.?a/i.test(raw)) level = 'master';
  else if (/bachelor|b\.?s\.?/i.test(raw)) level = 'bachelor';
  else if (/associate/i.test(raw)) level = 'associate';

  let field: string | null = null;
  if (match[1]) {
    field = match[1]
      .trim()
      .toLowerCase()
      .replace(/[,.]$/, '')
      .replace(/\s+or\s+.*$/i, '')
      .replace(/\s+(is\s+)?(required|preferred|desired|needed|a\s+plus).*$/i, '')
      .replace(/\s+(with|and)\s+.*$/i, '')
      .trim();
    if (field.length < 3) field = null;
  }

  return { level, field };
}

function extractCertifications(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const cert of KNOWN_CERTS) {
    if (lower.includes(cert.toLowerCase())) {
      found.push(cert);
    }
  }
  return [...new Set(found)];
}

// -- Main parser ---------------------------------------------------------------

export function parseJobDescription(text: string): ParsedJobDescription {
  const fullText = text.trim();

  if (!fullText) {
    return {
      title: '',
      sections: { required: '', preferred: '', responsibilities: '', about: '', fullText: '' },
      extractedRequirements: { yearsOfExperience: null, degreeLevel: null, degreeField: null, certifications: [] },
    };
  }

  const title = extractTitle(fullText);

  // Split into lines and find section boundaries
  const lines = fullText.split('\n');

  interface SectionBoundary {
    key: keyof ParsedJobDescription['sections'];
    lineIndex: number;
  }

  const boundaries: SectionBoundary[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    for (const { key, regex } of SECTION_PATTERNS) {
      if (regex.test(line)) {
        boundaries.push({ key, lineIndex: i });
        break;
      }
    }
  }

  // Sort boundaries by line index
  boundaries.sort((a, b) => a.lineIndex - b.lineIndex);

  const sections: ParsedJobDescription['sections'] = {
    required: '',
    preferred: '',
    responsibilities: '',
    about: '',
    fullText,
  };

  if (boundaries.length === 0) {
    // No section headers found — everything goes into fullText (already set)
  } else {
    for (let i = 0; i < boundaries.length; i++) {
      const start = boundaries[i].lineIndex + 1; // skip the header line itself
      const end = i + 1 < boundaries.length ? boundaries[i + 1].lineIndex : lines.length;
      const sectionText = lines
        .slice(start, end)
        .join('\n')
        .trim();
      sections[boundaries[i].key] = sectionText;
    }
  }

  // Extract requirements from the full text
  const degree = extractDegree(fullText);

  return {
    title,
    sections,
    extractedRequirements: {
      yearsOfExperience: extractYearsOfExperience(fullText),
      degreeLevel: degree.level,
      degreeField: degree.field,
      certifications: extractCertifications(fullText),
    },
  };
}
