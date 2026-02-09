// =============================================================================
// Resume Builder - Editor Panel (Center)
// =============================================================================

import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Globe,
  Heart,
  Trophy,
  BookOpen,
  Users,
  Smile,
  Building,
  BookMarked,
  LayoutList,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { SectionEditorRouter } from '@/components/editor'
import { cn } from '@/utils/cn'
import type { SectionType } from '@/types/resume'

// -- Section icon map ---------------------------------------------------------

const SECTION_ICON_MAP: Record<SectionType, LucideIcon> = {
  contact: User,
  summary: AlignLeft,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen,
  certifications: Award,
  languages: Globe,
  volunteer: Heart,
  awards: Trophy,
  publications: BookOpen,
  references: Users,
  hobbies: Smile,
  affiliations: Building,
  courses: BookMarked,
  customSections: LayoutList,
}

// -- Section descriptions for placeholders ------------------------------------

const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  contact: 'Add your name, email, phone, location, and social links.',
  summary: 'Write a brief professional summary or objective statement.',
  experience: 'List your work history with company names, roles, and dates.',
  education: 'Add your degrees, institutions, and academic achievements.',
  skills: 'Group your technical and soft skills by category.',
  projects: 'Showcase personal or professional projects with descriptions.',
  certifications: 'List professional certifications and credentials.',
  languages: 'Add languages you speak and your proficiency level.',
  volunteer: 'Include volunteer work and community involvement.',
  awards: 'Highlight awards, honors, and recognitions.',
  publications: 'List published papers, articles, or books.',
  references: 'Add professional references (or indicate availability).',
  hobbies: 'Share personal interests and hobbies.',
  affiliations: 'List professional organizations and memberships.',
  courses: 'Add relevant courses and continuing education.',
  customSections: 'Create custom sections with your own headings and content.',
}

// =============================================================================
// EditorPanel
// =============================================================================

export default function EditorPanel() {
  const sections = useResumeStore((s) => s.currentResume?.sections ?? [])
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)

  const sorted = [...sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.visible)

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No visible sections
          </h3>
          <p className="text-xs text-gray-500">
            Enable sections from the sidebar to start editing your resume.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="space-y-4">
        {sorted.map((section) => {
          const IconComponent = SECTION_ICON_MAP[section.type]
          const description = SECTION_DESCRIPTIONS[section.type]
          const isActive = activeSection === section.id

          return (
            <div
              key={section.id}
              data-section-id={section.id}
              className={cn(
                'group rounded-xl border bg-white p-6 transition-all duration-200 cursor-pointer',
                isActive
                  ? 'border-blue-300 ring-2 ring-blue-100 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200',
                  )}
                >
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-400">{description}</p>
                </div>
                <div className="shrink-0 text-gray-400">
                  {isActive ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Section editor content */}
              {isActive ? (
                <div className="mt-1">
                  <SectionEditorRouter sectionType={section.type} />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6">
                  <p className="text-center text-xs text-gray-400">
                    Click to expand and edit this section.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  )
}
