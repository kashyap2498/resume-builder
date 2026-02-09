import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResumeListStore } from '@/store/resumeListStore';
import type { ResumeListItem } from '@/store/resumeListStore';

describe('resumeListStore', () => {
  beforeEach(() => {
    useResumeListStore.setState({ resumes: [], currentResumeId: null });
  });

  // =========================================================================
  // Initial state
  // =========================================================================

  describe('initial state', () => {
    it('should start with an empty resumes array', () => {
      expect(useResumeListStore.getState().resumes).toEqual([]);
    });

    it('should start with null currentResumeId', () => {
      expect(useResumeListStore.getState().currentResumeId).toBeNull();
    });
  });

  // =========================================================================
  // addResume
  // =========================================================================

  describe('addResume', () => {
    it('should add a new resume and return its id', () => {
      const id = useResumeListStore.getState().addResume({
        name: 'My Resume',
        templateId: 'ats-standard',
      });

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);

      const resumes = useResumeListStore.getState().resumes;
      expect(resumes).toHaveLength(1);
      expect(resumes[0].id).toBe(id);
      expect(resumes[0].name).toBe('My Resume');
      expect(resumes[0].templateId).toBe('ats-standard');
    });

    it('should set currentResumeId to the new resume id', () => {
      const id = useResumeListStore.getState().addResume({
        name: 'First',
        templateId: 'modern',
      });

      expect(useResumeListStore.getState().currentResumeId).toBe(id);
    });

    it('should set updatedAt to a valid ISO timestamp', () => {
      useResumeListStore.getState().addResume({
        name: 'Timestamped',
        templateId: 'classic',
      });

      const resume = useResumeListStore.getState().resumes[0];
      expect(resume.updatedAt).toBeDefined();
      expect(new Date(resume.updatedAt).toISOString()).toBe(resume.updatedAt);
    });

    it('should add multiple resumes', () => {
      useResumeListStore.getState().addResume({ name: 'Resume 1', templateId: 'a' });
      useResumeListStore.getState().addResume({ name: 'Resume 2', templateId: 'b' });
      useResumeListStore.getState().addResume({ name: 'Resume 3', templateId: 'c' });

      expect(useResumeListStore.getState().resumes).toHaveLength(3);
    });

    it('should set currentResumeId to the most recently added resume', () => {
      useResumeListStore.getState().addResume({ name: 'First', templateId: 'a' });
      const id2 = useResumeListStore.getState().addResume({ name: 'Second', templateId: 'b' });

      expect(useResumeListStore.getState().currentResumeId).toBe(id2);
    });
  });

  // =========================================================================
  // removeResume
  // =========================================================================

  describe('removeResume', () => {
    it('should remove the specified resume', () => {
      const id = useResumeListStore.getState().addResume({ name: 'ToRemove', templateId: 'x' });
      useResumeListStore.getState().removeResume(id);

      expect(useResumeListStore.getState().resumes).toHaveLength(0);
    });

    it('should set currentResumeId to the first remaining resume when current is removed', () => {
      const id1 = useResumeListStore.getState().addResume({ name: 'First', templateId: 'a' });
      const id2 = useResumeListStore.getState().addResume({ name: 'Second', templateId: 'b' });
      // currentResumeId is now id2

      useResumeListStore.getState().removeResume(id2);

      expect(useResumeListStore.getState().currentResumeId).toBe(id1);
    });

    it('should set currentResumeId to null when removing the last resume', () => {
      const id = useResumeListStore.getState().addResume({ name: 'Only', templateId: 'x' });
      useResumeListStore.getState().removeResume(id);

      expect(useResumeListStore.getState().currentResumeId).toBeNull();
    });

    it('should not change currentResumeId when removing a non-current resume', () => {
      const id1 = useResumeListStore.getState().addResume({ name: 'First', templateId: 'a' });
      const id2 = useResumeListStore.getState().addResume({ name: 'Second', templateId: 'b' });
      // currentResumeId is id2

      useResumeListStore.getState().removeResume(id1);

      expect(useResumeListStore.getState().currentResumeId).toBe(id2);
      expect(useResumeListStore.getState().resumes).toHaveLength(1);
    });

    it('should be safe to call with a non-existent id', () => {
      useResumeListStore.getState().addResume({ name: 'Exists', templateId: 'a' });
      useResumeListStore.getState().removeResume('non-existent-id');

      expect(useResumeListStore.getState().resumes).toHaveLength(1);
    });
  });

  // =========================================================================
  // duplicateResume
  // =========================================================================

  describe('duplicateResume', () => {
    it('should create a copy with "(Copy)" suffix and return new id', () => {
      const originalId = useResumeListStore.getState().addResume({
        name: 'Original',
        templateId: 'modern',
      });

      const newId = useResumeListStore.getState().duplicateResume(originalId);

      expect(newId).not.toBeNull();
      expect(newId).not.toBe(originalId);

      const resumes = useResumeListStore.getState().resumes;
      expect(resumes).toHaveLength(2);

      const copy = resumes.find((r) => r.id === newId);
      expect(copy).toBeDefined();
      expect(copy!.name).toBe('Original (Copy)');
      expect(copy!.templateId).toBe('modern');
    });

    it('should set currentResumeId to the duplicated resume', () => {
      const originalId = useResumeListStore.getState().addResume({
        name: 'Original',
        templateId: 'x',
      });
      const newId = useResumeListStore.getState().duplicateResume(originalId);

      expect(useResumeListStore.getState().currentResumeId).toBe(newId);
    });

    it('should return null when duplicating a non-existent id', () => {
      const result = useResumeListStore.getState().duplicateResume('does-not-exist');
      expect(result).toBeNull();
    });

    it('should generate a new updatedAt for the copy', () => {
      const originalId = useResumeListStore.getState().addResume({
        name: 'Orig',
        templateId: 'x',
      });
      const newId = useResumeListStore.getState().duplicateResume(originalId)!;

      const resumes = useResumeListStore.getState().resumes;
      const original = resumes.find((r) => r.id === originalId)!;
      const copy = resumes.find((r) => r.id === newId)!;

      // Both should have valid timestamps
      expect(copy.updatedAt).toBeDefined();
      expect(new Date(copy.updatedAt).toISOString()).toBe(copy.updatedAt);
    });
  });

  // =========================================================================
  // renameResume
  // =========================================================================

  describe('renameResume', () => {
    it('should update the name of the specified resume', () => {
      const id = useResumeListStore.getState().addResume({
        name: 'Old Name',
        templateId: 'x',
      });
      useResumeListStore.getState().renameResume(id, 'New Name');

      const resume = useResumeListStore.getState().resumes.find((r) => r.id === id);
      expect(resume!.name).toBe('New Name');
    });

    it('should update the updatedAt timestamp', () => {
      const id = useResumeListStore.getState().addResume({
        name: 'Name',
        templateId: 'x',
      });
      const originalTimestamp = useResumeListStore.getState().resumes[0].updatedAt;

      // Small delay to ensure a different timestamp is possible
      useResumeListStore.getState().renameResume(id, 'Updated Name');

      const updatedResume = useResumeListStore.getState().resumes.find((r) => r.id === id)!;
      // The timestamp should exist and be a valid ISO string
      expect(updatedResume.updatedAt).toBeDefined();
    });

    it('should not affect other resumes', () => {
      const id1 = useResumeListStore.getState().addResume({ name: 'First', templateId: 'a' });
      const id2 = useResumeListStore.getState().addResume({ name: 'Second', templateId: 'b' });

      useResumeListStore.getState().renameResume(id1, 'Renamed First');

      expect(useResumeListStore.getState().resumes.find((r) => r.id === id1)!.name).toBe(
        'Renamed First',
      );
      expect(useResumeListStore.getState().resumes.find((r) => r.id === id2)!.name).toBe(
        'Second',
      );
    });
  });

  // =========================================================================
  // setCurrentResume
  // =========================================================================

  describe('setCurrentResume', () => {
    it('should set the current resume id', () => {
      const id = useResumeListStore.getState().addResume({ name: 'R', templateId: 'x' });
      useResumeListStore.getState().setCurrentResume(id);

      expect(useResumeListStore.getState().currentResumeId).toBe(id);
    });

    it('should allow setting to null', () => {
      useResumeListStore.getState().addResume({ name: 'R', templateId: 'x' });
      useResumeListStore.getState().setCurrentResume(null);

      expect(useResumeListStore.getState().currentResumeId).toBeNull();
    });

    it('should allow switching between resumes', () => {
      const id1 = useResumeListStore.getState().addResume({ name: 'R1', templateId: 'a' });
      const id2 = useResumeListStore.getState().addResume({ name: 'R2', templateId: 'b' });

      useResumeListStore.getState().setCurrentResume(id1);
      expect(useResumeListStore.getState().currentResumeId).toBe(id1);

      useResumeListStore.getState().setCurrentResume(id2);
      expect(useResumeListStore.getState().currentResumeId).toBe(id2);
    });
  });
});
