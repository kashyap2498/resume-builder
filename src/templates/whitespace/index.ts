// =============================================================================
// Whitespace - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const whitespace: TemplateDefinition = {
  id: 'whitespace',
  name: 'Whitespace',
  description:
    'Generous spacing with no dividers, relying on whitespace alone to separate sections. Light font weights and open layout create a breathable, elegant design.',
  category: 'minimal',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default whitespace;
