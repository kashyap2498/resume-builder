// =============================================================================
// Circuit Board - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const circuitBoard: TemplateDefinition = {
  id: 'circuit-board',
  name: 'Circuit Board',
  description:
    'Two-column layout designed for electrical and hardware engineers. Left sidebar with skills and certifications, main area for experience. Monospace headings with a technical green accent.',
  category: 'technical',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default circuitBoard;
