// =============================================================================
// Resume Builder - EntryWarnings (compact warning display with actions)
// =============================================================================

import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { EntryWarning } from '@/utils/entryWarnings';

interface EntryWarningsProps {
  warnings: EntryWarning[];
  onAction: (warning: EntryWarning) => void;
}

const levelConfig: Record<string, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-600 dark:text-amber-400',
  },
  suggestion: {
    icon: Lightbulb,
    className: 'text-violet-600 dark:text-violet-400',
  },
};

export function EntryWarnings({ warnings, onAction }: EntryWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-1">
      {warnings.map((warning) => {
        const config = levelConfig[warning.level] ?? levelConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={warning.id}
            className={cn(
              'flex flex-wrap items-start gap-2 rounded-md px-2 py-1 text-xs',
              warning.level === 'warning' && 'bg-amber-50 dark:bg-amber-900/10',
              warning.level === 'suggestion' && 'bg-violet-50 dark:bg-violet-900/10',
              warning.level === 'info' && 'bg-blue-50 dark:bg-blue-900/10',
            )}
          >
            <Icon className={cn('h-3.5 w-3.5 flex-shrink-0 mt-0.5', config.className)} />
            <span className="flex-[1_1_60%] min-w-0 text-gray-700 dark:text-gray-300">
              {warning.message}
            </span>
            {warning.action && (
              <button
                type="button"
                onClick={() => onAction(warning)}
                className={cn(
                  'flex-shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium transition-colors',
                  'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
                  'hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
                )}
              >
                {warning.action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
