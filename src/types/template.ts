// =============================================================================
// Resume Builder - Template Type Definitions
// =============================================================================

import type { ComponentType } from 'react';
import type { Resume } from './resume';

// -- Template Category --------------------------------------------------------

export type TemplateCategory =
  | 'professional'
  | 'modern'
  | 'technical'
  | 'healthcare'
  | 'creative'
  | 'minimal'
  | 'academic'
  | 'ats-optimized';

// -- Template Layout ----------------------------------------------------------

export type TemplateLayout = 'single' | 'two-column';

// -- Template Props -----------------------------------------------------------

/** Shared props that both preview and PDF template components receive */
export interface TemplateProps {
  resume: Resume;
}

// -- Template Definition ------------------------------------------------------

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  thumbnail?: string;
  previewComponent: ComponentType<TemplateProps>;
  /** Lazy loader for the PDF component to avoid loading @react-pdf/renderer at startup */
  getPdfComponent: () => Promise<ComponentType<TemplateProps>>;
}
