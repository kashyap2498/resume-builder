// =============================================================================
// Resume Builder - ATS Scoring Algorithm
// =============================================================================
// Computes an ATS compatibility score (0-100) across five categories:
//   1. Keyword Match (40 pts)  - job description keywords vs resume content
//   2. Formatting (20 pts)     - standard headings, consistent dates
//   3. Content Quality (20 pts)- summary, quantified achievements, action verbs
//   4. Section Completeness (10 pts) - essential sections present
//   5. Readability (10 pts)    - bullet points, appropriate length
//
// Returns a detailed breakdown with per-category scores and suggestions.

import type { ResumeData } from '@/types/resume';
import { getKeywordsByIndustry, type IndustryId } from '@/constants/atsKeywords';

// -- Types --------------------------------------------------------------------

export interface CategoryScore {
  score: number;
  maxScore: number;
  suggestions: string[];
}

export interface AtsScoreBreakdown {
  keywordMatch: CategoryScore;
  formatting: CategoryScore;
  contentQuality: CategoryScore;
  sectionCompleteness: CategoryScore;
  readability: CategoryScore;
}

export interface AtsScoreResult {
  score: number;
  breakdown: AtsScoreBreakdown;
  keywords: {
    matched: string[];
    missing: string[];
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

// -- Helper Functions ---------------------------------------------------------

/**
 * Extracts all meaningful keywords from text, lowercased and de-duped.
 */
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return [...new Set(words)];
}

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
    parts.push(...cat.items.map((s) => s.name));
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
  return highlights;
}

// -- TF-IDF Helper ------------------------------------------------------------

/**
 * Compute a simple TF-IDF score for a set of target keywords against resume text.
 * Returns a map of keyword -> TF-IDF score.
 */
function computeTfIdf(
  resumeText: string,
  targetKeywords: string[]
): Map<string, number> {
  const words = resumeText
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const totalWords = words.length || 1;
  const wordFreq = new Map<string, number>();
  for (const w of words) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }

  // IDF is approximated: log(totalKeywords / (1 + number of keywords that appear in resume))
  const totalTarget = targetKeywords.length || 1;
  const appearsCount = targetKeywords.filter((kw) => resumeText.toLowerCase().includes(kw.toLowerCase())).length || 1;

  const result = new Map<string, number>();
  for (const kw of targetKeywords) {
    const kwLower = kw.toLowerCase();
    const tf = (wordFreq.get(kwLower) || 0) / totalWords;
    const idf = Math.log(totalTarget / appearsCount);
    result.set(kw, tf * idf);
  }
  return result;
}

// -- Scoring Functions --------------------------------------------------------

/**
 * 1. Keyword Match (max 40 pts)
 */
