// =============================================================================
// Resume Builder - Section Manager Component
// =============================================================================

import { useCallback } from 'react';
import {
  GripVertical,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Languages,
  Heart,
  Trophy,
  BookOpen,
  Users,
  Smile,
  Building,
  BookMarked,
  Layers,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeStore } from '@/store/resumeStore';
import { useUIStore } from '@/store/uiStore';
import { Toggle } from '@/components/ui/Toggle';
import type { SectionConfig, SectionType } from '@/types/resume';
import { cn } from '@/utils/cn';

// -- Section icon mapping -----------------------------------------------------

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderKanban,
  certifications: Award,
  languages: Languages,
  volunteer: Heart,
  awards: Trophy,
  publications: BookOpen,
  references: Users,
  hobbies: Smile,
  affiliations: Building,
  courses: BookMarked,
  customSections: Layers,
};

// -- Section row --------------------------------------------------------------

interface SectionRowProps {
  section: SectionConfig;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

function SectionRow({ section, onToggleVisibility }: SectionRowProps) {
  const Icon = SECTION_ICONS[section.type] || Layers;
  const expandSection = useUIStore((s) => s.expandSection);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (isDragging) return;
    expandSection(section.id);
    const el = document.querySelector(`[data-section-id="${section.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md group cursor-pointer',
        'hover:bg-gray-50 transition-colors',
        !section.visible && 'opacity-50',
        isDragging && 'z-10 bg-white shadow-md',
      )}
    >
      {/* Drag handle */}
      <span
        className="cursor-grab text-gray-300 hover:text-gray-500 transition-colors shrink-0 touch-none"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </span>

      {/* Section icon */}
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />

      {/* Section title */}
      <span className="text-xs font-medium flex-1 truncate text-gray-700">
        {section.title}
      </span>

      {/* Visibility toggle */}
      <Toggle
        checked={section.visible}
        onChange={(checked) => onToggleVisibility(section.id, checked)}
        size="sm"
      />
    </div>
  );
}

// -- Component ----------------------------------------------------------------

export function SectionManager() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSections = useResumeStore((s) => s.updateSections);

  const sections = currentResume?.sections ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleToggleVisibility = useCallback(
    (id: string, visible: boolean) => {
      const updated = sections.map((s) =>
        s.id === id ? { ...s, visible } : s,
      );
      updateSections(updated);
    },
    [sections, updateSections],
  );

  // Sort by order for display
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
      const newIndex = sortedSections.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sortedSections, oldIndex, newIndex).map(
        (section, index) => ({ ...section, order: index }),
      );

      updateSections(reordered);
    },
    [sortedSections, updateSections],
  );

  if (sortedSections.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Layers className="h-4 w-4" />
          <span>Sections</span>
        </div>
        <p className="text-xs text-gray-500 italic px-1">
          No resume loaded. Open a resume to manage sections.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section heading */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Layers className="h-4 w-4" />
        <span>Sections</span>
      </div>

      <p className="text-xs text-gray-500 px-1">
        Toggle visibility and reorder sections.
      </p>

      {/* Section list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-0.5">
            {sortedSections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
