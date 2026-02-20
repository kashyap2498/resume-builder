// =============================================================================
// Resume Builder - ReviewExperienceSection (review UI for experience entries)
// =============================================================================

import { useCallback, useMemo } from 'react';
import { X, ArrowUpDown, ChevronsUp, GripVertical, Scissors } from 'lucide-react';
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
import { InlineField } from './InlineField';
import { BulletList } from './BulletList';
import { EntryWarnings } from './EntryWarnings';
import { computeExperienceWarnings } from '@/utils/entryWarnings';
import type { EntryWarning } from '@/utils/entryWarnings';

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
  onUpdateBullet?: (entryIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet?: (entryIndex: number, bulletIndex: number) => void;
  onAddBullet?: (entryIndex: number, text?: string) => void;
  onReorderBullet?: (entryIndex: number, fromIndex: number, toIndex: number) => void;
  onMoveBullet?: (fromEntryIndex: number, bulletIndex: number, toEntryIndex: number) => void;
}

// ---------------------------------------------------------------------------
// Sortable entry wrapper
// ---------------------------------------------------------------------------

interface SortableExperienceCardProps {
  entry: ExperienceEntry;
  index: number;
  totalEntries: number;
  updateEntry: ReviewExperienceSectionProps['updateEntry'];
  removeEntry: ReviewExperienceSectionProps['removeEntry'];
  onSwapPositionCompany?: (index: number) => void;
  onSplitEntry?: (entryIndex: number, bulletIndex: number) => void;
  onMergeEntries?: (indexA: number, indexB: number) => void;
  onUpdateBullet?: (entryIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet?: (entryIndex: number, bulletIndex: number) => void;
  onAddBullet?: (entryIndex: number, text?: string) => void;
  onReorderBullet?: (entryIndex: number, fromIndex: number, toIndex: number) => void;
  onMoveBullet?: (fromEntryIndex: number, bulletIndex: number, toEntryIndex: number) => void;
  warnings: EntryWarning[];
  onWarningAction: (warning: EntryWarning) => void;
  isFirst: boolean;
}

function SortableExperienceCard({
  entry,
  index,
  totalEntries,
  updateEntry,
  removeEntry,
  onSwapPositionCompany,
  onSplitEntry,
  onMergeEntries,
  onUpdateBullet,
  onRemoveBullet,
  onAddBullet,
  onReorderBullet,
  onMoveBullet,
  warnings,
  onWarningAction,
  isFirst,
}: SortableExperienceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Smart split suggestion banner for entries with 8+ bullets */}
      {entry.highlights.length > 8 && onSplitEntry && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2">
          <Scissors className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-300 flex-1">
            This entry has {entry.highlights.length} bullets and may contain multiple roles.
          </span>
          <button
            type="button"
            onClick={() => onSplitEntry(index, Math.floor(entry.highlights.length / 2))}
            className="text-sm font-medium text-amber-700 dark:text-amber-400 underline hover:text-amber-900 dark:hover:text-amber-200 whitespace-nowrap"
          >
            Split at midpoint
          </button>
        </div>
      )}

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

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 relative">
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

        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 gap-y-2 pr-6 pl-5 items-end">
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

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pr-6 pl-5">
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

        <div className="mt-2 pl-5">
          <InlineField
            label="Location"
            value={entry.location}
            onChange={(v) => updateEntry('experience', index, { location: v })}
            placeholder="City, State"
          />
        </div>

        {/* Per-entry warnings */}
        {warnings.length > 0 && (
          <div className="mt-3 pl-5">
            <EntryWarnings warnings={warnings} onAction={onWarningAction} />
          </div>
        )}

        {/* Bullet list (replaces RichTextEditor) */}
        <div className="mt-3 pl-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Highlights
          </p>
          {onUpdateBullet && onRemoveBullet && onAddBullet && onReorderBullet ? (
            <BulletList
              entryIndex={index}
              highlights={entry.highlights}
              onUpdateBullet={onUpdateBullet}
              onRemoveBullet={onRemoveBullet}
              onAddBullet={onAddBullet}
              onReorderBullet={onReorderBullet}
              onSplitEntry={onSplitEntry}
              onMoveBullet={onMoveBullet}
              hasPreviousEntry={index > 0}
              hasNextEntry={index < totalEntries - 1}
            />
          ) : (
            /* Fallback: read-only bullet display */
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
              {entry.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
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
  onUpdateBullet,
  onRemoveBullet,
  onAddBullet,
  onReorderBullet,
  onMoveBullet,
}: ReviewExperienceSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

  // Compute warnings for all entries
  const allWarnings = useMemo(
    () => experience.map((entry, i) => computeExperienceWarnings(entry, i)),
    [experience],
  );

  const handleWarningAction = useCallback(
    (warning: EntryWarning) => {
      if (!warning.action) return;
      const payload = warning.action.payload as Record<string, number> | undefined;

      switch (warning.action.type) {
        case 'split':
          if (payload && onSplitEntry) {
            onSplitEntry(payload.entryIndex, payload.bulletIndex);
          }
          break;
        case 'swap':
          if (payload && onSwapPositionCompany) {
            onSwapPositionCompany(payload.entryIndex);
          }
          break;
        case 'promote_bullet':
          if (payload) {
            const entry = experience[payload.entryIndex];
            if (entry && entry.highlights.length > 0) {
              updateEntry('experience', payload.entryIndex, { company: entry.highlights[0] });
              onRemoveBullet?.(payload.entryIndex, 0);
            }
          }
          break;
      }
    },
    [onSplitEntry, onSwapPositionCompany, experience, updateEntry, onRemoveBullet],
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
              totalEntries={experience.length}
              updateEntry={updateEntry}
              removeEntry={removeEntry}
              onSwapPositionCompany={onSwapPositionCompany}
              onSplitEntry={onSplitEntry}
              onMergeEntries={onMergeEntries}
              onUpdateBullet={onUpdateBullet}
              onRemoveBullet={onRemoveBullet}
              onAddBullet={onAddBullet}
              onReorderBullet={onReorderBullet}
              onMoveBullet={onMoveBullet}
              warnings={allWarnings[i]}
              onWarningAction={handleWarningAction}
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
