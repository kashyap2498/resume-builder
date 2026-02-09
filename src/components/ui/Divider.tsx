import { cn } from '../../utils/cn';

export interface DividerProps {
  label?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingStyles: Record<NonNullable<DividerProps['spacing']>, string> = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

export function Divider({
  label,
  className,
  spacing = 'md',
}: DividerProps) {
  if (label) {
    return (
      <div
        className={cn(
          'flex items-center gap-3',
          spacingStyles[spacing],
          className
        )}
        role="separator"
      >
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider select-none">
          {label}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    );
  }

  return (
    <hr
      className={cn('border-0 h-px bg-gray-200', spacingStyles[spacing], className)}
      role="separator"
    />
  );
}
