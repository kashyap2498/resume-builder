import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
// @ts-expect-error CSS-only module without type declarations
import '@fontsource/inter'
import App from './App'
import './index.css'
import { initAnalytics } from '@/utils/analytics'
import { initErrorTracking } from '@/utils/errorTracking'

initAnalytics()
initErrorTracking()

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexAuthProvider>
  </React.StrictMode>,
)
