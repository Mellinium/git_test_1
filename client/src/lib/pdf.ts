import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * Extracts the visible text for a single page. pdf.js exposes getTextContent which returns
 * structured text items (glyphs). For a production app you would want to join them with
 * attention to whitespace. Here we keep it simple and join item strings by a space.
 */
export async function extractPageText(document: PDFDocumentProxy, pageNumber: number): Promise<string> {
  try {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    return content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
  } catch (error) {
    console.warn('Failed to extract page text', error);
    return '';
  }
}
