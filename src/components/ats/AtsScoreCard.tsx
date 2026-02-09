// =============================================================================
// Resume Builder - ATS Score Card Component
// =============================================================================
// Displays the overall ATS score (0-100) with a circular SVG progress ring.
// Color-coded: red (<50), yellow (50-75), green (>75).

interface AtsScoreCardProps {
  score: number;
  isCalculating?: boolean;
}

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  bg: string;
  label: string;
} {
  if (score >= 75) {
    return {
      stroke: 'stroke-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Great',
    };
  }
  if (score >= 50) {
    return {
      stroke: 'stroke-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Needs Work',
    };
  }
  return {
    stroke: 'stroke-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Poor',
  };
}

export function AtsScoreCard({ score, isCalculating = false }: AtsScoreCardProps) {
  const { stroke, text, bg, label } = getScoreColor(score);

  // SVG circle parameters
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

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
            className="text-gray-100"
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
              <span className="text-xs text-gray-500">/ 100</span>
            </>
          )}
        </div>
      </div>
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}
      >
        {isCalculating ? 'Calculating...' : `ATS Score: ${label}`}
      </div>
    </div>
  );
}
