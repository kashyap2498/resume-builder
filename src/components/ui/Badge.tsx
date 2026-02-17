import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'gray'
    | 'blue'
    | 'green'
    | 'yellow'
    | 'red'
    | 'purple'
    | 'indigo';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  gray: 'bg-gray-100/70 text-gray-700 ring-gray-200/60 dark:bg-gray-700/40 dark:text-gray-300 dark:ring-gray-600/40',
  blue: 'bg-blue-50/70 text-blue-700 ring-blue-200/60 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-700/40',
  green: 'bg-green-50/70 text-green-700 ring-green-200/60 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-700/40',
  yellow: 'bg-yellow-50/70 text-yellow-700 ring-yellow-200/60 dark:bg-yellow-900/40 dark:text-yellow-300 dark:ring-yellow-700/40',
  red: 'bg-red-50/70 text-red-700 ring-red-200/60 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700/40',
  purple: 'bg-purple-50/70 text-purple-700 ring-purple-200/60 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-700/40',
  indigo: 'bg-indigo-50/70 text-indigo-700 ring-indigo-200/60 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-700/40',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-sm',
};

export function Badge({
  variant = 'gray',
  size = 'sm',
  icon,
  removable = false,
  onRemove,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md ring-1 ring-inset',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'ml-0.5 -mr-0.5 inline-flex items-center justify-center',
            'h-3.5 w-3.5 rounded-full',
            'hover:bg-black/10 transition-colors',
            'focus:outline-none'
          )}
          aria-label="Remove"
        >
          <svg className="h-2.5 w-2.5" viewBox="0 0 6 6" fill="currentColor">
            <path d="M.293.293a1 1 0 011.414 0L3 1.586 4.293.293a1 1 0 111.414 1.414L4.414 3l1.293 1.293a1 1 0 01-1.414 1.414L3 4.414 1.707 5.707A1 1 0 01.293 4.293L1.586 3 .293 1.707A1 1 0 01.293.293z" />
          </svg>
        </button>
      )}
    </span>
  );
}
