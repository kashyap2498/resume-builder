import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockResume } from '@/test/fixtures'

describe('docxExport', () => {
  beforeEach(() => {
    // Mock the download trigger
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
  })

  it('exports resume as docx blob', async () => {
    const { exportResumeAsDocx } = await import('@/utils/docxExport')

    // Should not throw
    await expect(exportResumeAsDocx(mockResume)).resolves.not.toThrow()
  })
})
