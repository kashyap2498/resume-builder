// =============================================================================
// Resume Builder - File Import Hook
// =============================================================================
// Handles file reading from file input or drag-and-drop, detects file type
// (PDF or DOCX), and routes to the appropriate parser. Returns parsed data
// for the user to review before finalizing the import.

import { useState, useCallback, useRef, useEffect } from 'react';
import { extractTextFromPdf } from '@/utils/pdfParser';
import { extractTextFromDocx } from '@/utils/docxParser';
import { parseResumeText } from '@/utils/resumeParser';
import { sanitizeResumeData } from '@/utils/sanitize';
import type { ResumeData } from '@/types/resume';

export type ImportFileType = 'pdf' | 'docx' | 'unknown';
export type ImportStatus = 'idle' | 'reading' | 'parsing' | 'done' | 'error';

export interface FileImportResult {
  rawText: string;
  parsedData: Partial<ResumeData>;
  fileName: string;
  fileType: ImportFileType;
}

export interface UseFileImportReturn {
  status: ImportStatus;
  result: FileImportResult | null;
  error: string | null;
  importFile: (file: File) => Promise<void>;
  reset: () => void;
}

function detectFileType(file: File): ImportFileType {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return 'pdf';
  }
  if (
    name.endsWith('.docx') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  return 'unknown';
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function useFileImport(): UseFileImportReturn {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [result, setResult] = useState<FileImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-progress import on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  const importFile = useCallback(async (file: File) => {
    // Abort any in-flight import so stale results don't overwrite UI
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setStatus('reading');
    setResult(null);
    setError(null);

    const fileType = detectFileType(file);

    if (fileType === 'unknown') {
      if (!signal.aborted) {
        setStatus('error');
        setError(
          'Unsupported file type. Please upload a PDF or DOCX file.'
        );
      }
      return;
    }

    try {
      // Step 1: Read the file
      const buffer = await readFileAsArrayBuffer(file);
      if (signal.aborted) return;

      // Step 2: Extract text
      setStatus('parsing');
      let rawText: string;

      if (fileType === 'pdf') {
        rawText = await extractTextFromPdf(buffer);
      } else {
        rawText = await extractTextFromDocx(buffer);
      }
      if (signal.aborted) return;

      if (!rawText.trim()) {
        if (!signal.aborted) {
          setStatus('error');
          setError(
            'Could not extract any text from the file. The file may be image-based or empty.'
          );
        }
        return;
      }

      // Step 3: Parse text into structured resume data
      const parsedData = sanitizeResumeData(parseResumeText(rawText));
      if (signal.aborted) return;

      setResult({
        rawText,
        parsedData,
        fileName: file.name,
        fileType,
      });
      setStatus('done');
    } catch (err) {
      if (!signal.aborted) {
        setStatus('error');
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred during import.'
        );
      }
    }
  }, []);

  return { status, result, error, importFile, reset };
}
