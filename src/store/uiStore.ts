// =============================================================================
// Resume Builder - UI State Store
// =============================================================================

import { create } from 'zustand';

// -- Sidebar Tab Type ---------------------------------------------------------

export type SidebarTab = 'sections' | 'styling' | 'ats' | 'versions';

// -- Store Shape --------------------------------------------------------------

export type ActiveDocType = 'resume' | 'coverLetter';

interface UIState {
  collapsedSections: Set<string>;
  sidebarTab: SidebarTab;
  previewZoom: number;
  showTemplateGallery: boolean;
  showImportModal: boolean;
  showOnboarding: boolean;
  onboardingStep: number;
  isMobile: boolean;
  isTablet: boolean;
  activeDocType: ActiveDocType;
}

interface UIActions {
  toggleSection: (id: string) => void;
  expandSection: (id: string) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setPreviewZoom: (zoom: number) => void;
  toggleTemplateGallery: () => void;
  toggleImportModal: () => void;
  setShowImportModal: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setDeviceSize: (width: number) => void;
  setActiveDocType: (type: ActiveDocType) => void;
}

export type UIStore = UIState & UIActions;

// -- Breakpoints --------------------------------------------------------------

const MOBILE_MAX = 768;
const TABLET_MAX = 1024;

// -- Store --------------------------------------------------------------------

export const useUIStore = create<UIStore>((set) => ({
  // -- State ------------------------------------------------------------------
  collapsedSections: new Set<string>(),
  sidebarTab: 'sections',
  previewZoom: 100,
  showTemplateGallery: false,
  showImportModal: false,
  showOnboarding: false,
  onboardingStep: 0,
  isMobile: false,
  isTablet: false,
  activeDocType: 'resume',

  // -- Actions ----------------------------------------------------------------

  toggleSection: (id) =>
    set((state) => {
      const next = new Set(state.collapsedSections);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { collapsedSections: next };
    }),

  expandSection: (id) =>
    set((state) => {
      const next = new Set(state.collapsedSections);
      next.delete(id);
      return { collapsedSections: next };
    }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setPreviewZoom: (zoom) =>
    set({ previewZoom: Math.max(25, Math.min(200, zoom)) }),

  toggleTemplateGallery: () =>
    set((state) => ({ showTemplateGallery: !state.showTemplateGallery })),

  toggleImportModal: () =>
    set((state) => ({ showImportModal: !state.showImportModal })),

  setShowImportModal: (show) => set({ showImportModal: show }),

  setShowOnboarding: (show) => set({ showOnboarding: show }),

  setOnboardingStep: (step) => set({ onboardingStep: step }),

  setDeviceSize: (width) =>
    set({
      isMobile: width <= MOBILE_MAX,
      isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    }),

  setActiveDocType: (type) => set({ activeDocType: type }),
}));
