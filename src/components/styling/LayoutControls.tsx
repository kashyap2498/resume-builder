// =============================================================================
// Resume Builder - Layout Controls Component
// =============================================================================

import { useCallback } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { useStylingStore } from '@/store/stylingStore';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import type { LayoutMargins } from '@/types/styling';

// -- Margin config ------------------------------------------------------------

interface MarginConfig {
  key: keyof LayoutMargins;
  label: string;
}

const MARGIN_CONFIGS: MarginConfig[] = [
  { key: 'top', label: 'Top' },
  { key: 'right', label: 'Right' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
];

// -- Component ----------------------------------------------------------------

export function LayoutControls() {
  const layout = useStylingStore((s) => s.layout);
  const setLayout = useStylingStore((s) => s.setLayout);

  const handleMarginChange = useCallback(
    (key: keyof LayoutMargins, value: number) => {
      setLayout({
        margins: { ...layout.margins, [key]: value },
      });
    },
    [setLayout, layout.margins],
  );

  const handleSectionSpacingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLayout({ sectionSpacing: Number(e.target.value) });
    },
    [setLayout],
  );

  const handleItemSpacingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLayout({ itemSpacing: Number(e.target.value) });
    },
    [setLayout],
  );

  const handleColumnToggle = useCallback(
    (checked: boolean) => {
      setLayout({ columnLayout: checked ? 'two-column' : 'single' });
    },
    [setLayout],
  );

  const handleSidebarWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLayout({ sidebarWidth: Number(e.target.value) });
    },
    [setLayout],
  );

  const handleDividersToggle = useCallback(
    (checked: boolean) => {
      setLayout({ showDividers: checked });
    },
    [setLayout],
  );

  const isTwoColumn = layout.columnLayout === 'two-column';

  return (
    <div className="flex flex-col gap-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <LayoutTemplate className="h-4 w-4" />
        <span>Layout</span>
      </div>

      {/* Margins */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Margins (px)
        </span>
        {MARGIN_CONFIGS.map(({ key, label }) => (
          <Slider
            key={key}
            label={label}
            min={10}
            max={60}
            step={1}
            value={layout.margins[key]}
            onChange={(e) => handleMarginChange(key, Number(e.target.value))}
            valueFormatter={(v) => `${v}px`}
          />
        ))}
      </div>

      {/* Spacing */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Spacing
        </span>
        <Slider
          label="Section Spacing"
          min={4}
          max={30}
          step={1}
          value={layout.sectionSpacing}
          onChange={handleSectionSpacingChange}
          valueFormatter={(v) => `${v}px`}
        />
        <Slider
          label="Item Spacing"
          min={2}
          max={15}
          step={1}
          value={layout.itemSpacing}
          onChange={handleItemSpacingChange}
          valueFormatter={(v) => `${v}px`}
        />
      </div>

      {/* Column layout */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Columns
        </span>
        <Toggle
          checked={isTwoColumn}
          onChange={handleColumnToggle}
          label="Two-Column Layout"
          size="sm"
        />

        {isTwoColumn && (
          <Slider
            label="Sidebar Width"
            min={25}
            max={45}
            step={1}
            value={layout.sidebarWidth}
            onChange={handleSidebarWidthChange}
            valueFormatter={(v) => `${v}%`}
          />
        )}
      </div>

      {/* Dividers */}
      <Toggle
        checked={layout.showDividers}
        onChange={handleDividersToggle}
        label="Show Dividers"
        size="sm"
      />
    </div>
  );
}
