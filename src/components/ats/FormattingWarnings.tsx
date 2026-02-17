// =============================================================================
// Resume Builder - Formatting Warnings Component
// =============================================================================
// Lists suggestions from the ATS breakdown grouped by category. Each
// suggestion is shown with an icon and colored priority dots when available.

import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { AtsScoreBreakdown, CategoryScore, PrioritizedAction } from '@/utils/atsScorer';

interface FormattingWarningsProps {
  breakdown: AtsScoreBreakdown;
  prioritizedActions?: PrioritizedAction[];
}

interface CategoryDisplayConfig {
  key: keyof AtsScoreBreakdown;
  label: string;
}

const CATEGORIES: CategoryDisplayConfig[] = [
  { key: 'hardSkillMatch', label: 'Hard Skill Match' },
  { key: 'softSkillMatch', label: 'Soft Skill Match' },
  { key: 'experienceAlignment', label: 'Experience Alignment' },
  { key: 'educationFit', label: 'Education Fit' },
  { key: 'keywordOptimization', label: 'Keyword Optimization' },
  { key: 'contentImpact', label: 'Content Impact' },
  { key: 'atsParseability', label: 'ATS Parseability' },
  { key: 'sectionStructure', label: 'Section Structure' },
  { key: 'readability', label: 'Readability' },
  { key: 'tailoringSignals', label: 'Tailoring Signals' },
];

const PRIORITY_DOT_COLORS: Record<PrioritizedAction['priority'], string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

function getPriorityForSuggestion(
  suggestion: string,
  actions: PrioritizedAction[]
): PrioritizedAction['priority'] | null {
  // Try to match suggestion text to a prioritized action
  const lower = suggestion.toLowerCase();
  for (const action of actions) {
    // Match on overlapping keywords between action and suggestion
    const actionWords = action.action.toLowerCase().split(/\s+/);
    const matchCount = actionWords.filter((w) => w.length > 3 && lower.includes(w)).length;
    if (matchCount >= 2) return action.priority;
  }
  return null;
}

function CategorySection({
  label,
  category,
  prioritizedActions = [],
}: {
  label: string;
  category: CategoryScore;
  prioritizedActions?: PrioritizedAction[];
}) {
  const percentage = Math.round((category.score / category.maxScore) * 100);
  const isGood = percentage >= 75;

  return (
    <div className="space-y-2">
      {/* Category header with score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGood ? (
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span
          className={`text-xs font-medium ${
            isGood ? 'text-green-600' : 'text-yellow-600'
          }`}
        >
          {category.score}/{category.maxScore}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
            isGood ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Suggestions with priority dots */}
      {category.suggestions.length > 0 && (
        <ul className="space-y-1 pl-6">
          {category.suggestions.map((suggestion, index) => {
            const priority = getPriorityForSuggestion(suggestion, prioritizedActions);
            return (
              <li
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400 list-disc leading-relaxed"
              >
                <span className="flex items-center gap-1.5">
                  {priority && (
                    <span
                      className={`inline-block h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT_COLORS[priority]}`}
                      title={`${priority} priority`}
                    />
                  )}
                  {suggestion}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FormattingWarnings({ breakdown, prioritizedActions = [] }: FormattingWarningsProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Detailed Breakdown</h3>
      {CATEGORIES.map(({ key, label }) => (
        <CategorySection
          key={key}
          label={label}
          category={breakdown[key]}
          prioritizedActions={prioritizedActions}
        />
      ))}
    </div>
  );
}
