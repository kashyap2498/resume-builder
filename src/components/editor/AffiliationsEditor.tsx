// =============================================================================
// Resume Builder - Professional Affiliations Editor
// =============================================================================

import { Plus, Building2 } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function AffiliationsEditor() {
  const affiliations =
    useResumeStore((s) => s.currentResume?.data.affiliations) ?? [];
  const addAffiliation = useResumeStore((s) => s.addAffiliation);
  const updateAffiliation = useResumeStore((s) => s.updateAffiliation);
  const removeAffiliation = useResumeStore((s) => s.removeAffiliation);

  const handleAdd = () => {
    addAffiliation({
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Professional Affiliations
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add memberships in professional organizations.
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

      {affiliations.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No affiliations added"
          description="Add professional organizations you belong to."
          action={{
            label: 'Add Affiliation',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {affiliations.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.organization || 'New Affiliation'}
              subtitle={entry.role || undefined}
              onDelete={() => removeAffiliation(entry.id)}
            >
              <div className="space-y-4">
                {/* Organization & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    placeholder="IEEE, ACM, etc."
                    value={entry.organization}
                    onChange={(e) =>
                      updateAffiliation(entry.id, {
                        organization: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Role"
                    placeholder="Member, Board Director, etc."
                    value={entry.role}
                    onChange={(e) =>
                      updateAffiliation(entry.id, { role: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    placeholder="Jan 2020"
                    value={entry.startDate}
                    onChange={(e) =>
                      updateAffiliation(entry.id, {
                        startDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="End Date"
                    placeholder="Present"
                    value={entry.endDate}
                    onChange={(e) =>
                      updateAffiliation(entry.id, { endDate: e.target.value })
                    }
                    hint="Leave blank or type 'Present' if ongoing"
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
