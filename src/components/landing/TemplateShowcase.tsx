import { useState, useMemo, useRef, useEffect, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTemplates } from '@/templates';
import { sampleWithTemplate } from '@/data/sampleResume';
import type { TemplateCategory } from '@/types/template';
import type { TemplateProps } from '@/types/template';

// ---------------------------------------------------------------------------
// Category filter configuration
// ---------------------------------------------------------------------------

interface CategoryFilter {
  label: string;
  value: TemplateCategory | 'all';
}

const categories: CategoryFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'ATS-Optimized', value: 'ats-optimized' },
  { label: 'Professional', value: 'professional' },
  { label: 'Modern', value: 'modern' },
  { label: 'Technical', value: 'technical' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Creative', value: 'creative' },
  { label: 'Academic', value: 'academic' },
  { label: 'Minimal', value: 'minimal' },
];

// ---------------------------------------------------------------------------
// Template preview — scales to fill card width via ResizeObserver
// ---------------------------------------------------------------------------

const TEMPLATE_WIDTH = 816; // native render width in px

function TemplatePreview({
  Component,
  templateId,
}: {
  Component: ComponentType<TemplateProps>;
  templateId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / TEMPLATE_WIDTH);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="aspect-[85/110] overflow-hidden bg-white">
      <div
        className="pointer-events-none w-[816px] origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        <Component resume={sampleWithTemplate(templateId)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TemplateShowcase() {
  const [activeFilter, setActiveFilter] = useState<TemplateCategory | 'all'>('all');
  const allTemplates = getAllTemplates();

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? allTemplates
        : allTemplates.filter((t) => t.category === activeFilter),
    [activeFilter, allTemplates],
  );

  return (
    <section id="templates" className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        {/* Header */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Templates
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Professional templates for every industry.{' '}
          <span className="text-gray-400">All included.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
          18+ templates and growing. No "premium" locks. No grayed-out options.
          Pick any template. It's yours.
        </p>

        {/* Category filter tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 overflow-x-auto pb-2 max-md:flex-nowrap max-md:justify-start max-md:whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((template) => {
              const layoutLabel =
                template.layout === 'two-column' ? 'Two column' : 'Single column';

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  {/* Preview area — dynamically scaled to fill card */}
                  <TemplatePreview
                    Component={template.previewComponent}
                    templateId={template.id}
                  />

                  {/* Info below preview */}
                  <div className="px-3 pb-3 pt-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {template.name}
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] capitalize text-blue-600">
                        {template.category}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                        {layoutLabel}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
