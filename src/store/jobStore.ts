import { create } from 'zustand'
import { saveJob, getJobsByResume, deleteJob } from '@/utils/db'
import type { JobApplication } from '@/types/versioning'
import { nanoid } from 'nanoid'

interface JobState {
  jobs: JobApplication[]
}

interface JobActions {
  loadJobs: (resumeId: string) => Promise<void>
  addJob: (job: Omit<JobApplication, 'id'>) => Promise<void>
  updateJob: (id: string, updates: Partial<JobApplication>) => Promise<void>
  removeJob: (id: string) => Promise<void>
}

export const useJobStore = create<JobState & JobActions>((set, get) => ({
  jobs: [],

  loadJobs: async (resumeId) => {
    const jobs = await getJobsByResume(resumeId)
    set({ jobs: jobs as JobApplication[] })
  },

  addJob: async (job) => {
    const newJob = { ...job, id: nanoid() } as JobApplication
    await saveJob(newJob as any)
    set((state) => ({ jobs: [...state.jobs, newJob] }))
  },

  updateJob: async (id, updates) => {
    const job = get().jobs.find((j) => j.id === id)
    if (!job) return
    const updated = { ...job, ...updates }
    await saveJob(updated as any)
    set((state) => ({ jobs: state.jobs.map((j) => (j.id === id ? updated : j)) }))
  },

  removeJob: async (id) => {
    await deleteJob(id)
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }))
  },
}))
