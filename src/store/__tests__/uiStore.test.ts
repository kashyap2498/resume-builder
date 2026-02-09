import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '@/store/uiStore';
import type { SidebarTab } from '@/store/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeSection: null,
      sidebarTab: 'sections',
      previewZoom: 100,
      showTemplateGallery: false,
      showImportModal: false,
      isMobile: false,
      isTablet: false,
    });
  });

  // =========================================================================
  // Initial state
  // =========================================================================

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useUIStore.getState();
      expect(state.activeSection).toBeNull();
      expect(state.sidebarTab).toBe('sections');
      expect(state.previewZoom).toBe(100);
      expect(state.showTemplateGallery).toBe(false);
      expect(state.showImportModal).toBe(false);
      expect(state.isMobile).toBe(false);
      expect(state.isTablet).toBe(false);
    });
  });

  // =========================================================================
  // setActiveSection
  // =========================================================================

  describe('setActiveSection', () => {
    it('should set the active section', () => {
      useUIStore.getState().setActiveSection('experience');
      expect(useUIStore.getState().activeSection).toBe('experience');
    });

    it('should allow setting to null', () => {
      useUIStore.getState().setActiveSection('experience');
      useUIStore.getState().setActiveSection(null);
      expect(useUIStore.getState().activeSection).toBeNull();
    });

    it('should overwrite a previously set section', () => {
      useUIStore.getState().setActiveSection('experience');
      useUIStore.getState().setActiveSection('education');
      expect(useUIStore.getState().activeSection).toBe('education');
    });
  });

  // =========================================================================
  // setSidebarTab
  // =========================================================================

  describe('setSidebarTab', () => {
    it('should set to styling', () => {
      useUIStore.getState().setSidebarTab('styling');
      expect(useUIStore.getState().sidebarTab).toBe('styling');
    });

    it('should set to ats', () => {
      useUIStore.getState().setSidebarTab('ats');
      expect(useUIStore.getState().sidebarTab).toBe('ats');
    });

    it('should set back to sections', () => {
      useUIStore.getState().setSidebarTab('ats');
      useUIStore.getState().setSidebarTab('sections');
      expect(useUIStore.getState().sidebarTab).toBe('sections');
    });
  });

  // =========================================================================
  // setPreviewZoom
  // =========================================================================

  describe('setPreviewZoom', () => {
    it('should set zoom to a valid value', () => {
      useUIStore.getState().setPreviewZoom(150);
      expect(useUIStore.getState().previewZoom).toBe(150);
    });

    it('should clamp zoom to minimum 25', () => {
      useUIStore.getState().setPreviewZoom(10);
      expect(useUIStore.getState().previewZoom).toBe(25);
    });

    it('should clamp zoom to maximum 200', () => {
      useUIStore.getState().setPreviewZoom(300);
      expect(useUIStore.getState().previewZoom).toBe(200);
    });

    it('should accept exact boundary value 25', () => {
      useUIStore.getState().setPreviewZoom(25);
      expect(useUIStore.getState().previewZoom).toBe(25);
    });

    it('should accept exact boundary value 200', () => {
      useUIStore.getState().setPreviewZoom(200);
      expect(useUIStore.getState().previewZoom).toBe(200);
    });

    it('should clamp negative values to 25', () => {
      useUIStore.getState().setPreviewZoom(-50);
      expect(useUIStore.getState().previewZoom).toBe(25);
    });
  });

  // =========================================================================
  // toggleTemplateGallery
  // =========================================================================

  describe('toggleTemplateGallery', () => {
    it('should toggle from false to true', () => {
      useUIStore.getState().toggleTemplateGallery();
      expect(useUIStore.getState().showTemplateGallery).toBe(true);
    });

    it('should toggle from true to false', () => {
      useUIStore.getState().toggleTemplateGallery();
      useUIStore.getState().toggleTemplateGallery();
      expect(useUIStore.getState().showTemplateGallery).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      useUIStore.getState().toggleTemplateGallery(); // true
      useUIStore.getState().toggleTemplateGallery(); // false
      useUIStore.getState().toggleTemplateGallery(); // true
      expect(useUIStore.getState().showTemplateGallery).toBe(true);
    });
  });

  // =========================================================================
  // toggleImportModal
  // =========================================================================

  describe('toggleImportModal', () => {
    it('should toggle from false to true', () => {
      useUIStore.getState().toggleImportModal();
      expect(useUIStore.getState().showImportModal).toBe(true);
    });

    it('should toggle from true to false', () => {
      useUIStore.getState().toggleImportModal();
      useUIStore.getState().toggleImportModal();
      expect(useUIStore.getState().showImportModal).toBe(false);
    });
  });

  // =========================================================================
  // setShowImportModal
  // =========================================================================

  describe('setShowImportModal', () => {
    it('should explicitly set to true', () => {
      useUIStore.getState().setShowImportModal(true);
      expect(useUIStore.getState().showImportModal).toBe(true);
    });

    it('should explicitly set to false', () => {
      useUIStore.getState().setShowImportModal(true);
      useUIStore.getState().setShowImportModal(false);
      expect(useUIStore.getState().showImportModal).toBe(false);
    });

    it('should override toggle state', () => {
      useUIStore.getState().toggleImportModal(); // true
      useUIStore.getState().setShowImportModal(false);
      expect(useUIStore.getState().showImportModal).toBe(false);
    });
  });

  // =========================================================================
  // setDeviceSize
  // =========================================================================

  describe('setDeviceSize', () => {
    it('should set isMobile true for width <= 768', () => {
      useUIStore.getState().setDeviceSize(768);
      expect(useUIStore.getState().isMobile).toBe(true);
      expect(useUIStore.getState().isTablet).toBe(false);
    });

    it('should set isMobile true for small widths', () => {
      useUIStore.getState().setDeviceSize(320);
      expect(useUIStore.getState().isMobile).toBe(true);
      expect(useUIStore.getState().isTablet).toBe(false);
    });

    it('should set isTablet true for widths 769-1024', () => {
      useUIStore.getState().setDeviceSize(800);
      expect(useUIStore.getState().isMobile).toBe(false);
      expect(useUIStore.getState().isTablet).toBe(true);
    });

    it('should set isTablet true at boundary 1024', () => {
      useUIStore.getState().setDeviceSize(1024);
      expect(useUIStore.getState().isMobile).toBe(false);
      expect(useUIStore.getState().isTablet).toBe(true);
    });

    it('should set both false for desktop widths > 1024', () => {
      useUIStore.getState().setDeviceSize(1280);
      expect(useUIStore.getState().isMobile).toBe(false);
      expect(useUIStore.getState().isTablet).toBe(false);
    });

    it('should set isMobile at boundary 769 to false and isTablet to true', () => {
      useUIStore.getState().setDeviceSize(769);
      expect(useUIStore.getState().isMobile).toBe(false);
      expect(useUIStore.getState().isTablet).toBe(true);
    });
  });
});
