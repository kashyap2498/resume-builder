// =============================================================================
// Resume Builder - Home Page (Dashboard)
// =============================================================================

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Edit3,
  Copy,
  Trash2,
  X,
  Clock,
  LayoutTemplate,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useResumeListStore, type ResumeListItem } from '@/store/resumeListStore'
import { createDefaultResume } from '@/constants/sectionDefaults'
import { getAllTemplates } from '@/templates'

// -- Template Options (from registry) -----------------------------------------

const registeredTemplates = getAllTemplates()
const TEMPLATE_OPTIONS = registeredTemplates.map((t) => ({
  id: t.id,
  name: t.name,
}))

// -- Helpers ------------------------------------------------------------------

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function getTemplateName(id: string): string {
  const found = TEMPLATE_OPTIONS.find((t) => t.id === id)
  return found?.name ?? id.replace(/-/g, ' ')
}

// -- Card Animation Variants -------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
}

// =============================================================================
// CreateResumeDialog
// =============================================================================

interface CreateResumeDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, templateId: string) => void
}

function CreateResumeDialog({ open, onClose, onCreate }: CreateResumeDialogProps) {
  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState(TEMPLATE_OPTIONS[0]?.id ?? 'ats-standard')

  const handleCreate = () => {
    const trimmed = name.trim() || 'Untitled Resume'
    onCreate(trimmed, templateId)
    setName('')
    setTemplateId(TEMPLATE_OPTIONS[0].id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Create New Resume
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Give your resume a name and choose a starting template.
            </p>

            {/* Name input */}
            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">
                Resume Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Software Engineer Resume"
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </label>

            {/* Template selector */}
            <div className="block mb-8">
              <span className="block text-sm font-medium text-gray-700 mb-3">
                Template
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {registeredTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={`flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left transition-all ${
                      templateId === t.id
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Mini layout preview */}
                    <div className="w-full h-14 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden p-1.5">
                      {t.layout === 'two-column' ? (
                        <div className="flex gap-0.5 w-full h-full">
                          <div className="w-1/3 bg-gray-300 rounded-sm" />
                          <div className="flex-1 flex flex-col gap-0.5">
                            <div className="h-1.5 bg-gray-300 rounded-sm w-3/4" />
                            <div className="h-1 bg-gray-200 rounded-sm w-full" />
                            <div className="h-1 bg-gray-200 rounded-sm w-full" />
                            <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
                            <div className="flex-1" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5 w-full h-full">
                          <div className="h-2 bg-gray-300 rounded-sm w-1/2 mx-auto" />
                          <div className="h-1 bg-gray-200 rounded-sm w-3/4 mx-auto" />
                          <div className="h-px bg-gray-200 w-full my-0.5" />
                          <div className="h-1 bg-gray-200 rounded-sm w-full" />
                          <div className="h-1 bg-gray-200 rounded-sm w-full" />
                          <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
                          <div className="flex-1" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {t.name}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-2">
                      {t.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 capitalize">
                        {t.category.replace(/-/g, ' ')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                        {t.layout === 'two-column' ? '2-col' : '1-col'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                icon={<Plus className="h-4 w-4" />}
              >
                Create Resume
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// ResumeCard
// =============================================================================

interface ResumeCardProps {
  resume: ResumeListItem
  index: number
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

function ResumeCard({ resume, index, onEdit, onDuplicate, onDelete }: ResumeCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(resume.id)}
    >
      {/* Icon / visual */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <FileText className="h-6 w-6" />
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
        {resume.name}
      </h3>

      {/* Template */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <LayoutTemplate className="h-3.5 w-3.5" />
        <span>{getTemplateName(resume.templateId)}</span>
      </div>

      {/* Updated */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatDate(resume.updatedAt)}</span>
      </div>

      {/* Action buttons (visible on hover) */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(resume.id) }}
          title="Edit"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(resume.id) }}
          title="Duplicate"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(resume.id) }}
          title="Delete"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

// =============================================================================
// HomePage
// =============================================================================

export default function HomePage() {
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const resumes = useResumeListStore((s) => s.resumes)
  const addResume = useResumeListStore((s) => s.addResume)
  const removeResume = useResumeListStore((s) => s.removeResume)
  const duplicateResume = useResumeListStore((s) => s.duplicateResume)

  const handleCreate = useCallback(
    (name: string, templateId: string) => {
      // 1. Create default resume data
      const resume = createDefaultResume(name, templateId)

      // 2. Add to list store (generates id from store)
      const id = addResume({ name, templateId })

      // 3. Save full resume data to localStorage under key resume-{id}
      const fullResume = { ...resume, id }
      localStorage.setItem(`resume-${id}`, JSON.stringify(fullResume))

      // 4. Close dialog and navigate to editor
      setDialogOpen(false)
      navigate(`/editor/${id}`)
    },
    [addResume, navigate],
  )

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/editor/${id}`)
    },
    [navigate],
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      // Duplicate in list store
      const newId = duplicateResume(id)
      if (!newId) return

      // Duplicate full resume data in localStorage
      try {
        const raw = localStorage.getItem(`resume-${id}`)
        if (raw) {
          const data = JSON.parse(raw)
          const duplicated = {
            ...data,
            id: newId,
            name: `${data.name} (Copy)`,
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem(`resume-${newId}`, JSON.stringify(duplicated))
        }
      } catch {
        // silently ignore
      }
    },
    [duplicateResume],
  )

  const handleDelete = useCallback(
    (id: string) => {
      removeResume(id)
      localStorage.removeItem(`resume-${id}`)
    },
    [removeResume],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Resume Builder
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create, edit, and manage your professional resumes
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setDialogOpen(true)}
          >
            Create New Resume
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {resumes.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No resumes yet
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-sm">
              Get started by creating your first resume. Pick a template and
              fill in your details.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => setDialogOpen(true)}
            >
              Create Your First Resume
            </Button>
          </motion.div>
        ) : (
          /* Resume grid */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {resumes.map((resume, i) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  index={i}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <CreateResumeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
