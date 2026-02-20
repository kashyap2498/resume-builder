// =============================================================================
// Resume Builder - ReviewSectionCard (collapsible section for review interface)
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

type Confidence = 'complete' | 'incomplete' | 'empty';

interface ReviewSectionCardProps {
  title: string;
  count?: number;
  confidence: Confidence;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

const confidenceBadge: Record<
  Exclude<Confidence, 'empty'>,
  { label: string; icon: typeof Check; className: string }
> = {
  complete: {
    label: 'Complete',
    icon: Check,
    className: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  },
  incomplete: {
    label: 'Review',
    icon: AlertTriangle,
    className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  },
};

export function ReviewSectionCard({
  title,
  count,
  confidence,
  defaultExpanded,
  children,
  sectionRef,
}: ReviewSectionCardProps) {
  const [expanded, setExpanded] = useState(
    defaultExpanded ?? (confidence === 'incomplete')
  );

  const badge = confidence !== 'empty' ? confidenceBadge[confidence] : null;

  return (
    <div
      ref={sectionRef}
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-left',
          'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150',
          'rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
        )}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-200',
            !expanded && '-rotate-90'
          )}
        />

        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </span>

        {count !== undefined && count > 0 && (
          <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            ({count} {count === 1 ? 'entry' : 'entries'})
          </span>
        )}

        {badge && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              badge.className
            )}
          >
            <badge.icon className="h-3 w-3" />
            {badge.label}
          </span>
        )}
      </button>

      {/* Body with collapse animation */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
