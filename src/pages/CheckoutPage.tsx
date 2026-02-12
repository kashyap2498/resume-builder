import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { Check } from 'lucide-react'
import { useCheckout } from '@/hooks/useCheckout'
import { usePurchase } from '@/hooks/usePurchase'

const monthlyFeatures = [
  'All templates (18+ and growing)',
  'PDF + Word export',
  'ATS scoring',
  'Cloud sync',
  'Cancel anytime',
]

const lifetimeFeatures = [
  'All templates (18+ and growing)',
  'PDF + Word export',
  'Full ATS scoring + job description matching',
  'Cloud sync across devices',
  'Version history',
  'Job application tracker',
  'All future updates forever',
  'AI features when released (V2)',
  '7-day money-back guarantee',
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { openCheckout } = useCheckout()
  const { isActive, isLoading } = usePurchase()
  const { signOut } = useAuthActions()

  // Reactive redirect: once purchase is detected, go to dashboard
  useEffect(() => {
    if (isActive) {
      navigate('/dashboard', { replace: true })
    }
  }, [isActive, navigate])

  // Auto-open checkout if user pre-selected a plan before signing up
  const didAutoOpen = useRef(false)
  useEffect(() => {
    if (didAutoOpen.current || isLoading || isActive) return
    const pendingPlan = sessionStorage.getItem('pending_plan') as 'monthly' | 'lifetime' | null
    if (pendingPlan) {
      sessionStorage.removeItem('pending_plan')
      didAutoOpen.current = true
      openCheckout(pendingPlan)
    }
  }, [isLoading, isActive, openCheckout])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Choose your plan to get started
        </h1>
        <p className="mt-3 text-center text-gray-500">
          One resume builder. Two ways to pay. Every feature included.
        </p>

        {/* Pricing cards */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Month Pass */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 opacity-90">
            <p className="text-lg font-semibold text-gray-700">Month Pass</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-700">$12.99</span>
              <span className="text-base text-gray-400">/month</span>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Perfect if you only need it for a month or two.
            </p>
            <ul className="mt-6 space-y-3">
              {monthlyFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-500">
                  <Check className="h-4 w-4 shrink-0 text-gray-300" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openCheckout('monthly')}
              className="mt-8 w-full rounded-xl border border-gray-200 py-3 text-center font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Get Month Pass
            </button>
          </div>

          {/* Lifetime */}
          <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-600/10">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              BEST VALUE
            </span>
            <p className="text-lg font-semibold text-gray-900">Lifetime</p>
            <div className="mt-4 flex items-baseline">
              <span className="mr-2 text-2xl text-gray-400 line-through">$49</span>
              <span className="text-5xl font-bold text-gray-900">$29</span>
              <span className="ml-1 text-base text-gray-500">one-time</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Pay once. Use forever. All future updates included.
            </p>
            <ul className="mt-6 space-y-3">
              {lifetimeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openCheckout('lifetime')}
              className="mt-8 w-full cursor-pointer rounded-xl bg-blue-600 py-3.5 text-center text-lg font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:translate-y-0.5"
            >
              Get Lifetime Access — $29
            </button>
          </div>
        </div>

        {/* Sign out link */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Wrong account?{' '}
          <button
            onClick={() => signOut().then(() => navigate('/login'))}
            className="text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  )
}
