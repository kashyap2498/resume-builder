import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computeAtsScore } from '@/utils/atsScorer'
import { mockResumeData, createEmptyResumeData } from '@/test/fixtures'
import type { ResumeData } from '@/types/resume'

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

    expect(result.score).toBeLessThanOrEqual(20)
  })

  it('should always return a score between 0 and 100', () => {
    // Test with multiple data variations
    const emptyResult = computeAtsScore(createEmptyResumeData())
    expect(emptyResult.score).toBeGreaterThanOrEqual(0)
    expect(emptyResult.score).toBeLessThanOrEqual(100)

    const fullResult = computeAtsScore(mockResumeData, 'react typescript engineer')
    expect(fullResult.score).toBeGreaterThanOrEqual(0)
    expect(fullResult.score).toBeLessThanOrEqual(100)
  })

  // ---------------------------------------------------------------------------
  // Keyword matching
  // ---------------------------------------------------------------------------

  it('should give a keyword category baseline of 20/40 when no job description is provided', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result.breakdown.keywordMatch.score).toBe(20)
    expect(result.breakdown.keywordMatch.maxScore).toBe(40)
  })

  it('should include matching words in keywords.matched when job description overlaps resume', () => {
    const jobDescription = 'React TypeScript Python developer with leadership experience'
    const result = computeAtsScore(mockResumeData, jobDescription)

    // mockResumeData contains React, TypeScript, Python
    expect(result.keywords.matched).toEqual(
      expect.arrayContaining(['react', 'typescript', 'python'])
    )
  })

  it('should include missing words in keywords.missing when job description does not overlap resume', () => {
    const jobDescription = 'Kubernetes Docker Terraform cloud infrastructure specialist'
    const result = computeAtsScore(mockResumeData, jobDescription)

    expect(result.keywords.missing).toEqual(
      expect.arrayContaining(['kubernetes', 'docker', 'terraform'])
    )
  })

  // ---------------------------------------------------------------------------
  // Formatting (contact info)
  // ---------------------------------------------------------------------------

  it('should score higher on formatting when contact info has email, phone, and location', () => {
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

    expect(resultWithContact.breakdown.formatting.score).toBeGreaterThan(
      resultWithoutContact.breakdown.formatting.score
    )
  })

  // ---------------------------------------------------------------------------
  // Content quality -- quantified achievements
  // ---------------------------------------------------------------------------

  it('should boost content quality score when highlights include quantified achievements', () => {
    // mockResumeData already has "35%", "50%", "60%", "100,000+" in highlights
    const result = computeAtsScore(mockResumeData)

    // An empty resume has zero content quality
    const emptyResult = computeAtsScore(createEmptyResumeData())

    expect(result.breakdown.contentQuality.score).toBeGreaterThan(
      emptyResult.breakdown.contentQuality.score
    )
  })

  // ---------------------------------------------------------------------------
  // Content quality -- action verbs
  // ---------------------------------------------------------------------------

  it('should boost content quality score when highlights use action verbs', () => {
    // mockResumeData highlights contain "Developed", "Led", "Reduced", "Built", "Implemented"
    const result = computeAtsScore(mockResumeData)

    // Build a resume with no action verbs at all
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

    expect(result.breakdown.contentQuality.score).toBeGreaterThan(
      noVerbsResult.breakdown.contentQuality.score
    )
  })

  // ---------------------------------------------------------------------------
  // Section completeness
  // ---------------------------------------------------------------------------

  it('should score high on section completeness when experience, education, skills, and contact are present', () => {
    const result = computeAtsScore(mockResumeData)

    // mockResumeData has name, experience, education, skills, certifications,
    // projects, volunteer, awards, publications, languages -- basically everything
    expect(result.breakdown.sectionCompleteness.score).toBeGreaterThanOrEqual(8)
  })

  it('should score zero on section completeness for a completely empty resume', () => {
    const result = computeAtsScore(createEmptyResumeData())

    expect(result.breakdown.sectionCompleteness.score).toBe(0)
  })

  // ---------------------------------------------------------------------------
  // Readability
  // ---------------------------------------------------------------------------

  it('should give readability points based on bullet point count and length', () => {
    // mockResumeData has 7 experience highlights (>= 6 threshold) with reasonable length
    const result = computeAtsScore(mockResumeData)

    expect(result.breakdown.readability.score).toBeGreaterThanOrEqual(4)
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

    expect(result.breakdown.readability.score).toBeLessThanOrEqual(5)
  })

  // ---------------------------------------------------------------------------
  // Breakdown category maxScore values
  // ---------------------------------------------------------------------------

  it('should have correct maxScore values for all breakdown categories', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result.breakdown.keywordMatch.maxScore).toBe(40)
    expect(result.breakdown.formatting.maxScore).toBe(20)
    expect(result.breakdown.contentQuality.maxScore).toBe(20)
    expect(result.breakdown.sectionCompleteness.maxScore).toBe(10)
    expect(result.breakdown.readability.maxScore).toBe(10)
  })

  // ---------------------------------------------------------------------------
  // Return shape
  // ---------------------------------------------------------------------------

  it('should return an object with score, breakdown, and keywords properties', () => {
    const result = computeAtsScore(mockResumeData)

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('breakdown')
    expect(result).toHaveProperty('keywords')
    expect(result.keywords).toHaveProperty('matched')
    expect(result.keywords).toHaveProperty('missing')
    expect(Array.isArray(result.keywords.matched)).toBe(true)
    expect(Array.isArray(result.keywords.missing)).toBe(true)
  })

  it('should include suggestions in each breakdown category', () => {
    const result = computeAtsScore(createEmptyResumeData())

    expect(Array.isArray(result.breakdown.keywordMatch.suggestions)).toBe(true)
    expect(Array.isArray(result.breakdown.formatting.suggestions)).toBe(true)
    expect(Array.isArray(result.breakdown.contentQuality.suggestions)).toBe(true)
    expect(Array.isArray(result.breakdown.sectionCompleteness.suggestions)).toBe(true)
    expect(Array.isArray(result.breakdown.readability.suggestions)).toBe(true)
  })
})
