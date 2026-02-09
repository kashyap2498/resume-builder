// =============================================================================
// Resume Builder - Undo/Redo History Store
// =============================================================================

import { create } from 'zustand';
import type { Resume } from '@/types/resume';

// -- Store Shape --------------------------------------------------------------

interface HistoryState {
  past: Resume[];
  future: Resume[];
  maxHistory: number;
}

interface HistoryActions {
  pushState: (resume: Resume) => void;
  undo: (currentResume: Resume) => Resume | null;
  redo: (currentResume: Resume) => Resume | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

// -- Store --------------------------------------------------------------------

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (resume) =>
    set((state) => ({
      past: [...state.past.slice(-(state.maxHistory - 1)), resume],
      future: [],
    })),

  undo: (currentResume) => {
    const { past } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [currentResume, ...state.future],
    }));
    return previous;
  },

  redo: (currentResume) => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set((state) => ({
      past: [...state.past, currentResume],
      future: state.future.slice(1),
    }));
    return next;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}));