function scoreKeywordMatch(
  data: ResumeData,
  jobDescription: string,
  industryId?: IndustryId
): { category: CategoryScore; matched: string[]; missing: string[] } {
  const suggestions: string[] = [];

  // When no job description but an industry is provided, use industry keywords
  if (!jobDescription.trim()) {
    if (industryId) {
      const industryKeywords = getKeywordsByIndustry(industryId);
      if (industryKeywords.length === 0) {
        return {
          category: {
            score: 20,
            maxScore: 40,
            suggestions: [
              'Provide a job description to get a detailed keyword match analysis.',
            ],
          },
          matched: [],
          missing: [],
        };
      }

      const resumeText = getResumeFullText(data).toLowerCase();
      const tfIdfScores = computeTfIdf(resumeText, industryKeywords);

      const matched: string[] = [];
      const missing: string[] = [];

      for (const kw of industryKeywords) {
        if (resumeText.includes(kw.toLowerCase())) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      }

      const matchRatio = industryKeywords.length > 0 ? matched.length / industryKeywords.length : 0;
      const score = Math.round(Math.min(matchRatio, 1) * 40);

      if (matchRatio < 0.3) {
        suggestions.push(
          `Your resume matches only ${Math.round(matchRatio * 100)}% of ${industryId} industry keywords. Consider adding more relevant terms.`
        );
      }
      if (missing.length > 0) {
        suggestions.push(
          `Top industry keywords to add: ${missing.slice(0, 8).join(', ')}.`
        );
      }

      return { category: { score, maxScore: 40, suggestions }, matched, missing };
    }

    return {
      category: {
        score: 20,
        maxScore: 40,
        suggestions: [
          'Provide a job description to get a detailed keyword match analysis.',
        ],
      },
      matched: [],
      missing: [],
    };
  }

  const jobKeywords = extractKeywords(jobDescription);
  const resumeText = getResumeFullText(data).toLowerCase();
  const resumeKeywords = new Set(extractKeywords(resumeText));

  // Use TF-IDF for scoring importance
  const tfIdfScores = computeTfIdf(resumeText, jobKeywords);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    if (resumeKeywords.has(keyword) || resumeText.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const totalKeywords = jobKeywords.length;
  let matchRatio = totalKeywords > 0 ? matched.length / totalKeywords : 0;
  matchRatio = Math.min(matchRatio, 1);

  const score = Math.round(matchRatio * 40);

  if (matchRatio < 0.5) {
    suggestions.push(
      `Your resume matches only ${Math.round(matchRatio * 100)}% of job description keywords. Consider adding more relevant terms.`
    );
  }
  if (missing.length > 0 && missing.length <= 10) {
    suggestions.push(
      `Consider incorporating these keywords: ${missing.slice(0, 10).join(', ')}.`
    );
  } else if (missing.length > 10) {
    suggestions.push(
      `${missing.length} keywords from the job description are missing. Review the job posting and tailor your resume.`
    );
  }

  return { category: { score, maxScore: 40, suggestions }, matched, missing };
}

/**
 * 2. Formatting (max 20 pts)
 */
function scoreFormatting(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Standard section headings present (up to 8 pts)
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasSkills = data.skills.length > 0;
  const hasSummary = data.summary.text.trim().length > 0;

  const headingCount = [hasExperience, hasEducation, hasSkills, hasSummary].filter(
    Boolean
  ).length;
  score += headingCount * 2; // 2 pts each, max 8

  if (!hasExperience) suggestions.push('Add a Work Experience section.');
  if (!hasEducation) suggestions.push('Add an Education section.');
  if (!hasSkills) suggestions.push('Add a Skills section.');
  if (!hasSummary) suggestions.push('Add a Professional Summary section.');

  // Consistent date formatting (up to 6 pts)
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
    score += 6;
  } else {
    suggestions.push('Add dates to your experience and education entries.');
  }

  // Contact info completeness (up to 6 pts)
  const hasEmail = !!data.contact.email;
  const hasPhone = !!data.contact.phone;
  const hasLocation = !!data.contact.location;

  if (hasEmail) score += 2;
  else suggestions.push('Add your email address.');
  if (hasPhone) score += 2;
  else suggestions.push('Add your phone number.');
  if (hasLocation) score += 2;
  else suggestions.push('Add your location.');

  return { score: Math.min(score, 20), maxScore: 20, suggestions };
}

/**
 * 3. Content Quality (max 20 pts)
 */
function scoreContentQuality(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Professional summary present and meaningful (5 pts)
  const summaryLength = data.summary.text.trim().length;
  if (summaryLength > 100) {
    score += 5;
  } else if (summaryLength > 30) {
    score += 3;
    suggestions.push('Expand your professional summary to 2-3 sentences.');
  } else if (summaryLength > 0) {
    score += 1;
    suggestions.push('Your summary is very short. Aim for 2-3 impactful sentences.');
  } else {
    suggestions.push('Add a professional summary to make a strong first impression.');
  }

  // Quantified achievements -- numbers and percentages in highlights (8 pts)
  const highlights = getAllHighlights(data);
  const quantifiedCount = highlights.filter((h) =>
    /\d+%|\$[\d,]+|\d+\+?\s*(?:years?|months?|clients?|projects?|team|people|users?|customers?|revenue|increase|decrease|reduction|improvement)/i.test(
      h
    )
  ).length;

  if (highlights.length === 0) {
    suggestions.push('Add bullet points to your experience entries with quantified achievements.');
  } else {
    const quantifiedRatio = quantifiedCount / highlights.length;
    if (quantifiedRatio >= 0.5) {
      score += 8;
    } else if (quantifiedRatio >= 0.25) {
      score += 5;
      suggestions.push(
        'Add more numbers and metrics to your bullet points (e.g., "Increased sales by 25%").'
      );
    } else if (quantifiedCount > 0) {
      score += 3;
      suggestions.push(
        'Most of your bullet points lack quantified results. Use numbers, percentages, or dollar amounts.'
      );
    } else {
      suggestions.push(
        'None of your bullet points include quantified achievements. Add metrics to demonstrate impact.'
      );
    }
  }

  // Action verbs (7 pts)
  const highlightsText = highlights.join(' ').toLowerCase();
  const usedActionVerbs = ACTION_VERBS.filter((v) =>
    highlightsText.includes(v)
  );

  if (usedActionVerbs.length >= 8) {
    score += 7;
  } else if (usedActionVerbs.length >= 5) {
    score += 5;
    suggestions.push('Use more varied action verbs to start your bullet points.');
  } else if (usedActionVerbs.length >= 2) {
    score += 3;
    suggestions.push(
      'Start each bullet point with a strong action verb (e.g., "Developed", "Managed", "Implemented").'
    );
  } else {
    suggestions.push(
      'Your bullet points should start with action verbs. Examples: Achieved, Developed, Led, Streamlined.'
    );
  }

  return { score: Math.min(score, 20), maxScore: 20, suggestions };
}

