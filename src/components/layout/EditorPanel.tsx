// =============================================================================
// Resume Builder - Editor Panel (Center)
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
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
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { SectionType, ResumeData } from '@/types/resume'

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

// -- Helpers for section badge counts -----------------------------------------

function getSectionBadge(sectionType: SectionType, data: ResumeData): { label: string; variant: 'blue' | 'green' | 'gray' } | null {
  const contact = data.contact

  switch (sectionType) {
    case 'contact': {
      const filled = [contact.firstName, contact.lastName, contact.email, contact.phone, contact.location].filter(Boolean).length
      if (filled === 0) return null
      return { label: `${filled}/5`, variant: filled >= 4 ? 'green' : 'blue' }
    }
    case 'summary':
      if (data.summary?.text?.trim()) return { label: 'Added', variant: 'green' }
      return null
    case 'hobbies': {
      const count = data.hobbies?.items?.filter(Boolean).length ?? 0
      if (count > 0) return { label: `${count}`, variant: 'blue' }
      return null
    }
    case 'experience':
    case 'education':
    case 'skills':
    case 'projects':
    case 'certifications':
    case 'languages':
    case 'volunteer':
    case 'awards':
    case 'publications':
    case 'references':
    case 'affiliations':
    case 'courses':
    case 'customSections': {
      const arr = data[sectionType]
      if (Array.isArray(arr) && arr.length > 0) {
        return { label: `${arr.length}`, variant: 'blue' }
      }
      return null
    }
    default:
      return null
  }
}

// -- Helpers for collapsed section summaries ----------------------------------

function getSectionSummary(sectionType: SectionType, data: ResumeData): string | null {
  switch (sectionType) {
    case 'contact': {
      const c = data.contact
      const parts = [
        [c.firstName, c.lastName].filter(Boolean).join(' '),
        c.email, c.location,
      ].filter(Boolean)
      return parts.length > 0 ? parts.join(' \u00B7 ') : null
    }
    case 'summary': {
      const text = data.summary?.text?.trim()
      if (!text) return null
      return text.length > 80 ? text.slice(0, 80) + '\u2026' : text
    }
    case 'experience':
      return joinNames(data.experience.map(e => e.company))
    case 'education':
      return joinNames(data.education.map(e => e.institution))
    case 'skills': {
      const cats = data.skills.length
      const total = data.skills.reduce((s, c) => s + c.items.length, 0)
      return cats > 0 ? `${cats} categor${cats === 1 ? 'y' : 'ies'} \u00B7 ${total} skill${total === 1 ? '' : 's'}` : null
    }
    case 'projects':
      return joinNames(data.projects.map(p => p.name))
    case 'certifications':
      return joinNames(data.certifications.map(c => c.name))
    case 'languages':
      return joinNames(data.languages.map(l => l.name))
    case 'volunteer':
      return joinNames(data.volunteer.map(v => v.organization))
    case 'awards':
      return joinNames(data.awards.map(a => a.title))
    case 'publications':
      return joinNames(data.publications.map(p => p.title))
    case 'references':
      return joinNames(data.references.map(r => r.name))
    case 'hobbies':
      return joinNames(data.hobbies?.items?.filter(Boolean) ?? [])
    case 'affiliations':
      return joinNames(data.affiliations.map(a => a.organization))
    case 'courses':
      return joinNames(data.courses.map(c => c.name))
    case 'customSections':
      return joinNames(data.customSections.map(s => s.title))
    default:
      return null
  }
}

function joinNames(items: string[]): string | null {
  const filtered = items.filter(Boolean)
  return filtered.length > 0 ? filtered.join(' \u00B7 ') : null
}

// =============================================================================
// EditorPanel
// =============================================================================

export default function EditorPanel() {
  const sections = useResumeStore((s) => s.currentResume?.sections ?? [])
  const resumeData = useResumeStore((s) => s.currentResume?.data)
  const collapsedSections = useUIStore((s) => s.collapsedSections)
  const toggleSection = useUIStore((s) => s.toggleSection)

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
          const isCollapsed = collapsedSections.has(section.id)
          const isActive = !isCollapsed
          const badge = resumeData ? getSectionBadge(section.type, resumeData) : null
          const summary = resumeData ? getSectionSummary(section.type, resumeData) : null

          return (
            <div
              key={section.id}
              data-section-id={section.id}
              className={cn(
                'group rounded-xl border bg-white p-6 transition-all duration-200 cursor-pointer',
                isActive
                  ? 'border-blue-400 ring-2 ring-blue-200 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
              )}
              onClick={() => toggleSection(section.id)}
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    {badge && (
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className="shrink-0 text-gray-500">
                  {isActive ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Section editor content with collapse animation */}
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1">
                      <SectionEditorRouter sectionType={section.type} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className={cn(
                        'text-xs truncate',
                        summary ? 'text-gray-500' : 'text-center text-gray-500 italic'
                      )}>
                        {summary || 'Not yet added \u2014 click to expand'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  )
}
