// =============================================================================
// Shared Template Component - Skill Badge
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';
import type { SkillProficiency } from '@/types/resume';

export interface SkillBadgeProps {
  name: string;
  proficiency?: SkillProficiency;
  font: FontStyling;
  colors: ColorStyling;
  /** Whether to show the proficiency dots indicator */
  showProficiency?: boolean;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  proficiency,
  font,
  colors,
  showProficiency = false,
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
      {showProficiency && proficiency && (
        <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '2px' }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor:
                  level <= proficiency ? colors.primary : colors.divider,
                display: 'inline-block',
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
};

export default SkillBadge;
