// =============================================================================
// Shared Template Component - Contact Line
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';
import type { ContactData } from '@/types/resume';

export interface ContactLineProps {
  contact: ContactData;
  font: FontStyling;
  colors: ColorStyling;
  layout: 'line' | 'block';
  /** Separator character for line layout */
  separator?: string;
}

const ContactLine: React.FC<ContactLineProps> = ({
  contact,
  font,
  colors,
  layout,
  separator = '|',
}) => {
  // Build contact items from available data
  const items: string[] = [];
  if (contact.email) items.push(contact.email);
  if (contact.phone) items.push(contact.phone);
  if (contact.location) items.push(contact.location);
  if (contact.website) items.push(contact.website);
  if (contact.linkedin) items.push(contact.linkedin);
  if (contact.github) items.push(contact.github);
  if (contact.portfolio) items.push(contact.portfolio);

  if (items.length === 0) return null;

  if (layout === 'line') {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px',
          fontSize: `${font.sizes.small}px`,
          fontFamily: font.family,
          color: colors.lightText,
          lineHeight: font.lineHeight,
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span>{item}</span>
            {index < items.length - 1 && (
              <span style={{ margin: '0 4px', color: colors.divider }}>
                {separator}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Block layout
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        fontSize: `${font.sizes.small}px`,
        fontFamily: font.family,
        color: colors.lightText,
        lineHeight: font.lineHeight,
      }}
    >
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  );
};

export default ContactLine;
