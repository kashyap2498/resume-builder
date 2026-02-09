// =============================================================================
// Template Registry Tests
// =============================================================================
// Comprehensive tests for the central template registry to ensure all 18
// templates are properly registered with valid definitions and that lookup
// helpers behave correctly.

import { describe, it, expect } from 'vitest';
import {
  TEMPLATES,
  getTemplate,
  getTemplatesByCategory,
  getAllTemplates,
} from '@/templates/index';
import type { TemplateCategory, TemplateLayout } from '@/types/template';

// -- Constants ----------------------------------------------------------------

const VALID_CATEGORIES: TemplateCategory[] = [
  'professional',
  'modern',
  'technical',
  'healthcare',
  'creative',
  'minimal',
  'academic',
  'ats-optimized',
];

const VALID_LAYOUTS: TemplateLayout[] = ['single', 'two-column'];

const EXPECTED_TEMPLATE_COUNT = 18;

const EXPECTED_TEMPLATE_IDS = [
  'ats-standard',
  'ats-professional',
  'minimal-lines',
  'whitespace',
  'professional-classic',
  'modern-clean',
  'executive-suite',
  'modern-sidebar',
  'technical-blueprint',
  'circuit-board',
  'developer-stack',
  'clinical-professional',
  'healthcare-modern',
  'creative-portfolio',
  'bold-creative',
  'academic-research',
  'academic-cv',
  'elegant-columns',
];

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// -- Test Suite ---------------------------------------------------------------

