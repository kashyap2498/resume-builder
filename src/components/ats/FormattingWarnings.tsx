// =============================================================================
// Resume Builder - Formatting Warnings Component
// =============================================================================
// Lists suggestions from the ATS breakdown grouped by category. Each
// suggestion is shown with an icon: check for good, warning for needs work.

import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { AtsScoreBreakdown, CategoryScore } from '@/utils/atsScorer';

interface FormattingWarningsProps {
  breakdown: AtsScoreBreakdown;
}

interface CategoryDisplayConfig {
  key: keyof AtsScoreBreakdown;
  label: string;
}

const CATEGORIES: CategoryDisplayConfig[] = [
  { key: 'keywordMatch', label: 'Keyword Match' },
  { key: 'formatting', label: 'Formatting' },
  { key: 'contentQuality', label: 'Content Quality' },
  { key: 'sectionCompleteness', label: 'Section Completeness' },
  { key: 'readability', label: 'Readability' },
];

function CategorySection({
  label,
  category,
}: {
  label: string;
  category: CategoryScore;
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
          <span className="text-sm font-medium text-gray-700">{label}</span>
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
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
            isGood ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Suggestions */}
      {category.suggestions.length > 0 && (
        <ul className="space-y-1 pl-6">
          {category.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="text-xs text-gray-600 list-disc leading-relaxed"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FormattingWarnings({ breakdown }: FormattingWarningsProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-900">Detailed Breakdown</h3>
      {CATEGORIES.map(({ key, label }) => (
        <CategorySection
          key={key}
          label={label}
          category={breakdown[key]}
        />
      ))}
    </div>
  );
}
