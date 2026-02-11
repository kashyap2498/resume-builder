// =============================================================================
// Resume Builder - PDF Preview Hook
// =============================================================================
// Generates a real PDF using @react-pdf/renderer and renders each page to a
// canvas image via pdfjs-dist. This produces a pixel-perfect preview that
// exactly matches the exported PDF.

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'
import { getTemplate } from '@/templates'
import type { Resume } from '@/types/resume'

interface PdfPreviewResult {
  pages: string[]
  numPages: number
  isGenerating: boolean
}

// Scale factor for retina-quality rendering
const RENDER_SCALE = 2

export function usePdfPreview(
  resume: Resume | null,
  type: 'resume' | 'coverLetter'
): PdfPreviewResult {
  const [pages, setPages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const generationIdRef = useRef(0)

  // Debounce the full resume object serialization to avoid regenerating on every keystroke
  const resumeJson = resume ? JSON.stringify(resume) : null
  const debouncedJson = useDebounce(resumeJson, 500)

  useEffect(() => {
    if (!debouncedJson) {
      setPages([])
      return
    }

    const currentResume: Resume = JSON.parse(debouncedJson)
    generationIdRef.current += 1
    const currentId = generationIdRef.current

    let cancelled = false

    async function generate() {
      setIsGenerating(true)
      try {
        // 1. Generate PDF blob
        const blob = await generatePdfBlob(currentResume, type)
        if (cancelled) return

        // 2. Render blob pages to canvas images
        const dataUrls = await renderPdfToImages(blob)
        if (cancelled) return

        setPages(dataUrls)
      } catch (err) {
        console.error('PDF preview generation failed:', err)
        if (!cancelled) {
          setPages([])
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false)
        }
      }
    }

    generate()

    return () => {
      cancelled = true
      // Only clear generating state if this cleanup is for the latest generation
      if (currentId === generationIdRef.current) {
        setIsGenerating(false)
      }
    }
  }, [debouncedJson, type])

  return { pages, numPages: pages.length, isGenerating }
}

async function generatePdfBlob(
  resume: Resume,
  type: 'resume' | 'coverLetter'
): Promise<Blob> {
  const { ensurePdfFontsRegistered } = await import('@/utils/pdfFontRegistry')
  await ensurePdfFontsRegistered()

  const { pdf } = await import('@react-pdf/renderer')
  const React = await import('react')

  let element: React.ReactElement

  if (type === 'coverLetter') {
    const { default: CoverLetterPdfTemplate } = await import(
      '@/components/coverLetter/CoverLetterPdfTemplate'
    )
    element = React.createElement(CoverLetterPdfTemplate, { resume })
  } else {
    const template = getTemplate(resume.templateId)
    if (!template) {
      throw new Error(`Template "${resume.templateId}" not found`)
    }
    const PdfComponent = await template.getPdfComponent()
    element = React.createElement(PdfComponent, { resume })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(element as any).toBlob()
  return blob
}

async function renderPdfToImages(blob: Blob): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist')

  // Import the worker as a URL so Vite bundles it correctly
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default

  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
  const pdfDocument = await loadingTask.promise

  const numPages = pdfDocument.numPages
  const dataUrls: string[] = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const viewport = page.getViewport({ scale: RENDER_SCALE })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const context = canvas.getContext('2d')!
    await page.render({ canvas, canvasContext: context, viewport }).promise

    dataUrls.push(canvas.toDataURL('image/png'))
  }

  return dataUrls
}
