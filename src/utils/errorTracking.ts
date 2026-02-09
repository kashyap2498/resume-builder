import * as Sentry from '@sentry/react'

export function initErrorTracking(): void {
  if (!import.meta.env.PROD) return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
  })
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!import.meta.env.PROD) {
    console.error('Error captured:', error, context)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}
