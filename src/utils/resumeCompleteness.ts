import type { ResumeData } from '@/types/resume'

export function getResumeCompleteness(data: ResumeData): { percent: number; details: string[] } {
  const checks: { label: string; filled: boolean }[] = [
    { label: 'First name', filled: !!data.contact.firstName },
    { label: 'Last name', filled: !!data.contact.lastName },
    { label: 'Email', filled: !!data.contact.email },
    { label: 'Phone', filled: !!data.contact.phone },
    { label: 'Professional title', filled: !!data.contact.title },
    { label: 'Summary', filled: !!data.summary?.text?.trim() },
    { label: 'At least 1 experience', filled: data.experience.length > 0 },
    { label: 'At least 1 education', filled: data.education.length > 0 },
    { label: 'At least 1 skill category', filled: data.skills.length > 0 },
  ]

  const filled = checks.filter((c) => c.filled).length
  const missing = checks.filter((c) => !c.filled).map((c) => c.label)

  return {
    percent: Math.round((filled / checks.length) * 100),
    details: missing,
  }
}
