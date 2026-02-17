// =============================================================================
// Resume Builder - EntryCard (shared collapsible card wrapper for list entries)
// =============================================================================

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Trash2, Copy, GripVertical } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/utils/cn';

interface EntryCardProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  onDelete: () => void;
  onDuplicate?: () => void;
  children: ReactNode;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
}

export function EntryCard({
  title,
  subtitle,
  defaultExpanded = false,
  onDelete,
  onDuplicate,
  children,
  className,
  dragHandleProps,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card shadow-[var(--shadow-glass-sm)] overflow-hidden transition-all duration-200',
        dragHandleProps && 'hover:shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {dragHandleProps ? (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          </div>
        ) : (
          <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
        )}

        <span className="shrink-0 text-gray-500">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {title || 'Untitled'}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
          )}
        </div>

        {onDuplicate && (
          <IconButton
            icon={<Copy />}
            label="Duplicate entry"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          />
        )}

        <IconButton
          icon={<Trash2 />}
          label="Delete entry"
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
        />
      </div>

      {/* Body with animation */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100/50 dark:border-dark-edge">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${title || 'this entry'}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
