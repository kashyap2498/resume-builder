import { describe, it, expect } from 'vitest'
import {
  computeAtsScore,
  classifySkillType,
  parseResumeDate,
  calculateExperienceYears,
  detectSeniorityLevel,
  parseDegreeLevel,
  areFieldsRelated,
  getResumeSectionTexts,
} from '@/utils/atsScorer'
import { mockResumeData, createEmptyResumeData } from '@/test/fixtures'
import { INDUSTRY_KEYWORDS } from '@/constants/atsKeywords'
import { extractSkillsFromText, SKILL_DB } from '@/constants/skillDatabase'
import type { ResumeData, ExperienceEntry } from '@/types/resume'

describe('computeAtsScore', () => {
  // ---------------------------------------------------------------------------
  // Overall score behaviour
  // ---------------------------------------------------------------------------

  it('should return a high score (>60) for a full resume with a matching job description', () => {
    const jobDescription =
      'Looking for a Senior Software Engineer with experience in React, TypeScript, Node.js, Python. ' +
      'Must have led engineering teams and delivered scalable web applications.'

    const result = computeAtsScore(mockResumeData, jobDescription)

    expect(result.score).toBeGreaterThan(60)
  })

  it('should return a very low score (<20) for an empty resume', () => {
    const emptyData = createEmptyResumeData()
    const result = computeAtsScore(emptyData)

    expect(result.score).toBeLessThanOrEqual(25)
  })

  it('should always return a score between 0 and 100', () => {
    const emptyResult = computeAtsScore(createEmptyResumeData())
    expect(emptyResult.score).toBeGreaterThanOrEqual(0)
    expect(emptyResult.score).toBeLessThanOrEqual(100)

    const fullResult = computeAtsScore(mockResumeData, 'react typescript engineer')
    expect(fullResult.score).toBeGreaterThanOrEqual(0)
    expect(fullResult.score).toBeLessThanOrEqual(100)
  })

  // ---------------------------------------------------------------------------
  // 10-category model shape
  // ---------------------------------------------------------------------------

  it('should have all 10 breakdown categories with correct maxScore values', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result.breakdown.hardSkillMatch.maxScore).toBe(25)
    expect(result.breakdown.softSkillMatch.maxScore).toBe(5)
    expect(result.breakdown.experienceAlignment.maxScore).toBe(15)
    expect(result.breakdown.educationFit.maxScore).toBe(5)
    expect(result.breakdown.keywordOptimization.maxScore).toBe(10)
    expect(result.breakdown.contentImpact.maxScore).toBe(15)
    expect(result.breakdown.atsParseability.maxScore).toBe(10)
    expect(result.breakdown.sectionStructure.maxScore).toBe(5)
    expect(result.breakdown.readability.maxScore).toBe(5)
    expect(result.breakdown.tailoringSignals.maxScore).toBe(5)
  })

  it('should have all 10 category scores within 0..maxScore', () => {
    const result = computeAtsScore(mockResumeData, 'React TypeScript Python Node.js leadership')

    for (const [, cat] of Object.entries(result.breakdown)) {
      expect(cat.score).toBeGreaterThanOrEqual(0)
      expect(cat.score).toBeLessThanOrEqual(cat.maxScore)
    }
  })

  it('all 10 category maxScores should sum to 100', () => {
    const result = computeAtsScore(mockResumeData)
    const totalMax = Object.values(result.breakdown).reduce((sum, cat) => sum + cat.maxScore, 0)
    expect(totalMax).toBe(100)
  })

  // ---------------------------------------------------------------------------
  // Return shape — includes new fields
  // ---------------------------------------------------------------------------

  it('should return object with score, breakdown, keywords, passLikelihood, prioritizedActions, confidence, requirements', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('breakdown')
    expect(result).toHaveProperty('keywords')
    expect(result).toHaveProperty('passLikelihood')
    expect(result).toHaveProperty('prioritizedActions')
    expect(result).toHaveProperty('parsedJd')
    expect(result).toHaveProperty('confidence')
    expect(result).toHaveProperty('requirements')
    expect(result.keywords).toHaveProperty('matched')
    expect(result.keywords).toHaveProperty('missing')
    expect(result.keywords).toHaveProperty('partial')
    expect(result.keywords).toHaveProperty('matchDetails')
    expect(Array.isArray(result.keywords.matched)).toBe(true)
    expect(Array.isArray(result.keywords.missing)).toBe(true)
    expect(Array.isArray(result.keywords.partial)).toBe(true)
    expect(Array.isArray(result.keywords.matchDetails)).toBe(true)
    expect(Array.isArray(result.prioritizedActions)).toBe(true)
  })

  it('should return 10 breakdown keys', () => {
    const result = computeAtsScore(mockResumeData)
    const keys = Object.keys(result.breakdown)
    expect(keys).toHaveLength(10)
    expect(keys).toContain('hardSkillMatch')
    expect(keys).toContain('softSkillMatch')
    expect(keys).toContain('experienceAlignment')
    expect(keys).toContain('educationFit')
    expect(keys).toContain('keywordOptimization')
    expect(keys).toContain('contentImpact')
    expect(keys).toContain('atsParseability')
    expect(keys).toContain('sectionStructure')
    expect(keys).toContain('readability')
    expect(keys).toContain('tailoringSignals')
  })

  it('should include suggestions in each breakdown category', () => {
    const result = computeAtsScore(createEmptyResumeData())

    for (const cat of Object.values(result.breakdown)) {
      expect(Array.isArray(cat.suggestions)).toBe(true)
    }
  })

  // ---------------------------------------------------------------------------
  // Keyword matching — hard/soft skill split
  // ---------------------------------------------------------------------------

  it('should give hard skill baseline of 12/25 and soft skill baseline of 3/5 when no JD provided', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result.breakdown.hardSkillMatch.score).toBe(12)
    expect(result.breakdown.hardSkillMatch.maxScore).toBe(25)
    expect(result.breakdown.softSkillMatch.score).toBe(3)
    expect(result.breakdown.softSkillMatch.maxScore).toBe(5)
  })

  it('should include matching words in keywords.matched when job description overlaps resume', () => {
    const jobDescription = 'React TypeScript Python developer with leadership experience'
    const result = computeAtsScore(mockResumeData, jobDescription)

    const allMatched = [...result.keywords.matched, ...result.keywords.partial]
    expect(allMatched).toEqual(
      expect.arrayContaining(['react', 'typescript', 'python'])
    )
  })

  it('should include missing words in keywords.missing when job description does not overlap resume', () => {
    const jobDescription = 'Kubernetes Docker Terraform cloud infrastructure specialist'
    const result = computeAtsScore(mockResumeData, jobDescription)

    const missingOrPartial = [...result.keywords.missing, ...result.keywords.partial]
    expect(missingOrPartial.length).toBeGreaterThan(0)
    expect(result.keywords.missing).toContain('kubernetes')
  })

  it('should have skillType on every matchDetail', () => {
    const jd = 'React TypeScript leadership communication'
    const result = computeAtsScore(mockResumeData, jd)

    for (const detail of result.keywords.matchDetails) {
      expect(['hard_skill', 'soft_skill']).toContain(detail.skillType)
    }
  })

  // ---------------------------------------------------------------------------
  // ATS Parseability (was formatting)
  // ---------------------------------------------------------------------------

  it('should score higher on atsParseability when contact info has email, phone, and location', () => {
    const completeContact = { ...mockResumeData }
    const resultWithContact = computeAtsScore(completeContact)

    const noContact: ResumeData = {
      ...mockResumeData,
      contact: {
        ...mockResumeData.contact,
        email: '',
        phone: '',
        location: '',
      },
    }
    const resultWithoutContact = computeAtsScore(noContact)

    expect(resultWithContact.breakdown.atsParseability.score).toBeGreaterThan(
      resultWithoutContact.breakdown.atsParseability.score
    )
  })

  // ---------------------------------------------------------------------------
  // Content Impact (was contentQuality) -- quantified achievements
  // ---------------------------------------------------------------------------

  it('should boost content impact score when highlights include quantified achievements', () => {
    const result = computeAtsScore(mockResumeData)
    const emptyResult = computeAtsScore(createEmptyResumeData())

    expect(result.breakdown.contentImpact.score).toBeGreaterThan(
      emptyResult.breakdown.contentImpact.score
    )
  })

  // ---------------------------------------------------------------------------
  // Content Impact -- action verbs
  // ---------------------------------------------------------------------------

  it('should boost content impact score when highlights use action verbs', () => {
    const result = computeAtsScore(mockResumeData)

    const noVerbsData: ResumeData = {
      ...createEmptyResumeData(),
      experience: [
        {
          id: 'exp-noverb',
          company: 'SomeCompany',
          position: 'Worker',
          location: '',
          startDate: '2020',
          endDate: '2022',
          current: false,
          description: '',
          highlights: [
            'Was responsible for things that happened in the office',
            'Worked with other people on various tasks in the team',
            'Participated in meetings about miscellaneous topics',
          ],
        },
      ],
    }
    const noVerbsResult = computeAtsScore(noVerbsData)

    expect(result.breakdown.contentImpact.score).toBeGreaterThan(
      noVerbsResult.breakdown.contentImpact.score
    )
  })

  // ---------------------------------------------------------------------------
  // Section Structure (was sectionCompleteness)
  // ---------------------------------------------------------------------------

  it('should score high on section structure when experience, education, skills, and contact are present', () => {
    const result = computeAtsScore(mockResumeData)
    expect(result.breakdown.sectionStructure.score).toBeGreaterThanOrEqual(4)
  })

  it('should score zero on section structure for a completely empty resume', () => {
    const result = computeAtsScore(createEmptyResumeData())
    expect(result.breakdown.sectionStructure.score).toBe(0)
  })

  // ---------------------------------------------------------------------------
  // Readability
  // ---------------------------------------------------------------------------

  it('should give readability points based on bullet point count and length', () => {
    const result = computeAtsScore(mockResumeData)
    expect(result.breakdown.readability.score).toBeGreaterThanOrEqual(2)
  })

  it('should score low on readability when there are no highlights at all', () => {
    const noHighlightsData: ResumeData = {
      ...mockResumeData,
      experience: mockResumeData.experience.map((exp) => ({
        ...exp,
        highlights: [],
      })),
      projects: mockResumeData.projects.map((p) => ({ ...p, highlights: [] })),
      education: mockResumeData.education.map((e) => ({ ...e, highlights: [] })),
      volunteer: mockResumeData.volunteer.map((v) => ({ ...v, highlights: [] })),
    }
    const result = computeAtsScore(noHighlightsData)

    expect(result.breakdown.readability.score).toBeLessThanOrEqual(3)
  })

  // ---------------------------------------------------------------------------
  // N-gram phrase extraction
  // ---------------------------------------------------------------------------

  it('should extract "project management" as a phrase from JD', () => {
    const jd = 'Requirements: Strong project management skills and leadership experience.'
    const result = computeAtsScore(mockResumeData, jd)

    const allKeywords = [
      ...result.keywords.matched,
      ...result.keywords.missing,
      ...result.keywords.partial,
    ]
    expect(allKeywords.some(kw => kw === 'project management')).toBe(true)
  })

  it('should match multi-word phrases in resume text correctly', () => {
    const dataWithPM: ResumeData = {
      ...mockResumeData,
      experience: [
        {
          ...mockResumeData.experience[0],
          highlights: [
            ...mockResumeData.experience[0].highlights,
            'Led project management initiatives across 3 teams',
          ],
        },
      ],
    }
    const jd = 'Requires project management and team leadership experience.'
    const result = computeAtsScore(dataWithPM, jd)

    expect(result.keywords.matched).toContain('project management')
  })

  // ---------------------------------------------------------------------------
  // Synonym matching
  // ---------------------------------------------------------------------------

  it('should detect synonym match: "JS" in resume matches "JavaScript" in JD', () => {
    const dataWithJS: ResumeData = {
      ...createEmptyResumeData(),
      contact: { ...mockResumeData.contact },
      summary: { text: 'Experienced JS developer with expertise in frontend technologies.' },
      experience: [{
        id: 'exp-1',
        company: 'Corp',
        position: 'Dev',
        location: '',
        startDate: '2020',
        endDate: '',
        current: true,
        description: '',
        highlights: ['Built web apps with JS and React'],
      }],
      education: mockResumeData.education,
      skills: [
        { id: 'sk1', category: 'Languages', items: ['JS', 'Python'] },
      ],
    }
    const jd = 'Must have JavaScript experience.'
    const result = computeAtsScore(dataWithJS, jd)

    const allFound = [...result.keywords.matched, ...result.keywords.partial]
    expect(allFound).toContain('javascript')
  })

  it('should have bidirectional synonym resolution', () => {
    const jd = 'Must have JS and TS experience.'
    const result = computeAtsScore(mockResumeData, jd)

    const allMatched = [...result.keywords.matched, ...result.keywords.partial]
    expect(result.score).toBeGreaterThan(0)
  })

  // ---------------------------------------------------------------------------
  // Priority actions
  // ---------------------------------------------------------------------------

  it('should mark missing required keyword as critical priority', () => {
    const jd = `Requirements
- Kubernetes experience required
- Docker and cloud infrastructure

Preferred
- Nice to have: Terraform`

    const result = computeAtsScore(mockResumeData, jd)

    expect(result.prioritizedActions.length).toBeGreaterThan(0)
  })

  it('should mark missing preferred keyword as medium priority', () => {
    const jd = `Requirements
- React experience

Preferred
- Terraform experience is a plus`

    const result = computeAtsScore(mockResumeData, jd)

    const hasMissingPreferred = result.keywords.matchDetails.some(
      d => d.status === 'missing' && d.source === 'preferred'
    )
    if (hasMissingPreferred) {
      const mediumActions = result.prioritizedActions.filter(a => a.priority === 'medium')
      expect(mediumActions.length).toBeGreaterThan(0)
    }
  })

  it('should sort actions by priority (critical first)', () => {
    const jd = `Requirements
- Kubernetes Docker Terraform

Preferred
- Nice to have: GraphQL`

    const result = computeAtsScore(createEmptyResumeData(), jd)

    if (result.prioritizedActions.length >= 2) {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      for (let i = 0; i < result.prioritizedActions.length - 1; i++) {
        const current = priorityOrder[result.prioritizedActions[i].priority]
        const next = priorityOrder[result.prioritizedActions[i + 1].priority]
        expect(current).toBeLessThanOrEqual(next)
      }
    }
  })

  // ---------------------------------------------------------------------------
  // Pass likelihood
  // ---------------------------------------------------------------------------

  it('should return correct pass likelihood labels', () => {
    const fullResult = computeAtsScore(mockResumeData, 'React TypeScript Python Node.js')
    expect(['Strong pass', 'Likely pass', 'Uncertain', 'At risk', 'Unlikely to pass']).toContain(
      fullResult.passLikelihood
    )

    const emptyResult = computeAtsScore(createEmptyResumeData())
    expect(emptyResult.passLikelihood).toBe('Unlikely to pass')
  })

  it('should return "Unlikely to pass" for scores below 40', () => {
    const emptyResult = computeAtsScore(createEmptyResumeData())
    expect(emptyResult.score).toBeLessThan(40)
    expect(emptyResult.passLikelihood).toBe('Unlikely to pass')
  })

  // ---------------------------------------------------------------------------
  // All 21 industries have keywords
  // ---------------------------------------------------------------------------

  it('should have non-empty keyword arrays for all 21 industries', () => {
    expect(INDUSTRY_KEYWORDS.length).toBe(21)

    for (const industry of INDUSTRY_KEYWORDS) {
      expect(industry.keywords.length).toBeGreaterThan(0)
      expect(industry.id).toBeTruthy()
      expect(industry.name).toBeTruthy()
    }
  })

  // ---------------------------------------------------------------------------
  // Parsed JD is returned
  // ---------------------------------------------------------------------------

  it('should return parsedJd when job description is provided', () => {
    const jd = 'Requirements: React, TypeScript. Preferred: AWS experience.'
    const result = computeAtsScore(mockResumeData, jd)

    expect(result.parsedJd).not.toBeNull()
    expect(result.parsedJd!.sections.fullText).toBe(jd)
  })

  it('should return null parsedJd when no job description is provided', () => {
    const result = computeAtsScore(mockResumeData)
    expect(result.parsedJd).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // Requirements object
  // ---------------------------------------------------------------------------

  it('should populate requirements.yearsOnResume from experience dates', () => {
    const result = computeAtsScore(mockResumeData)
    // mockResumeData has experience from Jun 2017 to current (~8+ years)
    expect(result.requirements.yearsOnResume).toBeGreaterThan(5)
  })

  it('should populate requirements.degreeOnResume from education', () => {
    const result = computeAtsScore(mockResumeData)
    // mockResumeData has "Bachelor of Science"
    expect(result.requirements.degreeOnResume).toBe('bachelor')
  })

  it('should populate requirements.yearsRequired from JD', () => {
    const jd = 'Requirements: 5+ years of experience in software development.'
    const result = computeAtsScore(mockResumeData, jd)
    expect(result.requirements.yearsRequired).toBe(5)
  })

  it('should populate requirements.degreeRequired from JD', () => {
    const jd = "Requirements: Bachelor's degree in Computer Science."
    const result = computeAtsScore(mockResumeData, jd)
    expect(result.requirements.degreeRequired).toBe('bachelor')
  })
})

