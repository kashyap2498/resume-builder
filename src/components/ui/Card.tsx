import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md';
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowStyles: Record<NonNullable<CardProps['shadow']>, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
};

export function Card({
  hover = false,
  padding = 'md',
  border = true,
  shadow = 'sm',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white',
        border && 'border border-gray-200',
        shadowStyles[shadow],
        paddingStyles[padding],
        hover && 'transition-shadow duration-200 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------- Sub-components ---------- */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  description,
  icon,
  action,
  children,
  className,
  ...props
}: CardHeaderProps) {
  const desc = subtitle || description;
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {desc && (
            <p className="text-xs text-gray-500">{desc}</p>
          )}
          {children}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
