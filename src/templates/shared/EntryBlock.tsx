// =============================================================================
// Shared Template Component - Entry Block
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';

export interface EntryBlockProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  description?: string;
  highlights?: string[];
  font: FontStyling;
  colors: ColorStyling;
  /** Spacing below each entry in px */
  spacing?: number;
}

const EntryBlock: React.FC<EntryBlockProps> = ({
  title,
  subtitle,
  dateRange,
  location,
  description,
  highlights,
  font,
  colors,
  spacing = 8,
}) => {
  return (
    <div style={{ marginBottom: `${spacing}px` }}>
      {/* Title line: title/subtitle left, date/location right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: `${font.sizes.normal}px`,
            fontFamily: font.family,
            fontWeight: 700,
            color: colors.text,
            lineHeight: font.lineHeight,
          }}
        >
          {title}
        </span>
        {dateRange && (
          <span
            style={{
              fontSize: `${font.sizes.small}px`,
              fontFamily: font.family,
              color: colors.lightText,
              lineHeight: font.lineHeight,
            }}
          >
            {dateRange}
          </span>
        )}
      </div>

      {/* Subtitle / Location line */}
      {(subtitle || location) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
          }}
        >
          {subtitle && (
            <span
              style={{
                fontSize: `${font.sizes.normal}px`,
                fontFamily: font.family,
                fontStyle: 'italic',
                color: colors.secondary,
                lineHeight: font.lineHeight,
              }}
            >
              {subtitle}
            </span>
          )}
          {location && (
            <span
              style={{
                fontSize: `${font.sizes.small}px`,
                fontFamily: font.family,
                color: colors.lightText,
                lineHeight: font.lineHeight,
              }}
            >
              {location}
            </span>
          )}
        </div>
      )}

      {/* Description paragraph */}
      {description && (
        <p
          style={{
            fontSize: `${font.sizes.normal}px`,
            fontFamily: font.family,
            color: colors.text,
            lineHeight: font.lineHeight,
            margin: '4px 0 2px 0',
          }}
        >
          {description}
        </p>
      )}

      {/* Bullet highlights */}
      {highlights && highlights.length > 0 && (
        <ul
          style={{
            margin: '4px 0 0 0',
            paddingLeft: '18px',
            listStyleType: 'disc',
          }}
        >
          {highlights.map((item, index) => (
            <li
              key={index}
              style={{
                fontSize: `${font.sizes.normal}px`,
                fontFamily: font.family,
                color: colors.text,
                lineHeight: font.lineHeight,
                marginBottom: '1px',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EntryBlock;
