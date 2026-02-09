// =============================================================================
// Resume Builder - AppShell (3-panel layout)
// =============================================================================
//
// Desktop  : 280px sidebar | flex-1 editor | 420px preview
// Tablet   : toggle between editor and preview
// Mobile   : tabs for sections / editor / preview
// =============================================================================

import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import EditorPanel from './EditorPanel'
import PreviewPanel from './PreviewPanel'
import { TemplateGallery } from '@/components/templates'

type MobileTab = 'sections' | 'editor' | 'preview'

export default function AppShell() {
  const isMobile = useUIStore((s) => s.isMobile)
  const isTablet = useUIStore((s) => s.isTablet)

  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [showPreview, setShowPreview] = useState(false)

  // -- Determine layout content ------------------------------------------------

  let layoutContent: React.ReactNode

  if (isMobile) {
    // -- Mobile layout --------------------------------------------------------
    layoutContent = (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar />

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          {(['sections', 'editor', 'preview'] as const).map((tab) => (
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
          {mobileTab === 'sections' && (
            <div className="h-full overflow-y-auto">
              <Sidebar />
            </div>
          )}
          {mobileTab === 'editor' && (
            <div className="h-full overflow-y-auto">
              <EditorPanel />
            </div>
          )}
          {mobileTab === 'preview' && (
            <div className="h-full overflow-y-auto">
              <PreviewPanel />
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
          {/* Sidebar always visible on tablet */}
          <aside className="w-[240px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Editor or Preview */}
          <div className="flex-1 overflow-y-auto">
            {showPreview ? <PreviewPanel /> : <EditorPanel />}
          </div>
        </div>
      </div>
    )
  } else {
    // -- Desktop layout -------------------------------------------------------
    layoutContent = (
      <div className="flex h-screen flex-col bg-gray-50">
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <aside className="w-[280px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Center editor */}
          <main className="flex-1 overflow-y-auto">
            <EditorPanel />
          </main>

          {/* Right preview */}
          <aside className="w-[420px] shrink-0 border-l border-gray-200 bg-gray-100 overflow-y-auto">
            <PreviewPanel />
          </aside>
        </div>
      </div>
    )
  }

  return (
    <>
      {layoutContent}
      <TemplateGallery />
    </>
  )
}