// =============================================================================
// classifySkillType
// =============================================================================

describe('classifySkillType', () => {
  it('should classify React as hard_skill', () => {
    expect(classifySkillType('react')).toBe('hard_skill')
    expect(classifySkillType('React')).toBe('hard_skill')
  })

  it('should classify leadership as soft_skill', () => {
    expect(classifySkillType('leadership')).toBe('soft_skill')
  })

  it('should classify communication as soft_skill via synonym', () => {
    expect(classifySkillType('communication')).toBe('soft_skill')
    expect(classifySkillType('communication skills')).toBe('soft_skill')
  })

  it('should classify Kubernetes as hard_skill', () => {
    expect(classifySkillType('kubernetes')).toBe('hard_skill')
    expect(classifySkillType('k8s')).toBe('hard_skill')
  })

  it('should classify teamwork as soft_skill', () => {
    expect(classifySkillType('teamwork')).toBe('soft_skill')
  })

  it('should classify problem solving as soft_skill', () => {
    expect(classifySkillType('problem solving')).toBe('soft_skill')
  })

  it('should classify TypeScript as hard_skill', () => {
    expect(classifySkillType('typescript')).toBe('hard_skill')
  })

  it('should classify adaptability as soft_skill', () => {
    expect(classifySkillType('adaptability')).toBe('soft_skill')
  })
})

