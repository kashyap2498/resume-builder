// =============================================================================
// Resume Builder - ATS Panel Component
// =============================================================================
// Main ATS analysis panel for the sidebar. Contains a TextArea for pasting a
// job description, an "Analyze" button, and displays ATS score results below.

import { useState, useCallback } from 'react';
import { FileText, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button, TextArea, Select } from '@/components/ui';
import { useResumeStore } from '@/store/resumeStore';
import { useAtsScore } from '@/hooks/useAtsScore';
import { INDUSTRY_KEYWORDS, type IndustryId } from '@/constants/atsKeywords';
import { AtsScoreCard } from './AtsScoreCard';
import { KeywordAnalysis } from './KeywordAnalysis';
import { FormattingWarnings } from './FormattingWarnings';

const INDUSTRY_OPTIONS = [
  { value: '', label: 'No industry selected' },
  ...INDUSTRY_KEYWORDS.map((i) => ({ value: i.id, label: i.name })),
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string; icon: typeof AlertCircle }> = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Info },
  low: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Info },
};

export function AtsPanel() {
  const [jobDescription, setJobDescription] = useState('');
  const [analyzedDescription, setAnalyzedDescription] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | ''>('');

  const currentResume = useResumeStore((s) => s.currentResume);
  const resumeData = currentResume?.data ?? null;

  const { score, breakdown, keywords, isCalculating, passLikelihood, prioritizedActions, parsedJd, confidence, requirements } = useAtsScore(
    resumeData,
    analyzedDescription,
    selectedIndustry || undefined
  );

  const handleAnalyze = useCallback(() => {
    setAnalyzedDescription(jobDescription);
  }, [jobDescription]);

  const hasAnalyzed = analyzedDescription.trim().length > 0 || resumeData !== null;

  // Count prioritized actions by priority
  const priorityCounts = prioritizedActions.reduce(
    (acc, a) => {
      acc[a.priority] = (acc[a.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count detected skills from parsed JD
  const requiredCount = parsedJd?.sections.required
    ? parsedJd.sections.required.split(/[,\n;]/).filter((s) => s.trim()).length
    : 0;
  const preferredCount = parsedJd?.sections.preferred
    ? parsedJd.sections.preferred.split(/[,\n;]/).filter((s) => s.trim()).length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ATS Analysis</h2>
      </div>

      {/* Industry Selector */}
      <div>
        <Select
          label="Industry"
          options={INDUSTRY_OPTIONS}
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as IndustryId | '')}
          hint="Select an industry to score against common keywords even without a job description."
        />
      </div>

      {/* Job Description Input */}
      <div className="space-y-3">
        <TextArea
          label="Job Description"
          placeholder="Paste the job description here to analyze keyword match..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          hint="Provide a job description for a more accurate keyword analysis."
        />
        <Button
          onClick={handleAnalyze}
          disabled={!resumeData}
          loading={isCalculating}
          fullWidth
          icon={<FileText className="h-4 w-4" />}
        >
          Analyze
        </Button>

        {/* JD Parsing Quality Indicator */}
        {parsedJd && analyzedDescription.trim().length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              Detected {requiredCount > 0 ? `${requiredCount} required` : 'no required'}
              {preferredCount > 0 ? `, ${preferredCount} preferred skills` : ' skills'}
              {requirements.yearsRequired
                ? ` | ${requirements.yearsRequired}+ years required (you have ~${requirements.yearsOnResume})`
                : ''}
              {requirements.degreeRequired
                ? ` | ${requirements.degreeRequired}'s degree${requirements.degreeOnResume ? ` (you have ${requirements.degreeOnResume}'s)` : ''}`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {resumeData && hasAnalyzed && (
        <div className="space-y-6">
          {/* Priority Action Summary */}
          {prioritizedActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
                const count = priorityCounts[p] || 0;
                if (count === 0) return null;
                const config = PRIORITY_COLORS[p];
                const Icon = config.icon;
                return (
                  <div
                    key={p}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
                  >
                    <Icon className="h-3 w-3" />
                    {count} {p}
                  </div>
                );
              })}
            </div>
          )}

          {/* Score Card */}
          <div className="rounded-xl border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card p-5">
            <AtsScoreCard
              score={score}
              isCalculating={isCalculating}
              passLikelihood={passLikelihood}
              confidence={confidence}
            />
          </div>

          {/* Keyword Analysis */}
          <div className="rounded-xl border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Keyword Analysis
            </h3>
            <KeywordAnalysis
              matched={keywords.matched}
              missing={keywords.missing}
              partial={keywords.partial}
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="rounded-xl border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card p-4">
            <FormattingWarnings
              breakdown={breakdown}
              prioritizedActions={prioritizedActions}
            />
          </div>
        </div>
      )}

      {/* Empty state when no resume is loaded */}
      {!resumeData && (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-dark-edge-strong bg-gray-50 dark:bg-dark-card p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-500 dark:text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Open a resume to start ATS analysis.
          </p>
        </div>
      )}
    </div>
  );
}
