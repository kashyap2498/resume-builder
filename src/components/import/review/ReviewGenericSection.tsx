// =============================================================================
// Resume Builder - ReviewGenericSection (data-driven renderer for misc sections)
// =============================================================================
// Covers: projects, certifications, languages, volunteer, awards, publications,
//         references, affiliations, courses, hobbies

import { X } from 'lucide-react';
import { TagInput } from '@/components/ui';
import { InlineField } from './InlineField';

// ---------------------------------------------------------------------------
// Field definition types
// ---------------------------------------------------------------------------

type FieldType = 'text' | 'multiline' | 'tags' | 'select';

interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  colSpan?: 2;
  placeholder?: string;
  options?: string[]; // for select type
}

// ---------------------------------------------------------------------------
// Section field definitions map
// ---------------------------------------------------------------------------

const SECTION_FIELD_DEFS: Record<string, FieldDef[]> = {
  projects: [
    { name: 'name', label: 'Project Name', type: 'text', placeholder: 'Project name' },
    { name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
    { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2023' },
    { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
    { name: 'description', label: 'Description', type: 'multiline', colSpan: 2, placeholder: 'Describe the project...' },
    { name: 'technologies', label: 'Technologies', type: 'tags', colSpan: 2, placeholder: 'Add technology...' },
  ],
  certifications: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Certification name' },
    { name: 'issuer', label: 'Issuer', type: 'text', placeholder: 'Issuing organization' },
    { name: 'date', label: 'Date', type: 'text', placeholder: 'Jan 2023' },
    { name: 'credentialId', label: 'Credential ID', type: 'text', placeholder: 'ABC123' },
    { name: 'url', label: 'URL', type: 'text', colSpan: 2, placeholder: 'https://...' },
  ],
  languages: [
    { name: 'name', label: 'Language', type: 'text', placeholder: 'Language name' },
    {
      name: 'proficiency',
      label: 'Proficiency',
      type: 'select',
      options: ['native', 'fluent', 'advanced', 'intermediate', 'beginner'],
    },
  ],
  volunteer: [
    { name: 'organization', label: 'Organization', type: 'text', placeholder: 'Organization name' },
    { name: 'role', label: 'Role', type: 'text', placeholder: 'Volunteer role' },
    { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2020' },
    { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
    { name: 'description', label: 'Description', type: 'multiline', colSpan: 2, placeholder: 'Describe your contributions...' },
  ],
  awards: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Award name' },
    { name: 'issuer', label: 'Issuer', type: 'text', placeholder: 'Issuing organization' },
    { name: 'date', label: 'Date', type: 'text', placeholder: 'Jan 2023' },
    { name: 'description', label: 'Description', type: 'multiline', colSpan: 2, placeholder: 'Award details...' },
  ],
  publications: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Publication title' },
    { name: 'publisher', label: 'Publisher', type: 'text', placeholder: 'Publisher name' },
    { name: 'date', label: 'Date', type: 'text', placeholder: 'Jan 2023' },
    { name: 'url', label: 'URL', type: 'text', placeholder: 'https://...' },
    { name: 'description', label: 'Description', type: 'multiline', colSpan: 2, placeholder: 'Brief summary...' },
  ],
  references: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Full name' },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Job title' },
    { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'email@example.com' },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
    { name: 'relationship', label: 'Relationship', type: 'text', placeholder: 'Former manager' },
  ],
  affiliations: [
    { name: 'organization', label: 'Organization', type: 'text', placeholder: 'Organization name' },
    { name: 'role', label: 'Role', type: 'text', placeholder: 'Member, Chair, etc.' },
    { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2020' },
    { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
  ],
  courses: [
    { name: 'name', label: 'Course Name', type: 'text', placeholder: 'Course name' },
    { name: 'institution', label: 'Institution', type: 'text', placeholder: 'Institution name' },
    { name: 'completionDate', label: 'Completion Date', type: 'text', placeholder: 'Jan 2023' },
    { name: 'description', label: 'Description', type: 'multiline', colSpan: 2, placeholder: 'Course description...' },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ReviewGenericSectionProps {
  sectionType: string;
  entries: Record<string, unknown>[];
  updateEntry: (section: string, index: number, updates: Record<string, unknown>) => void;
  removeEntry: (section: string, index: number) => void;
}

export function ReviewGenericSection({
  sectionType,
  entries,
  updateEntry,
  removeEntry,
}: ReviewGenericSectionProps) {
  const fields = SECTION_FIELD_DEFS[sectionType];
  if (!fields) return null;

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div
          key={(entry.id as string) ?? i}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 relative"
        >
          <button
            type="button"
            onClick={() => removeEntry(sectionType, i)}
            className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remove entry"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pr-8">
            {fields.map((field) => {
              const fieldValue = entry[field.name];

              if (field.type === 'tags') {
                return (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : undefined}>
                    <TagInput
                      tags={(fieldValue as string[]) ?? []}
                      onChange={(tags) => updateEntry(sectionType, i, { [field.name]: tags })}
                      placeholder={field.placeholder}
                      label={field.label}
                    />
                  </div>
                );
              }

              if (field.type === 'select' && field.options) {
                return (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : undefined}>
                    <span className="mb-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      {field.label}
                    </span>
                    <select
                      value={(fieldValue as string) ?? ''}
                      onChange={(e) => updateEntry(sectionType, i, { [field.name]: e.target.value })}
                      className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 dark:border-dark-edge dark:bg-dark-card dark:text-gray-100"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'multiline') {
                return (
                  <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : undefined}>
                    <InlineField
                      label={field.label}
                      value={(fieldValue as string) ?? ''}
                      onChange={(v) => updateEntry(sectionType, i, { [field.name]: v })}
                      placeholder={field.placeholder}
                      multiline
                    />
                  </div>
                );
              }

              // Default: text
              return (
                <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : undefined}>
                  <InlineField
                    label={field.label}
                    value={(fieldValue as string) ?? ''}
                    onChange={(v) => updateEntry(sectionType, i, { [field.name]: v })}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="py-4 text-center text-sm italic text-gray-400 dark:text-gray-500">
          No entries found.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hobbies-specific renderer (since it uses a flat string array, not entries)
// ---------------------------------------------------------------------------

interface ReviewHobbiesSectionProps {
  items: string[];
  onChangeItems: (items: string[]) => void;
}

export function ReviewHobbiesSection({ items, onChangeItems }: ReviewHobbiesSectionProps) {
  return (
    <TagInput
      tags={items}
      onChange={onChangeItems}
      placeholder="Add a hobby or interest..."
      label="Hobbies & Interests"
    />
  );
}
