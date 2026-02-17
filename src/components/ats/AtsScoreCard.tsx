// =============================================================================
// Resume Builder - ATS Score Card Component
// =============================================================================
// Displays the overall ATS score (0-100) with a circular SVG progress ring.
// 5-tier color system with pass likelihood label and confidence indicator.

interface AtsScoreCardProps {
  score: number;
  isCalculating?: boolean;
  passLikelihood?: string;
  confidence?: 'high' | 'medium' | 'low';
}

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  bg: string;
  label: string;
} {
  if (score >= 85) {
    return {
      stroke: 'stroke-green-600',
      text: 'text-green-700',
      bg: 'bg-green-50',
      label: 'Strong pass',
    };
  }
  if (score >= 70) {
    return {
      stroke: 'stroke-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Likely pass',
    };
  }
  if (score >= 55) {
    return {
      stroke: 'stroke-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Uncertain',
    };
  }
  if (score >= 40) {
    return {
      stroke: 'stroke-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      label: 'At risk',
    };
  }
  return {
    stroke: 'stroke-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Unlikely to pass',
  };
}

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'High confidence' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Medium confidence' },
  low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'Low confidence' },
};

export function AtsScoreCard({ score, isCalculating = false, passLikelihood, confidence }: AtsScoreCardProps) {
  const { stroke, text, bg, label } = getScoreColor(score);
  const displayLabel = passLikelihood ?? label;

  // SVG circle parameters
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const confidenceStyle = confidence ? CONFIDENCE_STYLES[confidence] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${stroke} transition-all duration-700 ease-out`}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isCalculating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          ) : (
            <>
              <span className={`text-3xl font-bold ${text}`}>{score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
            </>
          )}
        </div>
      </div>
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}
      >
        {isCalculating ? 'Calculating...' : displayLabel}
      </div>
      {confidenceStyle && !isCalculating && (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${confidenceStyle.bg} ${confidenceStyle.text}`}
        >
          {confidenceStyle.label}
        </div>
      )}
    </div>
  );
}
