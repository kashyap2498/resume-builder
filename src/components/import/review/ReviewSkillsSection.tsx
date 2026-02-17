// =============================================================================
// Resume Builder - ReviewSkillsSection (review UI for skill categories)
// =============================================================================

import { X } from 'lucide-react';
import type { SkillCategory } from '@/types/resume';
import { TagInput } from '@/components/ui';
import { InlineField } from './InlineField';

interface ReviewSkillsSectionProps {
  skills: SkillCategory[];
  updateEntry: (section: string, index: number, updates: Record<string, unknown>) => void;
  removeEntry: (section: string, index: number) => void;
}

export function ReviewSkillsSection({
  skills,
  updateEntry,
  removeEntry,
}: ReviewSkillsSectionProps) {
  return (
    <div className="space-y-3">
      {skills.map((cat, i) => (
        <div
          key={cat.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 relative"
        >
          <button
            type="button"
            onClick={() => removeEntry('skills', i)}
            className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remove category"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-8">
            <InlineField
              label="Category"
              value={cat.category}
              onChange={(v) => updateEntry('skills', i, { category: v })}
              placeholder="Category name"
            />
          </div>

          <div className="mt-2">
            <TagInput
              tags={cat.items}
              onChange={(items) => updateEntry('skills', i, { items })}
              placeholder="Add a skill..."
              label="Skills"
            />
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <p className="py-4 text-center text-sm italic text-gray-400 dark:text-gray-500">
          No skills found.
        </p>
      )}
    </div>
  );
}
