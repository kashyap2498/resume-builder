// =============================================================================
// Resume Builder - Styling Store
// =============================================================================

import { create } from 'zustand';
import type {
  FontStyling,
  ColorStyling,
  LayoutStyling,
  ResumeStyling,
  ColorTheme,
} from '@/types/styling';
import { useResumeStore } from './resumeStore';

// -- Defaults -----------------------------------------------------------------

const defaultFonts: FontStyling = {
  family: 'Inter',
  headerFamily: 'Inter',
  sizes: {
    name: 24,
    title: 14,
    sectionHeader: 13,
    normal: 11,
    small: 9,
  },
  lineHeight: 1.4,
  letterSpacing: 0,
};

const defaultColors: ColorStyling = {
  primary: '#2563eb',
  secondary: '#475569',
  text: '#1e293b',
  lightText: '#64748b',
  background: '#ffffff',
  headerBg: '#f8fafc',
  headerText: '#0f172a',
  divider: '#e2e8f0',
  accent: '#3b82f6',
};

const defaultLayout: LayoutStyling = {
  margins: { top: 24, right: 24, bottom: 24, left: 24 },
  sectionSpacing: 16,
  itemSpacing: 10,
  columnLayout: 'single',
  sidebarWidth: 35,
  showDividers: true,
};

// -- Store Shape --------------------------------------------------------------

interface StylingState {
  font: FontStyling;
  colors: ColorStyling;
  layout: LayoutStyling;
  themeId: string | null;
}

interface StylingActions {
  setFont: (font: Partial<FontStyling>) => void;
  setColors: (colors: Partial<ColorStyling>) => void;
  setLayout: (layout: Partial<LayoutStyling>) => void;
  applyTheme: (theme: ColorTheme) => void;
  resetToDefaults: () => void;
  /** Hydrate from a ResumeStyling object (e.g. when loading a resume) */
  hydrate: (styling: ResumeStyling) => void;
}

export type StylingStore = StylingState & StylingActions;

// -- Store --------------------------------------------------------------------

export const useStylingStore = create<StylingStore>((set) => ({
  // -- State ------------------------------------------------------------------
  font: { ...defaultFonts },
  colors: { ...defaultColors },
  layout: { ...defaultLayout },
  themeId: null,

  // -- Actions ----------------------------------------------------------------

  setFont: (font) => {
    set((state) => {
      const merged = { ...state.font, ...font };
      return { font: merged };
    });
  },

  setColors: (colors) => {
    set((state) => {
      const merged = { ...state.colors, ...colors };
      return { colors: merged, themeId: null };
    });
  },

  setLayout: (layout) => {
    set((state) => {
      const merged = { ...state.layout, ...layout };
      return { layout: merged };
    });
  },

  applyTheme: (theme) => {
    set({ colors: { ...theme.colors }, themeId: theme.id });
  },

  resetToDefaults: () => {
    set({
      font: { ...defaultFonts },
      colors: { ...defaultColors },
      layout: { ...defaultLayout },
      themeId: null,
    });
  },

  hydrate: (styling) => {
    set({
      font: { ...styling.font },
      colors: { ...styling.colors },
      layout: { ...styling.layout },
      themeId: styling.themeId,
    });
  },
}));

// -- Auto-sync styling changes to the resume store ----------------------------

useStylingStore.subscribe((state) => {
  const { currentResume, updateStyling } = useResumeStore.getState();
  if (currentResume) {
    updateStyling({ font: state.font, colors: state.colors, layout: state.layout, themeId: state.themeId });
  }
});
