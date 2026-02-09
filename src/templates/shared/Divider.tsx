// =============================================================================
// Shared Template Component - Divider
// =============================================================================

import React from 'react';

export interface DividerProps {
  color: string;
  style?: 'line' | 'double' | 'dotted' | 'thick';
  /** Vertical margin in px */
  spacing?: number;
}

const Divider: React.FC<DividerProps> = ({
  color,
  style = 'line',
  spacing = 8,
}) => {
  const getBorder = (): string => {
    switch (style) {
      case 'double':
        return `3px double ${color}`;
      case 'dotted':
        return `1px dotted ${color}`;
      case 'thick':
        return `2px solid ${color}`;
      case 'line':
      default:
        return `1px solid ${color}`;
    }
  };

  return (
    <hr
      style={{
        border: 'none',
        borderTop: getBorder(),
        margin: `${spacing}px 0`,
      }}
    />
  );
};

export default Divider;
