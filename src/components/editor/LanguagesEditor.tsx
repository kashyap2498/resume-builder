// =============================================================================
// Resume Builder - Languages Editor
// =============================================================================

import { Plus, Languages } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Select, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';
import type { LanguageProficiency } from '@/types/resume';

const proficiencyOptions = [
  { value: 'native', label: 'Native' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'beginner', label: 'Beginner' },
];

export function LanguagesEditor() {
  const languages =
    useResumeStore((s) => s.currentResume?.data.languages) ?? [];
  const addLanguage = useResumeStore((s) => s.addLanguage);
  const updateLanguage = useResumeStore((s) => s.updateLanguage);
  const removeLanguage = useResumeStore((s) => s.removeLanguage);

  const handleAdd = () => {
    addLanguage({
      name: '',
      proficiency: 'intermediate' as LanguageProficiency,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Languages</h3>
          <p className="text-sm text-gray-500 mt-1">
            List the languages you speak and your proficiency level.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>

      {languages.length === 0 ? (
        <EmptyState
          icon={<Languages className="h-6 w-6" />}
          title="No languages added"
          description="Add languages to highlight your multilingual abilities."
          action={{
            label: 'Add Language',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {languages.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.name || 'New Language'}
              subtitle={
                proficiencyOptions.find((o) => o.value === entry.proficiency)
                  ?.label
              }
              onDelete={() => removeLanguage(entry.id)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Language"
                  placeholder="Spanish"
                  value={entry.name}
                  onChange={(e) =>
                    updateLanguage(entry.id, { name: e.target.value })
                  }
                />
                <Select
                  label="Proficiency"
                  value={entry.proficiency}
                  onChange={(e) =>
                    updateLanguage(entry.id, {
                      proficiency: e.target.value as LanguageProficiency,
                    })
                  }
                  options={proficiencyOptions}
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
