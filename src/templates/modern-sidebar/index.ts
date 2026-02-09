// =============================================================================
// Modern Sidebar - Template Definition
// =============================================================================

import type { TemplateDefinition } from '@/types/template';
import PreviewTemplate from './PreviewTemplate';

const modernSidebar: TemplateDefinition = {
  id: 'modern-sidebar',
  name: 'Modern Sidebar',
  description:
    'Modern two-column design with a colored sidebar for contact info, skills, languages, and certifications. The main area showcases experience, education, and projects.',
  category: 'modern',
  layout: 'two-column',
  previewComponent: PreviewTemplate,
  getPdfComponent: () => import("./PdfTemplate").then(m => m.default),
};

export default modernSidebar;
