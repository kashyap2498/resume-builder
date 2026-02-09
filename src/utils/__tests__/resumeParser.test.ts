import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseResumeText } from '@/utils/resumeParser'

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const FULL_RESUME_TEXT = `John Doe
john@example.com
555-123-4567
https://www.linkedin.com/in/johndoe

Summary
Experienced software engineer with 5+ years of experience building scalable web applications and leading cross-functional teams.

Experience
Senior Developer at Tech Corp
Jan 2020 - Present
- Led team of 8 engineers
- Developed new dashboard that increased user engagement by 35%

Full Stack Developer at StartupXYZ
Jun 2017 - Dec 2019
- Built RESTful APIs serving 100,000+ daily requests
* Implemented CI/CD pipeline

Education
Bachelor of Science in Computer Science
MIT
2013 - 2017
GPA: 3.8

Skills
Programming: JavaScript, TypeScript, Python
Frameworks: React, Node.js
`

describe('parseResumeText', () => {
  // ---------------------------------------------------------------------------
  // Contact extraction
  // ---------------------------------------------------------------------------

  it('should extract an email address from the text', () => {
    const result = parseResumeText('Contact me at john@example.com for details.')

    expect(result.contact?.email).toBe('john@example.com')
  })

  it('should extract a phone number from the text', () => {
    const result = parseResumeText('Phone: 555-123-4567\nSome other line')

    expect(result.contact?.phone).toBe('555-123-4567')
  })

  it('should extract a name from the first lines of text', () => {
    const result = parseResumeText('John Doe\njohn@example.com\n555-123-4567')

    expect(result.contact?.firstName).toBe('John')
    expect(result.contact?.lastName).toBe('Doe')
  })

  it('should extract a LinkedIn URL from the text', () => {
    const result = parseResumeText(
      'John Doe\nhttps://www.linkedin.com/in/johndoe\njohn@example.com'
    )

    expect(result.contact?.linkedin).toMatch(/linkedin\.com\/in\/johndoe/)
  })

  // ---------------------------------------------------------------------------
  // Section detection
  // ---------------------------------------------------------------------------

  it('should detect the Experience section and parse entries', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.experience).toBeDefined()
    expect(result.experience!.length).toBeGreaterThanOrEqual(1)

    // First entry should reference Tech Corp or Senior Developer
    const firstExp = result.experience![0]
    const entryText = `${firstExp.company} ${firstExp.position}`
    expect(entryText.toLowerCase()).toMatch(/tech corp|senior developer/i)
  })

  it('should detect the Education section and parse entries', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.education).toBeDefined()
    expect(result.education!.length).toBeGreaterThanOrEqual(1)

    const firstEdu = result.education![0]
    const eduText =
      `${firstEdu.institution} ${firstEdu.degree} ${firstEdu.field}`.toLowerCase()
    // Should contain MIT or Bachelor or Computer Science
    expect(
      eduText.includes('mit') ||
      eduText.includes('bachelor') ||
      eduText.includes('computer science')
    ).toBe(true)
  })

  it('should detect the Skills section and parse skill categories', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.skills).toBeDefined()
    expect(result.skills!.length).toBeGreaterThanOrEqual(1)

    // Flatten all skill names
    const allSkillNames = result
      .skills!.flatMap((cat) => cat.items.map((item) => item.name.toLowerCase()))

    expect(allSkillNames).toEqual(
      expect.arrayContaining(['javascript', 'typescript', 'python'])
    )
  })

  it('should handle the Summary section', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.summary).toBeDefined()
    expect(result.summary!.text).toMatch(/experienced software engineer/i)
  })

  // ---------------------------------------------------------------------------
  // Date and bullet point handling
  // ---------------------------------------------------------------------------

  it('should handle date ranges like "Jan 2020 - Present"', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.experience).toBeDefined()
    // Find an entry with "Present" in its dates or current === true
    const currentEntry = result.experience!.find(
      (exp) =>
        exp.current === true ||
        exp.endDate?.toLowerCase().includes('present') ||
        exp.startDate?.toLowerCase().includes('jan 2020') ||
        exp.startDate?.toLowerCase().includes('2020')
    )
    expect(currentEntry).toBeDefined()
  })

  it('should handle bullet points starting with "-" or "*"', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    expect(result.experience).toBeDefined()
    // Collect all highlights across all experience entries
    const allHighlights = result.experience!.flatMap((exp) => exp.highlights)

    // The parsed highlights should not retain the leading "-" or "*"
    for (const highlight of allHighlights) {
      expect(highlight).not.toMatch(/^[-*]\s/)
    }

    // We expect at least some highlights were parsed
    expect(allHighlights.length).toBeGreaterThanOrEqual(1)
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  it('should return an empty partial for empty text', () => {
    const result = parseResumeText('')

    // Contact fields should all be empty strings
    expect(result.contact?.firstName).toBe('')
    expect(result.contact?.lastName).toBe('')
    expect(result.contact?.email).toBe('')

    // No sections detected, so experience/education/skills should be undefined
    expect(result.experience).toBeUndefined()
    expect(result.education).toBeUndefined()
    expect(result.skills).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // Full realistic resume
  // ---------------------------------------------------------------------------

  it('should parse a full realistic resume text with multiple sections', () => {
    const result = parseResumeText(FULL_RESUME_TEXT)

    // Contact
    expect(result.contact?.firstName).toBe('John')
    expect(result.contact?.lastName).toBe('Doe')
    expect(result.contact?.email).toBe('john@example.com')
    expect(result.contact?.phone).toBe('555-123-4567')
    expect(result.contact?.linkedin).toMatch(/linkedin\.com\/in\/johndoe/)

    // Summary
    expect(result.summary?.text).toBeTruthy()

    // Experience -- at least 1 entry
    expect(result.experience!.length).toBeGreaterThanOrEqual(1)

    // Education -- at least 1 entry
    expect(result.education!.length).toBeGreaterThanOrEqual(1)

    // Skills -- at least 1 category
    expect(result.skills!.length).toBeGreaterThanOrEqual(1)

    // GPA extracted
    const eduWithGpa = result.education!.find((e) => e.gpa === '3.8')
    expect(eduWithGpa).toBeDefined()
  })

  // ---------------------------------------------------------------------------
  // Skill category formatting
  // ---------------------------------------------------------------------------

  it('should parse "Category: skill1, skill2" format in skills section', () => {
    const text = `
Skills
Programming: JavaScript, TypeScript, Python
Tools: Git, Docker
`
    const result = parseResumeText(text)

    expect(result.skills).toBeDefined()
    const categories = result.skills!.map((c) => c.category.toLowerCase())
    expect(categories).toEqual(expect.arrayContaining(['programming', 'tools']))
  })
})
