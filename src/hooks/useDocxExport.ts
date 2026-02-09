import { useState, useCallback } from 'react'
import type { Resume } from '@/types/resume'

export interface UseDocxExportReturn {
  exportDocx: (resume: Resume) => Promise<void>
  isExporting: boolean
}

export function useDocxExport(): UseDocxExportReturn {
  const [isExporting, setIsExporting] = useState(false)

  const exportDocx = useCallback(async (resume: Resume) => {
    setIsExporting(true)
    try {
      const { exportResumeAsDocx } = await import('@/utils/docxExport')
      await exportResumeAsDocx(resume)
    } catch (error) {
      console.error('DOCX export failed:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportDocx, isExporting }
}
