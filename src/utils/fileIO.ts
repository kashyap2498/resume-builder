// =============================================================================
// Resume Builder - File I/O Utilities
// =============================================================================
// Functions to save a resume as a JSON file download and load a resume from
// a JSON file upload using the browser File API and Blob.

import type { Resume } from '@/types/resume';

/**
 * Triggers a browser download of the resume data as a JSON file.
 */
export function saveResumeAsJson(resume: Resume): void {
  const json = JSON.stringify(resume, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;

  // Build a filename from the resume name, falling back to the id
  const safeName = (resume.name || resume.id)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 100);
  link.download = `${safeName}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads a JSON file from a File object and parses it as a Resume.
 * Returns the parsed Resume or throws on failure.
 */
export function loadResumeFromJsonFile(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('Please select a valid JSON file.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text);

        // Basic validation: check for required top-level fields
        if (!data.id || !data.data || !data.sections) {
          reject(
            new Error(
              'The selected file does not appear to be a valid resume JSON file. ' +
              'Missing required fields (id, data, or sections).'
            )
          );
          return;
        }

        resolve(data as Resume);
      } catch (error) {
        reject(
          new Error(
            'Failed to parse the JSON file. Please ensure it is valid JSON.'
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Opens a file picker dialog for JSON files and returns the selected File,
 * or null if the user cancels.
 */
export function promptForJsonFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };

    // Handle cancel (input won't fire change)
    input.addEventListener('cancel', () => resolve(null));

    input.click();
  });
}
