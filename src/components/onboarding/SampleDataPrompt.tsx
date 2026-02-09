import { Button } from '@/components/ui/Button'
import { FileText, Sparkles } from 'lucide-react'

interface SampleDataPromptProps {
  onAccept: () => void
  onDecline: () => void
}

export function SampleDataPrompt({ onAccept, onDecline }: SampleDataPromptProps) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
        <Sparkles className="h-8 w-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start with sample data?</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          We can pre-fill your resume with example content to help you get started quickly. You can edit everything later.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onDecline}>
          Start from Scratch
        </Button>
        <Button variant="primary" onClick={onAccept} icon={<FileText className="h-4 w-4" />}>
          Use Sample Data
        </Button>
      </div>
    </div>
  )
}
