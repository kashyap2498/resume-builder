import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useCallback, lazy, Suspense } from 'react'
import { useConvexAuth } from 'convex/react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'

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

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const navigate = useNavigate()

  const handleReset = useCallback(() => {
    navigate('/')
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
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />
          <Route
            path="/editor/:resumeId"
            element={
              <AuthGuard>
                <Suspense fallback={<LoadingScreen />}>
                  <EditorPage />
                </Suspense>
              </AuthGuard>
            }
          />
        </Routes>
      </ErrorBoundary>
      <ToastContainer />
    </>
  )
}
