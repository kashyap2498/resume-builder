// =============================================================================
// Resume Builder - Custom Sections Editor
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, IconButton, EmptyState, RichTextEditor } from '@/components/ui';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';
import type { CustomSectionEntry } from '@/types/resume';

export function CustomSectionsEditor() {
  const customSections =
    useResumeStore((s) => s.currentResume?.data.customSections) ?? [];
  const addCustomSection = useResumeStore((s) => s.addCustomSection);
  const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
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

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddSection = () => {
    addCustomSection({ title: '', entries: [] });
  };

  const handleAddEntry = (sectionId: string, entries: CustomSectionEntry[]) => {
    const newEntry: CustomSectionEntry = {
      id: nanoid(),
      title: '',
      subtitle: '',
      date: '',
      description: '',
      highlights: [],
    };
    updateCustomSection(sectionId, {
      entries: [...entries, newEntry],
    });
    setExpandedEntries((prev) => new Set(prev).add(newEntry.id));
  };

  const handleUpdateEntry = (
    sectionId: string,
    entries: CustomSectionEntry[],
    entryId: string,
    update: Partial<CustomSectionEntry>
  ) => {
    updateCustomSection(sectionId, {
      entries: entries.map((e) =>
        e.id === entryId ? { ...e, ...update } : e
      ),
    });
  };

  const handleRemoveEntry = (
    sectionId: string,
    entries: CustomSectionEntry[],
    entryId: string
  ) => {
    updateCustomSection(sectionId, {
      entries: entries.filter((e) => e.id !== entryId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Custom Sections
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Create your own sections with custom titles and entries.
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
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                {/* Section header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50/50"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="shrink-0 text-gray-500">
                    {isSectionExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {section.title || 'Untitled Section'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {section.entries.length} entr
                      {section.entries.length !== 1 ? 'ies' : 'y'}
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
                  <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-4">
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

                    {/* Entries */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Entries
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="h-3.5 w-3.5" />}
                          onClick={() =>
                            handleAddEntry(section.id, section.entries)
                          }
                        >
                          Add Entry
                        </Button>
                      </div>

                      {section.entries.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No entries yet. Click "Add Entry" to get started.
                        </p>
                      )}

                      {section.entries.map((entry) => {
                        const isEntryExpanded = expandedEntries.has(entry.id);

                        return (
                          <div
                            key={entry.id}
                            className="rounded-md border border-gray-150 bg-gray-50/50 overflow-hidden"
                          >
                            {/* Entry header */}
                            <div
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleEntry(entry.id)}
                            >
                              <span className="shrink-0 text-gray-500">
                                {isEntryExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                              </span>
                              <p className="flex-1 text-sm text-gray-800 truncate">
                                {entry.title || 'Untitled Entry'}
                              </p>
                              <IconButton
                                icon={<Trash2 />}
                                label="Delete entry"
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEntry(
                                    section.id,
                                    section.entries,
                                    entry.id
                                  );
                                }}
                              />
                            </div>

                            {/* Entry body */}
                            {isEntryExpanded && (
                              <div className="px-3 pb-3 pt-2 border-t border-gray-100 space-y-3">
                                {/* Title & Subtitle */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <Input
                                    label="Title"
                                    placeholder="Entry title"
                                    value={entry.title}
                                    onChange={(e) =>
                                      handleUpdateEntry(
                                        section.id,
                                        section.entries,
                                        entry.id,
                                        { title: e.target.value }
                                      )
                                    }
                                  />
                                  <Input
                                    label="Subtitle"
                                    placeholder="Optional subtitle"
                                    value={entry.subtitle}
                                    onChange={(e) =>
                                      handleUpdateEntry(
                                        section.id,
                                        section.entries,
                                        entry.id,
                                        { subtitle: e.target.value }
                                      )
                                    }
                                  />
                                </div>

                                {/* Date */}
                                <Input
                                  label="Date"
                                  placeholder="Mar 2023"
                                  value={entry.date}
                                  onChange={(e) =>
                                    handleUpdateEntry(
                                      section.id,
                                      section.entries,
                                      entry.id,
                                      { date: e.target.value }
                                    )
                                  }
                                  wrapperClassName="sm:w-1/2"
                                />

                                {/* Description & Highlights */}
                                <RichTextEditor
                                  label="Description & Highlights"
                                  content={toEditorHtml(entry.description, entry.highlights)}
                                  onChange={(html) => {
                                    const { description, highlights } = fromEditorHtml(html);
                                    handleUpdateEntry(
                                      section.id,
                                      section.entries,
                                      entry.id,
                                      { description, highlights }
                                    );
                                  }}
                                  placeholder="Describe this entry and add bullet points..."
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
