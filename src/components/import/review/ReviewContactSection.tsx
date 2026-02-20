// =============================================================================
// Resume Builder - ReviewContactSection (review UI for contact fields)
// =============================================================================

import type { ContactData } from '@/types/resume';
import { InlineField } from './InlineField';

interface ReviewContactSectionProps {
  contact: ContactData;
  updateContact: (field: keyof ContactData, value: string) => void;
}

const CONTACT_FIELDS: { field: keyof ContactData; label: string; placeholder: string }[] = [
  { field: 'firstName', label: 'First Name', placeholder: 'First name' },
  { field: 'lastName', label: 'Last Name', placeholder: 'Last name' },
  { field: 'title', label: 'Title', placeholder: 'Software Engineer' },
  { field: 'email', label: 'Email', placeholder: 'email@example.com' },
  { field: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
  { field: 'location', label: 'Location', placeholder: 'City, State' },
  { field: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
  { field: 'github', label: 'GitHub', placeholder: 'github.com/...' },
  { field: 'website', label: 'Website', placeholder: 'https://example.com' },
  { field: 'portfolio', label: 'Portfolio', placeholder: 'https://portfolio.com' },
];

const IMPORTANT_FIELDS: (keyof ContactData)[] = ['firstName', 'lastName', 'title', 'email', 'phone'];

export function ReviewContactSection({ contact, updateContact }: ReviewContactSectionProps) {
  const missingFields = CONTACT_FIELDS
    .filter(({ field }) => IMPORTANT_FIELDS.includes(field) && !contact[field])
    .map(({ label }) => label);

  return (
    <div>
      {missingFields.length > 0 && (
        <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
          Missing: {missingFields.slice(0, 4).join(', ')}
          {missingFields.length > 4 && ` and ${missingFields.length - 4} more`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {CONTACT_FIELDS.map(({ field, label, placeholder }) => (
        <InlineField
          key={field}
          label={label}
          value={contact[field]}
          onChange={(v) => updateContact(field, v)}
          placeholder={placeholder}
        />
      ))}
      </div>
    </div>
  );
}