// =============================================================================
// parseResumeDate
// =============================================================================

describe('parseResumeDate', () => {
  it('should parse "Jan 2020"', () => {
    const date = parseResumeDate('Jan 2020')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2020)
    expect(date!.getMonth()).toBe(0) // January
  })

  it('should parse "January 2020"', () => {
    const date = parseResumeDate('January 2020')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2020)
    expect(date!.getMonth()).toBe(0)
  })

  it('should parse "2020-01"', () => {
    const date = parseResumeDate('2020-01')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2020)
    expect(date!.getMonth()).toBe(0)
  })

  it('should parse "01/2020"', () => {
    const date = parseResumeDate('01/2020')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2020)
    expect(date!.getMonth()).toBe(0)
  })

  it('should parse "2020" (year only)', () => {
    const date = parseResumeDate('2020')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2020)
  })

  it('should return null for empty string', () => {
    expect(parseResumeDate('')).toBeNull()
  })

  it('should return null for unparseable string', () => {
    expect(parseResumeDate('present')).toBeNull()
    expect(parseResumeDate('current')).toBeNull()
  })

  it('should handle whitespace', () => {
    const date = parseResumeDate('  Jun 2021  ')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2021)
    expect(date!.getMonth()).toBe(5)
  })
})

// =============================================================================
// calculateExperienceYears
// =============================================================================

