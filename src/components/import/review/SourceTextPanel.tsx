// =============================================================================
// Resume Builder - SourceTextPanel (collapsible raw text with colored highlights)
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SourceRange } from '@/utils/resumeParser';

const SECTION_COLORS: Record<string, { bg: string; darkBg: string }> = {
  contact: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30' },
  summary: { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-900/30' },
  experience: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30' },
  education: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/30' },
  skills: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30' },
  projects: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-900/30' },
  certifications: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-900/30' },
  languages: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-900/30' },
  volunteer: { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30' },
  awards: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30' },
  publications: { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-900/30' },
  references: { bg: 'bg-lime-100', darkBg: 'dark:bg-lime-900/30' },
  affiliations: { bg: 'bg-fuchsia-100', darkBg: 'dark:bg-fuchsia-900/30' },
  courses: { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-900/30' },
};

interface SourceTextPanelProps {
  rawText: string;
  sectionRanges: Map<string, SourceRange>;
  onScrollToSection: (sectionType: string) => void;
}

interface TextSegment {
  text: string;
  sectionType: string | null;
}

function buildSegments(
  rawText: string,
  sectionRanges: Map<string, SourceRange>,
): TextSegment[] {
  // Build sorted list of ranges with their section types
  const ranges: Array<{ start: number; end: number; type: string }> = [];
  for (const [type, range] of sectionRanges) {
    ranges.push({ start: range.startOffset, end: range.endOffset, type });
  }
  ranges.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    // Add unmatched text before this range
    if (range.start > cursor) {
      const text = rawText.substring(cursor, range.start);
      if (text) segments.push({ text, sectionType: null });
    }
    // Add the section range text
    const text = rawText.substring(range.start, range.end);
    if (text) segments.push({ text, sectionType: range.type });
    cursor = Math.max(cursor, range.end);
  }

  // Trailing unmatched text
  if (cursor < rawText.length) {
    const text = rawText.substring(cursor);
    if (text) segments.push({ text, sectionType: null });
  }

  return segments;
}

export function SourceTextPanel({
  rawText,
  sectionRanges,
  onScrollToSection,
}: SourceTextPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const segments = useMemo(
    () => buildSegments(rawText, sectionRanges),
    [rawText, sectionRanges],
  );

  if (!rawText) return null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Toggle bar */}
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
      >
        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {expanded ? 'Hide Original' : 'Show Original'}
        </span>
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 text-gray-400 transition-transform duration-200',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {/* Expandable text area */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-4 font-mono text-xs whitespace-pre-wrap border-t border-gray-200 dark:border-gray-700">
              {segments.map((seg, i) => {
                if (seg.sectionType) {
                  const colors = SECTION_COLORS[seg.sectionType];
                  return (
                    <span
                      key={i}
                      className={cn(
                        'cursor-pointer rounded-sm',
                        colors?.bg ?? 'bg-gray-100',
                        colors?.darkBg ?? 'dark:bg-gray-700/30',
                      )}
                      onClick={() => onScrollToSection(seg.sectionType!)}
                      title={`Click to scroll to ${seg.sectionType}`}
                    >
                      {seg.text}
                    </span>
                  );
                }
                return (
                  <span key={i} className="text-gray-400 dark:text-gray-500">
                    {seg.text}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
