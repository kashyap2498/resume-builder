import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeResumeData } from '@/utils/sanitize'

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
})
