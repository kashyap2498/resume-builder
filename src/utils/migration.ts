import { saveResume, saveResumeListItem, isIndexedDBAvailable } from './db'
import type { Resume } from '@/types/resume'
import type { ResumeListItem } from '@/store/resumeListStore'

const MIGRATION_FLAG = 'idb-migrated'

export async function migrateLocalStorageToIndexedDB(): Promise<void> {
  if (!isIndexedDBAvailable()) return
  if (localStorage.getItem(MIGRATION_FLAG)) return

  try {
    // Migrate resume list
    const listRaw = localStorage.getItem('resume-builder-list')
    if (listRaw) {
      const parsed = JSON.parse(listRaw)
      const resumes: ResumeListItem[] = parsed?.state?.resumes ?? []
      for (const item of resumes) {
        await saveResumeListItem(item)
      }
    }

    // Migrate individual resumes — snapshot keys before iterating
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    for (const key of keys) {
      if (key.startsWith('resume-') && key !== 'resume-builder-list') {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const resume: Resume = JSON.parse(raw)
            if (resume.id && resume.data) {
              await saveResume(resume)
            }
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    localStorage.setItem(MIGRATION_FLAG, 'true')
  } catch (error) {
    console.warn('Migration from localStorage to IndexedDB failed:', error)
  }
}
