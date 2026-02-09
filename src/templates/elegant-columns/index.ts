// =============================================================================
// Elegant Columns - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const elegantColumns: TemplateDefinition = {
  id: 'elegant-columns',
  name: 'Elegant Columns',
  description:
    'Elegant two-column design with contact info and skills in a clean sidebar, and experience in the main column. Refined indigo accent with subtle divider separating the columns.',
  category: 'modern',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default elegantColumns;
