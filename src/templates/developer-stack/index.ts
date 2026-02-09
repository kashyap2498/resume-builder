// =============================================================================
// Developer Stack - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const developerStack: TemplateDefinition = {
  id: 'developer-stack',
  name: 'Developer Stack',
  description:
    'Developer-focused two-column layout with a dark sidebar for tech stack and skills. Code-inspired aesthetic with monospace fonts, syntax-highlight colors, and JSX-style name treatment.',
  category: 'technical',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default developerStack;
