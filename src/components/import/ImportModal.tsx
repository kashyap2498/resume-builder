// =============================================================================
// Resume Builder - Import Modal Component
// =============================================================================
// Modal with drag-and-drop file upload area. Accepts .pdf, .docx, .json files.
// For PDF/DOCX, parses text and shows ImportPreview. For JSON, loads directly.

import { useState, useCallback, useRef, type DragEvent } from 'react';
import { Upload, FileText, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { useFileImport } from '@/hooks/useFileImport';
import { useResumeStore } from '@/store/resumeStore';
import type { ResumeData, Resume } from '@/types/resume';
import { ImportReview } from './ImportReview';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPTED_TYPES = '.pdf,.docx,.json';
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',
];

export function ImportModal({ open, onClose }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Partial<ResumeData> | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, importFile, reset } = useFileImport();
  const setResume = useResumeStore((s) => s.setResume);
  const currentResume = useResumeStore((s) => s.currentResume);

  const resetAll = useCallback(() => {
    setSelectedFile(null);
    setJsonData(null);
    setJsonError(null);
    setIsDragging(false);
    reset();
  }, [reset]);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  const isJsonFile = (file: File) => {
    return (
      file.name.toLowerCase().endsWith('.json') ||
      file.type === 'application/json'
    );
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setJsonData(null);
      setJsonError(null);

      if (isJsonFile(file)) {
        // Read and parse JSON directly
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          // Check if it looks like a Resume or ResumeData
          if (parsed.data && parsed.data.contact) {
            // Full Resume object -- extract data
            setJsonData(parsed.data as Partial<ResumeData>);
          } else if (parsed.contact) {
            // ResumeData object
            setJsonData(parsed as Partial<ResumeData>);
          } else {
            setJsonError(
              'The JSON file does not appear to contain valid resume data.'
            );
          }
        } catch {
          setJsonError('Failed to parse JSON file. Please check the file format.');
        }
      } else {
        // PDF or DOCX -- use the file import hook
        await importFile(file);
      }
    },
    [importFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  const handleApplyData = useCallback(
    (data: Partial<ResumeData>) => {
      if (!currentResume) return;

      // Only merge fields that were actually provided
      const updatedData: ResumeData = { ...currentResume.data };

      if (data.contact) {
        updatedData.contact = {
          ...currentResume.data.contact,
          ...data.contact,
        };
      }
      if (data.summary) {
        updatedData.summary = {
          ...currentResume.data.summary,
          ...data.summary,
        };
      }
      if (data.experience) updatedData.experience = data.experience;
      if (data.education) updatedData.education = data.education;
      if (data.skills) updatedData.skills = data.skills;
      if (data.certifications) updatedData.certifications = data.certifications;
      if (data.projects) updatedData.projects = data.projects;
      if (data.languages) updatedData.languages = data.languages;
      if (data.volunteer) updatedData.volunteer = data.volunteer;
      if (data.awards) updatedData.awards = data.awards;
      if (data.publications) updatedData.publications = data.publications;
      if (data.references) updatedData.references = data.references;
      if (data.hobbies) updatedData.hobbies = data.hobbies;
      if (data.affiliations) updatedData.affiliations = data.affiliations;
      if (data.courses) updatedData.courses = data.courses;

      // Auto-enable sections that have imported data
      const sectionDataMap: Record<string, boolean> = {
        summary: !!data.summary?.text,
        experience: (data.experience?.length ?? 0) > 0,
        education: (data.education?.length ?? 0) > 0,
        skills: (data.skills?.length ?? 0) > 0,
        certifications: (data.certifications?.length ?? 0) > 0,
        projects: (data.projects?.length ?? 0) > 0,
        languages: (data.languages?.length ?? 0) > 0,
        volunteer: (data.volunteer?.length ?? 0) > 0,
        awards: (data.awards?.length ?? 0) > 0,
        publications: (data.publications?.length ?? 0) > 0,
        references: (data.references?.length ?? 0) > 0,
        hobbies: (data.hobbies?.items?.length ?? 0) > 0,
        affiliations: (data.affiliations?.length ?? 0) > 0,
        courses: (data.courses?.length ?? 0) > 0,
      };

      const updatedSections = currentResume.sections.map((section) => {
        if (!section.visible && sectionDataMap[section.type]) {
          return { ...section, visible: true };
        }
        return section;
      });

      const updatedResume: Resume = {
        ...currentResume,
        data: updatedData,
        sections: updatedSections,
        updatedAt: new Date().toISOString(),
      };

      setResume(updatedResume);
      handleClose();
    },
    [currentResume, setResume, handleClose]
  );

  const showPreview =
    (status === 'done' && result) || (jsonData && !jsonError);
  const isLoading = status === 'reading' || status === 'parsing';
  const hasError = status === 'error' || !!jsonError;
  const errorMessage = error || jsonError;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Resume"
      size={showPreview ? 'xl' : 'lg'}
      className={showPreview ? 'max-w-4xl max-h-[95vh]' : undefined}
    >
      {/* Preview mode */}
      {showPreview && (
        <>
          <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
            <span>Imported data has been sanitized for security.</span>
          </div>
          <ImportReview
            parsedData={jsonData ?? result!.parsedData}
            rawText={result?.rawText ?? ''}
            parseMetadata={result?.parseMetadata}
            onApply={handleApplyData}
            onCancel={resetAll}
          />
        </>
      )}

      {/* Upload mode */}
      {!showPreview && (
        <div className="space-y-4">
          {/* Drag and drop area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
          >
            {isLoading ? (
              // Loading state
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-gray-200 border-t-blue-600" />
                <p className="text-sm font-medium text-gray-700">
                  {status === 'reading'
                    ? 'Reading file...'
                    : 'Parsing resume content...'}
                </p>
                {selectedFile && (
                  <p className="text-xs text-gray-500">{selectedFile.name}</p>
                )}
              </div>
            ) : selectedFile && !hasError ? (
              // File selected state
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              // Default drop zone
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">
                  Drag & drop your resume here
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supports PDF, DOCX, and JSON files
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={handleBrowse}
                >
                  Browse files
                </Button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleInputChange}
              className="hidden"
              aria-label="Select resume file"
            />
          </div>

          {/* Error display */}
          {hasError && errorMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Import Failed
                </p>
                <p className="mt-1 text-xs text-red-700">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Info */}
          <p className="text-center text-xs text-gray-500">
            Imported data will be available for review before applying to your
            resume.
          </p>
        </div>
      )}
    </Modal>
  );
}
