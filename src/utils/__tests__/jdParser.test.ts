import { describe, it, expect } from 'vitest'
import { parseJobDescription } from '@/utils/jdParser'

describe('parseJobDescription', () => {
  it('should parse structured JD with clear headers', () => {
    const jd = `Senior Software Engineer

Requirements
- 5+ years experience with React and TypeScript
- Strong understanding of REST APIs
- Bachelor's degree in Computer Science

Preferred
- Experience with AWS or GCP
- PMP certification

Responsibilities
- Build and maintain web applications
- Mentor junior developers

About Us
We are a fast-growing startup.`

    const result = parseJobDescription(jd)

    expect(result.title).toBe('Senior Software Engineer')
    expect(result.sections.required).toContain('React')
    expect(result.sections.required).toContain('TypeScript')
    expect(result.sections.preferred).toContain('AWS')
    expect(result.sections.responsibilities).toContain('web applications')
    expect(result.sections.about).toContain('startup')
    expect(result.sections.fullText).toBe(jd.trim())
  })

  it('should parse JD without section headers (fallback)', () => {
    const jd = 'Looking for a React developer with 3 years of experience and strong problem solving skills.'

    const result = parseJobDescription(jd)

    expect(result.sections.required).toBe('')
    expect(result.sections.preferred).toBe('')
    expect(result.sections.responsibilities).toBe('')
    expect(result.sections.fullText).toBe(jd.trim())
  })

  it('should extract years of experience from "5+ years"', () => {
    const jd = 'Requirements: 5+ years of software engineering experience.'
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.yearsOfExperience).toBe(5)
  })

  it('should extract years of experience from range "3-5 years"', () => {
    const jd = 'Must have 3-5 years of relevant experience.'
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.yearsOfExperience).toBe(3)
  })

  it('should extract bachelor degree requirement', () => {
    const jd = "Bachelor's degree in Computer Science or related field required."
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.degreeLevel).toBe('bachelor')
    expect(result.extractedRequirements.degreeField).toBe('computer science')
  })

  it('should extract master degree requirement', () => {
    const jd = "Master's degree in Engineering is preferred."
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.degreeLevel).toBe('master')
    expect(result.extractedRequirements.degreeField).toBe('engineering')
  })

  it('should extract PhD requirement', () => {
    const jd = 'Ph.D. in Machine Learning or related field.'
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.degreeLevel).toBe('phd')
  })

  it('should extract certification requirements', () => {
    const jd = 'PMP certification required. AWS Certified preferred. CISSP is a plus.'
    const result = parseJobDescription(jd)

    expect(result.extractedRequirements.certifications).toContain('PMP')
    expect(result.extractedRequirements.certifications).toContain('AWS Certified')
    expect(result.extractedRequirements.certifications).toContain('CISSP')
  })

  it('should handle empty string', () => {
    const result = parseJobDescription('')

    expect(result.title).toBe('')
    expect(result.sections.required).toBe('')
    expect(result.sections.fullText).toBe('')
    expect(result.extractedRequirements.yearsOfExperience).toBeNull()
    expect(result.extractedRequirements.degreeLevel).toBeNull()
    expect(result.extractedRequirements.certifications).toEqual([])
  })

  it('should handle very short JD', () => {
    const result = parseJobDescription('React developer wanted')

    expect(result.title).toBe('React developer wanted')
    expect(result.sections.fullText).toBe('React developer wanted')
  })

  it('should handle JD with unusual formatting', () => {
    const jd = `

    REQUIREMENTS:
    React, TypeScript, Node.js


    NICE TO HAVE:
    Docker experience

    `

    const result = parseJobDescription(jd)

    expect(result.sections.required).toContain('React')
    expect(result.sections.preferred).toContain('Docker')
  })

  it('should extract title from "Title:" pattern', () => {
    const jd = `Title: Frontend Engineer
Requirements
- React experience`

    const result = parseJobDescription(jd)

    // Parser extracts title from "Title:" pattern
    expect(result.title).toBe('Frontend Engineer')
  })

  it('should handle "What You\'ll Do" as responsibilities header', () => {
    const jd = `Developer Role

What You'll Do
- Write clean code
- Review pull requests

Qualifications
- 3+ years experience`

    const result = parseJobDescription(jd)

    expect(result.sections.responsibilities).toContain('clean code')
    expect(result.sections.required).toContain('experience')
  })
})
