// =============================================================================
// Resume Builder - Projects Editor
// =============================================================================

import { Plus, FolderKanban } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState, RichTextEditor } from '@/components/ui';
import { EntryCard } from './EntryCard';
import { toEditorHtml, fromEditorHtml } from '@/utils/richTextConvert';

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

                {/* Description & Highlights */}
                <RichTextEditor
                  label="Description & Highlights"
                  content={toEditorHtml(entry.description, entry.highlights)}
                  onChange={(html) => {
                    const { description, highlights } = fromEditorHtml(html);
                    updateProject(entry.id, { description, highlights });
                  }}
                  placeholder="Describe what the project does and add bullet points for key features..."
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