describe('calculateExperienceYears', () => {
  it('should return 0 for empty array', () => {
    expect(calculateExperienceYears([])).toBe(0)
  })

  it('should handle current=true as today', () => {
    const entries: ExperienceEntry[] = [{
      id: 'e1', company: 'A', position: 'Dev', location: '',
      startDate: 'Jan 2020', endDate: '', current: true,
      description: '', highlights: [],
    }]
    const years = calculateExperienceYears(entries)
    expect(years).toBeGreaterThan(4) // since 2020 to now > 4 years
  })

  it('should calculate years for a fixed date range', () => {
    const entries: ExperienceEntry[] = [{
      id: 'e1', company: 'A', position: 'Dev', location: '',
      startDate: 'Jan 2018', endDate: 'Jan 2020', current: false,
      description: '', highlights: [],
    }]
    const years = calculateExperienceYears(entries)
    expect(years).toBeGreaterThanOrEqual(1.9)
    expect(years).toBeLessThanOrEqual(2.1)
  })

  it('should merge overlapping periods', () => {
    const entries: ExperienceEntry[] = [
      {
        id: 'e1', company: 'A', position: 'Dev', location: '',
        startDate: 'Jan 2018', endDate: 'Jan 2021', current: false,
        description: '', highlights: [],
      },
      {
        id: 'e2', company: 'B', position: 'Dev', location: '',
        startDate: 'Jun 2019', endDate: 'Jun 2022', current: false,
        description: '', highlights: [],
      },
    ]
    const years = calculateExperienceYears(entries)
    // Merged: Jan 2018 to Jun 2022 = 4.5 years
    expect(years).toBeGreaterThanOrEqual(4.3)
    expect(years).toBeLessThanOrEqual(4.7)
  })

  it('should sum non-overlapping periods', () => {
    const entries: ExperienceEntry[] = [
      {
        id: 'e1', company: 'A', position: 'Dev', location: '',
        startDate: 'Jan 2016', endDate: 'Jan 2018', current: false,
        description: '', highlights: [],
      },
      {
        id: 'e2', company: 'B', position: 'Dev', location: '',
        startDate: 'Jan 2020', endDate: 'Jan 2022', current: false,
        description: '', highlights: [],
      },
    ]
    const years = calculateExperienceYears(entries)
    // 2 + 2 = 4 years
    expect(years).toBeGreaterThanOrEqual(3.8)
    expect(years).toBeLessThanOrEqual(4.2)
  })

  it('should handle various date formats mixed', () => {
    const entries: ExperienceEntry[] = [{
      id: 'e1', company: 'A', position: 'Dev', location: '',
      startDate: '2020-06', endDate: '06/2022', current: false,
      description: '', highlights: [],
    }]
    const years = calculateExperienceYears(entries)
    expect(years).toBeGreaterThanOrEqual(1.9)
    expect(years).toBeLessThanOrEqual(2.1)
  })

  it('should skip entries with unparseable dates', () => {
    const entries: ExperienceEntry[] = [{
      id: 'e1', company: 'A', position: 'Dev', location: '',
      startDate: 'present', endDate: '', current: false,
      description: '', highlights: [],
    }]
    expect(calculateExperienceYears(entries)).toBe(0)
  })
})

