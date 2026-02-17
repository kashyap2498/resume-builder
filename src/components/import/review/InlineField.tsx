// =============================================================================
// Resume Builder - InlineField (click-to-edit field for review interface)
// =============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface InlineFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function InlineField({
  value,
  onChange,
  label,
  placeholder = 'Click to edit',
  multiline = false,
  className,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  }, [draft, value, onChange]);

  const revert = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        revert();
      }
      // For single-line input, Enter commits
      if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    },
    [multiline, commit, revert]
  );

  const sharedInputClasses = cn(
    'w-full bg-transparent text-sm text-gray-900 dark:text-gray-100',
    'border-0 border-b-2 border-blue-500 dark:border-blue-400',
    'outline-none px-0 py-0.5 rounded-none',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500'
  );

  return (
    <div className={cn('min-h-[28px]', className)}>
      {label && (
        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          {label}
        </span>
      )}

      {editing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className={cn(sharedInputClasses, 'resize-y min-h-[60px]')}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className={sharedInputClasses}
            placeholder={placeholder}
          />
        )
      ) : (
        <span
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setEditing(true);
            }
          }}
          className={cn(
            'block w-full text-sm cursor-text py-0.5',
            'border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600',
            'transition-colors duration-150',
            value
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500 italic'
          )}
        >
          {value || placeholder}
        </span>
      )}
    </div>
  );
}
