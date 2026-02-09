import { create } from 'zustand'
import { saveVersion, getVersions } from '@/utils/db'
import type { Resume } from '@/types/resume'
import type { ResumeVersion } from '@/types/versioning'

interface VersionState {
  versions: ResumeVersion[]
}

interface VersionActions {
  saveNewVersion: (resumeId: string, snapshot: Resume, label: string) => Promise<void>
  loadVersions: (resumeId: string) => Promise<void>
  restoreVersion: (version: ResumeVersion) => Resume
}

export const useVersionStore = create<VersionState & VersionActions>((set) => ({
  versions: [],

  saveNewVersion: async (resumeId, snapshot, label) => {
    await saveVersion(resumeId, snapshot, label)
    const versions = await getVersions(resumeId)
    set({ versions: versions as ResumeVersion[] })
  },

  loadVersions: async (resumeId) => {
    const versions = await getVersions(resumeId)
    set({ versions: versions as ResumeVersion[] })
  },

  restoreVersion: (version) => {
    return version.snapshot
  },
}))