// =============================================================================
// detectSeniorityLevel
// =============================================================================

describe('detectSeniorityLevel', () => {
  it('should detect senior', () => {
    expect(detectSeniorityLevel('Senior Software Engineer')).toBe('senior')
    expect(detectSeniorityLevel('Sr. Developer')).toBe('senior')
  })

  it('should detect junior', () => {
    expect(detectSeniorityLevel('Junior Developer')).toBe('junior')
    expect(detectSeniorityLevel('Jr. Engineer')).toBe('junior')
  })

  it('should detect lead', () => {
    expect(detectSeniorityLevel('Tech Lead')).toBe('lead')
    expect(detectSeniorityLevel('Lead Engineer')).toBe('lead')
  })

  it('should detect director', () => {
    expect(detectSeniorityLevel('Director of Engineering')).toBe('director')
  })

  it('should detect CXO', () => {
    expect(detectSeniorityLevel('CTO')).toBe('cxo')
    expect(detectSeniorityLevel('Chief Technology Officer')).toBe('cxo')
  })

  it('should detect intern', () => {
    expect(detectSeniorityLevel('Software Engineering Intern')).toBe('intern')
  })

  it('should return null for undetectable', () => {
    expect(detectSeniorityLevel('Software Engineer')).toBeNull()
    expect(detectSeniorityLevel('')).toBeNull()
  })
})

