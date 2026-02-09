// =============================================================================
// Resume Builder - DOCX Text Extraction
// =============================================================================
// Uses mammoth to extract raw text content from DOCX files.
// Import is dynamic to avoid loading heavy dependencies at startup.

/**
 * Extracts raw text from a DOCX file.
 *
 * @param source - An ArrayBuffer containing the DOCX data
 * @returns The extracted text content
 */
export async function extractTextFromDocx(source: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.default.extractRawText({ arrayBuffer: source });

  if (result.messages && result.messages.length > 0) {
    const warnings = result.messages.filter((m) => m.type === 'warning');
    if (warnings.length > 0) {
      console.warn(
        'DOCX extraction warnings:',
        warnings.map((w) => w.message)
      );
    }
  }

  return result.value;
}
