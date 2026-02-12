import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { FileText, ArrowLeft } from 'lucide-react'

type Flow =
  | 'signIn'
  | 'signUp'
  | 'verifyEmail'
  | 'forgotPassword'
  | 'resetPassword'

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<Flow>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setError('')
    setCode('')
    setNewPassword('')
    setPassword('')
  }

  // Sign in with email + password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', { email, password, flow: 'signIn' })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // Sign up — sends verification OTP to email
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', { email, password, flow: 'signUp' })
      // If verify is configured, signUp won't authenticate — it sends an OTP
      setFlow('verifyEmail')
    } catch {
      setError('Could not create account. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  // Verify email OTP after signup
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', { email, code, flow: 'email-verification' })
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password — sends reset OTP to email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', { email, flow: 'reset' })
      setFlow('resetPassword')
    } catch {
      setError('Could not send reset code. Check your email and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset password — verify OTP + set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', {
        email,
        code,
        newPassword,
        flow: 'reset-verification',
      })
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Header text per flow
  const headerText: Record<Flow, string> = {
    signIn: 'Sign in to your account',
    signUp: 'Create a new account',
    verifyEmail: 'Verify your email',
    forgotPassword: 'Reset your password',
    resetPassword: 'Set a new password',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-gray-900">Resumello</span>
          </Link>
          <p className="text-sm text-gray-500">{headerText[flow]}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* ── Sign In ── */}
          {flow === 'signIn' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Min. 8 characters"
                />
              </label>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { resetForm(); setFlow('forgotPassword') }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Sign Up ── */}
          {flow === 'signUp' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Min. 8 characters"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Verify Email OTP ── */}
          {flow === 'verifyEmail' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <p className="text-sm text-gray-600">
                We sent a verification code to <strong>{email}</strong>. Enter it below.
              </p>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Verification Code</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center tracking-widest text-lg"
                  placeholder="Enter code"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          )}

          {/* ── Forgot Password (enter email) ── */}
          {flow === 'forgotPassword' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your email and we'll send you a code to reset your password.
              </p>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@example.com"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* ── Reset Password (enter code + new password) ── */}
          {flow === 'resetPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600">
                We sent a reset code to <strong>{email}</strong>. Enter it below with your new password.
              </p>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Reset Code</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center tracking-widest text-lg"
                  placeholder="Enter code"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Min. 8 characters"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* ── Divider + Google (only on signIn/signUp) ── */}
          {(flow === 'signIn' || flow === 'signUp') && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void signIn('google')}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* ── Navigation links ── */}
          {(flow === 'signIn' || flow === 'signUp') && (
            <p className="text-center text-sm text-gray-500">
              {flow === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
                }}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {flow === 'signIn' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          )}

          {/* Back to sign in (for verification/reset flows) */}
          {(flow === 'verifyEmail' || flow === 'forgotPassword' || flow === 'resetPassword') && (
            <button
              type="button"
              onClick={() => { resetForm(); setFlow('signIn') }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mx-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
