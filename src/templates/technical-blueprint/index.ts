// =============================================================================
// Technical Blueprint - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const technicalBlueprint: TemplateDefinition = {
  id: 'technical-blueprint',
  name: 'Technical Blueprint',
  description:
    'Clean technical design with monospace-inspired headings and a steel blue color palette. Features left-border accents and pipe-separated skills for a systematic, engineering feel.',
  category: 'technical',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default technicalBlueprint;
