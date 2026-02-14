// =============================================================================
// Resume Builder - Education Editor
// =============================================================================

import { Plus, GraduationCap } from 'lucide-react';
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
import { Input, Button, EmptyState, MonthYearPicker, RichTextEditor } from '@/components/ui';
import { SortableEntryCard } from './SortableEntryCard';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';

export function EducationEditor() {
  const education = useResumeStore((s) => s.currentResume?.data.education) ?? [];
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);
  const reorderEducation = useResumeStore((s) => s.reorderEducation);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((e) => e.id === active.id);
      const newIndex = education.findIndex((e) => e.id === over.id);
      const newOrder = arrayMove(
        education.map((e) => e.id),
        oldIndex,
        newIndex,
      );
      reorderEducation(newOrder);
    }
  };

  const handleAdd = () => {
    addEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
      highlights: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Education</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add your educational background and academic achievements.
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

      {education.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="No education added"
          description="Add your educational background to highlight your qualifications."
          action={{
            label: 'Add Education',
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
            items={education.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
          {education.map((entry) => (
            <SortableEntryCard
              key={entry.id}
              id={entry.id}
              title={entry.institution || 'New Education'}
              subtitle={
                [entry.degree, entry.field].filter(Boolean).join(' in ') ||
                undefined
              }
              onDelete={() => removeEducation(entry.id)}
            >
              <div className="space-y-4">
                {/* Institution */}
                <Input
                  label="Institution"
                  placeholder="Stanford University"
                  value={entry.institution}
                  onChange={(e) =>
                    updateEducation(entry.id, { institution: e.target.value })
                  }
                />

                {/* Degree & Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Degree"
                    placeholder="Bachelor of Science"
                    value={entry.degree}
                    onChange={(e) =>
                      updateEducation(entry.id, { degree: e.target.value })
                    }
                  />
                  <Input
                    label="Field of Study"
                    placeholder="Computer Science"
                    value={entry.field}
                    onChange={(e) =>
                      updateEducation(entry.id, { field: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MonthYearPicker
                    label="Start Date"
                    value={entry.startDate}
                    onChange={(val) =>
                      updateEducation(entry.id, { startDate: val })
                    }
                  />
                  <MonthYearPicker
                    label="End Date"
                    value={entry.endDate}
                    onChange={(val) =>
                      updateEducation(entry.id, { endDate: val })
                    }
                  />
                </div>

                {/* GPA */}
                <Input
                  label="GPA"
                  placeholder="3.8 / 4.0"
                  value={entry.gpa}
                  onChange={(e) =>
                    updateEducation(entry.id, { gpa: e.target.value })
                  }
                  wrapperClassName="sm:w-1/2"
                />

                {/* Description & Highlights */}
                <RichTextEditor
                  label="Description & Highlights"
                  content={toEditorHtml(entry.description, entry.highlights)}
                  onChange={(html) => {
                    const { description, highlights } = fromEditorHtml(html);
                    updateEducation(entry.id, { description, highlights });
                  }}
                  placeholder="Relevant coursework, thesis, achievements..."
                />
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
