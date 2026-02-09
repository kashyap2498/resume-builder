// =============================================================================
// ATS Standard - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const atsStandard: TemplateDefinition = {
  id: 'ats-standard',
  name: 'ATS Standard',
  description:
    'The most basic, clean template optimized for Applicant Tracking Systems. Pure text, no colors, standard headings for maximum ATS compatibility.',
  category: 'ats-optimized',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default atsStandard;
