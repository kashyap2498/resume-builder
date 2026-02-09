import { openDB, type IDBPDatabase } from 'idb'
import type { Resume } from '@/types/resume'
import type { ResumeListItem } from '@/store/resumeListStore'

const DB_NAME = 'resume-builder-db'
const DB_VERSION = 2

interface ResumeBuilderDB {
  resumes: { key: string; value: Resume }
  resumeList: { key: string; value: ResumeListItem }
  history: { key: number; value: { resumeId: string; snapshot: Resume; timestamp: number }; indexes: { resumeId: string } }
  versions: { key: number; value: { id: string; resumeId: string; snapshot: Resume; label: string; createdAt: string }; indexes: { resumeId: string } }
  jobs: { key: string; value: { id: string; resumeId: string; company: string; role: string; dateApplied: string; status: string; notes: string } }
}

let dbPromise: Promise<IDBPDatabase<ResumeBuilderDB>> | null = null

function getDB(): Promise<IDBPDatabase<ResumeBuilderDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ResumeBuilderDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('resumes', { keyPath: 'id' })
          db.createObjectStore('resumeList', { keyPath: 'id' })
          const historyStore = db.createObjectStore('history', { keyPath: undefined, autoIncrement: true })
          historyStore.createIndex('resumeId', 'resumeId')
        }
        if (oldVersion < 2) {
          const versionStore = db.createObjectStore('versions', { keyPath: undefined, autoIncrement: true })
          versionStore.createIndex('resumeId', 'resumeId')
          db.createObjectStore('jobs', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// -- Resume CRUD --
export async function saveResume(resume: Resume): Promise<void> {
  const db = await getDB()
  await db.put('resumes', resume)
}

export async function loadResume(id: string): Promise<Resume | undefined> {
  const db = await getDB()
  return db.get('resumes', id)
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('resumes', id)
}

// -- Resume List CRUD --
export async function saveResumeListItem(item: ResumeListItem): Promise<void> {
  const db = await getDB()
  await db.put('resumeList', item)
}

export async function getAllResumeListItems(): Promise<ResumeListItem[]> {
  const db = await getDB()
  return db.getAll('resumeList')
}

export async function deleteResumeListItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('resumeList', id)
}

// -- History --
export async function saveHistorySnapshot(resumeId: string, snapshot: Resume): Promise<void> {
  const db = await getDB()
  await db.add('history', { resumeId, snapshot, timestamp: Date.now() })
  // Keep max 50 per resume
  const tx = db.transaction('history', 'readwrite')
  const index = tx.store.index('resumeId')
  const all = await index.getAll(resumeId)
  if (all.length > 50) {
    const toDelete = all.slice(0, all.length - 50)
    for (const item of toDelete) {
      const cursor = await tx.store.openCursor()
      if (cursor) {
        // Find and delete the oldest entries
        let c = await tx.store.openCursor()
        while (c && toDelete.length > 0) {
          if (c.value.resumeId === resumeId) {
            await c.delete()
            toDelete.shift()
          }
          c = await c.continue()
        }
      }
    }
  }
  await tx.done
}

export async function loadHistorySnapshots(resumeId: string): Promise<Resume[]> {
  const db = await getDB()
  const index = db.transaction('history').store.index('resumeId')
  const all = await index.getAll(resumeId)
  return all.map((entry) => entry.snapshot)
}

export async function clearHistorySnapshots(resumeId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('history', 'readwrite')
  const index = tx.store.index('resumeId')
  let cursor = await index.openCursor(resumeId)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

// -- Versions --
export async function saveVersion(resumeId: string, snapshot: Resume, label: string): Promise<void> {
  const db = await getDB()
  await db.add('versions', { id: crypto.randomUUID?.() ?? Date.now().toString(), resumeId, snapshot, label, createdAt: new Date().toISOString() })
}

export async function getVersions(resumeId: string): Promise<Array<{ id: string; resumeId: string; snapshot: Resume; label: string; createdAt: string }>> {
  const db = await getDB()
  const index = db.transaction('versions').store.index('resumeId')
  return index.getAll(resumeId)
}

export async function deleteVersion(key: number): Promise<void> {
  const db = await getDB()
  await db.delete('versions', key)
}

// -- Jobs --
export async function saveJob(job: { id: string; resumeId: string; company: string; role: string; dateApplied: string; status: string; notes: string }): Promise<void> {
  const db = await getDB()
  await db.put('jobs', job)
}

export async function getJobsByResume(resumeId: string): Promise<Array<{ id: string; resumeId: string; company: string; role: string; dateApplied: string; status: string; notes: string }>> {
  const db = await getDB()
  const all = await db.getAll('jobs')
  return all.filter((j) => j.resumeId === resumeId)
}

export async function deleteJob(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('jobs', id)
}

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined'
  } catch {
    return false
  }
}
