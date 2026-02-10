// =============================================================================
// Resume Builder - Auto-Save Hook (Convex)
// =============================================================================
// Saves the current resume to Convex with debouncing.
// Fires 2 seconds after the last change, plus a periodic backup every 30s.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Resume } from '@/types/resume';
import type { Id } from '../../convex/_generated/dataModel';

const DEBOUNCE_MS = 2_000;
const PERIODIC_SAVE_MS = 30_000;

export interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  saveNow: () => void;
}

export function useAutoSave(resume: Resume | null): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const resumeRef = useRef<Resume | null>(resume);
  const saveToConvex = useMutation(api.resumes.save);
  const pendingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  // Keep the ref in sync so we always save the latest data
  useEffect(() => {
    resumeRef.current = resume;
  }, [resume]);

  const save = useCallback(async () => {
    const current = resumeRef.current;
    if (!current || !current.id) return;
    if (savingRef.current) return; // Prevent concurrent saves

    savingRef.current = true;
    setIsSaving(true);
    try {
      await saveToConvex({
        id: current.id as Id<"resumes">,
        data: JSON.stringify(current),
        name: current.name,
        templateId: current.templateId,
      });
      setLastSaved(new Date());
      pendingRef.current = false;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [saveToConvex]);

  // Debounced save on every resume change
  useEffect(() => {
    if (!resume) return;

    pendingRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      save();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [resume, save]);

  // Periodic backup save every 30s
  useEffect(() => {
    if (!resume) return;
    const interval = setInterval(() => {
      if (pendingRef.current) save();
    }, PERIODIC_SAVE_MS);
    return () => clearInterval(interval);
  }, [resume, save]);

  // Warn on beforeunload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { lastSaved, isSaving, saveNow: save };
}
