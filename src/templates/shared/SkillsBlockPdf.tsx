// =============================================================================
// Shared Template Component - Skills Block (PDF / @react-pdf)
// =============================================================================

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { SkillCategory, SkillsLayout } from '@/types/resume';
import type { Style } from '@react-pdf/types';

export interface SkillsBlockPdfProps {
  skills: SkillCategory[];
  layout?: SkillsLayout;
  mode?: 'freeform' | 'categories';
  fontSize: number;
  fontFamily: string;
  textColor: string;
  separator?: string;
  categoryWeight?: number;
  categoryColor?: string;
  categoryFontFamily?: string;
}

function renderItemsPdf(
  items: string[],
  layout: SkillsLayout,
  fontSize: number,
  fontFamily: string,
  textColor: string,
  separator: string,
) {
  const textStyle: Style = {
    fontSize,
    fontFamily,
    color: textColor,
  };

  switch (layout) {
    case 'bullets':
      return (
        <View>
          {items.map((item, i) => (
            <Text key={i} style={{ ...textStyle, marginBottom: 1 }}>
              {'\u2022'} {item}
            </Text>
          ))}
        </View>
      );

    case 'vertical':
      return (
        <View>
          {items.map((item, i) => (
            <Text key={i} style={{ ...textStyle, marginBottom: 1 }}>
              {item}
            </Text>
          ))}
        </View>
      );

    case '2-column':
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {items.map((item, i) => (
            <Text key={i} style={{ ...textStyle, width: '50%', marginBottom: 1 }}>
              {item}
            </Text>
          ))}
        </View>
      );

    case '3-column':
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {items.map((item, i) => (
            <Text key={i} style={{ ...textStyle, width: '33.33%', marginBottom: 1 }}>
              {item}
            </Text>
          ))}
        </View>
      );

    case 'comma':
    default:
      return <Text style={textStyle}>{items.join(separator)}</Text>;
  }
}

const SkillsBlockPdf: React.FC<SkillsBlockPdfProps> = ({
  skills,
  layout = 'comma',
  mode = 'freeform',
  fontSize,
  fontFamily,
  textColor,
  separator = ', ',
  categoryWeight = 700,
  categoryColor,
  categoryFontFamily,
}) => {
  const catColor = categoryColor ?? textColor;
  const catFont = categoryFontFamily ?? fontFamily;

  // Freeform mode or no category names: render all items flat
  if (mode === 'freeform' || skills.every((c) => !c.category)) {
    const allItems = skills.flatMap((c) => c.items);
    if (allItems.length === 0) return null;
    return <View>{renderItemsPdf(allItems, layout, fontSize, fontFamily, textColor, separator)}</View>;
  }

  // Categories mode: render each category with label
  return (
    <View>
      {skills.map((category) => {
        // For comma layout, render inline
        if (layout === 'comma') {
          return (
            <Text key={category.id} style={{ fontSize, color: textColor, fontFamily, marginBottom: 4 }}>
              {category.category ? (
                <Text style={{ fontFamily: catFont, fontWeight: 700 as const, color: catColor }}>
                  {category.category}:{' '}
                </Text>
              ) : null}
              {category.items.join(separator)}
            </Text>
          );
        }

        // For grid/vertical layouts, render in a View
        return (
          <View key={category.id} style={{ marginBottom: 4 }}>
            {category.category ? (
              <Text style={{ fontSize, fontFamily: catFont, fontWeight: 700 as const, color: catColor, marginBottom: 2 }}>
                {category.category}:
              </Text>
            ) : null}
            {renderItemsPdf(category.items, layout, fontSize, fontFamily, textColor, separator)}
          </View>
        );
      })}
    </View>
  );
};

export default SkillsBlockPdf;
