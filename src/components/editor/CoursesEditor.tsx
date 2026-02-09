// =============================================================================
// Resume Builder - Courses Editor
// =============================================================================

import { Plus, BookMarked } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, TextArea, Button, EmptyState } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function CoursesEditor() {
  const courses = useResumeStore((s) => s.currentResume?.data.courses) ?? [];
  const addCourse = useResumeStore((s) => s.addCourse);
  const updateCourse = useResumeStore((s) => s.updateCourse);
  const removeCourse = useResumeStore((s) => s.removeCourse);

  const handleAdd = () => {
    addCourse({
      name: '',
      institution: '',
      completionDate: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Courses</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add relevant courses and training programs.
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

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-6 w-6" />}
          title="No courses added"
          description="Add courses and training to show continuous learning."
          action={{
            label: 'Add Course',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {courses.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.name || 'New Course'}
              subtitle={entry.institution || undefined}
              onDelete={() => removeCourse(entry.id)}
            >
              <div className="space-y-4">
                {/* Name & Institution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Course Name"
                    placeholder="Machine Learning Specialization"
                    value={entry.name}
                    onChange={(e) =>
                      updateCourse(entry.id, { name: e.target.value })
                    }
                  />
                  <Input
                    label="Institution"
                    placeholder="Coursera, Udemy, MIT, etc."
                    value={entry.institution}
                    onChange={(e) =>
                      updateCourse(entry.id, { institution: e.target.value })
                    }
                  />
                </div>

                {/* Completion Date */}
                <Input
                  label="Completion Date"
                  placeholder="Jun 2023"
                  value={entry.completionDate}
                  onChange={(e) =>
                    updateCourse(entry.id, { completionDate: e.target.value })
                  }
                  wrapperClassName="sm:w-1/2"
                />

                {/* Description */}
                <TextArea
                  label="Description"
                  placeholder="Brief description of the course content..."
                  rows={3}
                  value={entry.description}
                  onChange={(e) =>
                    updateCourse(entry.id, { description: e.target.value })
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
