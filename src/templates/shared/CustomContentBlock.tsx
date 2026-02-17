// =============================================================================
// Shared Template Component - Custom Content Block (Preview / HTML)
// =============================================================================

import React from 'react';
import DOMPurify from 'dompurify';
import type { FontStyling, ColorStyling } from '@/types/styling';

export interface CustomContentBlockProps {
  content: string;
  font: FontStyling;
  colors: ColorStyling;
}

const CustomContentBlock: React.FC<CustomContentBlockProps> = ({
  content,
  font,
  colors,
}) => {
  if (!content || content === '<p></p>') return null;

  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'b', 'i'],
  });

  return (
    <div
      style={{
        fontSize: `${font.sizes.normal}px`,
        fontFamily: font.family,
        color: colors.text,
        lineHeight: font.lineHeight,
      }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default CustomContentBlock;
