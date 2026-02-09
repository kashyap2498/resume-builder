// =============================================================================
// Resume Builder - Cover Letter Preview
// =============================================================================

import { useMemo } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import type { Resume } from '@/types/resume'

// -- Constants ----------------------------------------------------------------

const ZOOM_STEP = 10
const MIN_ZOOM = 25
const MAX_ZOOM = 200
const A4_WIDTH = 595
const A4_HEIGHT = 842

export default function CoverLetterPreview() {
  const previewZoom = useUIStore((s) => s.previewZoom)
  const setPreviewZoom = useUIStore((s) => s.setPreviewZoom)
  const currentResume = useResumeStore((s) => s.currentResume)

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
        <span className="text-xs font-medium text-gray-500">Cover Letter Preview</span>

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
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {currentResume ? (
              <CoverLetterContent resume={currentResume} />
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
// CoverLetterContent
// =============================================================================

interface CoverLetterContentProps {
  resume: Resume
}

function CoverLetterContent({ resume }: CoverLetterContentProps) {
  const cl = resume.coverLetter
  const contact = resume.data.contact
  const { font, colors, layout } = resume.styling

  const styles = useMemo(() => ({
    container: {
      height: '100%',
      paddingTop: layout.margins.top,
      paddingRight: layout.margins.right,
      paddingBottom: layout.margins.bottom,
      paddingLeft: layout.margins.left,
      fontFamily: font.family || 'system-ui, sans-serif',
      fontSize: font.sizes.normal,
      lineHeight: font.lineHeight,
      color: colors.text,
      overflow: 'hidden' as const,
    },
    senderName: {
      fontFamily: font.headerFamily || font.family || 'system-ui, sans-serif',
      fontSize: font.sizes.name,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: 2,
    },
    senderContact: {
      fontSize: font.sizes.small,
      color: colors.lightText,
      marginBottom: layout.sectionSpacing,
    },
    date: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: layout.sectionSpacing,
    },
    recipientBlock: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: layout.sectionSpacing,
      lineHeight: 1.6,
    },
    salutation: {
      fontSize: font.sizes.normal,
      color: colors.text,
      fontWeight: 600,
      marginBottom: layout.itemSpacing + 4,
    },
    paragraph: {
      fontSize: font.sizes.normal,
      color: colors.text,
      lineHeight: font.lineHeight,
      marginBottom: layout.itemSpacing + 4,
    },
    signOff: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: 4,
    },
    signatureName: {
      fontSize: font.sizes.normal,
      fontWeight: 700,
      color: colors.text,
    },
  }), [font, colors, layout])

  if (!cl) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400">No cover letter data</p>
      </div>
    )
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  const contactParts = [contact.email, contact.phone, contact.location].filter(Boolean)

  return (
    <div style={styles.container}>
      {/* Sender Header */}
      {fullName && <div style={styles.senderName}>{fullName}</div>}
      {contactParts.length > 0 && (
        <div style={styles.senderContact}>{contactParts.join(' | ')}</div>
      )}

      {/* Date */}
      {cl.date && <div style={styles.date}>{cl.date}</div>}

      {/* Recipient Block */}
      {(cl.recipientName || cl.recipientTitle || cl.companyName || cl.companyAddress) && (
        <div style={styles.recipientBlock}>
          {cl.recipientName && <div>{cl.recipientName}</div>}
          {cl.recipientTitle && <div>{cl.recipientTitle}</div>}
          {cl.companyName && <div>{cl.companyName}</div>}
          {cl.companyAddress && <div>{cl.companyAddress}</div>}
        </div>
      )}

      {/* Salutation */}
      {cl.salutation && <div style={styles.salutation}>{cl.salutation}</div>}

      {/* Paragraphs */}
      {cl.openingParagraph && <div style={styles.paragraph}>{cl.openingParagraph}</div>}
      {cl.bodyParagraph && <div style={styles.paragraph}>{cl.bodyParagraph}</div>}
      {cl.closingParagraph && <div style={styles.paragraph}>{cl.closingParagraph}</div>}

      {/* Sign-off */}
      {cl.signOff && <div style={styles.signOff}>{cl.signOff}</div>}
      {fullName && <div style={styles.signatureName}>{fullName}</div>}
    </div>
  )
}
