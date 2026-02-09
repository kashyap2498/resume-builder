import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface ErrorFallbackProps {
  message?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorFallback({
  message = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorFallbackProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{message}</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
