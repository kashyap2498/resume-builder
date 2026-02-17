import { describe, it, expect } from 'vitest'
import { SYNONYM_MAP, resolveSynonyms, getCanonicalForm, getKnownPhrases } from '@/constants/atsSynonyms'

describe('atsSynonyms', () => {
  describe('bidirectionality', () => {
    it('should ensure all synonym entries are bidirectional', () => {
      for (const [key, group] of SYNONYM_MAP.entries()) {
        // Every member of the group should also map to the same group
        for (const member of group) {
          const memberGroup = SYNONYM_MAP.get(member)
          expect(memberGroup).toBeDefined()
          expect(memberGroup).toEqual(group)
        }
      }
    })
  })

  describe('no duplicates in groups', () => {
    it('should have no duplicate entries within any synonym group', () => {
      const visited = new Set<string>()
      for (const [key, group] of SYNONYM_MAP.entries()) {
        if (visited.has(key)) continue
        const uniqueGroup = new Set(group)
        expect(uniqueGroup.size).toBe(group.length)
        for (const member of group) visited.add(member)
      }
    })
  })

  describe('resolveSynonyms', () => {
    it('should return correct group for "js"', () => {
      const result = resolveSynonyms('js')
      expect(result).toContain('javascript')
      expect(result).toContain('js')
    })

    it('should return correct group for "JavaScript"', () => {
      const result = resolveSynonyms('JavaScript')
      expect(result).toContain('javascript')
      expect(result).toContain('js')
    })

    it('should return correct group for "k8s"', () => {
      const result = resolveSynonyms('k8s')
      expect(result).toContain('kubernetes')
      expect(result).toContain('k8s')
    })

    it('should return correct group for "TypeScript"', () => {
      const result = resolveSynonyms('TypeScript')
      expect(result).toContain('typescript')
      expect(result).toContain('ts')
    })

    it('should return single-element array for unknown keyword', () => {
      const result = resolveSynonyms('unknownkeyword123')
      expect(result).toEqual(['unknownkeyword123'])
    })

    it('should be case-insensitive', () => {
      const result1 = resolveSynonyms('AWS')
      const result2 = resolveSynonyms('aws')
      expect(result1).toEqual(result2)
    })
  })

  describe('getCanonicalForm', () => {
    it('should return "javascript" for "js"', () => {
      expect(getCanonicalForm('js')).toBe('javascript')
    })

    it('should return "kubernetes" for "k8s"', () => {
      expect(getCanonicalForm('k8s')).toBe('kubernetes')
    })

    it('should return "machine learning" for "ml"', () => {
      expect(getCanonicalForm('ml')).toBe('machine learning')
    })

    it('should return "amazon web services" for "aws"', () => {
      expect(getCanonicalForm('aws')).toBe('amazon web services')
    })

    it('should return the input itself for unknown keywords', () => {
      expect(getCanonicalForm('xyzunknown')).toBe('xyzunknown')
    })
  })

  describe('known abbreviations', () => {
    const abbreviationTests: [string, string][] = [
      ['js', 'javascript'],
      ['ts', 'typescript'],
      ['k8s', 'kubernetes'],
      ['ml', 'machine learning'],
      ['ai', 'artificial intelligence'],
      ['nlp', 'natural language processing'],
      ['aws', 'amazon web services'],
      ['gcp', 'google cloud platform'],
      ['ci/cd', 'ci/cd'],
      ['tdd', 'test-driven development'],
      ['seo', 'search engine optimization'],
      ['ehr', 'electronic health records'],
      ['dcf', 'discounted cash flow'],
      ['fda', 'food and drug administration'],
    ]

    for (const [abbr, canonical] of abbreviationTests) {
      it(`should resolve "${abbr}" to group containing "${canonical}"`, () => {
        const group = resolveSynonyms(abbr)
        expect(group).toContain(canonical)
      })
    }
  })

  describe('getKnownPhrases', () => {
    it('should return a set of multi-word phrases', () => {
      const phrases = getKnownPhrases()
      expect(phrases.size).toBeGreaterThan(0)
      // Every entry should have a space or hyphen
      for (const phrase of phrases) {
        expect(phrase.includes(' ') || phrase.includes('-')).toBe(true)
      }
    })

    it('should include common skill phrases', () => {
      const phrases = getKnownPhrases()
      expect(phrases.has('machine learning')).toBe(true)
      expect(phrases.has('project management')).toBe(true)
    })
  })
})
