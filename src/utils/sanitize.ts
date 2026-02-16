import DOMPurify from 'dompurify'
import type { ResumeData } from '@/types/resume'
import type { Resume } from '@/types/resume'
import { resumeSchema } from '@/schemas'

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

function sanitizeStringFields(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeText(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeStringFields)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeStringFields(value)
    }
    return result
  }
  return obj
}

export function sanitizeResumeData(data: Partial<ResumeData>): Partial<ResumeData> {
  return sanitizeStringFields(data) as Partial<ResumeData>
}

export function sanitizeImportedResume(data: unknown): Resume | null {
  const sanitized = sanitizeStringFields(data)
  const result = resumeSchema.safeParse(sanitized)
  if (result.success) {
    return result.data as Resume
  }
  console.warn('Resume validation failed after sanitization:', result.error)
  return null
}
