// =============================================================================
// Resume Builder - Skills Editor
// =============================================================================

import { useState } from 'react';
import { Plus, X, Wrench, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Select, Button, IconButton, EmptyState } from '@/components/ui';
import type { SkillCategory, SkillProficiency } from '@/types/resume';

const proficiencyOptions = [
  { value: '1', label: '1 - Beginner' },
  { value: '2', label: '2 - Basic' },
  { value: '3', label: '3 - Intermediate' },
  { value: '4', label: '4 - Advanced' },
  { value: '5', label: '5 - Expert' },
];

export function SkillsEditor() {
  const skills = useResumeStore((s) => s.currentResume?.data.skills) ?? [];
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddCategory = () => {
    const newCategory: SkillCategory = {
      id: nanoid(),
      category: '',
      items: [],
    };
    updateSkills([...skills, newCategory]);
    setExpandedIds((prev) => new Set(prev).add(newCategory.id));
  };

  const handleRemoveCategory = (id: string) => {
    updateSkills(skills.filter((c) => c.id !== id));
  };

  const handleUpdateCategoryName = (id: string, category: string) => {
    updateSkills(
      skills.map((c) => (c.id === id ? { ...c, category } : c))
    );
  };

  const handleAddItem = (categoryId: string) => {
    updateSkills(
      skills.map((c) =>
        c.id === categoryId
          ? { ...c, items: [...c.items, { name: '', proficiency: 3 as SkillProficiency }] }
          : c
      )
    );
  };

  const handleUpdateItem = (
    categoryId: string,
    index: number,
    field: 'name' | 'proficiency',
    value: string | number
  ) => {
    updateSkills(
      skills.map((c) => {
        if (c.id !== categoryId) return c;
        const items = [...c.items];
        items[index] = {
          ...items[index],
          [field]: field === 'proficiency' ? Number(value) : value,
        };
        return { ...c, items };
      })
    );
  };

  const handleRemoveItem = (categoryId: string, index: number) => {
    updateSkills(
      skills.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((_, i) => i !== index) }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Skills</h3>
          <p className="text-sm text-gray-500 mt-1">
            Organize your skills into categories with proficiency levels.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </div>

      {skills.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No skills added"
          description="Add skill categories to showcase your technical and professional abilities."
          action={{
            label: 'Add Skill Category',
            onClick: handleAddCategory,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {skills.map((cat) => {
            const isExpanded = expandedIds.has(cat.id);
            return (
              <div
                key={cat.id}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                {/* Category header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(cat.id)}
                >
                  <span className="shrink-0 text-gray-500">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {cat.category || 'Untitled Category'}
                    </p>
                    <p className="text-xs text-gray-500">
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
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                    <Input
                      label="Category Name"
                      placeholder="Programming Languages"
                      value={cat.category}
                      onChange={(e) =>
                        handleUpdateCategoryName(cat.id, e.target.value)
                      }
                    />

                    {/* Skill items */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Skills
                      </label>
                      {cat.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-end gap-2"
                        >
                          <Input
                            placeholder="Skill name"
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateItem(cat.id, idx, 'name', e.target.value)
                            }
                            wrapperClassName="flex-1"
                          />
                          <Select
                            value={String(item.proficiency)}
                            onChange={(e) =>
                              handleUpdateItem(
                                cat.id,
                                idx,
                                'proficiency',
                                e.target.value
                              )
                            }
                            options={proficiencyOptions}
                            wrapperClassName="w-44"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(cat.id, idx)}
                            className="shrink-0 p-2 mb-0.5 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="Remove skill"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Plus className="h-3.5 w-3.5" />}
                        onClick={() => handleAddItem(cat.id)}
                      >
                        Add Skill
                      </Button>
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
