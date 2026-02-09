// =============================================================================
// Resume Builder - Font Controls Component
// =============================================================================

import { useCallback } from 'react';
import { Type } from 'lucide-react';
import { useStylingStore } from '@/store/stylingStore';
import { FONT_OPTIONS } from '@/constants/fonts';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { loadFont } from '@/utils/fontLoader';
import type { FontSizes } from '@/types/styling';

// -- Font size slider config --------------------------------------------------

interface SizeConfig {
  key: keyof FontSizes;
  label: string;
  min: number;
  max: number;
}

const SIZE_CONFIGS: SizeConfig[] = [
  { key: 'name', label: 'Name', min: 16, max: 40 },
  { key: 'title', label: 'Title', min: 8, max: 24 },
  { key: 'sectionHeader', label: 'Section Header', min: 8, max: 24 },
  { key: 'normal', label: 'Normal', min: 8, max: 16 },
  { key: 'small', label: 'Small', min: 6, max: 12 },
];

// -- Font option lists --------------------------------------------------------

const fontSelectOptions = FONT_OPTIONS.map((f) => ({
  value: f.family,
  label: `${f.name} (${f.category})`,
}));

// -- Component ----------------------------------------------------------------

export function FontControls() {
  const font = useStylingStore((s) => s.font);
  const setFont = useStylingStore((s) => s.setFont);

  const handleFamilyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const fontOption = FONT_OPTIONS.find((f) => f.family === e.target.value);
      if (fontOption) {
        loadFont(fontOption.id);
      }
      setFont({ family: e.target.value });
    },
    [setFont],
  );

  const handleHeaderFamilyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const fontOption = FONT_OPTIONS.find((f) => f.family === e.target.value);
      if (fontOption) {
        loadFont(fontOption.id);
      }
      setFont({ headerFamily: e.target.value });
    },
    [setFont],
  );

  const handleSizeChange = useCallback(
    (key: keyof FontSizes, value: number) => {
      setFont({ sizes: { ...font.sizes, [key]: value } });
    },
    [setFont, font.sizes],
  );

  const handleLineHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFont({ lineHeight: parseFloat(e.target.value) });
    },
    [setFont],
  );

  const handleLetterSpacingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFont({ letterSpacing: parseFloat(e.target.value) });
    },
    [setFont],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Type className="h-4 w-4" />
        <span>Typography</span>
      </div>

      {/* Body font family */}
      <Select
        label="Body Font"
        value={font.family}
        onChange={handleFamilyChange}
        options={fontSelectOptions}
      />

      {/* Header font family */}
      <Select
        label="Header Font"
        value={font.headerFamily}
        onChange={handleHeaderFamilyChange}
        options={fontSelectOptions}
      />

      {/* Font sizes */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Font Sizes (px)
        </span>
        {SIZE_CONFIGS.map(({ key, label, min, max }) => (
          <Slider
            key={key}
            label={label}
            min={min}
            max={max}
            step={1}
            value={font.sizes[key]}
            onChange={(e) => handleSizeChange(key, Number(e.target.value))}
            valueFormatter={(v) => `${v}px`}
          />
        ))}
      </div>

      {/* Line height */}
      <Slider
        label="Line Height"
        min={1.0}
        max={2.0}
        step={0.1}
        value={font.lineHeight}
        onChange={handleLineHeightChange}
        valueFormatter={(v) => v.toFixed(1)}
      />

      {/* Letter spacing */}
      <Slider
        label="Letter Spacing"
        min={-1}
        max={3}
        step={0.1}
        value={font.letterSpacing}
        onChange={handleLetterSpacingChange}
        valueFormatter={(v) => `${v.toFixed(1)}px`}
      />
    </div>
  );
}
