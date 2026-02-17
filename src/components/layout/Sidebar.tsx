// =============================================================================
// Resume Builder - Sidebar with Tabs (Sections / Styling / ATS)
// =============================================================================

import {
  Layers,
  Paintbrush,
  ScanSearch,
  Clock,
} from 'lucide-react'
import { useUIStore, type SidebarTab } from '@/store/uiStore'
import { useResumeStore } from '@/store/resumeStore'
import { cn } from '@/utils/cn'
import { SectionManager, FontControls, ColorControls, ThemePicker, LayoutControls } from '@/components/styling'
import { AtsPanel } from '@/components/ats'
import { VersionPanel } from '@/components/versioning/VersionPanel'
import { JobTracker } from '@/components/versioning/JobTracker'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getResumeCompleteness } from '@/utils/resumeCompleteness'

// -- Tab config ---------------------------------------------------------------

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sections', label: 'Sections', icon: <Layers className="h-4 w-4" /> },
  { id: 'styling', label: 'Styling', icon: <Paintbrush className="h-4 w-4" /> },
  { id: 'ats', label: 'ATS', icon: <ScanSearch className="h-4 w-4" /> },
  { id: 'versions', label: 'Versions', icon: <Clock className="h-4 w-4" /> },
]

// =============================================================================
// Sidebar
// =============================================================================

export default function Sidebar() {
  const sidebarTab = useUIStore((s) => s.sidebarTab)
  const setSidebarTab = useUIStore((s) => s.setSidebarTab)
  const resumeData = useResumeStore((s) => s.currentResume?.data)
  const completeness = resumeData ? getResumeCompleteness(resumeData) : null

  return (
    <div className="flex h-full flex-col">
      {/* Resume completion indicator */}
      {completeness && (
        <div className="px-4 pt-4 pb-2 border-b border-gray-100/50 dark:border-dark-edge">
          <div className="flex items-center gap-3">
            <ProgressRing percent={completeness.percent} />
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Resume Strength</p>
              {completeness.details.length > 0 ? (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Missing: {completeness.details.slice(0, 2).join(', ')}
                  {completeness.details.length > 2 && ` +${completeness.details.length - 2} more`}
                </p>
              ) : (
                <p className="text-[11px] text-green-600 mt-0.5">Looking great!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 dark:border-dark-edge shrink-0" role="tablist" aria-label="Sidebar tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={sidebarTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setSidebarTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
              sidebarTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="flex-1 overflow-y-auto"
        role="tabpanel"
        id={`tabpanel-${sidebarTab}`}
        aria-labelledby={`tab-${sidebarTab}`}
        aria-live="polite"
      >
        {sidebarTab === 'sections' && <SectionsTab />}
        {sidebarTab === 'styling' && <StylingTab />}
        {sidebarTab === 'ats' && <ATSTab />}
        {sidebarTab === 'versions' && <VersionsTab />}
      </div>
    </div>
  )
}

// =============================================================================
// Sections Tab
// =============================================================================

function SectionsTab() {
  return (
    <div className="p-3">
      <p className="px-2 pb-3 text-xs text-gray-500 dark:text-gray-400">
        Drag to reorder. Click to edit. Toggle visibility with the switch.
      </p>
      <SectionManager />
    </div>
  )
}

// =============================================================================
// Styling Tab (Placeholder)
// =============================================================================

function StylingTab() {
  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <ThemePicker />
      <div className="h-px bg-gray-200/50 dark:bg-dark-edge" />
      <FontControls />
      <div className="h-px bg-gray-200/50 dark:bg-dark-edge" />
      <ColorControls />
      <div className="h-px bg-gray-200/50 dark:bg-dark-edge" />
      <LayoutControls />
    </div>
  )
}

// =============================================================================
// ATS Tab (Placeholder)
// =============================================================================

function ATSTab() {
  return (
    <div className="p-4 overflow-y-auto">
      <AtsPanel />
    </div>
  )
}

// =============================================================================
// Versions Tab
// =============================================================================

function VersionsTab() {
  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <VersionPanel />
      <div className="h-px bg-gray-200/50 dark:bg-dark-edge" />
      <JobTracker />
    </div>
  )
}
