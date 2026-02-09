// =============================================================================
// Resume Builder - UI State Store
// =============================================================================

import { create } from 'zustand';

// -- Sidebar Tab Type ---------------------------------------------------------

export type SidebarTab = 'sections' | 'styling' | 'ats';

// -- Store Shape --------------------------------------------------------------

interface UIState {
  activeSection: string | null;
  sidebarTab: SidebarTab;
  previewZoom: number;
  showTemplateGallery: boolean;
  showImportModal: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

interface UIActions {
  setActiveSection: (sectionId: string | null) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setPreviewZoom: (zoom: number) => void;
  toggleTemplateGallery: () => void;
  toggleImportModal: () => void;
  setShowImportModal: (show: boolean) => void;
  setDeviceSize: (width: number) => void;
}

export type UIStore = UIState & UIActions;

// -- Breakpoints --------------------------------------------------------------

const MOBILE_MAX = 768;
const TABLET_MAX = 1024;

// -- Store --------------------------------------------------------------------

export const useUIStore = create<UIStore>((set) => ({
  // -- State ------------------------------------------------------------------
  activeSection: null,
  sidebarTab: 'sections',
  previewZoom: 100,
  showTemplateGallery: false,
  showImportModal: false,
  isMobile: false,
  isTablet: false,

  // -- Actions ----------------------------------------------------------------

  setActiveSection: (sectionId) => set({ activeSection: sectionId }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setPreviewZoom: (zoom) =>
    set({ previewZoom: Math.max(25, Math.min(200, zoom)) }),

  toggleTemplateGallery: () =>
    set((state) => ({ showTemplateGallery: !state.showTemplateGallery })),

  toggleImportModal: () =>
    set((state) => ({ showImportModal: !state.showImportModal })),

  setShowImportModal: (show) => set({ showImportModal: show }),

  setDeviceSize: (width) =>
    set({
      isMobile: width <= MOBILE_MAX,
      isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    }),
}));
