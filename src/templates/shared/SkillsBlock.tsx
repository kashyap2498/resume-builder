// =============================================================================
// Shared Template Component - Skills Block (Preview / HTML)
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';
import type { SkillCategory, SkillsLayout } from '@/types/resume';

export interface SkillsBlockProps {
  skills: SkillCategory[];
  layout?: SkillsLayout;
  mode?: 'freeform' | 'categories';
  font: FontStyling;
  colors: ColorStyling;
  separator?: string;
  categoryWeight?: number;
  categoryColor?: string;
}

function renderItems(
  items: string[],
  layout: SkillsLayout,
  font: FontStyling,
  colors: ColorStyling,
  separator: string,
) {
  const itemStyle: React.CSSProperties = {
    fontSize: `${font.sizes.normal}px`,
    fontFamily: font.family,
    color: colors.text,
  };

  switch (layout) {
    case 'bullets':
      return (
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ ...itemStyle, marginBottom: '1px' }}>
              {'\u2022'} {item}
            </div>
          ))}
        </div>
      );

    case 'vertical':
      return (
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ ...itemStyle, marginBottom: '1px' }}>
              {item}
            </div>
          ))}
        </div>
      );

    case '2-column':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
          {items.map((item, i) => (
            <div key={i} style={itemStyle}>{item}</div>
          ))}
        </div>
      );

    case '3-column':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px 16px' }}>
          {items.map((item, i) => (
            <div key={i} style={itemStyle}>{item}</div>
          ))}
        </div>
      );

    case 'comma':
    default:
      return <span style={itemStyle}>{items.join(separator)}</span>;
  }
}

const SkillsBlock: React.FC<SkillsBlockProps> = ({
  skills,
  layout = 'comma',
  mode = 'freeform',
  font,
  colors,
  separator = ', ',
  categoryWeight = 600,
  categoryColor,
}) => {
  const catColor = categoryColor ?? colors.accent ?? colors.primary;

  // Freeform mode or no category names: render all items flat
  if (mode === 'freeform' || skills.every((c) => !c.category)) {
    const allItems = skills.flatMap((c) => c.items);
    if (allItems.length === 0) return null;
    return <div>{renderItems(allItems, layout, font, colors, separator)}</div>;
  }

  // Categories mode: render each category with label
  return (
    <div>
      {skills.map((category) => (
        <div key={category.id} style={{ marginBottom: '6px' }}>
          {category.category ? (
            <>
              <span
                style={{
                  fontWeight: categoryWeight,
                  fontSize: `${font.sizes.normal}px`,
                  fontFamily: font.family,
                  color: catColor,
                }}
              >
                {category.category}:
              </span>{' '}
            </>
          ) : null}
          {renderItems(category.items, layout, font, colors, separator)}
        </div>
      ))}
    </div>
  );
};

export default SkillsBlock;
