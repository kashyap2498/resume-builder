// =============================================================================
// Resume Builder - Editor Page
// =============================================================================

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useResumeStore } from '@/store/resumeStore'
import { useResumeListStore } from '@/store/resumeListStore'
import { useUIStore } from '@/store/uiStore'
import { useStylingStore } from '@/store/stylingStore'
import { useHistoryStore } from '@/store/historyStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePdfExport } from '@/hooks/usePdfExport'
import { getTemplate } from '@/templates'
import { saveResumeAsJson } from '@/utils/fileIO'
import AppShell from '@/components/layout/AppShell'
import type { Resume } from '@/types/resume'
import React from 'react'

export default function EditorPage() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()

  const setResume = useResumeStore((s) => s.setResume)
  const currentResume = useResumeStore((s) => s.currentResume)
  const setCurrentResumeId = useResumeListStore((s) => s.setCurrentResume)
  const setDeviceSize = useUIStore((s) => s.setDeviceSize)
  const hydrateStyling = useStylingStore((s) => s.hydrate)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -- Auto-save hook ---------------------------------------------------------

  const { saveNow } = useAutoSave(currentResume)
  const { exportPdf } = usePdfExport()

  // -- Load resume from localStorage on mount ---------------------------------

  useEffect(() => {
    if (!resumeId) {
      setError('No resume ID provided.')
      setLoading(false)
      return
    }

    try {
      const raw = localStorage.getItem(`resume-${resumeId}`)
      if (!raw) {
        setError('Resume not found. It may have been deleted.')
        setLoading(false)
        return
      }

      const resume: Resume = JSON.parse(raw)
      setResume(resume)
      setCurrentResumeId(resumeId)

      // Hydrate the styling store from the loaded resume data
      if (resume.styling) {
        hydrateStyling(resume.styling)
      }

      setLoading(false)
    } catch {
      setError('Failed to load resume data.')
      setLoading(false)
    }
  }, [resumeId, setResume, setCurrentResumeId, hydrateStyling])

  // -- Keyboard shortcuts -----------------------------------------------------

  const handleKeyboardShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      // Ctrl+S / Cmd+S: Save
      if (isCtrlOrCmd && e.key === 's') {
        e.preventDefault()
        if (currentResume) {
          saveNow()
          saveResumeAsJson(currentResume)
        }
      }

      // Ctrl+P / Cmd+P: Export PDF
      if (isCtrlOrCmd && e.key === 'p') {
        e.preventDefault()
        if (currentResume) {
          const template = getTemplate(currentResume.templateId)
          if (template) {
            const fileName = currentResume.name.replace(/\s+/g, '_') || 'resume'
            template.getPdfComponent().then((PdfComponent) => {
              exportPdf(
                React.createElement(PdfComponent, { resume: currentResume }),
                fileName,
              )
            }).catch((err) => console.error('PDF export failed:', err))
          }
        }
      }

      // Ctrl+Z / Cmd+Z: Undo
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const current = useResumeStore.getState().currentResume
        if (current) {
          const prev = useHistoryStore.getState().undo(current)
          if (prev) useResumeStore.getState().setResume(prev)
        }
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y: Redo
      if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const current = useResumeStore.getState().currentResume
        if (current) {
          const next = useHistoryStore.getState().redo(current)
          if (next) useResumeStore.getState().setResume(next)
        }
      }
    },
    [currentResume, saveNow, exportPdf],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  // -- History tracking (debounced) -------------------------------------------

  useEffect(() => {
    const timeoutId = { current: null as ReturnType<typeof setTimeout> | null }

    const unsub = useResumeStore.subscribe((state, prevState) => {
      if (!state.currentResume || !prevState.currentResume) return
      if (state.currentResume === prevState.currentResume) return

      // Debounce history pushes
      if (timeoutId.current) clearTimeout(timeoutId.current)
      timeoutId.current = setTimeout(() => {
        useHistoryStore.getState().pushState(prevState.currentResume!)
      }, 500)
    })

    return () => {
      unsub()
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  // -- Responsive listener ----------------------------------------------------

  useEffect(() => {
    const handleResize = () => setDeviceSize(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setDeviceSize])

  // -- Cleanup on unmount -----------------------------------------------------

  useEffect(() => {
    return () => {
      setResume(null)
    }
  }, [setResume])

  // -- Loading state ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading resume...</p>
        </div>
      </div>
    )
  }

  // -- Error state ------------------------------------------------------------

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{error}</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please go back to the dashboard and try again.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // -- Main editor layout -----------------------------------------------------

  return <AppShell />
}
