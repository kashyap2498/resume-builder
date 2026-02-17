import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 shadow-[var(--shadow-glass-sm)] hover:shadow-[var(--shadow-glass-md)]',
  secondary:
    'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised active:bg-gray-100 dark:active:bg-dark-overlay border border-gray-200 dark:border-dark-edge-strong shadow-[var(--shadow-glass-sm)] hover:shadow-[var(--shadow-glass-md)]',
  ghost:
    'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-dark-raised active:bg-white/80 dark:active:bg-dark-overlay',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 shadow-[var(--shadow-glass-sm)]',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:shadow-[var(--shadow-glow-blue-strong)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'select-none cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}
