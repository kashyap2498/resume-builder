import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      children,
      className,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-gray-900',
              'dark:bg-dark-card dark:text-gray-100 dark:border-dark-edge-strong',
              'transition-all duration-200 ease-out',
              'focus:outline-none',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-dark-raised',
              'cursor-pointer',
              error
                ? 'border-red-300/80 focus:border-red-500 focus:ring-0 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.1)] dark:border-red-500/60'
                : 'border-gray-200 dark:border-dark-edge-strong focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 focus:shadow-[var(--shadow-glow-blue)]',
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-xs text-gray-500 dark:text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
