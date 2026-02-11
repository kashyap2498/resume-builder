// =============================================================================
// Resume Builder - PDF Export Hook
// =============================================================================
// Uses @react-pdf/renderer to generate a PDF blob from a React element
// and triggers a browser download. Imports are dynamic to avoid loading
// Node.js-dependent code at startup.

import { useState, useCallback } from 'react';

export interface UsePdfExportReturn {
  exportPdf: (element: React.ReactElement, fileName: string) => Promise<void>;
  isExporting: boolean;
}

export function usePdfExport(): UsePdfExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(
    async (element: React.ReactElement, fileName: string) => {
      setIsExporting(true);
      try {
        const { ensurePdfFontsRegistered } = await import('@/utils/pdfFontRegistry');
        await ensurePdfFontsRegistered();
        const { pdf } = await import('@react-pdf/renderer');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = await pdf(element as any).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('PDF export failed:', error);
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { exportPdf, isExporting };
}
