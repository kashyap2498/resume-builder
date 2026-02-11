// =============================================================================
// Resume Builder - Hobbies & Interests Editor
// =============================================================================

import { useState } from 'react';
import { Plus, X, Palette } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState } from '@/components/ui';

export function HobbiesEditor() {
  const hobbies = useResumeStore((s) => s.currentResume?.data.hobbies);
  const updateHobbies = useResumeStore((s) => s.updateHobbies);
  const [newHobby, setNewHobby] = useState('');

  if (!hobbies) return null;

  const handleAdd = () => {
    const trimmed = newHobby.trim();
    if (!trimmed) return;
    updateHobbies({ items: [...hobbies.items, trimmed] });
    setNewHobby('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    updateHobbies({
      items: hobbies.items.filter((_, i) => i !== index),
    });
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...hobbies.items];
    updated[index] = value;
    updateHobbies({ items: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Hobbies & Interests
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Add personal hobbies and interests to give your resume personality.
        </p>
      </div>

      {hobbies.items.length === 0 && !newHobby ? (
        <EmptyState
          icon={<Palette className="h-6 w-6" />}
          title="No hobbies added"
          description="Add hobbies and interests to personalize your resume."
        />
      ) : null}

      {/* Existing hobbies */}
      {hobbies.items.length > 0 && (
        <div className="space-y-2">
          {hobbies.items.map((hobby, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={hobby}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                placeholder="Enter a hobby"
                wrapperClassName="flex-1"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="shrink-0 p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Remove hobby"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new hobby */}
      <div className="flex items-end gap-2">
        <Input
          label="Add a Hobby"
          placeholder="Photography, Hiking, Chess..."
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          onKeyDown={handleKeyDown}
          wrapperClassName="flex-1"
        />
        <Button
          variant="secondary"
          size="md"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAdd}
          disabled={!newHobby.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
