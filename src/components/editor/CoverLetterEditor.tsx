// =============================================================================
// Resume Builder - Cover Letter Editor
// =============================================================================

import { motion } from 'framer-motion'
import { Building2, Calendar, PenLine, Type, User, Mail, Phone, MapPin } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'
import type { CoverLetterData } from '@/types/coverLetter'

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

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

  // Count filled fields for progress
  const fields: (keyof CoverLetterData)[] = [
    'recipientName', 'recipientTitle', 'companyName', 'companyAddress',
    'date', 'salutation', 'openingParagraph', 'bodyParagraph',
    'closingParagraph', 'signOff',
  ]
  const filledCount = fields.filter((f) => cl[f]?.trim()).length
  const progressVariant = filledCount > 7 ? 'green' : filledCount >= 4 ? 'blue' : 'gray'

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cover Letter</h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize your cover letter for each application.
          </p>
        </div>
        <Badge variant={progressVariant}>
          {filledCount}/10 fields
        </Badge>
      </div>

      {/* Recipient Section */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <Card padding="lg" hover>
          <CardHeader
            title="Recipient"
            subtitle="Who is this letter addressed to?"
            icon={<Building2 className="h-4.5 w-4.5" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
        </Card>
      </motion.div>

      {/* Date & Greeting Section */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <Card padding="lg" hover>
          <CardHeader
            title="Date & Greeting"
            subtitle="Set the letter date and salutation"
            icon={<Calendar className="h-4.5 w-4.5" />}
          />
          <div className="space-y-4 mt-4">
            <Input
              label="Date"
              value={cl.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            <Input
              label="Salutation"
              placeholder="Dear Hiring Manager,"
              value={cl.salutation}
              onChange={(e) => handleChange('salutation', e.target.value)}
            />
          </div>
        </Card>
      </motion.div>

      {/* Letter Body Section */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <Card padding="lg" hover>
          <CardHeader
            title="Letter Body"
            subtitle="Write the main content of your letter"
            icon={<PenLine className="h-4.5 w-4.5" />}
          />
          <div className="space-y-4 mt-4">
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
          </div>
        </Card>
      </motion.div>

      {/* Sign-off Section */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <Card padding="lg" hover>
          <CardHeader
            title="Closing"
            subtitle="How would you like to sign off?"
            icon={<Type className="h-4.5 w-4.5" />}
          />
          <div className="mt-4">
            <Input
              label="Sign-off"
              placeholder="Sincerely,"
              value={cl.signOff}
              onChange={(e) => handleChange('signOff', e.target.value)}
            />
          </div>
        </Card>
      </motion.div>

      <Divider />

      {/* Sender Info (read-only from resume) */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
        <Card padding="lg">
          <CardHeader
            title="Sender Info"
            subtitle="Auto-filled from your resume contact information"
            icon={<User className="h-4.5 w-4.5" />}
          />
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            {fullName && <p className="text-sm font-medium text-gray-700 mb-2">{fullName}</p>}
            <div className="space-y-1">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{contact.location}</span>
                </div>
              )}
              {!fullName && !contact.email && !contact.phone && !contact.location && (
                <p className="text-sm text-gray-400 italic">No contact info on resume yet</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-10" />
    </div>
  )
}
