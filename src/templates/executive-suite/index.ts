// =============================================================================
// Executive Suite - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const executiveSuite: TemplateDefinition = {
  id: 'executive-suite',
  name: 'Executive Suite',
  description:
    'Elegant design for senior management and executives. Features a larger name treatment, subtle gold/dark accent colors, and refined spacing with a distinguished professional feel.',
  category: 'professional',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default executiveSuite;
