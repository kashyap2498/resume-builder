// =============================================================================
// Resume Builder - Cover Letter Preview (PDF-based)
// =============================================================================
//
// Renders the actual cover letter PDF in the preview panel using
// @react-pdf/renderer to generate the PDF and pdfjs-dist to render each
// page to a canvas image. Pixel-perfect match with the exported PDF.
// =============================================================================

import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { usePdfPreview } from '@/hooks/usePdfPreview'

// -- Constants ----------------------------------------------------------------

const ZOOM_STEP = 10
const MIN_ZOOM = 25
const MAX_ZOOM = 200
const A4_WIDTH = 595
const A4_HEIGHT = 842
const PAGE_GAP = 24

export default function CoverLetterPreview() {
  const previewZoom = useUIStore((s) => s.previewZoom)
  const setPreviewZoom = useUIStore((s) => s.setPreviewZoom)
  const currentResume = useResumeStore((s) => s.currentResume)

  const { pages, numPages, isGenerating } = usePdfPreview(currentResume, 'coverLetter')

  const handleZoomIn = () => setPreviewZoom(previewZoom + ZOOM_STEP)
  const handleZoomOut = () => setPreviewZoom(previewZoom - ZOOM_STEP)
  const handleFitWidth = () => {
    const fitZoom = Math.round((380 / A4_WIDTH) * 100)
    setPreviewZoom(fitZoom)
  }

  const scale = previewZoom / 100

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Cover Letter Preview</span>
          {numPages > 1 && (
            <span className="text-xs text-gray-400">
              {numPages} pages
            </span>
          )}
          {isGenerating && (
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          )}
        </div>

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
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col items-center" style={{ gap: PAGE_GAP * scale }}>
          {pages.length > 0 ? (
            pages.map((pageDataUrl, i) => (
              <div key={i} className="relative">
                {/* Page sheet */}
                <div
                  className="bg-white shadow-lg border border-gray-200 overflow-hidden"
                  style={{
                    width: A4_WIDTH * scale,
                    height: A4_HEIGHT * scale,
                  }}
                >
                  <img
                    src={pageDataUrl}
                    alt={`Page ${i + 1}`}
                    className="max-w-none"
                    style={{
                      width: A4_WIDTH,
                      height: A4_HEIGHT,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  />
                </div>

                {/* Page number label */}
                <div
                  className="flex items-center justify-center mt-2"
                  style={{ width: A4_WIDTH * scale }}
                >
                  <span className="text-xs text-gray-400 tabular-nums">
                    Page {i + 1}{numPages > 1 ? ` of ${numPages}` : ''}
                  </span>
                </div>
              </div>
            ))
          ) : (
            /* Placeholder skeleton while loading or no resume */
            <div className="relative">
              <div
                className="bg-white shadow-lg border border-gray-200 overflow-hidden flex items-center justify-center"
                style={{
                  width: A4_WIDTH * scale,
                  height: A4_HEIGHT * scale,
                }}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                    <span className="text-xs text-gray-400">Generating preview...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {currentResume ? 'Preparing preview...' : 'No resume loaded'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>
    </div>
  )
}
