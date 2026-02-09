// =============================================================================
// Resume Builder - AppShell (3-panel layout)
// =============================================================================
//
// Desktop  : 300px sidebar | flex-1 editor | 540px preview
// Tablet   : toggle between editor and preview
// Mobile   : tabs for sections / editor / preview
// =============================================================================

import { useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { createDefaultCoverLetter } from '@/utils/coverLetterDefaults'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import EditorPanel from './EditorPanel'
import PreviewPanel from './PreviewPanel'
import CoverLetterEditor from '@/components/editor/CoverLetterEditor'
import CoverLetterPreview from './CoverLetterPreview'
import { TemplateGallery } from '@/components/templates'
import { ErrorBoundary } from '@/components/ErrorBoundary'

type MobileTab = 'sections' | 'editor' | 'preview'

export default function AppShell() {
  const isMobile = useUIStore((s) => s.isMobile)
  const isTablet = useUIStore((s) => s.isTablet)
  const activeDocType = useUIStore((s) => s.activeDocType)
  const setActiveDocType = useUIStore((s) => s.setActiveDocType)

  const currentResume = useResumeStore((s) => s.currentResume)
  const updateCoverLetter = useResumeStore((s) => s.updateCoverLetter)

  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [showPreview, setShowPreview] = useState(false)

  const isCoverLetter = activeDocType === 'coverLetter'

  // Switch to cover letter mode, auto-create defaults if needed
  const handleSwitchToCoverLetter = useCallback(() => {
    if (currentResume && !currentResume.coverLetter) {
      const defaults = createDefaultCoverLetter(currentResume.data.contact)
      updateCoverLetter(defaults)
    }
    setActiveDocType('coverLetter')
  }, [currentResume, updateCoverLetter, setActiveDocType])

  // -- Toggle bar component (shared across layouts) ---------------------------
  const DocToggleBar = (
    <div className="flex items-center justify-center gap-1 border-b border-gray-200 bg-white py-1.5 shrink-0">
      <button
        onClick={() => setActiveDocType('resume')}
        className={`rounded-lg px-4 py-1 text-sm font-medium transition-colors ${
          !isCoverLetter
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Resume
      </button>
      <button
        onClick={handleSwitchToCoverLetter}
        className={`rounded-lg px-4 py-1 text-sm font-medium transition-colors ${
          isCoverLetter
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Cover Letter
      </button>
    </div>
  )

  // -- Determine layout content ------------------------------------------------

  let layoutContent: React.ReactNode

  if (isMobile) {
    // -- Mobile layout --------------------------------------------------------
    const mobileTabs = isCoverLetter
      ? (['editor', 'preview'] as const)
      : (['sections', 'editor', 'preview'] as const)

    layoutContent = (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar />
        {DocToggleBar}

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          {mobileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                mobileTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex-1 overflow-hidden">
          {!isCoverLetter && mobileTab === 'sections' && (
            <div className="h-full overflow-y-auto">
              <ErrorBoundary fallbackMessage="Sidebar failed to load">
                <Sidebar />
              </ErrorBoundary>
            </div>
          )}
          {mobileTab === 'editor' && (
            <div id="editor-content" className="h-full overflow-y-auto">
              <ErrorBoundary fallbackMessage="Editor failed to load">
                {isCoverLetter ? <CoverLetterEditor /> : <EditorPanel />}
              </ErrorBoundary>
            </div>
          )}
          {mobileTab === 'preview' && (
            <div className="h-full overflow-y-auto">
              <ErrorBoundary fallbackMessage="Preview failed to load">
                {isCoverLetter ? <CoverLetterPreview /> : <PreviewPanel />}
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    )
  } else if (isTablet) {
    // -- Tablet layout --------------------------------------------------------
    layoutContent = (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar />
        {DocToggleBar}

        {/* Toggle bar */}
        <div className="flex items-center justify-center gap-1 border-b border-gray-200 bg-white py-2 shrink-0">
          <button
            onClick={() => setShowPreview(false)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              !showPreview
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar (only in resume mode) */}
          {!isCoverLetter && (
            <aside className="w-[240px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto no-print">
              <ErrorBoundary fallbackMessage="Sidebar failed to load">
                <Sidebar />
              </ErrorBoundary>
            </aside>
          )}

          {/* Editor or Preview */}
          <div id={showPreview ? undefined : 'editor-content'} className="flex-1 overflow-y-auto">
            {showPreview ? (
              <ErrorBoundary fallbackMessage="Preview failed to load">
                {isCoverLetter ? <CoverLetterPreview /> : <PreviewPanel />}
              </ErrorBoundary>
            ) : (
              <ErrorBoundary fallbackMessage="Editor failed to load">
                {isCoverLetter ? <CoverLetterEditor /> : <EditorPanel />}
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    // -- Desktop layout -------------------------------------------------------
    layoutContent = (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar />
        {DocToggleBar}

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar (only in resume mode) */}
          {!isCoverLetter && (
            <aside className="w-[300px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto no-print">
              <ErrorBoundary fallbackMessage="Sidebar failed to load">
                <Sidebar />
              </ErrorBoundary>
            </aside>
          )}

          {/* Center editor */}
          <main id="editor-content" className="min-w-0 flex-1 overflow-y-auto">
            <ErrorBoundary fallbackMessage="Editor failed to load">
              {isCoverLetter ? <CoverLetterEditor /> : <EditorPanel />}
            </ErrorBoundary>
          </main>

          {/* Right preview */}
          <aside className="w-[540px] shrink-0 border-l border-gray-200 bg-gray-100 overflow-y-auto">
            <ErrorBoundary fallbackMessage="Preview failed to load">
              {isCoverLetter ? <CoverLetterPreview /> : <PreviewPanel />}
            </ErrorBoundary>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <>
      <a
        href="#editor-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-blue-600 focus:font-medium"
      >
        Skip to editor
      </a>
      {layoutContent}
      <TemplateGallery />
    </>
  )
}
