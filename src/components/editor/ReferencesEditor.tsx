// =============================================================================
// Resume Builder - References Editor
// =============================================================================

import { Plus, Users } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function ReferencesEditor() {
  const references =
    useResumeStore((s) => s.currentResume?.data.references) ?? [];
  const addReference = useResumeStore((s) => s.addReference);
  const updateReference = useResumeStore((s) => s.updateReference);
  const removeReference = useResumeStore((s) => s.removeReference);

  const handleAdd = () => {
    addReference({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      relationship: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">References</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add professional references who can vouch for your work.
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

      {references.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No references added"
          description="Add references from colleagues or managers who can speak to your abilities."
          action={{
            label: 'Add Reference',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {references.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.name || 'New Reference'}
              subtitle={
                [entry.title, entry.company].filter(Boolean).join(' at ') ||
                undefined
              }
              onDelete={() => removeReference(entry.id)}
            >
              <div className="space-y-4">
                {/* Name & Relationship */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Jane Smith"
                    value={entry.name}
                    onChange={(e) =>
                      updateReference(entry.id, { name: e.target.value })
                    }
                  />
                  <Input
                    label="Relationship"
                    placeholder="Former Manager"
                    value={entry.relationship}
                    onChange={(e) =>
                      updateReference(entry.id, {
                        relationship: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Title & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    placeholder="Engineering Director"
                    value={entry.title}
                    onChange={(e) =>
                      updateReference(entry.id, { title: e.target.value })
                    }
                  />
                  <Input
                    label="Company"
                    placeholder="Acme Inc."
                    value={entry.company}
                    onChange={(e) =>
                      updateReference(entry.id, { company: e.target.value })
                    }
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="jane.smith@example.com"
                    value={entry.email}
                    onChange={(e) =>
                      updateReference(entry.id, { email: e.target.value })
                    }
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={entry.phone}
                    onChange={(e) =>
                      updateReference(entry.id, { phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
