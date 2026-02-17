// =============================================================================
// Resume Builder - ReviewExperienceSection (review UI for experience entries)
// =============================================================================

import { useCallback } from 'react';
import { X, ArrowUpDown, Scissors, ChevronsUp, GripVertical } from 'lucide-react';
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
import type { ExperienceEntry } from '@/types/resume';
import { RichTextEditor } from '@/components/ui';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';
import { InlineField } from './InlineField';

// ---------------------------------------------------------------------------
// Suspicious bullet detection
// ---------------------------------------------------------------------------

function isSuspiciousBullet(bullet: string): boolean {
  let signals = 0;
  // Short and no period
  if (bullet.length < 40 && !bullet.endsWith('.')) signals++;
  // Title-cased (>=70% capitalized words)
  const words = bullet.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 6) {
    const capCount = words.filter(w => /^[A-Z]/.test(w)).length;
    if (capCount / words.length >= 0.7) signals++;
  }
  // Contains date
  const DATE_RANGE_RE = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}|Present|Current)/i;
  const DATE_RE = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}|\d{4}/i;
  if (DATE_RANGE_RE.test(bullet) || DATE_RE.test(bullet)) signals++;
  // Contains company indicators
  const COMPANY_RE = /\b(?:Inc\.?|LLC|Corp|Ltd|Technologies|Solutions|Systems|Group|University|College|Hospital|Bank|Agency|Studio|Labs?)\b/i;
  if (COMPANY_RE.test(bullet)) signals++;
  return signals >= 2;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewExperienceSectionProps {
  experience: ExperienceEntry[];
  updateEntry: (section: string, index: number, updates: Record<string, unknown>) => void;
  removeEntry: (section: string, index: number) => void;
  onSwapPositionCompany?: (index: number) => void;
  onSplitEntry?: (entryIndex: number, bulletIndex: number) => void;
  onMergeEntries?: (indexA: number, indexB: number) => void;
  onReorderEntries?: (fromIndex: number, toIndex: number) => void;
}

// ---------------------------------------------------------------------------
// Sortable entry wrapper
// ---------------------------------------------------------------------------

interface SortableExperienceCardProps {
  entry: ExperienceEntry;
  index: number;
  updateEntry: ReviewExperienceSectionProps['updateEntry'];
  removeEntry: ReviewExperienceSectionProps['removeEntry'];
  onSwapPositionCompany?: (index: number) => void;
  onSplitEntry?: (entryIndex: number, bulletIndex: number) => void;
  onMergeEntries?: (indexA: number, indexB: number) => void;
  handleRichTextChange: (index: number, html: string) => void;
  isFirst: boolean;
}

function SortableExperienceCard({
  entry,
  index,
  updateEntry,
  removeEntry,
  onSwapPositionCompany,
  onSplitEntry,
  onMergeEntries,
  handleRichTextChange,
  isFirst,
}: SortableExperienceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Pre-compute suspicious bullets for highlight rendering
  const suspiciousBullets = entry.highlights.map(isSuspiciousBullet);
  const hasSuspicious = suspiciousBullets.some(Boolean);

  return (
    <div ref={setNodeRef} style={style}>
      {/* Merge with previous button */}
      {!isFirst && onMergeEntries && (
        <div className="flex justify-center -mb-1 py-1">
          <button
            type="button"
            onClick={() => onMergeEntries(index - 1, index)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            title="Merge with previous entry"
          >
            <ChevronsUp className="h-3 w-3" />
            Merge with previous
          </button>
        </div>
      )}

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
          onClick={() => removeEntry('experience', index)}
          className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Remove entry"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 gap-y-2 pr-8 pl-6 items-end">
          <InlineField
            label="Position"
            value={entry.position}
            onChange={(v) => updateEntry('experience', index, { position: v })}
            placeholder="Job title"
          />
          {onSwapPositionCompany && (
            <button
              type="button"
              onClick={() => onSwapPositionCompany(index)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-1"
              title="Swap position and company"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          )}
          {!onSwapPositionCompany && <div />}
          <InlineField
            label="Company"
            value={entry.company}
            onChange={(v) => updateEntry('experience', index, { company: v })}
            placeholder="Company name"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pr-8 pl-6">
          <InlineField
            label="Start Date"
            value={entry.startDate}
            onChange={(v) => updateEntry('experience', index, { startDate: v })}
            placeholder="Jan 2020"
          />
          <InlineField
            label="End Date"
            value={entry.endDate}
            onChange={(v) => updateEntry('experience', index, { endDate: v })}
            placeholder="Present"
          />
        </div>

        <div className="mt-2 pl-6">
          <InlineField
            label="Location"
            value={entry.location}
            onChange={(v) => updateEntry('experience', index, { location: v })}
            placeholder="City, State"
          />
        </div>

        {/* If suspicious bullets exist, show them individually before the rich editor */}
        {hasSuspicious && (
          <div className="mt-3 pl-6 space-y-1">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
              Flagged highlights (may be misclassified):
            </p>
            {entry.highlights.map((bullet, bIdx) => {
              const suspicious = suspiciousBullets[bIdx];
              if (!suspicious) return null;
              return (
                <div
                  key={bIdx}
                  className="group flex items-start gap-2 border-l-2 border-amber-400 pl-2 py-0.5 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-1">{bullet}</span>
                  {onSplitEntry && (
                    <button
                      type="button"
                      onClick={() => onSplitEntry(index, bIdx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-amber-500 hover:text-amber-700 p-0.5 flex-shrink-0"
                      title="Split entry at this bullet"
                    >
                      <Scissors className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pl-6">
          <RichTextEditor
            label="Description & Highlights"
            content={toEditorHtml(entry.description, entry.highlights)}
            onChange={(html) => handleRichTextChange(index, html)}
            placeholder="Describe your responsibilities and achievements..."
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ReviewExperienceSection({
  experience,
  updateEntry,
  removeEntry,
  onSwapPositionCompany,
  onSplitEntry,
  onMergeEntries,
  onReorderEntries,
}: ReviewExperienceSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleRichTextChange = useCallback(
    (index: number, html: string) => {
      const { description, highlights } = fromEditorHtml(html);
      updateEntry('experience', index, { description, highlights });
    },
    [updateEntry],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id && onReorderEntries) {
        const oldIndex = experience.findIndex((e) => e.id === active.id);
        const newIndex = experience.findIndex((e) => e.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          onReorderEntries(oldIndex, newIndex);
        }
      }
    },
    [experience, onReorderEntries],
  );

  const entryIds = experience.map((e) => e.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entryIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {experience.map((entry, i) => (
            <SortableExperienceCard
              key={entry.id}
              entry={entry}
              index={i}
              updateEntry={updateEntry}
              removeEntry={removeEntry}
              onSwapPositionCompany={onSwapPositionCompany}
              onSplitEntry={onSplitEntry}
              onMergeEntries={onMergeEntries}
              handleRichTextChange={handleRichTextChange}
              isFirst={i === 0}
            />
          ))}

          {experience.length === 0 && (
            <p className="py-4 text-center text-sm italic text-gray-400 dark:text-gray-500">
              No experience entries found.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
