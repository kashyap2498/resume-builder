// =============================================================================
// Resume Builder - Font Definitions
// =============================================================================

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace';
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, system-ui, sans-serif', category: 'sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, Arial, sans-serif', category: 'sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'sans-serif' },
  { id: 'opensans', name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans-serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans-serif' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif', category: 'sans-serif' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito, sans-serif', category: 'sans-serif' },
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", Georgia, serif', category: 'serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, Georgia, serif', category: 'serif' },
  { id: 'garamond', name: 'EB Garamond', family: '"EB Garamond", Garamond, serif', category: 'serif' },
  { id: 'sourcecodepro', name: 'Source Code Pro', family: '"Source Code Pro", monospace', category: 'monospace' },
];

export const DEFAULT_FONT_SIZES = {
  name: 28,
  title: 14,
  sectionHeader: 16,
  normal: 11,
  small: 9,
};
