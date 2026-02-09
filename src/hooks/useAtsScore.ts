// =============================================================================
// Resume Builder - ATS Score Hook
// =============================================================================
// Takes resume data and an optional job description, computes an ATS
// compatibility score (0-100) across five categories, and returns a
// detailed breakdown including matched and missing keywords.

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  computeAtsScore,
  type AtsScoreResult,
} from '@/utils/atsScorer';
import type { ResumeData } from '@/types/resume';
import type { IndustryId } from '@/constants/atsKeywords';

export interface UseAtsScoreReturn {
  score: number;
  breakdown: AtsScoreResult['breakdown'];
  keywords: AtsScoreResult['keywords'];
  isCalculating: boolean;
}

export function useAtsScore(
  resumeData: ResumeData | null,
  jobDescription: string = '',
  industryId?: IndustryId
): UseAtsScoreReturn {
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce the job description so we don't recalculate on every keystroke
  const debouncedJobDescription = useDebounce(jobDescription, 500);

  const result = useMemo<AtsScoreResult | null>(() => {
    if (!resumeData) return null;

    setIsCalculating(true);
    try {
      return computeAtsScore(resumeData, debouncedJobDescription, industryId);
    } finally {
      setIsCalculating(false);
    }
  }, [resumeData, debouncedJobDescription, industryId]);

  // Reset calculating flag after render
  useEffect(() => {
    setIsCalculating(false);
  }, [result]);

  const emptyResult: UseAtsScoreReturn = {
    score: 0,
    breakdown: {
      keywordMatch: { score: 0, maxScore: 40, suggestions: [] },
      formatting: { score: 0, maxScore: 20, suggestions: [] },
      contentQuality: { score: 0, maxScore: 20, suggestions: [] },
      sectionCompleteness: { score: 0, maxScore: 10, suggestions: [] },
      readability: { score: 0, maxScore: 10, suggestions: [] },
    },
    keywords: { matched: [], missing: [] },
    isCalculating,
  };

  if (!result) return emptyResult;

  return {
    score: result.score,
    breakdown: result.breakdown,
    keywords: result.keywords,
    isCalculating,
  };
}
