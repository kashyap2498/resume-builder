// =============================================================================
// Clinical Professional - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const clinicalProfessional: TemplateDefinition = {
  id: 'clinical-professional',
  name: 'Clinical Professional',
  description:
    'Healthcare professional template with a clean, trustworthy blue palette. Features a prominent header banner, clear section dividers, and emphasis on certifications and clinical experience.',
  category: 'healthcare',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default clinicalProfessional;
