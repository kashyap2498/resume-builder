// =============================================================================
// Resume Builder - Theme Picker Component
// =============================================================================

import { useCallback } from 'react';
import { Palette, Check } from 'lucide-react';
import { useStylingStore } from '@/store/stylingStore';
import { COLOR_THEMES } from '@/constants/colorThemes';
import { cn } from '@/utils/cn';
import type { ColorTheme } from '@/types/styling';

// -- Theme card ---------------------------------------------------------------

interface ThemeCardProps {
  theme: ColorTheme;
  isActive: boolean;
  onSelect: (theme: ColorTheme) => void;
}

function ThemeCard({ theme, isActive, onSelect }: ThemeCardProps) {
  const { colors } = theme;

  // Show a preview strip of the theme's key colors
  const previewColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.text,
    colors.lightText,
    colors.headerBg,
  ];

  return (
    <button
      type="button"
      onClick={() => onSelect(theme)}
      className={cn(
        'relative flex flex-col items-start gap-1.5 p-2 rounded-lg border transition-all text-left',
        'hover:shadow-sm',
        isActive
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
          : 'border-gray-200 bg-white hover:border-gray-300',
      )}
    >
      {/* Active check */}
      {isActive && (
        <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-white" />
        </span>
      )}

      {/* Theme name */}
      <span className="text-xs font-medium text-gray-700 truncate w-full pr-5">
        {theme.name}
      </span>

      {/* Color preview circles */}
      <div className="flex items-center gap-1">
        {previewColors.map((color, idx) => (
          <span
            key={idx}
            className="h-3.5 w-3.5 rounded-full border border-gray-200 shrink-0"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </button>
  );
}

// -- Component ----------------------------------------------------------------

export function ThemePicker() {
  const themeId = useStylingStore((s) => s.themeId);
  const applyTheme = useStylingStore((s) => s.applyTheme);

  const handleSelect = useCallback(
    (theme: ColorTheme) => {
      applyTheme(theme);
    },
    [applyTheme],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Section heading */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Palette className="h-4 w-4" />
        <span>Color Themes</span>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-2 gap-2">
        {COLOR_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={themeId === theme.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
