// =============================================================================
// Resume Builder - EntryCard (shared collapsible card wrapper for list entries)
// =============================================================================

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Trash2, GripVertical } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { cn } from '@/utils/cn';

interface EntryCardProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  onDelete: () => void;
  children: ReactNode;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
}

export function EntryCard({
  title,
  subtitle,
  defaultExpanded = false,
  onDelete,
  children,
  className,
  dragHandleProps,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {dragHandleProps ? (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-300" />
          </div>
        ) : (
          <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
        )}

        <span className="shrink-0 text-gray-400">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {title || 'Untitled'}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        <IconButton
          icon={<Trash2 />}
          label="Delete entry"
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
