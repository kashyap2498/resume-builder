// =============================================================================
// Academic Research - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const academicResearch: TemplateDefinition = {
  id: 'academic-research',
  name: 'Academic Research',
  description:
    'Academic CV format with publications displayed prominently in numbered citation style. Traditional serif typography, green accent colors, and emphasis on research experience and scholarly work.',
  category: 'academic',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default academicResearch;
