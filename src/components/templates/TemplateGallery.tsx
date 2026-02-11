// =============================================================================
// Resume Builder - Template Gallery Modal
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '@/components/ui';
import { getAllTemplates } from '@/templates';
import { useResumeStore } from '@/store/resumeStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { trackEvent } from '@/utils/analytics';
import { useInView } from '@/hooks/useInView';
import type { TemplateCategory, TemplateDefinition } from '@/types/template';
import type { Resume } from '@/types/resume';

const ALL_CATEGORIES: Array<{ id: TemplateCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'professional', label: 'Professional' },
  { id: 'modern', label: 'Modern' },
  { id: 'technical', label: 'Technical' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'creative', label: 'Creative' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'academic', label: 'Academic' },
  { id: 'ats-optimized', label: 'ATS Optimized' },
];

// -- Lazy Template Card -------------------------------------------------------

interface LazyTemplateCardProps {
  template: TemplateDefinition;
  isActive: boolean;
  onSelect: (id: string) => void;
  currentResume: Resume | null;
}

function LazyTemplateCard({ template, isActive, onSelect, currentResume }: LazyTemplateCardProps) {
  const { ref, isInView } = useInView({ rootMargin: '100px' });

  const previewResume = useMemo(() => {
    if (!currentResume) return null;
    return { ...currentResume, templateId: template.id };
  }, [currentResume, template.id]);

  if (!isInView) {
    return (
      <div ref={ref} className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-pulse">
        <div className="w-full h-20 rounded-lg bg-gray-200 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-full mb-1" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    );
  }

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        className={cn(
          'relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:shadow-md w-full',
          isActive
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-200 bg-white hover:border-gray-300',
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </span>
        )}

        {/* Mini layout preview */}
        <div className="w-full h-[120px] rounded-lg border border-gray-200 overflow-hidden relative bg-white">
          {previewResume ? (
            <div
              className="pointer-events-none select-none"
              style={{
                width: 595,
                height: 842,
                transform: 'scale(0.336)',
                transformOrigin: 'top left',
              }}
            >
              <ErrorBoundary fallbackMessage="Preview unavailable">
                <template.previewComponent resume={previewResume} />
              </ErrorBoundary>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2">
              {template.layout === 'two-column' ? (
                <div className="flex gap-1 w-full h-full">
                  <div className="w-1/3 bg-gray-300 rounded-sm" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-2 bg-gray-300 rounded-sm w-3/4" />
                    <div className="h-1.5 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1.5 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1.5 bg-gray-200 rounded-sm w-5/6" />
                    <div className="flex-1" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 w-full h-full">
                  <div className="h-3 bg-gray-300 rounded-sm w-1/2 mx-auto" />
                  <div className="h-1.5 bg-gray-200 rounded-sm w-3/4 mx-auto" />
                  <div className="h-px bg-gray-200 w-full my-0.5" />
                  <div className="h-1.5 bg-gray-200 rounded-sm w-full" />
                  <div className="h-1.5 bg-gray-200 rounded-sm w-full" />
                  <div className="h-1.5 bg-gray-200 rounded-sm w-5/6" />
                  <div className="flex-1" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template info */}
        <span className="text-sm font-semibold text-gray-900">
          {template.name}
        </span>
        <span className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {template.description}
        </span>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
            {template.category.replace(/-/g, ' ')}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {template.layout === 'two-column' ? '2-col' : '1-col'}
          </span>
        </div>
      </button>
    </div>
  );
}

// -- Template Gallery ---------------------------------------------------------

export function TemplateGallery() {
  const showGallery = useUIStore((s) => s.showTemplateGallery);
  const toggleGallery = useUIStore((s) => s.toggleTemplateGallery);
  const currentResume = useResumeStore((s) => s.currentResume);
  const setTemplateId = useResumeStore((s) => s.setTemplateId);

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const allTemplates = getAllTemplates();
  const filtered = selectedCategory === 'all'
    ? allTemplates
    : allTemplates.filter((t) => t.category === selectedCategory);

  const handleSelect = useCallback((templateId: string) => {
    setTemplateId(templateId);
    trackEvent('template_changed', { template: templateId });
  }, [setTemplateId]);

  return (
    <Modal
      open={showGallery}
      onClose={toggleGallery}
      title="Choose Template"
      size="xl"
      className="!max-w-3xl"
    >
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <ErrorBoundary fallbackMessage="Failed to load template gallery">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((template) => (
          <LazyTemplateCard
            key={template.id}
            template={template}
            isActive={currentResume?.templateId === template.id}
            onSelect={handleSelect}
            currentResume={currentResume ?? null}
          />
        ))}
      </div>
      </ErrorBoundary>
    </Modal>
  );
}
