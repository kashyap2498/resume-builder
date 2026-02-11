// =============================================================================
// Resume Builder - Professional Summary Editor
// =============================================================================

import { useResumeStore } from '@/store/resumeStore';
import { TextArea } from '@/components/ui';

const MAX_CHARS = 500;

export function SummaryEditor() {
  const summary = useResumeStore((s) => s.currentResume?.data.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  if (!summary) return null;

  const charCount = summary.text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Professional Summary
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Write a brief overview of your professional background and key
          qualifications.
        </p>
      </div>

      <div className="space-y-2">
        <TextArea
          label="Summary"
          placeholder="Experienced software engineer with 5+ years of expertise in building scalable web applications..."
          rows={6}
          value={summary.text}
          onChange={(e) => updateSummary({ text: e.target.value })}
          error={isOverLimit ? `Summary exceeds ${MAX_CHARS} characters` : undefined}
          hint="Keep your summary concise and impactful. Focus on your key strengths and career objectives."
        />

        <div className="flex justify-end">
          <span
            className={`text-xs font-medium ${
              isOverLimit
                ? 'text-red-600'
                : charCount > MAX_CHARS * 0.8
                  ? 'text-amber-600'
                  : 'text-gray-500'
            }`}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
