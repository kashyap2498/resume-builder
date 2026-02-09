// =============================================================================
// Shared Template Component - Section Heading
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';

export interface SectionHeadingProps {
  title: string;
  font: FontStyling;
  colors: ColorStyling;
  /** Optional override for heading style variant */
  variant?: 'uppercase' | 'capitalize' | 'normal';
  /** Whether to render a divider line below the heading */
  showDivider?: boolean;
  /** Divider style */
  dividerStyle?: 'line' | 'double' | 'dotted' | 'thick';
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  font,
  colors,
  variant = 'uppercase',
  showDivider = false,
  dividerStyle = 'line',
}) => {
  const textTransform =
    variant === 'uppercase'
      ? 'uppercase'
      : variant === 'capitalize'
        ? 'capitalize'
        : 'none';

  const getDividerBorder = (): string => {
    switch (dividerStyle) {
      case 'double':
        return `3px double ${colors.divider}`;
      case 'dotted':
        return `1px dotted ${colors.divider}`;
      case 'thick':
        return `2px solid ${colors.divider}`;
      case 'line':
      default:
        return `1px solid ${colors.divider}`;
    }
  };

  return (
    <div style={{ marginBottom: '4px' }}>
      <h2
        style={{
          fontSize: `${font.sizes.sectionHeader}px`,
          fontFamily: font.headerFamily,
          color: colors.primary,
          textTransform,
          letterSpacing: `${font.letterSpacing + 0.5}px`,
          fontWeight: 700,
          margin: 0,
          padding: 0,
          lineHeight: font.lineHeight,
        }}
      >
        {title}
      </h2>
      {showDivider && (
        <div
          style={{
            borderBottom: getDividerBorder(),
            marginTop: '2px',
          }}
        />
      )}
    </div>
  );
};

export default SectionHeading;
