// =============================================================================
// Resume Builder - Keyword Analysis Component
// =============================================================================
// Shows matched keywords (green badges) and missing keywords (red badges).

import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui';

interface KeywordAnalysisProps {
  matched: string[];
  missing: string[];
}

export function KeywordAnalysis({ matched, missing }: KeywordAnalysisProps) {
  if (matched.length === 0 && missing.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">
          Paste a job description above and click "Analyze" to see keyword matches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Matched Keywords */}
      {matched.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h4 className="text-sm font-medium text-gray-700">
              Matched Keywords ({matched.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((keyword) => (
              <Badge key={keyword} variant="green" size="sm">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missing.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h4 className="text-sm font-medium text-gray-700">
              Missing Keywords ({missing.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((keyword) => (
              <Badge key={keyword} variant="red" size="sm">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
