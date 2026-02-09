// =============================================================================
// Bold Creative - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const boldCreative: TemplateDefinition = {
  id: 'bold-creative',
  name: 'Bold Creative',
  description:
    'Bold single-column design with oversized colorful headers, creative typography, and generous spacing. Perfect for creative professionals who want their resume to stand out.',
  category: 'creative',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default boldCreative;
