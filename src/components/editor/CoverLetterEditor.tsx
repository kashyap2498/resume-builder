// =============================================================================
// Resume Builder - Cover Letter Editor
// =============================================================================

import { useResumeStore } from '@/store/resumeStore'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import type { CoverLetterData } from '@/types/coverLetter'

export default function CoverLetterEditor() {
  const currentResume = useResumeStore((s) => s.currentResume)
  const updateCoverLetter = useResumeStore((s) => s.updateCoverLetter)

  if (!currentResume?.coverLetter) return null

  const cl = currentResume.coverLetter
  const contact = currentResume.data.contact

  const handleChange = (field: keyof CoverLetterData, value: string) => {
    updateCoverLetter({ [field]: value })
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  const contactLine = [contact.email, contact.phone, contact.location].filter(Boolean).join(' | ')

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Cover Letter</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize your cover letter for each application. Your contact info is pulled from your resume.
        </p>
      </div>

      {/* Recipient Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Recipient</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            placeholder="Acme Corp"
            value={cl.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
          <Input
            label="Recipient Name"
            placeholder="Jane Smith"
            value={cl.recipientName}
            onChange={(e) => handleChange('recipientName', e.target.value)}
          />
          <Input
            label="Recipient Title"
            placeholder="Hiring Manager"
            value={cl.recipientTitle}
            onChange={(e) => handleChange('recipientTitle', e.target.value)}
          />
          <Input
            label="Company Address"
            placeholder="123 Main St, City, State"
            value={cl.companyAddress}
            onChange={(e) => handleChange('companyAddress', e.target.value)}
          />
        </div>
      </section>

      {/* Date */}
      <section className="space-y-4">
        <Input
          label="Date"
          value={cl.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </section>

      {/* Salutation */}
      <section className="space-y-4">
        <Input
          label="Salutation"
          placeholder="Dear Hiring Manager,"
          value={cl.salutation}
          onChange={(e) => handleChange('salutation', e.target.value)}
        />
      </section>

      {/* Letter Body */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Letter Body</h3>
        <TextArea
          label="Opening Paragraph"
          rows={4}
          placeholder="Introduce yourself and state the position you're applying for..."
          hint="Introduce yourself and state the position you're applying for"
          value={cl.openingParagraph}
          onChange={(e) => handleChange('openingParagraph', e.target.value)}
        />
        <TextArea
          label="Body Paragraph"
          rows={6}
          placeholder="Highlight your relevant experience and why you're a great fit..."
          hint="Highlight your relevant experience and why you're a great fit"
          value={cl.bodyParagraph}
          onChange={(e) => handleChange('bodyParagraph', e.target.value)}
        />
        <TextArea
          label="Closing Paragraph"
          rows={4}
          placeholder="Thank the reader and include a call to action..."
          hint="Thank the reader and include a call to action"
          value={cl.closingParagraph}
          onChange={(e) => handleChange('closingParagraph', e.target.value)}
        />
      </section>

      {/* Sign-off */}
      <section className="space-y-4">
        <Input
          label="Sign-off"
          placeholder="Sincerely,"
          value={cl.signOff}
          onChange={(e) => handleChange('signOff', e.target.value)}
        />
      </section>

      {/* Sender Info (read-only from resume) */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Sender Info</h3>
        <p className="text-xs text-gray-400">Auto-filled from your resume contact information</p>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          {fullName && <p className="text-sm font-medium text-gray-700">{fullName}</p>}
          {contactLine && <p className="text-sm text-gray-500">{contactLine}</p>}
          {!fullName && !contactLine && (
            <p className="text-sm text-gray-400 italic">No contact info on resume yet</p>
          )}
        </div>
      </section>
    </div>
  )
}
