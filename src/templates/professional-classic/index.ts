// =============================================================================
// Professional Classic - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const professionalClassic: TemplateDefinition = {
  id: 'professional-classic',
  name: 'Professional Classic',
  description:
    'Classic corporate look with a navy header area for name and title. Bold section headings with underline accents create a traditional, authoritative resume design.',
  category: 'professional',
  layout: 'single',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default professionalClassic;
