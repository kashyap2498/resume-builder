import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveResumeAsJson, loadResumeFromJsonFile } from '@/utils/fileIO';
import { mockResume } from '@/test/fixtures';

describe('fileIO', () => {
  // =========================================================================
  // saveResumeAsJson
  // =========================================================================

  describe('saveResumeAsJson', () => {
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    it('should create a download link and click it', () => {
      saveResumeAsJson(mockResume);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should set the download filename based on resume name', () => {
      saveResumeAsJson(mockResume);
      expect(mockLink.download).toBe('Test_Resume.json');
    });

    it('should call URL.createObjectURL with a Blob', () => {
      saveResumeAsJson(mockResume);
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should call URL.revokeObjectURL to clean up', () => {
      saveResumeAsJson(mockResume);
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should append and remove the link from document body', () => {
      saveResumeAsJson(mockResume);
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should sanitize special characters in filename', () => {
      const resume = { ...mockResume, name: 'My Resume (Final)!' };
      saveResumeAsJson(resume);
      expect(mockLink.download).toBe('My_Resume__Final__.json');
    });
  });

  // =========================================================================
  // loadResumeFromJsonFile
  // =========================================================================

  describe('loadResumeFromJsonFile', () => {
    it('should parse a valid JSON resume file', async () => {
      const json = JSON.stringify(mockResume);
      const file = new File([json], 'resume.json', { type: 'application/json' });

      const result = await loadResumeFromJsonFile(file);
      expect(result.id).toBe(mockResume.id);
      expect(result.name).toBe(mockResume.name);
      expect(result.data).toBeDefined();
    });

    it('should reject non-JSON files', async () => {
      const file = new File(['hello'], 'resume.txt', { type: 'text/plain' });

      await expect(loadResumeFromJsonFile(file)).rejects.toThrow(
        'Please select a valid JSON file.',
      );
    });

    it('should reject invalid JSON content', async () => {
      const file = new File(['not valid json{{{'], 'resume.json', {
        type: 'application/json',
      });

      await expect(loadResumeFromJsonFile(file)).rejects.toThrow(
        'Failed to parse the JSON file',
      );
    });

    it('should reject JSON missing required fields', async () => {
      const json = JSON.stringify({ name: 'incomplete' });
      const file = new File([json], 'resume.json', { type: 'application/json' });

      await expect(loadResumeFromJsonFile(file)).rejects.toThrow(
        'Missing required fields',
      );
    });

    it('should accept files with .json extension regardless of MIME type', async () => {
      const json = JSON.stringify(mockResume);
      const file = new File([json], 'resume.json', { type: '' });

      const result = await loadResumeFromJsonFile(file);
      expect(result.id).toBe(mockResume.id);
    });
  });
});
