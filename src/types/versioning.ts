import type { Resume } from './resume'

export interface ResumeVersion {
  id: string
  resumeId: string
  snapshot: Resume
  label: string
  createdAt: string
}

export type JobApplicationStatus = 'draft' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface JobApplication {
  id: string
  resumeId: string
  company: string
  role: string
  dateApplied: string
  status: JobApplicationStatus
  notes: string
}
