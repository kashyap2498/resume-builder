// =============================================================================
// Creative Portfolio - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const creativePortfolio: TemplateDefinition = {
  id: 'creative-portfolio',
  name: 'Creative Portfolio',
  description:
    'Bold creative two-column design with a dark sidebar, large name treatment, and portfolio-style project sections. Vibrant accent colors and modern typography for designers and creatives.',
  category: 'creative',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default creativePortfolio;
