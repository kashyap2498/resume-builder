// =============================================================================
// Resume Builder - Preset Color Themes
// =============================================================================

import type { ColorTheme } from '@/types/styling';

export const COLOR_THEMES: ColorTheme[] = [
  // -- 1. Classic (navy / gray) ------------------------------------------------
  {
    id: 'classic',
    name: 'Classic',
    colors: {
      primary: '#1B2A4A',
      secondary: '#3D5A80',
      text: '#2D2D2D',
      lightText: '#6B7280',
      background: '#FFFFFF',
      headerBg: '#1B2A4A',
      headerText: '#FFFFFF',
      divider: '#D1D5DB',
      accent: '#3D5A80',
    },
  },

  // -- 2. Slate (cool grays) ---------------------------------------------------
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      primary: '#475569',
      secondary: '#64748B',
      text: '#1E293B',
      lightText: '#94A3B8',
      background: '#FFFFFF',
      headerBg: '#334155',
      headerText: '#F8FAFC',
      divider: '#CBD5E1',
      accent: '#475569',
    },
  },

  // -- 3. Ocean (blue tones) ---------------------------------------------------
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0C4A6E',
      secondary: '#0369A1',
      text: '#1E293B',
      lightText: '#64748B',
      background: '#FFFFFF',
      headerBg: '#0C4A6E',
      headerText: '#F0F9FF',
      divider: '#BAE6FD',
      accent: '#0284C7',
    },
  },

  // -- 4. Forest (green tones) -------------------------------------------------
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#14532D',
      secondary: '#166534',
      text: '#1C1917',
      lightText: '#6B7280',
      background: '#FFFFFF',
      headerBg: '#14532D',
      headerText: '#F0FDF4',
      divider: '#BBF7D0',
      accent: '#15803D',
    },
  },

  // -- 5. Burgundy (wine / dark red) -------------------------------------------
  {
    id: 'burgundy',
    name: 'Burgundy',
    colors: {
      primary: '#6B1527',
      secondary: '#9B1B30',
      text: '#27272A',
      lightText: '#71717A',
      background: '#FFFFFF',
      headerBg: '#6B1527',
      headerText: '#FFF1F2',
      divider: '#E4C6CB',
      accent: '#9B1B30',
    },
  },

  // -- 6. Charcoal (near-black / white) ----------------------------------------
  {
    id: 'charcoal',
    name: 'Charcoal',
    colors: {
      primary: '#18181B',
      secondary: '#3F3F46',
      text: '#18181B',
      lightText: '#71717A',
      background: '#FFFFFF',
      headerBg: '#18181B',
      headerText: '#FAFAFA',
      divider: '#D4D4D8',
      accent: '#3F3F46',
    },
  },

  // -- 7. Royal (deep purple) --------------------------------------------------
  {
    id: 'royal',
    name: 'Royal',
    colors: {
      primary: '#3B0764',
      secondary: '#581C87',
      text: '#1C1917',
      lightText: '#78716C',
      background: '#FFFFFF',
      headerBg: '#3B0764',
      headerText: '#FAF5FF',
      divider: '#D8B4FE',
      accent: '#7C3AED',
    },
  },

  // -- 8. Sunset (warm orange tones) -------------------------------------------
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#7C2D12',
      secondary: '#9A3412',
      text: '#292524',
      lightText: '#78716C',
      background: '#FFFFFF',
      headerBg: '#7C2D12',
      headerText: '#FFF7ED',
      divider: '#FDBA74',
      accent: '#C2410C',
    },
  },

  // -- 9. Teal (teal / cyan) ---------------------------------------------------
  {
    id: 'teal',
    name: 'Teal',
    colors: {
      primary: '#134E4A',
      secondary: '#115E59',
      text: '#1E293B',
      lightText: '#64748B',
      background: '#FFFFFF',
      headerBg: '#134E4A',
      headerText: '#F0FDFA',
      divider: '#99F6E4',
      accent: '#0D9488',
    },
  },

  // -- 10. Minimal (pure black / white) ----------------------------------------
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      text: '#000000',
      lightText: '#737373',
      background: '#FFFFFF',
      headerBg: '#FFFFFF',
      headerText: '#000000',
      divider: '#E5E5E5',
      accent: '#000000',
    },
  },
];

/** Look up a theme by its ID. Returns undefined if not found. */
export function getThemeById(id: string): ColorTheme | undefined {
  return COLOR_THEMES.find((theme) => theme.id === id);
}

/** The default theme applied to new resumes. */
export const DEFAULT_THEME_ID = 'classic';
