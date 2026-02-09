// =============================================================================
// Resume Builder - Awards Editor
// =============================================================================

import { Plus, Trophy } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function AwardsEditor() {
  const awards = useResumeStore((s) => s.currentResume?.data.awards) ?? [];
  const addAward = useResumeStore((s) => s.addAward);
  const updateAward = useResumeStore((s) => s.updateAward);
  const removeAward = useResumeStore((s) => s.removeAward);

  const handleAdd = () => {
    addAward({
      title: '',
      issuer: '',
      date: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Awards</h3>
          <p className="text-sm text-gray-500 mt-1">
            Highlight awards and recognitions you have received.
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

      {awards.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No awards added"
          description="Add awards and recognitions to stand out."
          action={{
            label: 'Add Award',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {awards.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.title || 'New Award'}
              subtitle={entry.issuer || undefined}
              onDelete={() => removeAward(entry.id)}
            >
              <div className="space-y-4">
                {/* Title & Issuer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Award Title"
                    placeholder="Employee of the Year"
                    value={entry.title}
                    onChange={(e) =>
                      updateAward(entry.id, { title: e.target.value })
                    }
                  />
                  <Input
                    label="Issuer"
                    placeholder="Acme Corporation"
                    value={entry.issuer}
                    onChange={(e) =>
                      updateAward(entry.id, { issuer: e.target.value })
                    }
                  />
                </div>

                {/* Date */}
                <Input
                  label="Date"
                  placeholder="Dec 2023"
                  value={entry.date}
                  onChange={(e) =>
                    updateAward(entry.id, { date: e.target.value })
                  }
                  wrapperClassName="sm:w-1/2"
                />

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Describe the award and why you received it..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updateAward(entry.id, { description: e.target.value })
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
