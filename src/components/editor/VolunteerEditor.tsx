// =============================================================================
// Resume Builder - Volunteer Experience Editor
// =============================================================================

import { Plus, X, Heart } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function VolunteerEditor() {
  const volunteer =
    useResumeStore((s) => s.currentResume?.data.volunteer) ?? [];
  const addVolunteer = useResumeStore((s) => s.addVolunteer);
  const updateVolunteer = useResumeStore((s) => s.updateVolunteer);
  const removeVolunteer = useResumeStore((s) => s.removeVolunteer);

  const handleAdd = () => {
    addVolunteer({
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: [],
    });
  };

  const handleAddHighlight = (id: string, highlights: string[]) => {
    updateVolunteer(id, { highlights: [...highlights, ''] });
  };

  const handleUpdateHighlight = (
    id: string,
    highlights: string[],
    index: number,
    value: string
  ) => {
    const updated = [...highlights];
    updated[index] = value;
    updateVolunteer(id, { highlights: updated });
  };

  const handleRemoveHighlight = (
    id: string,
    highlights: string[],
    index: number
  ) => {
    updateVolunteer(id, {
      highlights: highlights.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Volunteer Experience
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add volunteer work and community involvement.
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

      {volunteer.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No volunteer experience added"
          description="Add volunteer work to show your community involvement."
          action={{
            label: 'Add Volunteer Experience',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {volunteer.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.organization || 'New Volunteer Experience'}
              subtitle={entry.role || undefined}
              onDelete={() => removeVolunteer(entry.id)}
            >
              <div className="space-y-4">
                {/* Organization & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    placeholder="Red Cross"
                    value={entry.organization}
                    onChange={(e) =>
                      updateVolunteer(entry.id, {
                        organization: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Role"
                    placeholder="Volunteer Coordinator"
                    value={entry.role}
                    onChange={(e) =>
                      updateVolunteer(entry.id, { role: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    placeholder="Jun 2021"
                    value={entry.startDate}
                    onChange={(e) =>
                      updateVolunteer(entry.id, { startDate: e.target.value })
                    }
                  />
                  <Input
                    label="End Date"
                    placeholder="Present"
                    value={entry.endDate}
                    onChange={(e) =>
                      updateVolunteer(entry.id, { endDate: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Describe your volunteer work and impact..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updateVolunteer(entry.id, { description: e.target.value })
                  }
                />

                {/* Highlights */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Highlights
                  </label>
                  {entry.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Led a team of 20 volunteers..."
                        value={highlight}
                        onChange={(e) =>
                          handleUpdateHighlight(
                            entry.id,
                            entry.highlights,
                            idx,
                            e.target.value
                          )
                        }
                        wrapperClassName="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveHighlight(entry.id, entry.highlights, idx)
                        }
                        className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove highlight"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() =>
                      handleAddHighlight(entry.id, entry.highlights)
                    }
                  >
                    Add Highlight
                  </Button>
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
