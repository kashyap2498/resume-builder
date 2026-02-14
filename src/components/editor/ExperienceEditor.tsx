// =============================================================================
// Resume Builder - Work Experience Editor
// =============================================================================

import { Plus, Briefcase } from 'lucide-react';
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
import { Input, Toggle, Button, EmptyState, MonthYearPicker, RichTextEditor } from '@/components/ui';
import { SortableEntryCard } from './SortableEntryCard';
import { experienceEntrySchema } from '@/schemas/experience';
import { useFieldValidation } from '@/hooks/useFieldValidation';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';
import type { ExperienceEntry } from '@/types/resume';

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
              <ExperienceEntryForm
                entry={entry}
                onUpdate={(fields) => updateExperience(entry.id, fields)}
              />
            </SortableEntryCard>
          ))}
        </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// -- Validated entry form sub-component ---------------------------------------

function ExperienceEntryForm({
  entry,
  onUpdate,
}: {
  entry: ExperienceEntry;
  onUpdate: (fields: Partial<ExperienceEntry>) => void;
}) {
  const { onBlur, getError } = useFieldValidation(experienceEntrySchema, entry as unknown as Record<string, unknown>);

  return (
    <div className="space-y-4">
      {/* Company & Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company"
          placeholder="Acme Inc."
          value={entry.company}
          onChange={(e) => onUpdate({ company: e.target.value })}
          onBlur={() => onBlur('company')}
          error={getError('company')}
        />
        <Input
          label="Position"
          placeholder="Software Engineer"
          value={entry.position}
          onChange={(e) => onUpdate({ position: e.target.value })}
          onBlur={() => onBlur('position')}
          error={getError('position')}
        />
      </div>

      {/* Location */}
      <Input
        label="Location"
        placeholder="San Francisco, CA"
        value={entry.location}
        onChange={(e) => onUpdate({ location: e.target.value })}
      />

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MonthYearPicker
          label="Start Date"
          value={entry.startDate}
          onChange={(val) => onUpdate({ startDate: val })}
        />
        {!entry.current && (
          <MonthYearPicker
            label="End Date"
            value={entry.endDate}
            onChange={(val) => onUpdate({ endDate: val })}
          />
        )}
      </div>

      {/* Currently working */}
      <Toggle
        checked={entry.current}
        onChange={(checked) =>
          onUpdate({ current: checked, endDate: checked ? '' : entry.endDate })
        }
        label="I currently work here"
        size="sm"
      />

      {/* Description & Highlights */}
      <RichTextEditor
        label="Description & Highlights"
        content={toEditorHtml(entry.description, entry.highlights)}
        onChange={(html) => {
          const { description, highlights } = fromEditorHtml(html);
          onUpdate({ description, highlights });
        }}
        placeholder="Describe your role and add bullet points for key achievements..."
      />
    </div>
  );
}
