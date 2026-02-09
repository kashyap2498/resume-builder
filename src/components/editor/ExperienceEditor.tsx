// =============================================================================
// Resume Builder - Work Experience Editor
// =============================================================================

import { Plus, X, Briefcase } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Toggle, Button, EmptyState } from '@/components/ui';
import { SortableEntryCard } from './SortableEntryCard';

export function ExperienceEditor() {
  const experience = useResumeStore((s) => s.currentResume?.data.experience) ?? [];
  const addExperience = useResumeStore((s) => s.addExperience);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);
  const reorderExperience = useResumeStore((s) => s.reorderExperience);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = experience.findIndex((e) => e.id === active.id);
      const newIndex = experience.findIndex((e) => e.id === over.id);
      const newOrder = arrayMove(
        experience.map((e) => e.id),
        oldIndex,
        newIndex,
      );
      reorderExperience(newOrder);
    }
  };

  const handleAdd = () => {
    addExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
    });
  };

  const handleAddHighlight = (id: string, highlights: string[]) => {
    updateExperience(id, { highlights: [...highlights, ''] });
  };

  const handleUpdateHighlight = (
    id: string,
    highlights: string[],
    index: number,
    value: string
  ) => {
    const updated = [...highlights];
    updated[index] = value;
    updateExperience(id, { highlights: updated });
  };

  const handleRemoveHighlight = (
    id: string,
    highlights: string[],
    index: number
  ) => {
    updateExperience(id, {
      highlights: highlights.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Work Experience
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add your professional work history, starting with the most recent.
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

      {experience.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No experience added"
          description="Add your work experience to showcase your professional background."
          action={{
            label: 'Add Experience',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experience.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
          {experience.map((entry) => (
            <SortableEntryCard
              key={entry.id}
              id={entry.id}
              title={entry.company || 'New Experience'}
              subtitle={entry.position}
              onDelete={() => removeExperience(entry.id)}
            >
              <div className="space-y-4">
                {/* Company & Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company"
                    placeholder="Acme Inc."
                    value={entry.company}
                    onChange={(e) =>
                      updateExperience(entry.id, { company: e.target.value })
                    }
                  />
                  <Input
                    label="Position"
                    placeholder="Software Engineer"
                    value={entry.position}
                    onChange={(e) =>
                      updateExperience(entry.id, { position: e.target.value })
                    }
                  />
                </div>

                {/* Location */}
                <Input
                  label="Location"
                  placeholder="San Francisco, CA"
                  value={entry.location}
                  onChange={(e) =>
                    updateExperience(entry.id, { location: e.target.value })
                  }
                />

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    placeholder="Jan 2020"
                    value={entry.startDate}
                    onChange={(e) =>
                      updateExperience(entry.id, { startDate: e.target.value })
                    }
                  />
                  <Input
                    label="End Date"
                    placeholder="Dec 2023"
                    value={entry.endDate}
                    onChange={(e) =>
                      updateExperience(entry.id, { endDate: e.target.value })
                    }
                    disabled={entry.current}
                  />
                </div>

                {/* Currently working */}
                <Toggle
                  checked={entry.current}
                  onChange={(checked) =>
                    updateExperience(entry.id, {
                      current: checked,
                      endDate: checked ? '' : entry.endDate,
                    })
                  }
                  label="I currently work here"
                  size="sm"
                />

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Describe your role, responsibilities, and impact..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updateExperience(entry.id, { description: e.target.value })
                  }
                />

                {/* Highlights */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Key Highlights
                  </label>
                  {entry.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Achieved 30% improvement in..."
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
            </SortableEntryCard>
          ))}
        </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
