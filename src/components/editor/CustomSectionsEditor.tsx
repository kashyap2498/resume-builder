// =============================================================================
// Resume Builder - Custom Sections Editor (Simplified)
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, IconButton, EmptyState, RichTextEditor } from '@/components/ui';

export function CustomSectionsEditor() {
  const customSections =
    useResumeStore((s) => s.currentResume?.data.customSections) ?? [];
  const addCustomSection = useResumeStore((s) => s.addCustomSection);
  const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const prevLengthRef = useRef(customSections.length);

  // Auto-expand newly added section
  useEffect(() => {
    if (customSections.length > prevLengthRef.current && customSections.length > 0) {
      const lastSection = customSections[customSections.length - 1];
      setExpandedSections((prev) => new Set(prev).add(lastSection.id));
    }
    prevLengthRef.current = customSections.length;
  }, [customSections]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSection = () => {
    addCustomSection({ title: '', content: '', entries: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Custom Sections
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create your own sections with custom titles and rich text content.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddSection}
        >
          Add Section
        </Button>
      </div>

      {customSections.length === 0 ? (
        <EmptyState
          icon={<LayoutList className="h-6 w-6" />}
          title="No custom sections"
          description="Create custom sections to add unique content to your resume."
          action={{
            label: 'Add Custom Section',
            onClick: handleAddSection,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-4">
          {customSections.map((section) => {
            const isSectionExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="rounded-lg border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card overflow-hidden"
              >
                {/* Section header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-raised transition-colors bg-gray-50/50 dark:bg-dark-raised/50"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="shrink-0 text-gray-500 dark:text-gray-400">
                    {isSectionExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {section.title || 'Untitled Section'}
                    </p>
                  </div>
                  <IconButton
                    icon={<Trash2 />}
                    label="Delete section"
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomSection(section.id);
                    }}
                  />
                </div>

                {/* Section body */}
                {isSectionExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-dark-edge space-y-4">
                    {/* Section title */}
                    <Input
                      label="Section Title"
                      placeholder="Conferences, Side Projects, etc."
                      value={section.title}
                      onChange={(e) =>
                        updateCustomSection(section.id, {
                          title: e.target.value,
                        })
                      }
                    />

                    {/* Rich text content */}
                    <RichTextEditor
                      label="Content"
                      content={section.content ?? ''}
                      onChange={(html) => {
                        updateCustomSection(section.id, {
                          content: html,
                        });
                      }}
                      placeholder="Write your section content here... Use the toolbar for formatting."
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
