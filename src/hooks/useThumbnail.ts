// =============================================================================
// Resume Builder - Dashboard Thumbnail Hook
// =============================================================================
// Generates a low-resolution page-1 thumbnail for dashboard resume cards.
// Reuses the same PDF pipeline as usePdfPreview but at scale 0.5 and page 1 only.
// Caches results in a module-level Map to avoid re-rendering.

import { useState, useEffect, useRef } from 'react'
import { getTemplate } from '@/templates'
import type { Resume } from '@/types/resume'

const THUMBNAIL_SCALE = 0.5

// Module-level cache: key = resumeId + ":" + simple hash of data
const thumbnailCache = new Map<string, string>()

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

export function clearThumbnailCache() {
  thumbnailCache.clear()
}

interface UseThumbnailResult {
  thumbnailUrl: string | null
  isLoading: boolean
}

export function useThumbnail(
  resumeData: string | undefined,
  templateId: string,
  resumeId: string
): UseThumbnailResult {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const generationIdRef = useRef(0)

  useEffect(() => {
    if (!resumeData) return

    const cacheKey = `${resumeId}:${simpleHash(resumeData)}`

    // Check cache
    const cached = thumbnailCache.get(cacheKey)
    if (cached) {
      setThumbnailUrl(cached)
      setIsLoading(false)
      return
    }

    generationIdRef.current += 1
    const currentId = generationIdRef.current
    let cancelled = false

    async function generate() {
      setIsLoading(true)
      try {
        // Parse resume data
        const resume: Resume = JSON.parse(resumeData!)

        // Ensure template exists
        const template = getTemplate(templateId || resume.templateId)
        if (!template) {
          setIsLoading(false)
          return
        }

        // Generate PDF blob
        const { ensurePdfFontsRegistered } = await import('@/utils/pdfFontRegistry')
        await ensurePdfFontsRegistered()

        const { pdf } = await import('@react-pdf/renderer')
        const React = await import('react')

        const PdfComponent = await template.getPdfComponent()
        const element = React.createElement(PdfComponent, { resume })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = await pdf(element as any).toBlob()
        if (cancelled) return

        // Render page 1 only at low scale
        const pdfjsLib = await import('pdfjs-dist')
        const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default

        const arrayBuffer = await blob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
        const pdfDocument = await loadingTask.promise
        if (cancelled) return

        const page = await pdfDocument.getPage(1)
        const viewport = page.getViewport({ scale: THUMBNAIL_SCALE })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height

        const context = canvas.getContext('2d')!
        await page.render({ canvas, canvasContext: context, viewport }).promise
        if (cancelled) return

        const dataUrl = canvas.toDataURL('image/png')

        // Store in cache
        thumbnailCache.set(cacheKey, dataUrl)

        if (!cancelled && currentId === generationIdRef.current) {
          setThumbnailUrl(dataUrl)
        }
      } catch (err) {
        console.error('Thumbnail generation failed:', err)
      } finally {
        if (!cancelled && currentId === generationIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    generate()

    return () => {
      cancelled = true
    }
  }, [resumeData, templateId, resumeId])

  return { thumbnailUrl, isLoading }
}
