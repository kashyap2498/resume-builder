// =============================================================================
// Resume Builder - SortableEntryCard (drag-and-drop wrapper for EntryCard)
// =============================================================================

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EntryCard } from './EntryCard';
import type { ReactNode } from 'react';

interface SortableEntryCardProps {
  id: string;
  title: string;
  subtitle?: string;
  onDelete: () => void;
  children: ReactNode;
}

export function SortableEntryCard({ id, ...props }: SortableEntryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EntryCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}
