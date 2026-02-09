// =============================================================================
// Healthcare Modern - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const healthcareModern: TemplateDefinition = {
  id: 'healthcare-modern',
  name: 'Healthcare Modern',
  description:
    'Modern healthcare two-column layout with a teal sidebar for certifications, skills, and languages. Clean design that conveys trustworthiness and professionalism for medical professionals.',
  category: 'healthcare',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default healthcareModern;
