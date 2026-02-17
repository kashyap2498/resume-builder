import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles: Record<NonNullable<TooltipProps['position']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  if (!content) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative inline-flex group', className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          'absolute z-50 whitespace-nowrap',
          'rounded-lg bg-gray-900/90 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-white',
          'shadow-[var(--shadow-glass-lg)]',
          'opacity-0 scale-95 pointer-events-none',
          'transition-all duration-150 ease-in-out',
          'group-hover:opacity-100 group-hover:scale-100',
          positionStyles[position]
        )}
      >
        {content}
      </div>
    </div>
  );
}
