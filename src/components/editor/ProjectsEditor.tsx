// =============================================================================
// Resume Builder - Projects Editor
// =============================================================================

import { Plus, X, FolderKanban } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function ProjectsEditor() {
  const projects = useResumeStore((s) => s.currentResume?.data.projects) ?? [];
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  const handleAdd = () => {
    addProject({
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
      highlights: [],
    });
  };

  const handleAddHighlight = (id: string, highlights: string[]) => {
    updateProject(id, { highlights: [...highlights, ''] });
  };

  const handleUpdateHighlight = (
    id: string,
    highlights: string[],
    index: number,
    value: string
  ) => {
    const updated = [...highlights];
    updated[index] = value;
    updateProject(id, { highlights: updated });
  };

  const handleRemoveHighlight = (
    id: string,
    highlights: string[],
    index: number
  ) => {
    updateProject(id, {
      highlights: highlights.filter((_, i) => i !== index),
    });
  };

  const handleTechnologiesChange = (id: string, value: string) => {
    const techs = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateProject(id, { technologies: techs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Projects</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showcase personal or professional projects you have worked on.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects added"
          description="Add projects to demonstrate your skills and initiative."
          action={{
            label: 'Add Project',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.name || 'New Project'}
              subtitle={entry.technologies.join(', ') || undefined}
              onDelete={() => removeProject(entry.id)}
            >
              <div className="space-y-4">
                {/* Name & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Project Name"
                    placeholder="My Awesome App"
                    value={entry.name}
                    onChange={(e) =>
                      updateProject(entry.id, { name: e.target.value })
                    }
                  />
                  <Input
                    label="URL"
                    placeholder="https://github.com/user/project"
                    value={entry.url}
                    onChange={(e) =>
                      updateProject(entry.id, { url: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    placeholder="Mar 2023"
                    value={entry.startDate}
                    onChange={(e) =>
                      updateProject(entry.id, { startDate: e.target.value })
                    }
                  />
                  <Input
                    label="End Date"
                    placeholder="Jun 2023"
                    value={entry.endDate}
                    onChange={(e) =>
                      updateProject(entry.id, { endDate: e.target.value })
                    }
                  />
                </div>

                {/* Technologies */}
                <Input
                  label="Technologies"
                  placeholder="React, TypeScript, Node.js"
                  value={entry.technologies.join(', ')}
                  onChange={(e) =>
                    handleTechnologiesChange(entry.id, e.target.value)
                  }
                  hint="Separate technologies with commas"
                />

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Describe what the project does and your contributions..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updateProject(entry.id, { description: e.target.value })
                  }
                />

                {/* Highlights */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Highlights
                  </label>
                  {entry.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Built a feature that..."
                        value={highlight}
                        onChange={(e) =>
                          handleUpdateHighlight(
                            entry.id,
                            entry.highlights,
                            idx,
                            e.target.value
                          )
                        }
                        wrapperClassName="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveHighlight(entry.id, entry.highlights, idx)
                        }
                        className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove highlight"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() =>
                      handleAddHighlight(entry.id, entry.highlights)
                    }
                  >
                    Add Highlight
                  </Button>
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
