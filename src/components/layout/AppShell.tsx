// =============================================================================
// Resume Builder - AppShell (3-panel layout)
// =============================================================================
//
// Desktop  : 336px sidebar | flex-1 editor | 580px preview
// Tablet   : toggle between editor and preview
// Mobile   : tabs for sections / editor / preview
// =============================================================================

import { useState, useCallback } from 'react'
import { FileText, Mail } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { createDefaultCoverLetter } from '@/utils/coverLetterDefaults'
import { Tabs } from '@/components/ui/Tabs'
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

  const docTabs = [
    { id: 'resume', label: 'Resume', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'coverLetter', label: 'Cover Letter', icon: <Mail className="h-3.5 w-3.5" /> },
  ]

  const handleDocTabChange = useCallback((tabId: string) => {
    if (tabId === 'coverLetter') {
      handleSwitchToCoverLetter()
    } else {
      setActiveDocType('resume')
    }
  }, [handleSwitchToCoverLetter, setActiveDocType])

  // -- Toggle bar component (shared across layouts) ---------------------------
  const DocToggleBar = (
    <div className="flex items-center justify-center border-b border-gray-200 dark:border-dark-edge bg-white/90 dark:bg-dark-surface backdrop-blur-lg py-1.5 shrink-0">
      <Tabs
        tabs={docTabs}
        activeTab={activeDocType}
        onTabChange={handleDocTabChange}
        variant="pills"
        size="sm"
      />
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
      <div className="flex h-screen flex-col bg-mesh-gradient">
        <TopBar />
        {DocToggleBar}

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 dark:border-dark-edge bg-white/90 dark:bg-dark-surface backdrop-blur-lg shrink-0">
          {mobileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                mobileTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
      <div className="flex h-screen flex-col bg-mesh-gradient">
        <TopBar />
        {DocToggleBar}

        {/* Toggle bar */}
        <div className="flex items-center justify-center gap-1 border-b border-gray-200 dark:border-dark-edge bg-white/90 dark:bg-dark-surface backdrop-blur-lg py-2 shrink-0">
          <button
            onClick={() => setShowPreview(false)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              !showPreview
                ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-[var(--shadow-glass-sm)]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-[var(--shadow-glass-sm)]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar (only in resume mode) */}
          {!isCoverLetter && (
            <aside className="w-[240px] shrink-0 border-r border-gray-200 dark:border-dark-edge bg-gray-50 dark:bg-dark-surface backdrop-blur-xl overflow-y-auto no-print">
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
      <div className="flex h-screen flex-col bg-mesh-gradient">
        <TopBar />
        {DocToggleBar}

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar (only in resume mode) */}
          {!isCoverLetter && (
            <aside className="w-[336px] shrink-0 border-r border-gray-200 dark:border-dark-edge bg-gray-50 dark:bg-dark-surface backdrop-blur-xl overflow-y-auto no-print">
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
          <aside className="w-[580px] shrink-0 border-l border-gray-200 dark:border-dark-edge bg-gray-100 dark:bg-dark-base backdrop-blur-lg overflow-y-auto">
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
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-white/90 focus:backdrop-blur-lg focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-[var(--shadow-glass-lg)] focus:text-blue-600 focus:font-medium"
      >
        Skip to editor
      </a>
      {layoutContent}
      <TemplateGallery />
    </>
  )
}
