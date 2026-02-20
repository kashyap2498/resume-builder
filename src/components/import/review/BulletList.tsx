// =============================================================================
// Resume Builder - BulletList (discrete bullet editing for experience entries)
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, GripVertical, Scissors, ChevronUp, ChevronDown } from 'lucide-react';
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
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Suspicious bullet detection (same heuristic as before)
// ---------------------------------------------------------------------------

function isSuspiciousBullet(bullet: string): boolean {
  let signals = 0;
  if (bullet.length < 40 && !bullet.endsWith('.')) signals++;
  const words = bullet.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 6) {
    const capCount = words.filter(w => /^[A-Z]/.test(w)).length;
    if (capCount / words.length >= 0.7) signals++;
  }
  const DATE_RANGE_RE = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}|Present|Current)/i;
  const DATE_RE = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}|\d{4}/i;
  if (DATE_RANGE_RE.test(bullet) || DATE_RE.test(bullet)) signals++;
  const COMPANY_RE = /\b(?:Inc\.?|LLC|Corp|Ltd|Technologies|Solutions|Systems|Group|University|College|Hospital|Bank|Agency|Studio|Labs?)\b/i;
  if (COMPANY_RE.test(bullet)) signals++;
  return signals >= 2;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BulletListProps {
  entryIndex: number;
  highlights: string[];
  onUpdateBullet: (entryIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet: (entryIndex: number, bulletIndex: number) => void;
  onAddBullet: (entryIndex: number, text?: string) => void;
  onReorderBullet: (entryIndex: number, fromIndex: number, toIndex: number) => void;
  onSplitEntry?: (entryIndex: number, bulletIndex: number) => void;
  onMoveBullet?: (fromEntryIndex: number, bulletIndex: number, toEntryIndex: number) => void;
  hasPreviousEntry: boolean;
  hasNextEntry: boolean;
}

// ---------------------------------------------------------------------------
// Inline editable bullet
// ---------------------------------------------------------------------------

interface EditableBulletProps {
  id: string;
  text: string;
  index: number;
  entryIndex: number;
  isSuspicious: boolean;
  onUpdate: (entryIndex: number, bulletIndex: number, text: string) => void;
  onRemove: (entryIndex: number, bulletIndex: number) => void;
  onSplitEntry?: (entryIndex: number, bulletIndex: number) => void;
  onMoveToPrev?: () => void;
  onMoveToNext?: () => void;
  hasPreviousEntry: boolean;
  hasNextEntry: boolean;
}

function EditableBullet({
  id,
  text,
  index,
  entryIndex,
  isSuspicious,
  onUpdate,
  onRemove,
  onSplitEntry,
  onMoveToPrev,
  onMoveToNext,
  hasPreviousEntry,
  hasNextEntry,
}: EditableBulletProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(text);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [text]);

  const handleFinishEdit = useCallback(() => {
    setIsEditing(false);
    if (editText.trim() !== text) {
      onUpdate(entryIndex, index, editText.trim());
    }
  }, [editText, text, onUpdate, entryIndex, index]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  }, [handleFinishEdit, text]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-1.5 rounded-md py-1 px-1 -mx-1 transition-colors',
        isSuspicious && 'border-l-2 border-amber-400 pl-1.5',
        !isDragging && 'hover:bg-gray-50 dark:hover:bg-gray-700/30',
      )}
    >
      {/* Drag handle */}
      <div
        className="mt-1 cursor-grab text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Bullet content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-blue-300 bg-white px-2 py-0.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 dark:border-blue-600"
          />
        ) : (
          <span
            onClick={handleStartEdit}
            className={cn(
              'block cursor-text text-sm text-gray-700 dark:text-gray-300 py-0.5',
              isSuspicious && 'text-amber-800 dark:text-amber-300',
            )}
            title="Click to edit"
          >
            {text || <span className="italic text-gray-400">Empty bullet</span>}
          </span>
        )}
      </div>

      {/* Action buttons (always visible for touch/accessibility) */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Move to previous entry */}
        {hasPreviousEntry && onMoveToPrev && (
          <button
            type="button"
            onClick={onMoveToPrev}
            className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Move to previous entry"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}

        {/* Move to next entry */}
        {hasNextEntry && onMoveToNext && (
          <button
            type="button"
            onClick={onMoveToNext}
            className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Move to next entry"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {/* Split at this bullet */}
        {onSplitEntry && (
          <button
            type="button"
            onClick={() => onSplitEntry(entryIndex, index)}
            className={cn(
              'rounded p-1 transition-opacity',
              isSuspicious
                ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100',
            )}
            title="Split entry at this bullet"
          >
            <Scissors className="h-4 w-4" />
          </button>
        )}

        {/* Delete bullet */}
        <button
          type="button"
          onClick={() => onRemove(entryIndex, index)}
          className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Remove bullet"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BulletList main component
// ---------------------------------------------------------------------------

export function BulletList({
  entryIndex,
  highlights,
  onUpdateBullet,
  onRemoveBullet,
  onAddBullet,
  onReorderBullet,
  onSplitEntry,
  onMoveBullet,
  hasPreviousEntry,
  hasNextEntry,
}: BulletListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Generate stable IDs for sortable items
  const bulletIds = highlights.map((_, i) => `bullet-${entryIndex}-${i}`);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = bulletIds.indexOf(active.id as string);
        const newIndex = bulletIds.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          onReorderBullet(entryIndex, oldIndex, newIndex);
        }
      }
    },
    [bulletIds, entryIndex, onReorderBullet],
  );

  return (
    <div className="space-y-0.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={bulletIds} strategy={verticalListSortingStrategy}>
          {highlights.map((bullet, bIdx) => (
            <EditableBullet
              key={bulletIds[bIdx]}
              id={bulletIds[bIdx]}
              text={bullet}
              index={bIdx}
              entryIndex={entryIndex}
              isSuspicious={isSuspiciousBullet(bullet)}
              onUpdate={onUpdateBullet}
              onRemove={onRemoveBullet}
              onSplitEntry={onSplitEntry}
              onMoveToPrev={
                hasPreviousEntry && onMoveBullet
                  ? () => onMoveBullet(entryIndex, bIdx, entryIndex - 1)
                  : undefined
              }
              onMoveToNext={
                hasNextEntry && onMoveBullet
                  ? () => onMoveBullet(entryIndex, bIdx, entryIndex + 1)
                  : undefined
              }
              hasPreviousEntry={hasPreviousEntry}
              hasNextEntry={hasNextEntry}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add bullet button */}
      <button
        type="button"
        onClick={() => onAddBullet(entryIndex)}
        className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add bullet
      </button>
    </div>
  );
}
