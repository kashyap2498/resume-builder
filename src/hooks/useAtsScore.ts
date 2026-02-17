// =============================================================================
// Resume Builder - ATS Score Hook
// =============================================================================
// Takes resume data and an optional job description, computes an ATS
// compatibility score (0-100) across ten categories, and returns a
// detailed breakdown including matched and missing keywords.

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  computeAtsScore,
  type AtsScoreResult,
  type KeywordMatchDetail,
  type PrioritizedAction,
} from '@/utils/atsScorer';
import type { ParsedJobDescription } from '@/utils/jdParser';
import type { ResumeData } from '@/types/resume';
import type { IndustryId } from '@/constants/atsKeywords';

export interface UseAtsScoreReturn {
  score: number;
  breakdown: AtsScoreResult['breakdown'];
  keywords: AtsScoreResult['keywords'];
  isCalculating: boolean;
  passLikelihood: string;
  prioritizedActions: PrioritizedAction[];
  parsedJd: ParsedJobDescription | null;
  confidence: 'high' | 'medium' | 'low';
  requirements: AtsScoreResult['requirements'];
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
      hardSkillMatch: { score: 0, maxScore: 25, suggestions: [] },
      softSkillMatch: { score: 0, maxScore: 5, suggestions: [] },
      experienceAlignment: { score: 0, maxScore: 15, suggestions: [] },
      educationFit: { score: 0, maxScore: 5, suggestions: [] },
      keywordOptimization: { score: 0, maxScore: 10, suggestions: [] },
      contentImpact: { score: 0, maxScore: 15, suggestions: [] },
      atsParseability: { score: 0, maxScore: 10, suggestions: [] },
      sectionStructure: { score: 0, maxScore: 5, suggestions: [] },
      readability: { score: 0, maxScore: 5, suggestions: [] },
      tailoringSignals: { score: 0, maxScore: 5, suggestions: [] },
    },
    keywords: { matched: [], missing: [], partial: [], matchDetails: [] },
    isCalculating,
    passLikelihood: 'Unlikely to pass',
    prioritizedActions: [],
    parsedJd: null,
    confidence: 'low',
    requirements: { yearsRequired: null, yearsOnResume: 0, degreeRequired: null, degreeOnResume: null },
  };

  if (!result) return emptyResult;

  return {
    score: result.score,
    breakdown: result.breakdown,
    keywords: result.keywords,
    isCalculating,
    passLikelihood: result.passLikelihood,
    prioritizedActions: result.prioritizedActions,
    parsedJd: result.parsedJd,
    confidence: result.confidence,
    requirements: result.requirements,
  };
}
