// =============================================================================
// Resume Builder - Top Toolbar
// =============================================================================

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  FileDown,
  FileText,
  Upload,
  LayoutGrid,
  Check,
  Loader2,
  Clock,
  Bookmark,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { useToastStore } from '@/hooks/useToast'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useDocxExport } from '@/hooks/useDocxExport'
import { useCoverLetterPdfExport, useCoverLetterDocxExport } from '@/hooks/useCoverLetterExport'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useVersionStore } from '@/store/versionStore'
import { ImportModal } from '@/components/import'
import { saveResumeAsJson } from '@/utils/fileIO'
import { getTemplate } from '@/templates'
import { trackEvent } from '@/utils/analytics'
import React from 'react'

export default function TopBar() {
  const navigate = useNavigate()

  const currentResume = useResumeStore((s) => s.currentResume)
  const toggleTemplateGallery = useUIStore((s) => s.toggleTemplateGallery)
  const toggleImportModal = useUIStore((s) => s.toggleImportModal)
  const setShowImportModal = useUIStore((s) => s.setShowImportModal)
  const activeDocType = useUIStore((s) => s.activeDocType)

  const addToast = useToastStore((s) => s.addToast)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [versionLabel, setVersionLabel] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const shortcutsOpen = useUIStore((s) => s.showShortcuts)
  const setShortcutsOpen = useUIStore((s) => s.setShowShortcuts)
  const inputRef = useRef<HTMLInputElement>(null)
  const versionInputRef = useRef<HTMLInputElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  const { exportPdf, isExporting } = usePdfExport()
  const { exportDocx, isExporting: isDocxExporting } = useDocxExport()
  const { exportCoverLetterPdf, isExporting: isCLPdfExporting } = useCoverLetterPdfExport()
  const { exportCoverLetterDocx, isExporting: isCLDocxExporting } = useCoverLetterDocxExport()
  const { lastSaved, isSaving } = useAutoSave(currentResume)
  const showImportModal = useUIStore((s) => s.showImportModal)
  const saveNewVersion = useVersionStore((s) => s.saveNewVersion)

  const isCoverLetter = activeDocType === 'coverLetter'
  const resumeName = currentResume?.name ?? 'Untitled Resume'
  const templateId = currentResume?.templateId ?? ''

  // Focus input when editing
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    if (!exportOpen) return
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setExportOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExportOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [exportOpen])

  const handleStartEdit = () => {
    setEditName(resumeName)
    setIsEditingName(true)
  }

  const handleFinishEdit = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== resumeName && currentResume) {
      // Update in resume store (auto-save will persist to Convex)
      const updatedResume = { ...currentResume, name: trimmed }
      useResumeStore.getState().setResume(updatedResume)
    }
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit()
    if (e.key === 'Escape') setIsEditingName(false)
  }

  const handleSaveJSON = () => {
    if (!currentResume) return

    saveResumeAsJson(currentResume)
    addToast('Saved as JSON', 'success')

    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleExportDocx = async () => {
    if (!currentResume) return
    try {
      if (isCoverLetter) {
        await exportCoverLetterDocx(currentResume)
        trackEvent('cover_letter_exported_docx')
      } else {
        await exportDocx(currentResume)
        trackEvent('resume_exported_docx')
      }
      addToast('DOCX exported successfully', 'success')
    } catch (error) {
      console.error('DOCX export failed:', error)
      addToast('DOCX export failed. Please try again.', 'error')
    }
  }

  const handleOpenVersionModal = () => {
    setVersionLabel(`Version ${new Date().toLocaleString()}`)
    setVersionModalOpen(true)
  }

  const handleSaveVersion = async () => {
    if (!currentResume) return
    const label = versionLabel.trim() || `Version ${new Date().toLocaleString()}`
    setVersionModalOpen(false)
    try {
      await saveNewVersion(currentResume.id, currentResume, label)
      addToast('Version saved', 'success')
    } catch (error) {
      console.error('Save version failed:', error)
      addToast('Failed to save version', 'error')
    }
  }

  const handleExportPDF = async () => {
    if (!currentResume) return

    if (isCoverLetter) {
      try {
        await exportCoverLetterPdf(currentResume)
        trackEvent('cover_letter_exported_pdf')
        addToast('PDF exported successfully', 'success')
      } catch (error) {
        console.error('Cover letter PDF export failed:', error)
        addToast('PDF export failed. Please try again.', 'error')
      }
      return
    }

    const template = getTemplate(currentResume.templateId)
    if (!template) {
      addToast(`Template "${currentResume.templateId}" not found. Please select a registered template.`, 'error')
      return
    }

    const fileName = currentResume.name.replace(/\s+/g, '_') || 'resume'

    try {
      const PdfComponent = await template.getPdfComponent()
      await exportPdf(
        React.createElement(PdfComponent, { resume: currentResume }),
        fileName,
      )
      trackEvent('resume_exported_pdf')
      addToast('PDF exported successfully', 'success')
    } catch (error) {
      console.error('PDF export failed:', error)
      addToast('PDF export failed. Please try again.', 'error')
    }
  }

  // Format the last saved time for display
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    if (diffSecs < 10) return 'Just saved'
    if (diffSecs < 60) return `Saved ${diffSecs}s ago`
    const diffMins = Math.floor(diffSecs / 60)
    if (diffMins < 60) return `Saved ${diffMins}m ago`
    return `Saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const pdfExporting = isCoverLetter ? isCLPdfExporting : isExporting
  const docxExporting = isCoverLetter ? isCLDocxExporting : isDocxExporting
  const anyExporting = pdfExporting || docxExporting

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-gray-200 dark:border-dark-edge bg-white/85 dark:bg-dark-surface backdrop-blur-xl px-4 py-2.5 shrink-0 shadow-[var(--shadow-glass-sm)] no-print">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200/50 dark:bg-dark-edge shrink-0" />

        {/* Resume name */}
        <div className="min-w-0">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              className="rounded-md border border-blue-300/60 dark:border-dark-edge-strong bg-white dark:bg-dark-card px-2 py-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:shadow-[var(--shadow-glow-blue)] w-64"
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className="group flex items-center gap-2 rounded-md px-2 py-0.5 hover:bg-white/50 transition-colors min-w-0"
              title="Click to rename"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                {resumeName}
              </span>
              <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                edit
              </span>
            </button>
          )}

          {/* Template name */}
          {templateId && (
            <p className="pl-2 text-xs text-gray-500 capitalize">
              {templateId.replace(/-/g, ' ')} template
            </p>
          )}
        </div>
      </div>

      {/* Right side - action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Auto-save indicator */}
        {(lastSaved || isSaving) && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mr-1">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">{formatLastSaved(lastSaved)}</span>
              </>
            ) : null}
          </span>
        )}

        {/* Manual save indicator */}
        {showSaved && (
          <span className="flex items-center gap-1 text-xs text-green-600 mr-2">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={<HelpCircle className="h-4 w-4" />}
          onClick={() => setShortcutsOpen(true)}
          title="Keyboard shortcuts"
        />

        <div className="relative" ref={exportRef}>
          <Button
            variant="ghost"
            size="sm"
            icon={anyExporting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />}
            onClick={() => setExportOpen(!exportOpen)}
            disabled={anyExporting}
          >
            <span className="hidden sm:inline">
              {anyExporting ? 'Exporting...' : 'Export'}
            </span>
            {!anyExporting && <ChevronDown className="h-3 w-3 ml-0.5" />}
          </Button>

          <AnimatePresence>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 dark:border-dark-edge bg-white/95 dark:bg-dark-overlay backdrop-blur-xl shadow-[var(--shadow-glass-lg)] py-1 z-50"
              >
                <button onClick={() => { setExportOpen(false); handleExportPDF() }}
                  disabled={pdfExporting}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised">
                  <FileDown className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Download PDF
                </button>
                <button onClick={() => { setExportOpen(false); handleExportDocx() }}
                  disabled={docxExporting}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Download DOCX
                </button>
                <div className="my-1 h-px bg-gray-100/50 dark:bg-dark-edge" />
                <button onClick={() => { setExportOpen(false); handleSaveJSON() }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-raised">
                  <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Save as JSON
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isCoverLetter && (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              onClick={toggleImportModal}
              title="Import resume"
            >
              <span className="hidden sm:inline">Import</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={<Bookmark className="h-4 w-4" />}
              onClick={handleOpenVersionModal}
              title="Save Version"
            >
              <span className="hidden sm:inline">Version</span>
            </Button>

            <div className="h-6 w-px bg-gray-200 dark:bg-dark-edge-strong" />

            <Button
              variant="secondary"
              size="sm"
              icon={<LayoutGrid className="h-4 w-4" />}
              onClick={toggleTemplateGallery}
            >
              <span className="hidden sm:inline">Templates</span>
            </Button>
          </>
        )}
      </div>

      {/* Version Label Modal */}
      <Modal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        title="Save Version"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setVersionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveVersion}>
              Save Version
            </Button>
          </div>
        }
      >
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Version Label</span>
          <input
            ref={versionInputRef}
            type="text"
            value={versionLabel}
            onChange={(e) => setVersionLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveVersion() }}
            className="w-full rounded-lg border border-gray-300 dark:border-dark-edge-strong bg-white dark:bg-dark-card px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:shadow-[var(--shadow-glow-blue)] transition-all duration-200"
            placeholder="e.g. Final draft, Before redesign..."
            autoFocus
          />
        </label>
      </Modal>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Import Modal */}
      <ImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

    </header>
  )
}
