// =============================================================================
// Resume Builder - ReviewEducationSection (review UI for education entries)
// =============================================================================

import { useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EducationEntry } from '@/types/resume';
import { InlineField } from './InlineField';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewEducationSectionProps {
  education: EducationEntry[];
  updateEntry: (section: string, index: number, updates: Record<string, unknown>) => void;
  removeEntry: (section: string, index: number) => void;
  onReorderEntries?: (fromIndex: number, toIndex: number) => void;
}

// ---------------------------------------------------------------------------
// Sortable education card
// ---------------------------------------------------------------------------

interface SortableEducationCardProps {
  entry: EducationEntry;
  index: number;
  updateEntry: ReviewEducationSectionProps['updateEntry'];
  removeEntry: ReviewEducationSectionProps['removeEntry'];
}

function SortableEducationCard({
  entry,
  index,
  updateEntry,
  removeEntry,
}: SortableEducationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 relative">
        {/* Drag handle */}
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <button
          type="button"
          onClick={() => removeEntry('education', index)}
          className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Remove entry"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pr-8 pl-6">
          <InlineField
            label="Institution"
            value={entry.institution}
            onChange={(v) => updateEntry('education', index, { institution: v })}
            placeholder="University name"
          />
          <InlineField
            label="Degree"
            value={entry.degree}
            onChange={(v) => updateEntry('education', index, { degree: v })}
            placeholder="Bachelor of Science"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pr-8 pl-6">
          <InlineField
            label="Field of Study"
            value={entry.field}
            onChange={(v) => updateEntry('education', index, { field: v })}
            placeholder="Computer Science"
          />
          <InlineField
            label="GPA"
            value={entry.gpa}
            onChange={(v) => updateEntry('education', index, { gpa: v })}
            placeholder="3.8/4.0"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pr-8 pl-6">
          <InlineField
            label="Start Date"
            value={entry.startDate}
            onChange={(v) => updateEntry('education', index, { startDate: v })}
            placeholder="Sep 2016"
          />
          <InlineField
            label="End Date"
            value={entry.endDate}
            onChange={(v) => updateEntry('education', index, { endDate: v })}
            placeholder="Jun 2020"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ReviewEducationSection({
  education,
  updateEntry,
  removeEntry,
  onReorderEntries,
}: ReviewEducationSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id && onReorderEntries) {
        const oldIndex = education.findIndex((e) => e.id === active.id);
        const newIndex = education.findIndex((e) => e.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          onReorderEntries(oldIndex, newIndex);
        }
      }
    },
    [education, onReorderEntries],
  );

  const entryIds = education.map((e) => e.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entryIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {education.map((entry, i) => (
            <SortableEducationCard
              key={entry.id}
              entry={entry}
              index={i}
              updateEntry={updateEntry}
              removeEntry={removeEntry}
            />
          ))}

          {education.length === 0 && (
            <p className="py-4 text-center text-sm italic text-gray-400 dark:text-gray-500">
              No education entries found.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
