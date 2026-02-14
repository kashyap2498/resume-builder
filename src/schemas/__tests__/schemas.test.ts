import { describe, it, expect } from 'vitest'
import {
  contactSchema,
  summarySchema,
  experienceEntrySchema,
  educationEntrySchema,
  skillCategorySchema,
  projectEntrySchema,
  certificationEntrySchema,
  languageEntrySchema,
  volunteerEntrySchema,
  awardEntrySchema,
  publicationEntrySchema,
  referenceEntrySchema,
  hobbiesSchema,
  affiliationEntrySchema,
  courseEntrySchema,
  resumeSchema,
} from '@/schemas'
import { mockResume, mockResumeData } from '@/test/fixtures'

describe('Zod Schemas', () => {
  describe('contactSchema', () => {
    it('validates valid contact data', () => {
      const result = contactSchema.safeParse(mockResumeData.contact)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = contactSchema.safeParse({ ...mockResumeData.contact, email: 'not-an-email' })
      expect(result.success).toBe(false)
    })

    it('allows empty email', () => {
      const result = contactSchema.safeParse({ ...mockResumeData.contact, email: '' })
      expect(result.success).toBe(true)
    })

    it('rejects empty first name', () => {
      const result = contactSchema.safeParse({ ...mockResumeData.contact, firstName: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('summarySchema', () => {
    it('validates valid summary', () => {
      const result = summarySchema.safeParse(mockResumeData.summary)
      expect(result.success).toBe(true)
    })

    it('rejects summary over 2000 chars', () => {
      const result = summarySchema.safeParse({ text: 'a'.repeat(2001) })
      expect(result.success).toBe(false)
    })
  })

  describe('experienceEntrySchema', () => {
    it('validates valid experience', () => {
      const result = experienceEntrySchema.safeParse(mockResumeData.experience[0])
      expect(result.success).toBe(true)
    })

    it('rejects missing company', () => {
      const result = experienceEntrySchema.safeParse({ ...mockResumeData.experience[0], company: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('educationEntrySchema', () => {
    it('validates valid education', () => {
      const result = educationEntrySchema.safeParse(mockResumeData.education[0])
      expect(result.success).toBe(true)
    })

    it('rejects invalid GPA format', () => {
      const result = educationEntrySchema.safeParse({ ...mockResumeData.education[0], gpa: 'abc' })
      expect(result.success).toBe(false)
    })
  })

  describe('skillCategorySchema', () => {
    it('validates valid skill category', () => {
      const result = skillCategorySchema.safeParse(mockResumeData.skills[0])
      expect(result.success).toBe(true)
    })

    it('accepts empty category name', () => {
      const result = skillCategorySchema.safeParse({ ...mockResumeData.skills[0], category: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('projectEntrySchema', () => {
    it('validates valid project', () => {
      const result = projectEntrySchema.safeParse(mockResumeData.projects[0])
      expect(result.success).toBe(true)
    })
  })

  describe('certificationEntrySchema', () => {
    it('validates valid certification', () => {
      const result = certificationEntrySchema.safeParse(mockResumeData.certifications[0])
      expect(result.success).toBe(true)
    })
  })

  describe('languageEntrySchema', () => {
    it('validates valid language', () => {
      const result = languageEntrySchema.safeParse(mockResumeData.languages[0])
      expect(result.success).toBe(true)
    })

    it('rejects invalid proficiency', () => {
      const result = languageEntrySchema.safeParse({ ...mockResumeData.languages[0], proficiency: 'expert' })
      expect(result.success).toBe(false)
    })
  })

  describe('hobbiesSchema', () => {
    it('validates valid hobbies', () => {
      const result = hobbiesSchema.safeParse(mockResumeData.hobbies)
      expect(result.success).toBe(true)
    })
  })

  describe('resumeSchema', () => {
    it('validates a full resume', () => {
      const result = resumeSchema.safeParse(mockResume)
      expect(result.success).toBe(true)
    })

    it('rejects resume missing id', () => {
      const { id, ...rest } = mockResume
      const result = resumeSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })
})
