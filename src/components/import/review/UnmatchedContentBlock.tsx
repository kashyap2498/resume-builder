// =============================================================================
// Resume Builder - UnmatchedContentBlock (shows unmatched text chunks)
// =============================================================================

import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const SECTION_OPTIONS = [
  { value: 'experience', label: 'Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'languages', label: 'Languages' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'awards', label: 'Awards' },
  { value: 'publications', label: 'Publications' },
  { value: 'references', label: 'References' },
  { value: 'affiliations', label: 'Affiliations' },
  { value: 'courses', label: 'Courses' },
] as const;

export interface UnmatchedChunk {
  text: string;
  startOffset: number;
  endOffset: number;
}

interface UnmatchedContentBlockProps {
  chunks: UnmatchedChunk[];
  onAddAs: (chunkIndex: number, sectionType: string) => void;
  onSkip: (chunkIndex: number) => void;
}

function ChunkItem({
  chunk,
  index,
  onAddAs,
  onSkip,
}: {
  chunk: UnmatchedChunk;
  index: number;
  onAddAs: (chunkIndex: number, sectionType: string) => void;
  onSkip: (chunkIndex: number) => void;
}) {
  const [selectedType, setSelectedType] = useState('');

  return (
    <div className="space-y-2">
      <pre className="border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded p-3 font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto text-gray-700 dark:text-gray-300">
        {chunk.text}
      </pre>
      <div className="flex items-center gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Add as…</option>
          {SECTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedType}
          onClick={() => {
            if (selectedType) onAddAs(index, selectedType);
          }}
          className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => onSkip(index)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-3 w-3" />
          Skip
        </button>
      </div>
    </div>
  );
}

export function UnmatchedContentBlock({
  chunks,
  onAddAs,
  onSkip,
}: UnmatchedContentBlockProps) {
  if (chunks.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Unmatched Content
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800/50 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
          {chunks.length}
        </span>
      </div>

      {/* Chunks */}
      <div className="space-y-4">
        {chunks.map((chunk, i) => (
          <ChunkItem
            key={`${chunk.startOffset}-${chunk.endOffset}`}
            chunk={chunk}
            index={i}
            onAddAs={onAddAs}
            onSkip={onSkip}
          />
        ))}
      </div>
    </div>
  );
}
