// =============================================================================
// Resume Builder - PDF Text Extraction
// =============================================================================
// Uses pdfjs-dist to extract text content from PDF files.
// Returns the extracted text as a single string.
// Import is dynamic to avoid loading heavy Node.js-dependent code at startup.

/**
 * Extracts all text content from a PDF file.
 *
 * @param source - An ArrayBuffer containing the PDF data
 * @returns The extracted text with pages separated by newlines
 */
export async function extractTextFromPdf(source: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set the worker source to the CDN build matching the installed version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const uint8Array = new Uint8Array(source);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdfDocument = await loadingTask.promise;

  const totalPages = pdfDocument.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Concatenate all text items on this page
    const pageText = textContent.items
      .filter((item): item is { str: string } => 'str' in item)
      .map((item) => item.str)
      .join(' ');

    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}
