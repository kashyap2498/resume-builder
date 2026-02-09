// =============================================================================
// Academic CV - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const academicCv: TemplateDefinition = {
  id: 'academic-cv',
  name: 'Academic CV',
  description:
    'Traditional academic Curriculum Vitae with serif typography and a formal layout. Highlights publications, research, presentations, and teaching experience with context-aware section labels.',
  category: 'academic',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default academicCv;
