// =============================================================================
// Shared Template Component - Skill Badge
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';

export interface SkillBadgeProps {
  name: string;
  font: FontStyling;
  colors: ColorStyling;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  font,
  colors,
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        fontSize: `${font.sizes.small}px`,
        fontFamily: font.family,
        color: colors.text,
        backgroundColor: colors.background === '#ffffff' ? '#f3f4f6' : colors.background,
        borderRadius: '4px',
        lineHeight: font.lineHeight,
      }}
    >
      {name}
    </span>
  );
};

export default SkillBadge;