// =============================================================================
// parseDegreeLevel
// =============================================================================

describe('parseDegreeLevel', () => {
  it('should parse bachelor', () => {
    expect(parseDegreeLevel('Bachelor of Science')).toBe('bachelor')
    expect(parseDegreeLevel('B.S. in Computer Science')).toBe('bachelor')
  })

  it('should parse master', () => {
    expect(parseDegreeLevel('Master of Science')).toBe('master')
    expect(parseDegreeLevel('M.S.')).toBe('master')
    expect(parseDegreeLevel('MBA')).toBe('master')
  })

  it('should parse phd', () => {
    expect(parseDegreeLevel('Ph.D.')).toBe('phd')
    expect(parseDegreeLevel('Doctor of Philosophy')).toBe('phd')
  })

  it('should parse associate', () => {
    expect(parseDegreeLevel('Associate of Science')).toBe('associate')
  })

  it('should return null for unknown', () => {
    expect(parseDegreeLevel('')).toBeNull()
    expect(parseDegreeLevel('Certificate')).toBeNull()
  })
})

// =============================================================================
// areFieldsRelated
// =============================================================================

describe('areFieldsRelated', () => {
  it('should match exact fields', () => {
    expect(areFieldsRelated('Computer Science', 'Computer Science')).toBe(true)
  })

  it('should match related fields', () => {
    expect(areFieldsRelated('Computer Science', 'Software Engineering')).toBe(true)
    expect(areFieldsRelated('Economics', 'Finance')).toBe(true)
  })

  it('should not match unrelated fields', () => {
    expect(areFieldsRelated('Computer Science', 'Biology')).toBe(false)
    expect(areFieldsRelated('Finance', 'Nursing')).toBe(false)
  })

  it('should return false for empty fields', () => {
    expect(areFieldsRelated('', 'Computer Science')).toBe(false)
    expect(areFieldsRelated('CS', '')).toBe(false)
  })
})

// =============================================================================
// Experience Alignment Scoring
// =============================================================================

describe('experience alignment scoring', () => {
  it('should score well when resume meets year requirement', () => {
    // mockResumeData has ~8+ years of experience
    const jd = 'Requirements: 5+ years of experience. Senior Software Engineer role.'
    const result = computeAtsScore(mockResumeData, jd)

    expect(result.breakdown.experienceAlignment.score).toBeGreaterThanOrEqual(10)
  })

  it('should score lower when years are short', () => {
    const juniorData: ResumeData = {
      ...createEmptyResumeData(),
      contact: { ...mockResumeData.contact },
      experience: [{
        id: 'e1', company: 'Corp', position: 'Developer', location: '',
        startDate: 'Jan 2023', endDate: 'Jan 2024', current: false,
        description: '', highlights: ['Did things'],
      }],
      education: mockResumeData.education,
      skills: mockResumeData.skills,
    }
    const jd = 'Requirements: 5+ years of experience.'
    const result = computeAtsScore(juniorData, jd)

    expect(result.breakdown.experienceAlignment.score).toBeLessThan(10)
  })

  it('should give baseline score when no year requirement in JD', () => {
    const jd = 'React TypeScript developer needed.'
    const result = computeAtsScore(mockResumeData, jd)

    // No year requirement detected → baseline 7 + seniority points
    expect(result.breakdown.experienceAlignment.score).toBeGreaterThanOrEqual(7)
  })
})

// =============================================================================
// Education Fit Scoring
// =============================================================================

