// =============================================================================
// Resume Builder - Styling Type Definitions
// =============================================================================

// -- Font Sizing --------------------------------------------------------------

export interface FontSizes {
  name: number;
  title: number;
  sectionHeader: number;
  normal: number;
  small: number;
}

// -- Font Styling -------------------------------------------------------------

export interface FontStyling {
  family: string;
  headerFamily: string;
  sizes: FontSizes;
  lineHeight: number;
  letterSpacing: number;
}

// -- Color Styling ------------------------------------------------------------

export interface ColorStyling {
  primary: string;
  secondary: string;
  text: string;
  lightText: string;
  background: string;
  headerBg: string;
  headerText: string;
  divider: string;
  accent: string;
}

// -- Layout Styling -----------------------------------------------------------

export interface LayoutMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ColumnLayout = 'single' | 'two-column';

export interface LayoutStyling {
  margins: LayoutMargins;
  sectionSpacing: number;
  itemSpacing: number;
  columnLayout: ColumnLayout;
  /** Width of the sidebar as a percentage (used in two-column layout) */
  sidebarWidth: number;
  showDividers: boolean;
}

// -- Resume Styling (top-level) -----------------------------------------------

export interface ResumeStyling {
  font: FontStyling;
  colors: ColorStyling;
  layout: LayoutStyling;
  themeId: string | null;
}

// -- Color Theme --------------------------------------------------------------

export interface ColorTheme {
  id: string;
  name: string;
  colors: ColorStyling;
}
