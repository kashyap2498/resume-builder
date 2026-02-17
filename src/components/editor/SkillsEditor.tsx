// =============================================================================
// Resume Builder - Skills Editor (Redesigned)
// =============================================================================

import { Plus, Wrench, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, IconButton, EmptyState, TagInput } from '@/components/ui';
import type { SkillsLayout } from '@/types/resume';

const LAYOUT_OPTIONS: { value: SkillsLayout; label: string }[] = [
  { value: 'comma', label: 'Comma' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'vertical', label: 'Vertical' },
  { value: '2-column', label: '2-Col' },
  { value: '3-column', label: '3-Col' },
];

export function SkillsEditor() {
  const skills = useResumeStore((s) => s.currentResume?.data.skills) ?? [];
  const skillsLayout = useResumeStore((s) => s.currentResume?.data.skillsLayout) ?? 'comma';
  const skillsMode = useResumeStore((s) => s.currentResume?.data.skillsMode) ?? 'freeform';
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const updateSkillsLayout = useResumeStore((s) => s.updateSkillsLayout);
  const updateSkillsMode = useResumeStore((s) => s.updateSkillsMode);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // -- Freeform helpers -------------------------------------------------------

  const freeformItems = (): string[] => {
    if (skills.length === 0) return [];
    // In freeform mode, all items are merged into a flat list
    return skills.flatMap((c) => c.items);
  };

  const setFreeformItems = (items: string[]) => {
    if (skills.length === 0) {
      updateSkills([{ id: nanoid(), category: '', items }]);
    } else {
      // Store as single category with empty name
      updateSkills([{ ...skills[0], category: '', items }]);
    }
  };

  // -- Mode switching ---------------------------------------------------------

  const handleModeSwitch = (mode: 'freeform' | 'categories') => {
    if (mode === skillsMode) return;

    if (mode === 'freeform') {
      // Merge all category items into one flat list
      const allItems = skills.flatMap((c) => c.items);
      updateSkills([{ id: skills[0]?.id || nanoid(), category: '', items: allItems }]);
    } else {
      // Keep skills in a "General" category if switching from freeform
      if (skills.length <= 1) {
        const items = skills[0]?.items ?? [];
        updateSkills([{ id: skills[0]?.id || nanoid(), category: 'General', items }]);
        if (skills[0]?.id) setExpandedIds(new Set([skills[0].id]));
      }
    }
    updateSkillsMode(mode);
  };

  // -- Category helpers -------------------------------------------------------

  const handleAddCategory = () => {
    const newCategory = { id: nanoid(), category: '', items: [] as string[] };
    updateSkills([...skills, newCategory]);
    setExpandedIds((prev) => new Set(prev).add(newCategory.id));
  };

  const handleRemoveCategory = (id: string) => {
    updateSkills(skills.filter((c) => c.id !== id));
  };

  const handleUpdateCategoryName = (id: string, category: string) => {
    updateSkills(skills.map((c) => (c.id === id ? { ...c, category } : c)));
  };

  const handleUpdateCategoryItems = (id: string, items: string[]) => {
    updateSkills(skills.map((c) => (c.id === id ? { ...c, items } : c)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Skills</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add your skills and choose how they display on your resume.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-dark-raised w-fit">
        <button
          type="button"
          onClick={() => handleModeSwitch('freeform')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            skillsMode === 'freeform'
              ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Freeform
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('categories')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            skillsMode === 'categories'
              ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Layout Picker */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Display Format
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateSkillsLayout(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                skillsLayout === opt.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-edge hover:border-gray-300 dark:hover:border-dark-edge-strong'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Freeform Mode */}
      {skillsMode === 'freeform' && (
        <TagInput
          tags={freeformItems()}
          onChange={setFreeformItems}
          label="Skills"
          placeholder="Type a skill and press Enter..."
        />
      )}

      {/* Categories Mode */}
      {skillsMode === 'categories' && (
        <div className="space-y-3">
          {skills.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-6 w-6" />}
              title="No skill categories"
              description="Add skill categories to organize your abilities."
              action={{
                label: 'Add Category',
                onClick: handleAddCategory,
                icon: <Plus className="h-4 w-4" />,
              }}
            />
          ) : (
            <>
              {skills.map((cat) => {
                const isExpanded = expandedIds.has(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="rounded-lg border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card overflow-hidden"
                  >
                    {/* Category header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-raised transition-colors"
                      onClick={() => toggleExpand(cat.id)}
                    >
                      <span className="shrink-0 text-gray-500 dark:text-gray-400">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {cat.category || 'Untitled Category'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.items.length} skill{cat.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <IconButton
                        icon={<Trash2 />}
                        label="Delete category"
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(cat.id);
                        }}
                      />
                    </div>

                    {/* Category body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-dark-edge space-y-4">
                        <Input
                          label="Category Name"
                          placeholder="Category (optional)"
                          value={cat.category}
                          onChange={(e) =>
                            handleUpdateCategoryName(cat.id, e.target.value)
                          }
                        />
                        <TagInput
                          tags={cat.items}
                          onChange={(items) => handleUpdateCategoryItems(cat.id, items)}
                          label="Skills"
                          placeholder="Type a skill and press Enter..."
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={handleAddCategory}
              >
                Add Category
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
