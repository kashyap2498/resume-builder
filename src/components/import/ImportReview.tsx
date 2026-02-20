// =============================================================================
// Resume Builder - ImportReview (main review UI for imported resume data)
// =============================================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Undo2, Redo2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useImportReviewState } from '@/hooks/useImportReviewState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ResumeData } from '@/types/resume';
import type { ParseMetadata } from '@/utils/resumeParser';
import {
  ReviewSectionCard,
  ReviewContactSection,
  ReviewExperienceSection,
  ReviewEducationSection,
  ReviewSkillsSection,
  ReviewGenericSection,
  ReviewHobbiesSection,
  SourceTextPanel,
  UnmatchedContentBlock,
} from './review';

// ---------------------------------------------------------------------------
// Section config for iteration
// ---------------------------------------------------------------------------

interface SectionDef {
  key: string;
  title: string;
  /** Return entry count (or undefined to always show) */
  getCount?: (state: ReturnType<typeof useImportReviewState>) => number;
  /** Return true if section should be displayed */
  shouldShow: (state: ReturnType<typeof useImportReviewState>) => boolean;
}

const SECTION_DEFS: SectionDef[] = [
  {
    key: 'contact',
    title: 'Contact Information',
    shouldShow: () => true, // always show
  },
  {
    key: 'summary',
    title: 'Professional Summary',
    shouldShow: (s) => s.summary.length > 0,
  },
  {
    key: 'experience',
    title: 'Experience',
    getCount: (s) => s.experience.length,
    shouldShow: (s) => s.experience.length > 0,
  },
  {
    key: 'education',
    title: 'Education',
    getCount: (s) => s.education.length,
    shouldShow: (s) => s.education.length > 0,
  },
  {
    key: 'skills',
    title: 'Skills',
    getCount: (s) => s.skills.length,
    shouldShow: (s) => s.skills.length > 0,
  },
  {
    key: 'projects',
    title: 'Projects',
    getCount: (s) => s.projects.length,
    shouldShow: (s) => s.projects.length > 0,
  },
  {
    key: 'certifications',
    title: 'Certifications',
    getCount: (s) => s.certifications.length,
    shouldShow: (s) => s.certifications.length > 0,
  },
  {
    key: 'languages',
    title: 'Languages',
    getCount: (s) => s.languages.length,
    shouldShow: (s) => s.languages.length > 0,
  },
  {
    key: 'volunteer',
    title: 'Volunteer Experience',
    getCount: (s) => s.volunteer.length,
    shouldShow: (s) => s.volunteer.length > 0,
  },
  {
    key: 'awards',
    title: 'Awards',
    getCount: (s) => s.awards.length,
    shouldShow: (s) => s.awards.length > 0,
  },
  {
    key: 'publications',
    title: 'Publications',
    getCount: (s) => s.publications.length,
    shouldShow: (s) => s.publications.length > 0,
  },
  {
    key: 'references',
    title: 'References',
    getCount: (s) => s.references.length,
    shouldShow: (s) => s.references.length > 0,
  },
  {
    key: 'hobbies',
    title: 'Hobbies & Interests',
    shouldShow: (s) => s.hobbies.items.length > 0,
  },
  {
    key: 'affiliations',
    title: 'Affiliations',
    getCount: (s) => s.affiliations.length,
    shouldShow: (s) => s.affiliations.length > 0,
  },
  {
    key: 'courses',
    title: 'Courses',
    getCount: (s) => s.courses.length,
    shouldShow: (s) => s.courses.length > 0,
  },
];

// Generic sections handled by ReviewGenericSection
const GENERIC_SECTIONS = new Set([
  'projects', 'certifications', 'languages', 'volunteer',
  'awards', 'publications', 'references', 'affiliations', 'courses',
]);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ImportReviewProps {
  parsedData: Partial<ResumeData>;
  rawText: string;
  parseMetadata?: ParseMetadata;
  onApply: (data: Partial<ResumeData>) => void;
  onCancel: () => void;
}

