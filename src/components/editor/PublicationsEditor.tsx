// =============================================================================
// Resume Builder - Publications Editor
// =============================================================================

import { Plus, BookOpen } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function PublicationsEditor() {
  const publications =
    useResumeStore((s) => s.currentResume?.data.publications) ?? [];
  const addPublication = useResumeStore((s) => s.addPublication);
  const updatePublication = useResumeStore((s) => s.updatePublication);
  const removePublication = useResumeStore((s) => s.removePublication);

  const handleAdd = () => {
    addPublication({
      title: '',
      publisher: '',
      date: '',
      url: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Publications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add articles, papers, or books you have published.
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

      {publications.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No publications added"
          description="Add your published works to demonstrate thought leadership."
          action={{
            label: 'Add Publication',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {publications.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.title || 'New Publication'}
              subtitle={entry.publisher || undefined}
              onDelete={() => removePublication(entry.id)}
            >
              <div className="space-y-4">
                {/* Title */}
                <Input
                  label="Title"
                  placeholder="Building Scalable Systems with Microservices"
                  value={entry.title}
                  onChange={(e) =>
                    updatePublication(entry.id, { title: e.target.value })
                  }
                />

                {/* Publisher & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Publisher"
                    placeholder="IEEE, O'Reilly, Medium"
                    value={entry.publisher}
                    onChange={(e) =>
                      updatePublication(entry.id, {
                        publisher: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Date"
                    placeholder="Mar 2023"
                    value={entry.date}
                    onChange={(e) =>
                      updatePublication(entry.id, { date: e.target.value })
                    }
                  />
                </div>

                {/* URL */}
                <Input
                  label="URL"
                  placeholder="https://example.com/publication"
                  value={entry.url}
                  onChange={(e) =>
                    updatePublication(entry.id, { url: e.target.value })
                  }
                />

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Brief summary of the publication..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updatePublication(entry.id, {
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
