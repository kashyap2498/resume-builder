import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'round' | 'square';
  loading?: boolean;
  showTooltip?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const variantStyles: Record<NonNullable<IconButtonProps['variant']>, string> = {
  default:
    'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm',
  ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  danger: 'text-gray-500 hover:bg-red-50 hover:text-red-600',
};

const sizeStyles: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
};

const iconSizes: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  shape = 'square',
  loading = false,
  showTooltip = true,
  tooltipPosition = 'top',
  disabled,
  className,
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;

  const button = (
    <button
      disabled={isDisabled}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        'transition-all duration-150 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        shape === 'round' ? 'rounded-full' : 'rounded-lg',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', iconSizes[size])} />
      ) : (
        <span className={cn('inline-flex', iconSizes[size], '[&>svg]:h-full [&>svg]:w-full')}>
          {icon}
        </span>
      )}
    </button>
  );

  if (showTooltip && !isDisabled) {
    return (
      <Tooltip content={label} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
