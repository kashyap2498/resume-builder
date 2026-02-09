import { useState, useCallback } from 'react'
import type { Resume } from '@/types/resume'

export interface UseCoverLetterPdfExportReturn {
  exportCoverLetterPdf: (resume: Resume) => Promise<void>
  isExporting: boolean
}

export function useCoverLetterPdfExport(): UseCoverLetterPdfExportReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportCoverLetterPdf = useCallback(async (resume: Resume) => {
    setIsExporting(true)
    try {
      const { default: CoverLetterPdfTemplate } = await import(
        '@/components/coverLetter/CoverLetterPdfTemplate'
      )
      const { pdf } = await import('@react-pdf/renderer')
      const React = await import('react')
      const element = React.createElement(CoverLetterPdfTemplate, { resume })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeName = (resume.name || 'cover-letter').replace(/\s+/g, '_')
      link.download = `${safeName}_cover_letter.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Cover letter PDF export failed:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportCoverLetterPdf, isExporting }
}

export interface UseCoverLetterDocxExportReturn {
  exportCoverLetterDocx: (resume: Resume) => Promise<void>
  isExporting: boolean
}

export function useCoverLetterDocxExport(): UseCoverLetterDocxExportReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportCoverLetterDocx = useCallback(async (resume: Resume) => {
    setIsExporting(true)
    try {
      const { exportCoverLetterAsDocx } = await import('@/utils/coverLetterDocxExport')
      await exportCoverLetterAsDocx(resume)
    } catch (error) {
      console.error('Cover letter DOCX export failed:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportCoverLetterDocx, isExporting }
}