/**
 * 4. Section Completeness (max 10 pts)
 */
function scoreSectionCompleteness(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  // Essential sections (2 pts each)
  if (data.contact.firstName || data.contact.lastName) score += 2;
  else suggestions.push('Add your name to the contact section.');

  if (data.experience.length > 0) score += 2;
  else suggestions.push('Add at least one work experience entry.');

  if (data.education.length > 0) score += 2;
  else suggestions.push('Add your education background.');

  if (data.skills.length > 0) score += 2;
  else suggestions.push('Add a skills section to highlight your competencies.');

  // Bonus: extra sections (2 pts)
  const bonusSections = [
    data.certifications.length > 0,
    data.projects.length > 0,
    data.volunteer.length > 0,
    data.awards.length > 0,
    data.languages.length > 0,
    data.publications.length > 0,
  ].filter(Boolean).length;

  if (bonusSections >= 2) {
    score += 2;
  } else if (bonusSections === 1) {
    score += 1;
    suggestions.push(
      'Consider adding more sections (projects, certifications, volunteer work) to strengthen your resume.'
    );
  } else {
    suggestions.push(
      'Add supplementary sections like projects, certifications, or volunteer experience.'
    );
  }

  return { score: Math.min(score, 10), maxScore: 10, suggestions };
}

/**
 * 5. Readability (max 10 pts)
 */
function scoreReadability(data: ResumeData): CategoryScore {
  let score = 0;
  const suggestions: string[] = [];

  const highlights = getAllHighlights(data);

  // Bullet points usage (4 pts)
  if (highlights.length >= 6) {
    score += 4;
  } else if (highlights.length >= 3) {
    score += 2;
    suggestions.push('Add more bullet points to your experience entries (3-5 per role).');
  } else {
    suggestions.push(
      'Use bullet points to describe your experience. Aim for 3-5 bullets per role.'
    );
  }

  // Bullet point length -- not too short, not too long (3 pts)
  if (highlights.length > 0) {
    const avgLength =
      highlights.reduce((sum, h) => sum + h.length, 0) / highlights.length;

    if (avgLength >= 40 && avgLength <= 150) {
      score += 3;
    } else if (avgLength < 40) {
      score += 1;
      suggestions.push(
        'Your bullet points are quite short. Provide more detail about your accomplishments.'
      );
    } else {
      score += 1;
      suggestions.push(
        'Some bullet points are too long. Keep each to 1-2 lines for easy scanning.'
      );
    }
  }

  // Experience entry count (3 pts)
  const expCount = data.experience.length;
  if (expCount >= 2 && expCount <= 6) {
    score += 3;
  } else if (expCount === 1) {
    score += 2;
    suggestions.push('Consider adding more work experience if available.');
  } else if (expCount > 6) {
    score += 2;
    suggestions.push(
      'You have many experience entries. Consider focusing on the most recent and relevant roles.'
    );
  } else {
    suggestions.push('Add work experience to your resume.');
  }

  return { score: Math.min(score, 10), maxScore: 10, suggestions };
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
  const keywordResult = scoreKeywordMatch(data, jobDescription, industryId);
  const formatting = scoreFormatting(data);
  const contentQuality = scoreContentQuality(data);
  const sectionCompleteness = scoreSectionCompleteness(data);
  const readability = scoreReadability(data);

  const totalScore =
    keywordResult.category.score +
    formatting.score +
    contentQuality.score +
    sectionCompleteness.score +
    readability.score;

  return {
    score: Math.min(totalScore, 100),
    breakdown: {
      keywordMatch: keywordResult.category,
      formatting,
      contentQuality,
      sectionCompleteness,
      readability,
    },
    keywords: {
      matched: keywordResult.matched,
      missing: keywordResult.missing,
    },
  };
}
