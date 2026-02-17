import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { label, error, hint, rows = 4, className, wrapperClassName, id, ...props },
    ref
  ) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          spellCheck={true}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
            'dark:bg-dark-card dark:text-gray-100 dark:border-dark-edge-strong',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'transition-all duration-200 ease-out',
            'focus:outline-none',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-dark-raised',
            'resize-y',
            error
              ? 'border-red-300/80 focus:border-red-500 focus:ring-0 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.1)] dark:border-red-500/60'
              : 'border-gray-200 dark:border-dark-edge-strong focus:border-blue-400 dark:focus:border-blue-500 focus:ring-0 focus:shadow-[var(--shadow-glow-blue)]',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${textareaId}-hint`} className="text-xs text-gray-500 dark:text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
