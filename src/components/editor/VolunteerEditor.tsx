// =============================================================================
// Resume Builder - Volunteer Experience Editor
// =============================================================================

import { Plus, Heart } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState, MonthYearPicker, RichTextEditor } from '@/components/ui';
import { EntryCard } from './EntryCard';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';

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
                  <MonthYearPicker
                    label="Start Date"
                    value={entry.startDate}
                    onChange={(val) =>
                      updateVolunteer(entry.id, { startDate: val })
                    }
                  />
                  <MonthYearPicker
                    label="End Date"
                    value={entry.endDate}
                    onChange={(val) =>
                      updateVolunteer(entry.id, { endDate: val })
                    }
                  />
                </div>

                {/* Description & Highlights */}
                <RichTextEditor
                  label="Description & Highlights"
                  content={toEditorHtml(entry.description, entry.highlights)}
                  onChange={(html) => {
                    const { description, highlights } = fromEditorHtml(html);
                    updateVolunteer(entry.id, { description, highlights });
                  }}
                  placeholder="Describe your volunteer work and add bullet points for impact..."
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
