// =============================================================================
// Resume Builder - Preview Panel (Right)
// =============================================================================

import { useMemo } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/templates'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import type { Resume } from '@/types/resume'

// -- Constants ----------------------------------------------------------------

const ZOOM_STEP = 10
const MIN_ZOOM = 25
const MAX_ZOOM = 200

// A4 dimensions in points (at 100% zoom, 1pt = 1px on screen)
const A4_WIDTH = 595
const A4_HEIGHT = 842

export default function PreviewPanel() {
  const previewZoom = useUIStore((s) => s.previewZoom)
  const setPreviewZoom = useUIStore((s) => s.setPreviewZoom)
  const currentResume = useResumeStore((s) => s.currentResume)

  const handleZoomIn = () => setPreviewZoom(previewZoom + ZOOM_STEP)
  const handleZoomOut = () => setPreviewZoom(previewZoom - ZOOM_STEP)
  const handleFitWidth = () => {
    // Approximate fit: panel is ~420px, minus some padding
    const fitZoom = Math.round((380 / A4_WIDTH) * 100)
    setPreviewZoom(fitZoom)
  }

  const scale = previewZoom / 100

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shrink-0">
        <span className="text-xs font-medium text-gray-500">Preview</span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={previewZoom <= MIN_ZOOM}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="w-12 text-center text-xs font-medium text-gray-600 tabular-nums">
            {previewZoom}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={previewZoom >= MAX_ZOOM}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-gray-200" />

          <button
            onClick={handleFitWidth}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Fit to width"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div
          className="print-area bg-white shadow-lg border border-gray-200 relative"
          style={{
            width: A4_WIDTH * scale,
            height: A4_HEIGHT * scale,
            transformOrigin: 'top center',
          }}
        >
          {/* Inner content at native scale */}
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {currentResume ? (
              <ErrorBoundary fallbackMessage="Preview rendering failed">
                <PreviewContent resume={currentResume} />
              </ErrorBoundary>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">No resume loaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PreviewContent
// =============================================================================

interface PreviewContentProps {
  resume: Resume
}

function PreviewContent({ resume }: PreviewContentProps) {
  const template = useMemo(() => getTemplate(resume.templateId), [resume.templateId])

  // If a registered template is found, render its preview component
  if (template) {
    const TemplatePreview = template.previewComponent
    return <TemplatePreview resume={resume} />
  }

  // Fallback: basic preview when template is not registered
  const { contact } = resume.data
  const fullName =
    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
    'Your Name'

  return (
    <div className="h-full p-10 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h1>
        {contact.title && (
          <p className="text-sm text-gray-600 mb-2">{contact.title}</p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-gray-500">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </div>

      {/* Sections */}
      {resume.sections
        .filter((s) => s.visible && s.type !== 'contact')
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div key={section.id} className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 pb-1 border-b border-gray-100">
              {section.title}
            </h2>
            <p className="text-xs text-gray-400 italic">
              Content will render here with the selected template.
            </p>
          </div>
        ))}

      {/* Watermark */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[8px] text-gray-300 uppercase tracking-widest">
          {resume.templateId.replace(/-/g, ' ')} template
        </p>
      </div>
    </div>
  )
}
