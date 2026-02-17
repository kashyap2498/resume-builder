// =============================================================================
// Resume Builder - Home Page (Dashboard)
// =============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  LogOut,
  Search,
  Edit3,
  Copy,
  Trash2,
  FileDown,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useThumbnail, clearThumbnailCache } from '@/hooks/useThumbnail'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useToastStore } from '@/hooks/useToast'
import { useUIStore } from '@/store/uiStore'
import { createDefaultResume } from '@/constants/sectionDefaults'
import { getAllTemplates, getTemplate } from '@/templates'
import { trackEvent } from '@/utils/analytics'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Resume } from '@/types/resume'
import React from 'react'

// -- Template Options (from registry) -----------------------------------------

const registeredTemplates = getAllTemplates()
const TEMPLATE_OPTIONS = registeredTemplates.map((t) => ({
  id: t.id,
  name: t.name,
}))

// -- Types --------------------------------------------------------------------

type SortOrder = 'recent' | 'name-asc' | 'name-desc' | 'oldest'

interface ResumeItem {
  id: string
  name: string
  templateId: string
  updatedAt: string
  data?: string
}

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

function sortResumes(resumes: ResumeItem[], order: SortOrder): ResumeItem[] {
  const sorted = [...resumes]
  switch (order) {
    case 'recent':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return sorted
  }
}

const SORT_LABELS: Record<SortOrder, string> = {
  'recent': 'Recent',
  'name-asc': 'Name A-Z',
  'name-desc': 'Name Z-A',
  'oldest': 'Oldest',
}

// -- Card Animation Variants -------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-resume-dialog-title"
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-dark-card p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-raised hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="create-resume-dialog-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Create New Resume
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Give your resume a name and choose a starting template.
            </p>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Resume Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Software Engineer Resume"
                autoFocus
                className="w-full rounded-lg border border-gray-300 dark:border-dark-edge-strong bg-white dark:bg-dark-card px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </label>

            <div className="block mb-8">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-dark-edge-strong bg-white dark:bg-dark-card hover:border-gray-300 dark:hover:border-dark-edge-strong hover:bg-gray-50 dark:hover:bg-dark-raised'
                    }`}
                  >
                    <div className="w-full h-14 rounded bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 flex items-center justify-center overflow-hidden p-1.5">
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
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {t.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                        {t.category.replace(/-/g, ' ')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {t.layout === 'two-column' ? '2-col' : '1-col'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
// ThumbnailPreview — renders a single resume thumbnail
// =============================================================================

function ThumbnailPreview({ resume }: { resume: ResumeItem }) {
  const { thumbnailUrl, isLoading } = useThumbnail(
    resume.data,
    resume.templateId,
    resume.id
  )

  return (
    <div className="bg-gray-100 dark:bg-dark-raised h-[200px] p-4 flex items-center justify-center overflow-hidden rounded-t-xl border-b border-gray-200 dark:border-dark-edge relative">
      {isLoading && !thumbnailUrl && (
        <div className="absolute inset-0 bg-gray-200/60 dark:bg-dark-raised animate-pulse">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      )}
      {thumbnailUrl ? (
        <div className="shadow-lg rounded-sm overflow-hidden h-full">
          <img
            src={thumbnailUrl}
            alt={`Preview of ${resume.name}`}
            className="h-full w-auto object-contain"
          />
        </div>
      ) : !isLoading ? (
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs">Preview</span>
        </div>
      ) : null}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 shadow-lg">
          Open
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// ResumeCard — Thumbnail-dominant card
// =============================================================================

interface ResumeCardProps {
  resume: ResumeItem
  index: number
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
}

function ResumeCard({ resume, index, onEdit, onDuplicate, onDelete, onDownload }: ResumeCardProps) {
  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Edit',
      icon: <Edit3 />,
      onClick: () => onEdit(resume.id),
    },
    {
      label: 'Duplicate',
      icon: <Copy />,
      onClick: () => onDuplicate(resume.id),
    },
    {
      label: 'Download PDF',
      icon: <FileDown />,
      onClick: () => onDownload(resume.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 />,
      onClick: () => onDelete(resume.id),
      variant: 'danger',
    },
  ]

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="group rounded-xl border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card shadow-[var(--shadow-glass-sm)] hover:shadow-[var(--shadow-glass-md)] hover:border-gray-300 dark:hover:border-dark-edge-strong transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(resume.id)}
    >
      {/* Thumbnail */}
      <ThumbnailPreview resume={resume} />

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
            {resume.name}
          </h3>
          <DropdownMenu items={menuItems} />
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="blue" size="sm">
            {getTemplateName(resume.templateId)}
          </Badge>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(resume.updatedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// CreateNewCard — Dashed-border CTA card
// =============================================================================

function CreateNewCard({ onClick, index }: { onClick: () => void; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-edge-strong bg-white/50 dark:bg-dark-card/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[280px]"
      onClick={onClick}
    >
      <div className="h-12 w-12 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center shadow-[var(--shadow-glass-sm)]">
        <Plus className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Create New Resume</span>
    </motion.div>
  )
}

// =============================================================================
// SkeletonCard — Loading placeholder
// =============================================================================

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-edge overflow-hidden">
      <div className="h-[200px] bg-gray-200/60 dark:bg-dark-raised relative">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200/60 dark:bg-dark-raised rounded w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200/60 dark:bg-dark-raised rounded w-20 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
          </div>
          <div className="h-5 bg-gray-200/60 dark:bg-dark-raised rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SortDropdown — simple sort selector
// =============================================================================

function SortDropdown({ value, onChange }: { value: SortOrder; onChange: (v: SortOrder) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-edge rounded-lg hover:bg-gray-50 dark:hover:bg-dark-raised transition-colors shadow-[var(--shadow-glass-sm)]"
      >
        {SORT_LABELS[value]}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-gray-200 dark:border-dark-edge bg-white/95 dark:bg-dark-overlay backdrop-blur-xl shadow-[var(--shadow-glass-lg)] py-1 z-50"
          >
            {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
              <button
                key={key}
                onClick={() => { onChange(key); setOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                  value === key ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised'
                }`}
              >
                {SORT_LABELS[key]}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// EmptyState — Inviting empty state with template previews
