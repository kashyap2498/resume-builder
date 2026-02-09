import Plausible from 'plausible-tracker'

let plausible: ReturnType<typeof Plausible> | null = null

export function initAnalytics(): void {
  if (!import.meta.env.PROD) return

  plausible = Plausible({
    domain: 'resume-builder.app',
    trackLocalhost: false,
  })

  plausible.enableAutoPageviews()
}

export function trackEvent(name: string, props?: Record<string, string | number | boolean>): void {
  if (!plausible) return
  plausible.trackEvent(name, { props })
}