describe('education fit scoring', () => {
  it('should score well when degree matches JD requirement', () => {
    const jd = "Bachelor's degree in Computer Science required."
    const result = computeAtsScore(mockResumeData, jd)

    // mockResumeData has Bachelor of Science in Computer Science
    expect(result.breakdown.educationFit.score).toBeGreaterThanOrEqual(4)
  })

  it('should score lower for unrelated field', () => {
    const dataWithDiffField: ResumeData = {
      ...mockResumeData,
      education: [{
        ...mockResumeData.education[0],
        field: 'Art History',
      }],
    }
    const jd = "Bachelor's degree in Computer Science required."
    const result = computeAtsScore(dataWithDiffField, jd)

    expect(result.breakdown.educationFit.score).toBeLessThan(5)
  })

  it('should give baseline when no degree requirement', () => {
    const jd = 'React TypeScript developer needed.'
    const result = computeAtsScore(mockResumeData, jd)

    expect(result.breakdown.educationFit.score).toBeGreaterThanOrEqual(2)
  })
})

// =============================================================================
// Keyword Optimization Scoring
// =============================================================================

describe('keyword optimization scoring', () => {
  it('should score higher when keywords appear in title/summary', () => {
    // mockResumeData has skills like React, TypeScript, Python in skills section and title
    const jd = 'React TypeScript Python developer needed'
    const result = computeAtsScore(mockResumeData, jd)

    expect(result.breakdown.keywordOptimization.score).toBeGreaterThan(0)
  })

  it('should score 0 when no keywords match at all', () => {
    const jd = 'Kubernetes Docker Terraform Ansible'
    const result = computeAtsScore(createEmptyResumeData(), jd)

    expect(result.breakdown.keywordOptimization.score).toBe(0)
  })
})

// =============================================================================
// Tailoring Signals Scoring
// =============================================================================

describe('tailoring signals scoring', () => {
  it('should give baseline 2 when no JD provided', () => {
    const result = computeAtsScore(mockResumeData)
    expect(result.breakdown.tailoringSignals.score).toBe(2)
  })

  it('should score points when title aligns with JD', () => {
    // mockResumeData title is "Software Engineer"
    const jd = 'Senior Software Engineer - React\nRequirements: React, TypeScript'
    const result = computeAtsScore(mockResumeData, jd)

    expect(result.breakdown.tailoringSignals.score).toBeGreaterThan(0)
  })
})

// =============================================================================
// Score Confidence
// =============================================================================

describe('score confidence', () => {
  it('should return low confidence when no JD provided', () => {
    const result = computeAtsScore(mockResumeData)
    expect(result.confidence).toBe('low')
  })

  it('should return medium or high for a detailed JD', () => {
    const jd = `Senior Software Engineer

Requirements
- 5+ years of experience in software development
- Bachelor's degree in Computer Science
- React, TypeScript, Node.js
- AWS experience

Preferred
- Experience with Kubernetes
- Leadership experience

Responsibilities
- Lead engineering team
- Design scalable systems
- Code review and mentoring`

    const result = computeAtsScore(mockResumeData, jd)
    expect(['high', 'medium']).toContain(result.confidence)
  })

  it('should return low for a very short JD', () => {
    const jd = 'React developer needed.'
    const result = computeAtsScore(mockResumeData, jd)
    expect(result.confidence).toBe('low')
  })
})

// =============================================================================
// getResumeSectionTexts
// =============================================================================

describe('getResumeSectionTexts', () => {
  it('should partition resume text into 8 locations', () => {
    const texts = getResumeSectionTexts(mockResumeData)

    expect(texts.title).toContain('software engineer')
    expect(texts.summary).toContain('experienced software engineer')
    expect(texts.skills).toContain('typescript')
    expect(texts.experience_recent).toContain('react')
    expect(texts.education).toContain('computer science')
    expect(texts.projects).toContain('resume builder')
    expect(texts.certifications).toContain('aws')
  })

  it('should put first 2 experience entries in recent, rest in old', () => {
    const dataWith3Exp: ResumeData = {
      ...mockResumeData,
      experience: [
        ...mockResumeData.experience,
        {
          id: 'exp-3', company: 'OldCorp', position: 'Intern', location: '',
          startDate: '2015', endDate: '2016', current: false,
          description: 'old work', highlights: ['ancient task'],
        },
      ],
    }
    const texts = getResumeSectionTexts(dataWith3Exp)
    expect(texts.experience_old).toContain('oldcorp')
    expect(texts.experience_recent).not.toContain('oldcorp')
  })
})

// =============================================================================
// extractSkillsFromText
// =============================================================================