describe('Template Registry', () => {
  // ---------------------------------------------------------------------------
  // 1. Total registration count
  // ---------------------------------------------------------------------------
  describe('template count', () => {
    it('should have all 18 templates registered in the TEMPLATES record', () => {
      expect(Object.keys(TEMPLATES)).toHaveLength(EXPECTED_TEMPLATE_COUNT);
    });

    it('getAllTemplates() should return exactly 18 templates', () => {
      const all = getAllTemplates();
      expect(all).toHaveLength(EXPECTED_TEMPLATE_COUNT);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Unique IDs
  // ---------------------------------------------------------------------------
  describe('unique IDs', () => {
    it('each template should have a unique id', () => {
      const all = getAllTemplates();
      const ids = all.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Required fields validation
  // ---------------------------------------------------------------------------
  describe('template definitions', () => {
    const allTemplates = getAllTemplates();

    it.each(allTemplates)(
      '$id should have a non-empty name',
      (template) => {
        expect(template.name).toBeTruthy();
        expect(typeof template.name).toBe('string');
        expect(template.name.trim().length).toBeGreaterThan(0);
      }
    );

    it.each(allTemplates)(
      '$id should have a non-empty description',
      (template) => {
        expect(template.description).toBeTruthy();
        expect(typeof template.description).toBe('string');
        expect(template.description.trim().length).toBeGreaterThan(0);
      }
    );

    it.each(allTemplates)(
      '$id should have a valid category',
      (template) => {
        expect(VALID_CATEGORIES).toContain(template.category);
      }
    );

    it.each(allTemplates)(
      '$id should have a valid layout ("single" or "two-column")',
      (template) => {
        expect(VALID_LAYOUTS).toContain(template.layout);
      }
    );

    it.each(allTemplates)(
      '$id should have a previewComponent that is a function',
      (template) => {
        expect(typeof template.previewComponent).toBe('function');
      }
    );

    it.each(allTemplates)(
      '$id should have a getPdfComponent that is a function',
      (template) => {
        expect(typeof template.getPdfComponent).toBe('function');
      }
    );
  });

  // ---------------------------------------------------------------------------
  // 4. ID format
  // ---------------------------------------------------------------------------
  describe('ID format', () => {
    it('all template ids should follow kebab-case pattern', () => {
      const all = getAllTemplates();
      for (const template of all) {
        expect(template.id).toMatch(KEBAB_CASE_REGEX);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. TEMPLATES record keys match template ids
  // ---------------------------------------------------------------------------
  describe('TEMPLATES record keys', () => {
    it('should have keys that match the template ids exactly', () => {
      const all = getAllTemplates();
      const idsFromList = all.map((t) => t.id).sort();
      const keysFromRecord = Object.keys(TEMPLATES).sort();
      expect(keysFromRecord).toEqual(idsFromList);
    });

    it('each TEMPLATES entry value should have an id matching its key', () => {
      for (const [key, template] of Object.entries(TEMPLATES)) {
        expect(template.id).toBe(key);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Expected template IDs are all present
  // ---------------------------------------------------------------------------
  describe('expected template IDs', () => {
    it.each(EXPECTED_TEMPLATE_IDS)(
      'should contain template with id "%s"',
      (id) => {
        expect(TEMPLATES).toHaveProperty(id);
      }
    );
  });

  // ---------------------------------------------------------------------------
  // 7. getTemplate() lookup
  // ---------------------------------------------------------------------------
  describe('getTemplate()', () => {
    it('should return the ATS Standard template for id "ats-standard"', () => {
      const template = getTemplate('ats-standard');
      expect(template).toBeDefined();
      expect(template!.id).toBe('ats-standard');
      expect(template!.name).toBe('ATS Standard');
      expect(template!.category).toBe('ats-optimized');
      expect(template!.layout).toBe('single');
    });

    it('should return undefined for a nonexistent id', () => {
      const template = getTemplate('nonexistent');
      expect(template).toBeUndefined();
    });

    it('should return undefined for an empty string', () => {
      const template = getTemplate('');
      expect(template).toBeUndefined();
    });

    it.each(EXPECTED_TEMPLATE_IDS)(
      'should return a defined template for id "%s"',
      (id) => {
        const template = getTemplate(id);
        expect(template).toBeDefined();
        expect(template!.id).toBe(id);
      }
    );
  });

  // ---------------------------------------------------------------------------
  // 8. getTemplatesByCategory() - category counts
  // ---------------------------------------------------------------------------
  describe('getTemplatesByCategory()', () => {
    it('should return 2 templates for category "ats-optimized"', () => {
      const templates = getTemplatesByCategory('ats-optimized');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('ats-optimized');
      }
    });

    it('should return 2 templates for category "professional"', () => {
      const templates = getTemplatesByCategory('professional');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('professional');
      }
    });

    it('should return 3 templates for category "modern"', () => {
      const templates = getTemplatesByCategory('modern');
      expect(templates).toHaveLength(3);
      for (const t of templates) {
        expect(t.category).toBe('modern');
      }
    });

    it('should return 3 templates for category "technical"', () => {
      const templates = getTemplatesByCategory('technical');
      expect(templates).toHaveLength(3);
      for (const t of templates) {
        expect(t.category).toBe('technical');
      }
    });

    it('should return 2 templates for category "healthcare"', () => {
      const templates = getTemplatesByCategory('healthcare');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('healthcare');
      }
    });

    it('should return 2 templates for category "creative"', () => {
      const templates = getTemplatesByCategory('creative');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('creative');
      }
    });

    it('should return 2 templates for category "minimal"', () => {
      const templates = getTemplatesByCategory('minimal');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('minimal');
      }
    });

    it('should return 2 templates for category "academic"', () => {
      const templates = getTemplatesByCategory('academic');
      expect(templates).toHaveLength(2);
      for (const t of templates) {
        expect(t.category).toBe('academic');
      }
    });

    it('total templates across all categories should equal 18', () => {
      let total = 0;
      for (const category of VALID_CATEGORIES) {
        total += getTemplatesByCategory(category).length;
      }
      expect(total).toBe(EXPECTED_TEMPLATE_COUNT);
    });

    it('should return an empty array for an unknown category', () => {
      const templates = getTemplatesByCategory(
        'nonexistent' as TemplateCategory
      );
      expect(templates).toEqual([]);
      expect(templates).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 9. getAllTemplates() consistency
  // ---------------------------------------------------------------------------
  describe('getAllTemplates() consistency', () => {
    it('should return the same template objects as TEMPLATES record values', () => {
      const all = getAllTemplates();
      for (const template of all) {
        expect(TEMPLATES[template.id]).toBe(template);
      }
    });

    it('should return a stable reference on repeated calls', () => {
      const first = getAllTemplates();
      const second = getAllTemplates();
      expect(first).toBe(second);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Specific template spot-checks
  // ---------------------------------------------------------------------------
  describe('specific template spot-checks', () => {
    it('ats-professional should be ats-optimized with single layout', () => {
      const t = getTemplate('ats-professional');
      expect(t).toBeDefined();
      expect(t!.name).toBe('ATS Professional');
      expect(t!.category).toBe('ats-optimized');
      expect(t!.layout).toBe('single');
    });

    it('modern-sidebar should be modern with two-column layout', () => {
      const t = getTemplate('modern-sidebar');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Modern Sidebar');
      expect(t!.category).toBe('modern');
      expect(t!.layout).toBe('two-column');
    });

    it('elegant-columns should be modern with two-column layout', () => {
      const t = getTemplate('elegant-columns');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Elegant Columns');
      expect(t!.category).toBe('modern');
      expect(t!.layout).toBe('two-column');
    });

    it('developer-stack should be technical with two-column layout', () => {
      const t = getTemplate('developer-stack');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Developer Stack');
      expect(t!.category).toBe('technical');
      expect(t!.layout).toBe('two-column');
    });

    it('circuit-board should be technical with two-column layout', () => {
      const t = getTemplate('circuit-board');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Circuit Board');
      expect(t!.category).toBe('technical');
      expect(t!.layout).toBe('two-column');
    });

    it('healthcare-modern should be healthcare with two-column layout', () => {
      const t = getTemplate('healthcare-modern');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Healthcare Modern');
      expect(t!.category).toBe('healthcare');
      expect(t!.layout).toBe('two-column');
    });

    it('creative-portfolio should be creative with two-column layout', () => {
      const t = getTemplate('creative-portfolio');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Creative Portfolio');
      expect(t!.category).toBe('creative');
      expect(t!.layout).toBe('two-column');
    });

    it('academic-cv should be academic with single layout', () => {
      const t = getTemplate('academic-cv');
      expect(t).toBeDefined();
      expect(t!.name).toBe('Academic CV');
      expect(t!.category).toBe('academic');
      expect(t!.layout).toBe('single');
    });
  });
});
