// =============================================================================
// Resume Builder - Color Controls Component
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useStylingStore } from '@/store/stylingStore';
import type { ColorStyling } from '@/types/styling';

// -- Color field config -------------------------------------------------------

interface ColorField {
  key: keyof ColorStyling;
  label: string;
}

const COLOR_FIELDS: ColorField[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'text', label: 'Text' },
  { key: 'lightText', label: 'Light Text' },
  { key: 'background', label: 'Background' },
  { key: 'headerBg', label: 'Header Bg' },
  { key: 'headerText', label: 'Header Text' },
  { key: 'divider', label: 'Divider' },
  { key: 'accent', label: 'Accent' },
];

// -- Color swatch with popover ------------------------------------------------

interface ColorSwatchProps {
  color: string;
  label: string;
  onChange: (color: string) => void;
}

function ColorSwatch({ color, label, onChange }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        className="flex items-center gap-2 w-full text-left group py-1 px-1 -mx-1 rounded hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span
          className="h-5 w-5 rounded border border-gray-300 shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-gray-700 flex-1 truncate">
          {label}
        </span>
        <span className="text-xs text-gray-400 font-mono uppercase">
          {color}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-6 w-6 rounded border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange(val);
                }
              }}
              className="flex-1 text-xs font-mono border border-gray-200 rounded px-2 py-1 uppercase"
              maxLength={7}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// -- Component ----------------------------------------------------------------

export function ColorControls() {
  const colors = useStylingStore((s) => s.colors);
  const setColors = useStylingStore((s) => s.setColors);

  const handleColorChange = useCallback(
    (key: keyof ColorStyling, value: string) => {
      setColors({ [key]: value });
    },
    [setColors],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Section heading */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Palette className="h-4 w-4" />
        <span>Colors</span>
      </div>

      {/* Color fields */}
      <div className="flex flex-col gap-0.5">
        {COLOR_FIELDS.map(({ key, label }) => (
          <ColorSwatch
            key={key}
            color={colors[key]}
            label={label}
            onChange={(c) => handleColorChange(key, c)}
          />
        ))}
      </div>
    </div>
  );
}
