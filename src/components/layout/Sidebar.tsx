// =============================================================================
// Resume Builder - Sidebar with Tabs (Sections / Styling / ATS)
// =============================================================================

import {
  Layers,
  Paintbrush,
  ScanSearch,
} from 'lucide-react'
import { useUIStore, type SidebarTab } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { SectionManager, FontControls, ColorControls, ThemePicker, LayoutControls } from '@/components/styling'
import { AtsPanel } from '@/components/ats'

// -- Tab config ---------------------------------------------------------------

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sections', label: 'Sections', icon: <Layers className="h-4 w-4" /> },
  { id: 'styling', label: 'Styling', icon: <Paintbrush className="h-4 w-4" /> },
  { id: 'ats', label: 'ATS', icon: <ScanSearch className="h-4 w-4" /> },
]

// =============================================================================
// Sidebar
// =============================================================================

export default function Sidebar() {
  const sidebarTab = useUIStore((s) => s.sidebarTab)
  const setSidebarTab = useUIStore((s) => s.setSidebarTab)

  return (
    <div className="flex h-full flex-col">
      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
              sidebarTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'sections' && <SectionsTab />}
        {sidebarTab === 'styling' && <StylingTab />}
        {sidebarTab === 'ats' && <ATSTab />}
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
      <p className="px-2 pb-3 text-xs text-gray-400">
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
      <div className="h-px bg-gray-200" />
      <FontControls />
      <div className="h-px bg-gray-200" />
      <ColorControls />
      <div className="h-px bg-gray-200" />
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
