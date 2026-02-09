// =============================================================================
// Resume Builder - ATS Panel Component
// =============================================================================
// Main ATS analysis panel for the sidebar. Contains a TextArea for pasting a
// job description, an "Analyze" button, and displays ATS score results below.

import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Button, TextArea } from '@/components/ui';
import { useResumeStore } from '@/store/resumeStore';
import { useAtsScore } from '@/hooks/useAtsScore';
import { AtsScoreCard } from './AtsScoreCard';
import { KeywordAnalysis } from './KeywordAnalysis';
import { FormattingWarnings } from './FormattingWarnings';

export function AtsPanel() {
  const [jobDescription, setJobDescription] = useState('');
  const [analyzedDescription, setAnalyzedDescription] = useState('');

  const currentResume = useResumeStore((s) => s.currentResume);
  const resumeData = currentResume?.data ?? null;

  const { score, breakdown, keywords, isCalculating } = useAtsScore(
    resumeData,
    analyzedDescription
  );

  const handleAnalyze = useCallback(() => {
    setAnalyzedDescription(jobDescription);
  }, [jobDescription]);

  const hasAnalyzed = analyzedDescription.trim().length > 0 || resumeData !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">ATS Analysis</h2>
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
      </div>

      {/* Results */}
      {resumeData && hasAnalyzed && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <AtsScoreCard score={score} isCalculating={isCalculating} />
          </div>

          {/* Keyword Analysis */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Keyword Analysis
            </h3>
            <KeywordAnalysis
              matched={keywords.matched}
              missing={keywords.missing}
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <FormattingWarnings breakdown={breakdown} />
          </div>
        </div>
      )}

      {/* Empty state when no resume is loaded */}
      {!resumeData && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Open a resume to start ATS analysis.
          </p>
        </div>
      )}
    </div>
  );
}
