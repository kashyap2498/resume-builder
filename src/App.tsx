import { Routes, Route, useNavigate } from 'react-router-dom'
import { useCallback, lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const EditorPage = lazy(() => import('./pages/EditorPage'))

function EditorLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading editor...</p>
      </div>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()

  const handleReset = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <ErrorBoundary fallbackMessage="The application encountered an error" onReset={handleReset} className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/editor/:resumeId"
          element={
            <Suspense fallback={<EditorLoadingFallback />}>
              <EditorPage />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  )
}
