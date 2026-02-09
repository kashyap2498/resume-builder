// =============================================================================
// Resume Builder - Resume List Store (persisted to localStorage)
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

// -- Types --------------------------------------------------------------------

export interface ResumeListItem {
  id: string;
  name: string;
  templateId: string;
  updatedAt: string;
}

// -- Store Shape --------------------------------------------------------------

interface ResumeListState {
  resumes: ResumeListItem[];
  currentResumeId: string | null;
}

interface ResumeListActions {
  addResume: (resume: Omit<ResumeListItem, 'id' | 'updatedAt'>) => string;
  removeResume: (id: string) => void;
  duplicateResume: (id: string) => string | null;
  renameResume: (id: string, name: string) => void;
  setCurrentResume: (id: string | null) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export type ResumeListStore = ResumeListState & ResumeListActions;

// -- Helpers ------------------------------------------------------------------

const now = () => new Date().toISOString();

const STORAGE_KEY = 'resume-builder-list';

// -- Store --------------------------------------------------------------------

export const useResumeListStore = create<ResumeListStore>()(
  persist(
    (set, get) => ({
      // -- State --------------------------------------------------------------
      resumes: [],
      currentResumeId: null,

      // -- Actions ------------------------------------------------------------

      addResume: (resume) => {
        const id = nanoid();
        set((state) => ({
          resumes: [
            ...state.resumes,
            { ...resume, id, updatedAt: now() },
          ],
          currentResumeId: id,
        }));
        return id;
      },

      removeResume: (id) =>
        set((state) => {
          const filtered = state.resumes.filter((r) => r.id !== id);
          return {
            resumes: filtered,
            currentResumeId:
              state.currentResumeId === id
                ? filtered.length > 0
                  ? filtered[0].id
                  : null
                : state.currentResumeId,
          };
        }),

      duplicateResume: (id) => {
        const state = get();
        const original = state.resumes.find((r) => r.id === id);
        if (!original) return null;

        const newId = nanoid();
        set((s) => ({
          resumes: [
            ...s.resumes,
            {
              ...original,
              id: newId,
              name: `${original.name} (Copy)`,
              updatedAt: now(),
            },
          ],
          currentResumeId: newId,
        }));
        return newId;
      },

      renameResume: (id, name) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, name, updatedAt: now() } : r,
          ),
        })),

      setCurrentResume: (id) => set({ currentResumeId: id }),

      loadFromStorage: () => {
        // persist middleware handles rehydration automatically; this is a
        // manual escape-hatch if the consumer needs to force a reload.
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state) {
              set({
                resumes: parsed.state.resumes ?? [],
                currentResumeId: parsed.state.currentResumeId ?? null,
              });
            }
          }
        } catch {
          // silently ignore parse errors
        }
      },

      saveToStorage: () => {
        // persist middleware auto-saves, but this allows manual flush.
        try {
          const { resumes, currentResumeId } = get();
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ state: { resumes, currentResumeId } }),
          );
        } catch {
          // silently ignore quota errors
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        resumes: state.resumes,
        currentResumeId: state.currentResumeId,
      }),
    },
  ),
);
