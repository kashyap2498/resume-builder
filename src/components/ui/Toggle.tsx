import { cn } from '../../utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const trackSizes: Record<NonNullable<ToggleProps['size']>, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
};

const thumbSizes: Record<NonNullable<ToggleProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const thumbTranslate: Record<NonNullable<ToggleProps['size']>, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        'inline-flex items-start gap-3 select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full p-1',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          trackSizes[size],
          checked ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-in-out',
            thumbSizes[size],
            checked ? thumbTranslate[size] : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5 pt-0.5">
          {label && (
            <span className="text-sm font-medium text-gray-900">{label}</span>
          )}
          {description && (
            <span className="text-xs text-gray-500">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
