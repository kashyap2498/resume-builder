// =============================================================================
// Shared Template Component - Date Range
// =============================================================================

import React from 'react';
import type { FontStyling, ColorStyling } from '@/types/styling';

export interface DateRangeProps {
  startDate: string;
  endDate?: string;
  current?: boolean;
  font: FontStyling;
  colors: ColorStyling;
}

/** Formats a date string (YYYY-MM or YYYY-MM-DD) into a readable format. */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Handle YYYY-MM and YYYY-MM-DD formats
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${parts[0]}`;
    }
  }
  return dateStr;
}

/** Builds a formatted date range string. */
export function formatDateRange(
  startDate: string,
  endDate?: string,
  current?: boolean
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : '';
  if (current) return start ? `${start} - Present` : 'Present';
  if (start && end && start !== end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return '';
}

const DateRange: React.FC<DateRangeProps> = ({
  startDate,
  endDate,
  current,
  font,
  colors,
}) => {
  const text = formatDateRange(startDate, endDate, current);

  if (!text) return null;

  return (
    <span
      style={{
        fontSize: `${font.sizes.small}px`,
        fontFamily: font.family,
        color: colors.lightText,
        lineHeight: font.lineHeight,
      }}
    >
      {text}
    </span>
  );
};

export default DateRange;
