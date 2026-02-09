// =============================================================================
// Resume Builder - Auto-Save Hook
// =============================================================================
// Saves the current resume to localStorage every 30 seconds.
// Also saves on beforeunload to prevent data loss.

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Resume } from '@/types/resume';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds
const STORAGE_KEY_PREFIX = 'resume-';

function getStorageKey(resumeId: string): string {
  return `${STORAGE_KEY_PREFIX}${resumeId}`;
}

export interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  saveNow: () => void;
}

export function useAutoSave(resume: Resume | null): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const resumeRef = useRef<Resume | null>(resume);

  // Keep the ref in sync so the beforeunload handler always has the latest data
  useEffect(() => {
    resumeRef.current = resume;
  }, [resume]);

  const save = useCallback(() => {
    const current = resumeRef.current;
    if (!current) return;

    setIsSaving(true);
    try {
      const key = getStorageKey(current.id);
      const serialized = JSON.stringify(current);
      localStorage.setItem(key, serialized);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Periodic auto-save
  useEffect(() => {
    if (!resume) return;

    const intervalId = setInterval(save, AUTO_SAVE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [resume, save]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const current = resumeRef.current;
      if (!current) return;
      try {
        const key = getStorageKey(current.id);
        localStorage.setItem(key, JSON.stringify(current));
      } catch {
        // Silently fail on beforeunload -- we cannot do much here
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { lastSaved, isSaving, saveNow: save };
}

/**
 * Load a previously auto-saved resume from localStorage.
 */
export function loadAutoSavedResume(resumeId: string): Resume | null {
  try {
    const key = getStorageKey(resumeId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Resume;
  } catch {
    return null;
  }
}

/**
 * Remove auto-saved data for a resume.
 */
export function clearAutoSavedResume(resumeId: string): void {
  try {
    const key = getStorageKey(resumeId);
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
