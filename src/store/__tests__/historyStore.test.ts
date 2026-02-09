import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHistoryStore } from '@/store/historyStore';
import { mockResume, createEmptyResume } from '@/test/fixtures';
import type { Resume } from '@/types/resume';

// ---------------------------------------------------------------------------
// Helper: create distinct resume snapshots for testing undo/redo
// ---------------------------------------------------------------------------
function makeResume(name: string): Resume {
  return createEmptyResume({ id: name, name });
}

describe('historyStore', () => {
  beforeEach(() => {
    useHistoryStore.setState({ past: [], future: [], maxHistory: 50 });
  });

  // =========================================================================
  // Initial state
  // =========================================================================

  describe('initial state', () => {
    it('should have empty past and future arrays', () => {
      const state = useHistoryStore.getState();
      expect(state.past).toEqual([]);
      expect(state.future).toEqual([]);
    });

    it('should have maxHistory of 50', () => {
      expect(useHistoryStore.getState().maxHistory).toBe(50);
    });
  });

  // =========================================================================
  // pushState
  // =========================================================================

  describe('pushState', () => {
    it('should add the resume to the past stack', () => {
      const resume = structuredClone(mockResume);
      useHistoryStore.getState().pushState(resume);

      const state = useHistoryStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(resume);
    });

    it('should clear the future stack when pushing', () => {
      // Simulate some future state
      useHistoryStore.setState({ future: [makeResume('future-1')] });
      useHistoryStore.getState().pushState(makeResume('new'));

      expect(useHistoryStore.getState().future).toEqual([]);
    });

    it('should accumulate multiple states in past', () => {
      useHistoryStore.getState().pushState(makeResume('v1'));
      useHistoryStore.getState().pushState(makeResume('v2'));
      useHistoryStore.getState().pushState(makeResume('v3'));

      const past = useHistoryStore.getState().past;
      expect(past).toHaveLength(3);
      expect(past[0].name).toBe('v1');
      expect(past[1].name).toBe('v2');
      expect(past[2].name).toBe('v3');
    });
  });

  // =========================================================================
  // undo
  // =========================================================================

  describe('undo', () => {
    it('should return the most recent past state', () => {
      const v1 = makeResume('v1');
      const current = makeResume('current');
      useHistoryStore.getState().pushState(v1);

      const result = useHistoryStore.getState().undo(current);
      expect(result).toEqual(v1);
    });

    it('should pop from past and push current to future', () => {
      const v1 = makeResume('v1');
      const v2 = makeResume('v2');
      const current = makeResume('current');

      useHistoryStore.getState().pushState(v1);
      useHistoryStore.getState().pushState(v2);

      useHistoryStore.getState().undo(current);

      const state = useHistoryStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0].name).toBe('v1');
      expect(state.future).toHaveLength(1);
      expect(state.future[0].name).toBe('current');
    });

    it('should return null when past is empty', () => {
      const result = useHistoryStore.getState().undo(makeResume('current'));
      expect(result).toBeNull();
    });

    it('should not modify state when past is empty', () => {
      const beforeState = useHistoryStore.getState();
      useHistoryStore.getState().undo(makeResume('current'));

      expect(useHistoryStore.getState().past).toEqual(beforeState.past);
      expect(useHistoryStore.getState().future).toEqual(beforeState.future);
    });

    it('should support multiple consecutive undos', () => {
      const v1 = makeResume('v1');
      const v2 = makeResume('v2');
      const v3 = makeResume('v3');

      useHistoryStore.getState().pushState(v1);
      useHistoryStore.getState().pushState(v2);

      // Undo from v3 (current)
      const result1 = useHistoryStore.getState().undo(v3);
      expect(result1!.name).toBe('v2');

      // Undo again from v2 (now current)
      const result2 = useHistoryStore.getState().undo(v2);
      expect(result2!.name).toBe('v1');

      // Future now has v3 and v2
      const future = useHistoryStore.getState().future;
      expect(future).toHaveLength(2);
      expect(future[0].name).toBe('v2');
      expect(future[1].name).toBe('v3');
    });
  });

  // =========================================================================
  // redo
  // =========================================================================

  describe('redo', () => {
    it('should return the first future state', () => {
      const v1 = makeResume('v1');
      const v2 = makeResume('v2');

      useHistoryStore.getState().pushState(v1);
      // Undo to create a future entry
      useHistoryStore.getState().undo(v2);

      const result = useHistoryStore.getState().redo(v1);
      expect(result!.name).toBe('v2');
    });

    it('should pop from future and push current to past', () => {
      const v1 = makeResume('v1');
      const v2 = makeResume('v2');

      useHistoryStore.getState().pushState(v1);
      useHistoryStore.getState().undo(v2);
      // At this point: past=[], future=[v2]

      useHistoryStore.getState().redo(v1);
      // Now: past=[v1], future=[]

      const state = useHistoryStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0].name).toBe('v1');
      expect(state.future).toHaveLength(0);
    });

    it('should return null when future is empty', () => {
      const result = useHistoryStore.getState().redo(makeResume('current'));
      expect(result).toBeNull();
    });

    it('should not modify state when future is empty', () => {
      useHistoryStore.getState().redo(makeResume('current'));
      expect(useHistoryStore.getState().past).toEqual([]);
      expect(useHistoryStore.getState().future).toEqual([]);
    });
  });

  // =========================================================================
  // canUndo / canRedo
  // =========================================================================

  describe('canUndo / canRedo', () => {
    it('canUndo should return false when past is empty', () => {
      expect(useHistoryStore.getState().canUndo()).toBe(false);
    });

    it('canUndo should return true when past has entries', () => {
      useHistoryStore.getState().pushState(makeResume('v1'));
      expect(useHistoryStore.getState().canUndo()).toBe(true);
    });

    it('canRedo should return false when future is empty', () => {
      expect(useHistoryStore.getState().canRedo()).toBe(false);
    });

    it('canRedo should return true when future has entries', () => {
      useHistoryStore.getState().pushState(makeResume('v1'));
      useHistoryStore.getState().undo(makeResume('current'));
      expect(useHistoryStore.getState().canRedo()).toBe(true);
    });
  });

  // =========================================================================
  // clear
  // =========================================================================

  describe('clear', () => {
    it('should empty both past and future stacks', () => {
      useHistoryStore.getState().pushState(makeResume('v1'));
      useHistoryStore.getState().pushState(makeResume('v2'));
      useHistoryStore.getState().undo(makeResume('current'));

      // Verify non-empty before clear
      expect(useHistoryStore.getState().past.length).toBeGreaterThan(0);
      expect(useHistoryStore.getState().future.length).toBeGreaterThan(0);

      useHistoryStore.getState().clear();

      expect(useHistoryStore.getState().past).toEqual([]);
      expect(useHistoryStore.getState().future).toEqual([]);
    });
  });

  // =========================================================================
  // History limit
  // =========================================================================

  describe('history limit', () => {
    it('should trim old states when exceeding maxHistory', () => {
      useHistoryStore.setState({ maxHistory: 5 });

      // Push 7 states — only the last 5 should be kept
      for (let i = 0; i < 7; i++) {
        useHistoryStore.getState().pushState(makeResume(`v${i}`));
      }

      const past = useHistoryStore.getState().past;
      expect(past).toHaveLength(5);
      // The oldest two (v0, v1) should be trimmed
      expect(past[0].name).toBe('v2');
      expect(past[4].name).toBe('v6');
    });

    it('should keep exactly maxHistory entries when at the limit', () => {
      useHistoryStore.setState({ maxHistory: 3 });

      useHistoryStore.getState().pushState(makeResume('v1'));
      useHistoryStore.getState().pushState(makeResume('v2'));
      useHistoryStore.getState().pushState(makeResume('v3'));

      expect(useHistoryStore.getState().past).toHaveLength(3);

      // Push one more — should still be 3
      useHistoryStore.getState().pushState(makeResume('v4'));
      const past = useHistoryStore.getState().past;
      expect(past).toHaveLength(3);
      expect(past[0].name).toBe('v2');
      expect(past[2].name).toBe('v4');
    });
  });

  // =========================================================================
  // Undo / Redo round-trip
  // =========================================================================

  describe('undo/redo round-trip', () => {
    it('should restore the original state after undo then redo', () => {
      const v1 = makeResume('v1');
      const v2 = makeResume('v2');

      useHistoryStore.getState().pushState(v1);

      // Undo from v2
      const undone = useHistoryStore.getState().undo(v2);
      expect(undone).toEqual(v1);

      // Redo from v1
      const redone = useHistoryStore.getState().redo(v1);
      expect(redone).toEqual(v2);
    });
  });
});
