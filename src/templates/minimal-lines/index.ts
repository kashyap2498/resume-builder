// =============================================================================
// Minimal Lines - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const minimalLines: TemplateDefinition = {
  id: 'minimal-lines',
  name: 'Minimal Lines',
  description:
    'Clean minimal design with thin line dividers between sections. Light font weights and subtle typography for an elegant, understated look.',
  category: 'minimal',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default minimalLines;
