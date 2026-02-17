import { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Type and press Enter...',
  label,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
      }
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        // Handle comma-separated paste in the input
        const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
        const newTags = [...tags];
        for (const part of parts) {
          if (!newTags.includes(part)) newTags.push(part);
        }
        onChange(newTags);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text/plain');
    if (text.includes(',')) {
      e.preventDefault();
      const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
      const newTags = [...tags];
      for (const part of parts) {
        if (!newTags.includes(part)) newTags.push(part);
      }
      onChange(newTags);
      setInput('');
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-dark-edge-strong bg-white dark:bg-dark-card focus-within:shadow-[var(--shadow-glow-blue)] focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-all duration-200 cursor-text min-h-[42px]"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm border border-blue-200 dark:border-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="inline-flex items-center justify-center rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (input.trim()) {
              const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
              const newTags = [...tags];
              for (const part of parts) {
                if (!newTags.includes(part)) newTags.push(part);
              }
              onChange(newTags);
              setInput('');
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
    </div>
  );
}
