import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { ContactEditor } from '@/components/editor/ContactEditor'
import { SummaryEditor } from '@/components/editor/SummaryEditor'
import { ExperienceEditor } from '@/components/editor/ExperienceEditor'
import { EducationEditor } from '@/components/editor/EducationEditor'
import { SkillsEditor } from '@/components/editor/SkillsEditor'
import { WizardStep } from './WizardStep'
import { SampleDataPrompt } from './SampleDataPrompt'
import { sampleResumeData } from '@/constants/sampleData'
import { cn } from '@/utils/cn'

const STEPS = [
  { title: 'Welcome', description: 'Let\'s build your resume step by step.' },
  { title: 'Contact Information', description: 'Add your personal and professional contact details.' },
  { title: 'Professional Summary', description: 'Write a brief summary about your professional background.' },
  { title: 'Work Experience', description: 'Add your work history with companies, roles, and achievements.' },
  { title: 'Education', description: 'Add your educational background.' },
  { title: 'Skills', description: 'List your technical and professional skills.' },
]

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const showOnboarding = useUIStore((s) => s.showOnboarding)
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding)
  const currentResume = useResumeStore((s) => s.currentResume)
  const setResume = useResumeStore((s) => s.setResume)

  const handleClose = () => {
    setShowOnboarding(false)
    setStep(0)
  }

  const handleUseSampleData = () => {
    if (currentResume) {
      setResume({
        ...currentResume,
        data: { ...sampleResumeData },
        updatedAt: new Date().toISOString(),
      })
    }
    setStep(1)
  }

  const handleStartScratch = () => {
    setStep(1)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <Modal
      open={showOnboarding}
      onClose={handleClose}
      title="Resume Setup Wizard"
      size="lg"
      className="!max-w-2xl"
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i === step ? 'w-8 bg-blue-600' : i < step ? 'w-2 bg-blue-300' : 'w-2 bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px] max-h-[60vh] overflow-y-auto">
        {step === 0 && (
          <SampleDataPrompt onAccept={handleUseSampleData} onDecline={handleStartScratch} />
        )}
        {step === 1 && (
          <WizardStep title={STEPS[1].title} description={STEPS[1].description}>
            <ContactEditor />
          </WizardStep>
        )}
        {step === 2 && (
          <WizardStep title={STEPS[2].title} description={STEPS[2].description}>
            <SummaryEditor />
          </WizardStep>
        )}
        {step === 3 && (
          <WizardStep title={STEPS[3].title} description={STEPS[3].description}>
            <ExperienceEditor />
          </WizardStep>
        )}
        {step === 4 && (
          <WizardStep title={STEPS[4].title} description={STEPS[4].description}>
            <EducationEditor />
          </WizardStep>
        )}
        {step === 5 && (
          <WizardStep title={STEPS[5].title} description={STEPS[5].description}>
            <SkillsEditor />
          </WizardStep>
        )}
      </div>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={handlePrev} icon={<ChevronLeft className="h-4 w-4" />}>
            Previous
          </Button>
          <span className="text-xs text-gray-400">Step {step} of {STEPS.length - 1}</span>
          <Button
            variant="primary"
            onClick={handleNext}
            icon={step === STEPS.length - 1 ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            iconPosition="right"
          >
            {step === STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
