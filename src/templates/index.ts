// =============================================================================
// Template Registry
// =============================================================================
// Central registry for all resume templates. Import template definitions
// and register them here. Provides lookup helpers by ID and category.

import type { TemplateDefinition } from '@/types/template';
import type { TemplateCategory } from '@/types/template';

// -- Template Imports ---------------------------------------------------------

// ATS-Optimized (1-2)
import atsStandard from './ats-standard';
import atsProfessional from './ats-professional';

// Minimal (3-4)
import minimalLines from './minimal-lines';
import whitespace from './whitespace';

// Professional (5, 7)
import professionalClassic from './professional-classic';
import executiveSuite from './executive-suite';

// Modern (6, 8, 18)
import modernClean from './modern-clean';
import modernSidebar from './modern-sidebar';
import elegantColumns from './elegant-columns';

// Technical (9-11)
import technicalBlueprint from './technical-blueprint';
import circuitBoard from './circuit-board';
import developerStack from './developer-stack';

// Healthcare (12-13)
import clinicalProfessional from './clinical-professional';
import healthcareModern from './healthcare-modern';

// Creative (14-15)
import creativePortfolio from './creative-portfolio';
import boldCreative from './bold-creative';

// Academic (16-17)
import academicResearch from './academic-research';
import academicCv from './academic-cv';

// -- Registry -----------------------------------------------------------------

const templateList: TemplateDefinition[] = [
  atsStandard,
  atsProfessional,
  minimalLines,
  whitespace,
  professionalClassic,
  modernClean,
  executiveSuite,
  modernSidebar,
  technicalBlueprint,
  circuitBoard,
  developerStack,
  clinicalProfessional,
  healthcareModern,
  creativePortfolio,
  boldCreative,
  academicResearch,
  academicCv,
  elegantColumns,
];

/** All templates indexed by their ID. */
export const TEMPLATES: Record<string, TemplateDefinition> = Object.fromEntries(
  templateList.map((t) => [t.id, t])
);

// -- Helpers ------------------------------------------------------------------

/**
 * Get a single template definition by its ID.
 * Returns undefined if the template is not registered.
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES[id];
}

/**
 * Get all templates that belong to a given category.
 */
export function getTemplatesByCategory(
  category: TemplateCategory
): TemplateDefinition[] {
  return templateList.filter((t) => t.category === category);
}

/**
 * Get the full ordered list of all registered templates.
 */
export function getAllTemplates(): TemplateDefinition[] {
  return templateList;
}

export default TEMPLATES;
