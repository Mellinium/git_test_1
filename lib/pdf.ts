import type { PDFDocumentProxy } from 'pdfjs-dist';

export async function extractTextForPage(document: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await document.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const strings = textContent.items
    .map((item) => ('str' in item ? item.str : ''))
    .filter((value): value is string => value.length > 0);
  return strings.join(' ');
}
