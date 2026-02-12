import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, lazy, Suspense } from 'react'
import { useConvexAuth } from 'convex/react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import CheckoutPage from './pages/CheckoutPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'
import { usePurchase } from '@/hooks/usePurchase'

const EditorPage = lazy(() => import('./pages/EditorPage'))

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PurchaseGuard({ children }: { children: React.ReactNode }) {
  const { isActive, isLoading } = usePurchase()
  if (isLoading) return <LoadingScreen />
  if (!isActive) return <Navigate to="/checkout" replace />
  return children
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function SmartHome() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    window.createLemonSqueezy?.()
  }, [])

  const handleReset = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  return (
    <>
      <ErrorBoundary fallbackMessage="The application encountered an error" onReset={handleReset} className="min-h-screen">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={<SmartHome />}
          />
          <Route
            path="/checkout"
            element={
              <AuthGuard>
                <CheckoutPage />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <PurchaseGuard>
                  <HomePage />
                </PurchaseGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/editor/:resumeId"
            element={
              <AuthGuard>
                <PurchaseGuard>
                  <Suspense fallback={<LoadingScreen />}>
                    <EditorPage />
                  </Suspense>
                </PurchaseGuard>
              </AuthGuard>
            }
          />
          {/* Catch-all — send unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <ToastContainer />
    </>
  )
}
