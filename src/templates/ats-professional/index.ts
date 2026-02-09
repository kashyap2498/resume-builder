// =============================================================================
// ATS Professional - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const atsProfessional: TemplateDefinition = {
  id: 'ats-professional',
  name: 'ATS Professional',
  description:
    'ATS-optimized template with a subtle accent color for headings and a thin decorative line under the name. Clean and professional while maintaining ATS compatibility.',
  category: 'ats-optimized',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default atsProfessional;