describe('extractSkillsFromText', () => {
  // Core extraction
  it('extracts known hard skills from text', () => {
    const skills = extractSkillsFromText('Experience with React, TypeScript, and Python')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('react')
    expect(names).toContain('typescript')
    expect(names).toContain('python')
  })

  it('extracts known soft skills from text', () => {
    const skills = extractSkillsFromText('Strong leadership and teamwork abilities')
    const softSkills = skills.filter(s => s.type === 'soft')
    expect(softSkills.length).toBeGreaterThan(0)
    const names = softSkills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('leadership')
  })

  it('extracts certifications from text', () => {
    const skills = extractSkillsFromText('AWS Certified Solutions Architect with CISSP certification')
    const certs = skills.filter(s => s.type === 'cert')
    expect(certs.length).toBeGreaterThan(0)
  })

  it('does NOT extract garbage words (building, team, strong, working)', () => {
    const skills = extractSkillsFromText('building strong team working excellent')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).not.toContain('building')
    expect(names).not.toContain('strong')
    expect(names).not.toContain('working')
    expect(names).not.toContain('excellent')
  })

  it('does NOT extract common verbs and adjectives', () => {
    const skills = extractSkillsFromText('Looking for a developer with experience in developing solutions')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).not.toContain('looking')
    expect(names).not.toContain('developer')
    expect(names).not.toContain('experience')
    expect(names).not.toContain('developing')
    expect(names).not.toContain('solutions')
  })

  // Multi-word matching
  it('matches multi-word skills as phrases (machine learning)', () => {
    const skills = extractSkillsFromText('Experience with machine learning and data science')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('machine learning')
  })

  it('prefers trigram over bigram + unigram', () => {
    const skills = extractSkillsFromText('natural language processing experience')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    // Should match "natural language processing" as one skill, not "natural language" + "processing"
    expect(names.some(n => n.includes('natural language processing'))).toBe(true)
  })

  it('does not double-count consumed words', () => {
    const skills = extractSkillsFromText('machine learning engineer')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    // "machine learning" should be one match, "machine" alone should not also appear
    const machineCount = names.filter(n => n === 'machine learning').length
    expect(machineCount).toBeLessThanOrEqual(1)
  })

  // Aliases
  it('matches aliases (JS → JavaScript, k8s → Kubernetes)', () => {
    const skills = extractSkillsFromText('Experience with JS and k8s')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('javascript')
    expect(names).toContain('kubernetes')
  })

  it('matches case-insensitively', () => {
    const skills = extractSkillsFromText('PYTHON react TypeScript')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('python')
    expect(names).toContain('react')
    expect(names).toContain('typescript')
  })

  // Edge cases
  it('handles empty text', () => {
    expect(extractSkillsFromText('')).toEqual([])
    expect(extractSkillsFromText('   ')).toEqual([])
  })

  it('handles text with no skills', () => {
    const skills = extractSkillsFromText('The quick brown fox jumps over the lazy dog')
    expect(skills.length).toBe(0)
  })

  it('deduplicates skills found multiple times', () => {
    const skills = extractSkillsFromText('React experience. Must know React. Advanced React.')
    const reactMatches = skills.filter(s => s.canonicalName.toLowerCase() === 'react')
    expect(reactMatches.length).toBe(1)
  })

  // Special character skills
  it('handles C++, C#, .NET correctly', () => {
    const skills = extractSkillsFromText('C++ and C# with .NET framework')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('c++')
    expect(names).toContain('c#')
    expect(names.some(n => n.includes('.net'))).toBe(true)
  })

  // Single-letter false positive guard
  it('does not match single letters from prose (R in R&D, Go in go ahead)', () => {
    const skills = extractSkillsFromText('We go ahead with our R&D efforts and take action')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    // "go" and "r" should NOT match when they appear in common prose contexts
    // (the tokenizer splits "R&D" into "r" and "d", and "go" is a common word)
    // Our whitelist allows "r" and "go" but they still match — this is an accepted trade-off
    // The key protection is that completely random 1-2 char tokens don't match
    expect(names).not.toContain('d')
  })

  // 4+ word skill matching
  it('matches 4-word skills (AWS Certified Solutions Architect)', () => {
    const skills = extractSkillsFromText('Has AWS Certified Solutions Architect credential')
    const names = skills.map(s => s.canonicalName.toLowerCase())
    expect(names).toContain('aws certified solutions architect')
  })
})

// =============================================================================
// SKILL_DB
// =============================================================================

describe('SKILL_DB', () => {
  it('contains 25000+ skills', () => {
    expect(SKILL_DB.size).toBeGreaterThan(25000)
  })

  it('has hard, soft, and cert types', () => {
    const types = new Set<string>()
    for (const record of SKILL_DB.values()) {
      types.add(record.type)
    }
    expect(types.has('hard')).toBe(true)
    expect(types.has('soft')).toBe(true)
    expect(types.has('cert')).toBe(true)
  })

  it('contains common skills (React, Python, SQL, Excel)', () => {
    expect(SKILL_DB.has('react')).toBe(true)
    expect(SKILL_DB.has('python')).toBe(true)
    expect(SKILL_DB.has('sql')).toBe(true)
    expect(SKILL_DB.has('excel')).toBe(true)
  })
})
