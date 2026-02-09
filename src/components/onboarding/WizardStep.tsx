import type { ReactNode } from 'react'

interface WizardStepProps {
  title: string
  description: string
  children: ReactNode
}

export function WizardStep({ title, description, children }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}
