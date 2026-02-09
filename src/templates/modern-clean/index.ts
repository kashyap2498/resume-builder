// =============================================================================
// Modern Clean - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const modernClean: TemplateDefinition = {
  id: 'modern-clean',
  name: 'Modern Clean',
  description:
    'Clean modern design with an accent color top bar and sans-serif typography. Contact info displayed in a block layout alongside the name for a contemporary professional look.',
  category: 'modern',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default modernClean;