export function ImportReview({
  parsedData,
  rawText,
  parseMetadata,
  onApply,
  onCancel,
}: ImportReviewProps) {
  const state = useImportReviewState(parsedData);
  const isWide = useMediaQuery('(min-width: 768px)');
  const hasSourceText = !!(rawText && parseMetadata);
  const isSideBySide = isWide && hasSourceText;

  // Bidirectional sync: track which section is hovered on the right panel
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Section refs for scroll-to-section from SourceTextPanel
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToSection = useCallback((type: string) => {
    const el = sectionRefs.current.get(type);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const getSectionRef = useCallback(
    (key: string) => {
      const ref: React.RefObject<HTMLDivElement | null> = {
        get current() {
          return sectionRefs.current.get(key) ?? null;
        },
        set current(el: HTMLDivElement | null) {
          if (el) sectionRefs.current.set(key, el);
          else sectionRefs.current.delete(key);
        },
      };
      return ref;
    },
    [],
  );

  // Initialize unmatched chunks from parseMetadata
  useEffect(() => {
    if (parseMetadata && rawText) {
      const chunks = parseMetadata.unmatchedRanges.map((range) => ({
        text: rawText.substring(range.startOffset, range.endOffset).trim(),
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      })).filter((c) => c.text.length > 0);
      state.initUnmatchedChunks(chunks);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        state.undo();
      } else if (
        (e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey
      ) {
        e.preventDefault();
        state.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        state.redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state]);

  const visibleSections = useMemo(
    () => SECTION_DEFS.filter((def) => def.shouldShow(state)),
    [state],
  );

  const issueCount = useMemo(
    () => visibleSections.filter((def) => state.getSectionConfidence(def.key) === 'incomplete').length,
    [visibleSections, state],
  );

  const handleImport = useCallback(() => {
    onApply(state.buildPartialResumeData());
  }, [onApply, state]);

  const updateHobbiesItems = useCallback(
    (items: string[]) => {
      state.setHobbies({ items });
    },
    [state],
  );

  // ---------------------------------------------------------------------------
  // Section renderer
  // ---------------------------------------------------------------------------

  function renderSectionContent(key: string) {
    switch (key) {
      case 'contact':
        return (
          <ReviewContactSection
            contact={state.contact}
            updateContact={state.updateContact}
          />
        );

      case 'summary':
        return (
          <div>
            <textarea
              value={state.summary}
              onChange={(e) => state.updateSummary(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-dark-edge dark:bg-dark-card dark:text-gray-100 dark:placeholder:text-gray-500"
              placeholder="Professional summary..."
            />
          </div>
        );

      case 'experience':
        return (
          <ReviewExperienceSection
            experience={state.experience}
            updateEntry={state.updateEntry}
            removeEntry={state.removeEntry}
            onSwapPositionCompany={state.swapPositionCompany}
            onSplitEntry={state.splitEntry}
            onMergeEntries={(indexA, indexB) => state.mergeEntries('experience', indexA, indexB)}
            onReorderEntries={(from, to) => state.reorderEntries('experience', from, to)}
            onUpdateBullet={state.updateBullet}
            onRemoveBullet={state.removeBullet}
            onAddBullet={state.addBullet}
            onReorderBullet={state.reorderBullet}
            onMoveBullet={state.moveBullet}
          />
        );

      case 'education':
        return (
          <ReviewEducationSection
            education={state.education}
            updateEntry={state.updateEntry}
            removeEntry={state.removeEntry}
            onReorderEntries={(from, to) => state.reorderEntries('education', from, to)}
          />
        );

      case 'skills':
        return (
          <ReviewSkillsSection
            skills={state.skills}
            updateEntry={state.updateEntry}
            removeEntry={state.removeEntry}
          />
        );

      case 'hobbies':
        return (
          <ReviewHobbiesSection
            items={state.hobbies.items}
            onChangeItems={updateHobbiesItems}
          />
        );

      default:
        if (GENERIC_SECTIONS.has(key)) {
          const entries = state[key as keyof typeof state];
          return (
            <ReviewGenericSection
              sectionType={key}
              entries={entries as Record<string, unknown>[]}
              updateEntry={state.updateEntry}
              removeEntry={state.removeEntry}
            />
          );
        }
        return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Review cards (shared between both layouts)
  // ---------------------------------------------------------------------------

  const reviewCards = (
    <>
      {visibleSections.map((def) => (
        <div
          key={def.key}
          onMouseEnter={() => setHoveredSection(def.key)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <ReviewSectionCard
            title={def.title}
            count={def.getCount?.(state)}
            confidence={state.getSectionConfidence(def.key)}
            sectionRef={getSectionRef(def.key)}
          >
            {renderSectionContent(def.key)}
          </ReviewSectionCard>
        </div>
      ))}

      {/* Unmatched content */}
      <UnmatchedContentBlock
        chunks={state.unmatchedChunks}
        onAddAs={state.addUnmatchedAs}
        onSkip={state.skipUnmatchedChunk}
      />
    </>
  );

  return (
    <div className="flex flex-col">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-1 py-3 backdrop-blur dark:border-dark-edge dark:bg-dark-card/95">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {visibleSections.length} section{visibleSections.length !== 1 ? 's' : ''} found
          </span>
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              {issueCount} need{issueCount === 1 ? 's' : ''} review
            </span>
          )}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={state.undo}
              disabled={!state.canUndo}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={state.redo}
              disabled={!state.canRedo}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleImport}>
            Import to Resume
          </Button>
        </div>
      </div>

      {/* Main content area */}
      {isSideBySide ? (
        /* Side-by-side layout (>= 768px with source text) */
        <div className="flex gap-4 py-4" style={{ height: 'calc(95vh - 200px)' }}>
          {/* Left panel: Source text (always visible) */}
          <div className="w-2/5 min-w-0 flex-shrink-0">
            <SourceTextPanel
              rawText={rawText}
              sectionRanges={parseMetadata!.sectionRanges}
              onScrollToSection={scrollToSection}
              alwaysExpanded
              highlightedSection={hoveredSection}
            />
          </div>

          {/* Right panel: Review cards (scrollable) */}
          <div className="w-3/5 min-w-0 space-y-3 overflow-y-auto pr-1">
            {reviewCards}
          </div>
        </div>
      ) : (
        /* Stacked layout (< 768px or no source text) */
        <div className="space-y-3 overflow-y-auto py-4" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {/* Source text panel (collapsible in stacked mode) */}
          {hasSourceText && (
            <SourceTextPanel
              rawText={rawText}
              sectionRanges={parseMetadata!.sectionRanges}
              onScrollToSection={scrollToSection}
            />
          )}

          {reviewCards}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-dark-edge">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleImport}>
          Import to Resume
        </Button>
      </div>
    </div>
  );
}
