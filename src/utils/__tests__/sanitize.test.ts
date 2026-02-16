import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeResumeData, sanitizeImportedResume } from '@/utils/sanitize'
import { mockResume } from '@/test/fixtures'

describe('sanitize', () => {
  describe('sanitizeText', () => {
    it('strips script tags', () => {
      expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('Hello')
    })

    it('strips HTML tags', () => {
      expect(sanitizeText('<b>bold</b> text')).toBe('bold text')
    })

    it('preserves plain text', () => {
      expect(sanitizeText('Hello World')).toBe('Hello World')
    })

    it('handles empty string', () => {
      expect(sanitizeText('')).toBe('')
    })
  })

  describe('sanitizeResumeData', () => {
    it('sanitizes nested string fields', () => {
      const data = {
        contact: {
          firstName: '<script>alert("xss")</script>John',
          lastName: 'Doe',
        },
      } as any
      const result = sanitizeResumeData(data)
      expect((result as any).contact.firstName).toBe('John')
      expect((result as any).contact.lastName).toBe('Doe')
    })

    it('sanitizes arrays of strings', () => {
      const data = {
        hobbies: {
          items: ['<b>Hiking</b>', 'Reading'],
        },
      }
      const result = sanitizeResumeData(data)
      expect((result as any).hobbies.items[0]).toBe('Hiking')
    })
  })

  describe('sanitizeImportedResume', () => {
    it('accepts a valid resume and returns it', () => {
      const result = sanitizeImportedResume(mockResume)
      expect(result).not.toBeNull()
      expect(result!.id).toBe(mockResume.id)
      expect(result!.data.contact.firstName).toBe('John')
    })

    it('accepts a resume with optional coverLetter missing', () => {
      const { coverLetter, ...withoutCoverLetter } = mockResume as any
      const result = sanitizeImportedResume(withoutCoverLetter)
      expect(result).not.toBeNull()
      expect(result!.id).toBe(mockResume.id)
    })

    it('strips extra unknown fields but still validates', () => {
      const withExtras = {
        ...mockResume,
        unknownTopLevelField: 'should be stripped',
        data: {
          ...mockResume.data,
          unknownDataField: 'also stripped',
        },
      }
      const result = sanitizeImportedResume(withExtras)
      expect(result).not.toBeNull()
      expect((result as any).unknownTopLevelField).toBeUndefined()
    })

    it('returns null for truly invalid data (missing required fields)', () => {
      const invalid = { id: 'test', name: 'bad' }
      const result = sanitizeImportedResume(invalid)
      expect(result).toBeNull()
    })

    it('returns null for empty object', () => {
      const result = sanitizeImportedResume({})
      expect(result).toBeNull()
    })

    it('sanitizes XSS in resume fields and still validates', () => {
      const xssResume = JSON.parse(JSON.stringify(mockResume))
      xssResume.data.contact.firstName = '<script>alert("xss")</script>John'
      const result = sanitizeImportedResume(xssResume)
      expect(result).not.toBeNull()
      expect(result!.data.contact.firstName).toBe('John')
    })
  })
})