// =============================================================================

const floatVariants = {
  float: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay: i * 0.4,
    },
  }),
}

const cardRotations = ['rotate-[-6deg]', 'rotate-0', 'rotate-[6deg]']

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const previewTemplates = registeredTemplates.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Template preview thumbnails — fanned like a hand of cards */}
      <div className="flex items-end gap-4 mb-10 relative">
        {previewTemplates.map((t, i) => (
          <motion.div
            key={t.id}
            custom={i}
            variants={floatVariants}
            animate="float"
            className={`rounded-lg border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card shadow-[var(--shadow-glass-md)] overflow-hidden ${cardRotations[i]} ${
              i === 1 ? 'w-32 h-40 z-10 scale-105' : 'w-24 h-32 opacity-70'
            }`}
          >
            <div className="p-2 h-full">
              {t.layout === 'two-column' ? (
                <div className="flex gap-0.5 w-full h-full">
                  <div className="w-1/3 bg-gray-200 dark:bg-gray-600 rounded-sm" />
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded-sm w-3/4" />
                    <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-5/6" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 w-full h-full">
                  <div className="h-2 bg-gray-300 dark:bg-gray-500 rounded-sm w-1/2 mx-auto" />
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-3/4 mx-auto" />
                  <div className="h-px bg-gray-200 dark:bg-gray-600 w-full my-0.5" />
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-full" />
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-full" />
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-sm w-5/6" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sparkle accent */}
      <div className="mb-4">
        <Sparkles className="h-6 w-6 text-blue-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Create your first resume
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        Pick a template and start building in seconds. Choose from {registeredTemplates.length} professionally designed templates.
      </p>
      <Button
        variant="primary"
        size="lg"
        icon={<Plus className="h-5 w-5" />}
        onClick={onCreate}
      >
        Create Your First Resume
      </Button>

      {/* Feature pills */}
      <div className="flex items-center gap-2 mt-6">
        {['ATS-Optimized', 'PDF Export', 'Multiple Templates'].map((label) => (
          <span
            key={label}
            className="px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-card text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-edge"
          >
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// =============================================================================
// HomePage
// =============================================================================

export default function HomePage() {
  const navigate = useNavigate()
  const { signOut } = useAuthActions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const rawResumes = useQuery(api.resumes.list)
  const createResume = useMutation(api.resumes.create)
  const removeResume = useMutation(api.resumes.remove)
  const duplicateResumeMut = useMutation(api.resumes.duplicate)
  const addToast = useToastStore((s) => s.addToast)
  const { exportPdf, isExporting: isPdfExporting } = usePdfExport()

  const resumes: ResumeItem[] = useMemo(
    () =>
      (rawResumes ?? []).map((r: { _id: string; name: string; templateId: string; updatedAt: string; data?: string }) => ({
        id: r._id as string,
        name: r.name,
        templateId: r.templateId,
        updatedAt: r.updatedAt,
        data: r.data,
      })),
    [rawResumes]
  )

  // Filter + sort
  const filteredResumes = useMemo(() => {
    let result = resumes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) => r.name.toLowerCase().includes(q))
    }
    return sortResumes(result, sortOrder)
  }, [resumes, searchQuery, sortOrder])

  const handleCreate = useCallback(
    async (name: string, templateId: string) => {
      const resume = createDefaultResume(name, templateId)
      const id = await createResume({
        data: JSON.stringify(resume),
        name,
        templateId,
      })

      trackEvent('resume_created', { template: templateId })
      useUIStore.getState().setShowOnboarding(true)
      setDialogOpen(false)
      navigate(`/editor/${id}`)
    },
    [createResume, navigate],
  )

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/editor/${id}`)
    },
    [navigate],
  )

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        await duplicateResumeMut({ id: id as Id<"resumes"> })
        clearThumbnailCache()
        addToast('Resume duplicated', 'success')
      } catch {
        addToast('Failed to duplicate resume', 'error')
      }
    },
    [duplicateResumeMut, addToast],
  )

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const resume = resumes.find((r) => r.id === id)
      setDeleteTarget({ id, name: resume?.name || 'this resume' })
    },
    [resumes],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await removeResume({ id: deleteTarget.id as Id<"resumes"> })
      clearThumbnailCache()
      addToast('Resume deleted', 'success')
    } catch {
      addToast('Failed to delete resume', 'error')
    }
    setDeleteTarget(null)
  }, [deleteTarget, removeResume, addToast])

  const handleDownloadPdf = useCallback(
    async (id: string) => {
      const resume = resumes.find((r) => r.id === id)
      if (!resume?.data) {
        addToast('Resume data not available', 'error')
        return
      }

      try {
        const parsed: Resume = JSON.parse(resume.data)
        const template = getTemplate(resume.templateId)
        if (!template) {
          addToast(`Template "${resume.templateId}" not found`, 'error')
          return
        }

        const fileName = resume.name.replace(/\s+/g, '_') || 'resume'
        const PdfComponent = await template.getPdfComponent()
        await exportPdf(
          React.createElement(PdfComponent, { resume: parsed }),
          fileName,
        )
        trackEvent('resume_exported_pdf_dashboard')
        addToast('PDF exported successfully', 'success')
      } catch (error) {
        console.error('PDF export from dashboard failed:', error)
        addToast('PDF export failed. Please try again.', 'error')
      }
    },
    [resumes, exportPdf, addToast],
  )

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  const showSearch = resumes.length >= 3

  // Cmd+K / Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const commandPaletteResumes = useMemo(
    () =>
      resumes.map((r) => ({
        id: r.id,
        name: r.name,
        templateName: getTemplateName(r.templateId),
        timeAgo: formatDate(r.updatedAt),
      })),
    [resumes],
  )

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-dark-edge bg-white/90 dark:bg-dark-surface backdrop-blur-xl shadow-[var(--shadow-glass-sm)]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="shrink-0">
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Resumello
            </h1>
            {resumes.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {resumes.length} resume{resumes.length === 1 ? '' : 's'}
              </p>
            )}
          </div>

          {/* Center: Search */}
          {showSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-dark-edge bg-white dark:bg-dark-card pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[var(--shadow-glass-sm)]"
                />
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setDialogOpen(true)}
            >
              Create
            </Button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-raised transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Button
              variant="secondary"
              icon={<LogOut className="h-4 w-4" />}
              onClick={handleSignOut}
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {rawResumes === undefined ? (
          /* Loading state — skeleton cards */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 bg-gray-200/60 dark:bg-dark-raised rounded w-32 animate-pulse" />
              <div className="h-9 bg-gray-200/60 dark:bg-dark-raised rounded w-24 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty state */
          <EmptyState onCreate={() => setDialogOpen(true)} />
        ) : (
          /* Resume grid */
          <div>
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery.trim() && filteredResumes.length !== resumes.length
                  ? `${filteredResumes.length} of ${resumes.length} resumes`
                  : `${resumes.length} resume${resumes.length === 1 ? '' : 's'}`}
              </p>
              <SortDropdown value={sortOrder} onChange={setSortOrder} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {/* Create New card */}
                <CreateNewCard
                  key="create-new"
                  onClick={() => setDialogOpen(true)}
                  index={0}
                />

                {/* Resume cards */}
                {filteredResumes.map((resume, i) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    index={i + 1}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteRequest}
                    onDownload={handleDownloadPdf}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* No search results */}
            {searchQuery.trim() && filteredResumes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No resumes matching &ldquo;{searchQuery}&rdquo;
                </p>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* PDF exporting overlay */}
      {isPdfExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-xl px-6 py-4 shadow-[var(--shadow-glass-lg)] flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Exporting PDF...</span>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <CreateResumeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        resumes={commandPaletteResumes}
        onSelectResume={handleEdit}
        onCreateResume={() => { setCommandPaletteOpen(false); setDialogOpen(true) }}
        onSignOut={handleSignOut}
      />
    </div>
  )
}
