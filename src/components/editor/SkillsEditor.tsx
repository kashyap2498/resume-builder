// =============================================================================
// Resume Builder - Skills Editor
// =============================================================================

import { Plus, Wrench, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, IconButton, EmptyState } from '@/components/ui';

/** Holds local string state so comma-separated input doesn't jump cursor on every keystroke. */
function SkillItemsInput({
  items,
  onCommit,
  label,
  placeholder,
  hint,
}: {
  items: string[];
  onCommit: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
}) {
  const [local, setLocal] = useState(items.join(', '));
  const committedRef = useRef(items);
  const localRef = useRef(local);
  localRef.current = local;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  // Sync from store when items change externally (undo, import)
  useEffect(() => {
    if (items !== committedRef.current) {
      setLocal(items.join(', '));
      committedRef.current = items;
    }
  }, [items]);

  // Commit unsaved local state on unmount (e.g. accordion collapse before blur)
  useEffect(() => {
    return () => {
      const current = localRef.current;
      const parsed = current.split(',').map((s) => s.trim()).filter(Boolean);
      if (JSON.stringify(parsed) !== JSON.stringify(committedRef.current)) {
        onCommitRef.current(parsed);
      }
    };
  }, []);

  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const parsed = local.split(',').map((s) => s.trim()).filter(Boolean);
        committedRef.current = parsed;
        onCommit(parsed);
      }}
      hint={hint}
    />
  );
}

export function SkillsEditor() {
  const skills = useResumeStore((s) => s.currentResume?.data.skills) ?? [];
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Skills</h3>
          <p className="text-sm text-gray-500 mt-1">
            Organize your skills into categories.
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
                      placeholder="Category (optional)"
                      value={cat.category}
                      onChange={(e) =>
                        handleUpdateCategoryName(cat.id, e.target.value)
                      }
                    />
                    <SkillItemsInput
                      items={cat.items}
                      onCommit={(items) =>
                        updateSkills(skills.map((c) => (c.id === cat.id ? { ...c, items } : c)))
                      }
                      label="Skills"
                      placeholder="JavaScript, TypeScript, Python, Go"
                      hint="Separate skills with commas"
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
