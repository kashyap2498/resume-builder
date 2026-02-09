import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// @ts-expect-error CSS-only module without type declarations
import '@fontsource/inter'
import App from './App'
import './index.css'
import { migrateLocalStorageToIndexedDB } from '@/utils/migration'
import { initAnalytics } from '@/utils/analytics'
import { initErrorTracking } from '@/utils/errorTracking'

// Initialize analytics and error tracking
initAnalytics()
initErrorTracking()

// Fire-and-forget migration from localStorage to IndexedDB
migrateLocalStorageToIndexedDB()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
