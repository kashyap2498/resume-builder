// =============================================================================
// Resume Builder - PDF Text Extraction
// =============================================================================
// Uses pdfjs-dist to extract text content from PDF files.
// Returns the extracted text preserving line structure by analyzing Y positions.
// Import is dynamic to avoid loading heavy Node.js-dependent code at startup.

/**
 * Extracts all text content from a PDF file, preserving line breaks.
 *
 * @param source - An ArrayBuffer containing the PDF data
 * @returns The extracted text with line breaks preserved
 */
export async function extractTextFromPdf(source: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Import the worker as a URL so Vite bundles it correctly
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const uint8Array = new Uint8Array(source);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;

  const totalPages = pdfDocument.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Build lines by grouping text items that share the same Y position.
    // Each text item has a `transform` array where index 5 is the Y coordinate.
    const lines: { y: number; items: { x: number; str: string }[] }[] = [];
    const LINE_THRESHOLD = 3; // Y values within 3 units are the same line

    for (const item of textContent.items) {
      if (!('str' in item) || !(item as { str: string }).str.trim()) continue;

      const typed = item as { str: string; transform: number[] };
      const y = typed.transform[5];
      const x = typed.transform[4];

      // Find an existing line with a similar Y position
      let existingLine = lines.find((l) => Math.abs(l.y - y) < LINE_THRESHOLD);

      if (!existingLine) {
        existingLine = { y, items: [] };
        lines.push(existingLine);
      }

      existingLine.items.push({ x, str: typed.str });
    }

    // Sort lines top-to-bottom (higher Y = higher on page in PDF coords)
    lines.sort((a, b) => b.y - a.y);

    // Calculate typical line spacing to detect paragraph breaks
    const gaps: number[] = [];
    for (let j = 1; j < lines.length; j++) {
      const gap = lines[j - 1].y - lines[j].y;
      if (gap > 0) gaps.push(gap);
    }
    gaps.sort((a, b) => a - b);
    const medianGap = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 12;
    const paragraphThreshold = medianGap * 1.8;

    // Within each line, sort items left-to-right by X position.
    // Insert blank lines where the Y gap is larger than typical line spacing.
    const lineTexts: string[] = [];
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      line.items.sort((a, b) => a.x - b.x);
      const text = line.items.map((item) => item.str).join(' ').trim();

      if (j > 0) {
        const gap = lines[j - 1].y - line.y;
        if (gap > paragraphThreshold) {
          lineTexts.push(''); // empty line = paragraph break
        }
      }
      lineTexts.push(text);
    }

    pageTexts.push(lineTexts.join('\n'));
  }

  return pageTexts.join('\n\n');
}
