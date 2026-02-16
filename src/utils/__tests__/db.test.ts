import { describe, it, expect, beforeEach } from 'vitest'
import { saveHistorySnapshot, loadHistorySnapshots, clearHistorySnapshots } from '@/utils/db'
import { mockResume } from '@/test/fixtures'

// fake-indexeddb/auto is loaded in test setup, so IDB is available.
// Each test gets a fresh DB because vitest isolates workers.

describe('db - history cleanup', () => {
  const RESUME_ID = 'cleanup-test-resume'

  beforeEach(async () => {
    await clearHistorySnapshots(RESUME_ID)
  })

  it('should keep at most 50 snapshots per resume', async () => {
    const snapshot = { ...mockResume, id: RESUME_ID }

    // Insert 60 snapshots
    for (let i = 0; i < 60; i++) {
      await saveHistorySnapshot(RESUME_ID, snapshot)
    }

    const remaining = await loadHistorySnapshots(RESUME_ID)
    expect(remaining.length).toBe(50)
  })

  it('should not delete snapshots from other resumes', async () => {
    const OTHER_ID = 'other-resume'
    const snapshot = { ...mockResume, id: RESUME_ID }
    const otherSnapshot = { ...mockResume, id: OTHER_ID }

    // Insert 5 for other resume
    for (let i = 0; i < 5; i++) {
      await saveHistorySnapshot(OTHER_ID, otherSnapshot)
    }

    // Insert 55 for target resume (triggers cleanup)
    for (let i = 0; i < 55; i++) {
      await saveHistorySnapshot(RESUME_ID, snapshot)
    }

    const targetRemaining = await loadHistorySnapshots(RESUME_ID)
    const otherRemaining = await loadHistorySnapshots(OTHER_ID)

    expect(targetRemaining.length).toBe(50)
    expect(otherRemaining.length).toBe(5)

    // Cleanup
    await clearHistorySnapshots(OTHER_ID)
  })

  it('should not delete anything when under 50 snapshots', async () => {
    const snapshot = { ...mockResume, id: RESUME_ID }

    for (let i = 0; i < 30; i++) {
      await saveHistorySnapshot(RESUME_ID, snapshot)
    }

    const remaining = await loadHistorySnapshots(RESUME_ID)
    expect(remaining.length).toBe(30)
  })
})
