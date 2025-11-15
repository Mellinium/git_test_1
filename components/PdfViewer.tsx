'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Highlight } from '@/lib/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

export type SelectionInfo = {
  text: string;
  rects: Highlight['rects'];
  button: {
    left: number;
    top: number;
  };
};

type PdfViewerProps = {
  file: string | File;
  currentPage: number;
  numPages?: number;
  highlights: Highlight[];
  onDocumentLoad: (doc: PDFDocumentProxy) => void;
  onPageChange: (pageNumber: number) => void;
  onSelectionChange: (info: SelectionInfo | null) => void;
};

export function PdfViewer({
  file,
  currentPage,
  numPages,
  highlights,
  onDocumentLoad,
  onPageChange,
  onSelectionChange
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      // Grab the browser selection directly from the rendered pdf.js text layer.
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        onSelectionChange(null);
        return;
      }
      const text = selection.toString().trim();
      if (!text) {
        onSelectionChange(null);
        return;
      }
      // The range bounding boxes give us the coordinates for the highlighted snippet
      // relative to the viewport. We normalise them to the PDF container so we can
      // persist highlights per page.
      const range = selection.getRangeAt(0);
      const rects: SelectionInfo['rects'] = [];
      const clientRects = range.getClientRects();
      const containerRect = container.getBoundingClientRect();
      for (const rect of Array.from(clientRects)) {
        rects.push({
          left: rect.left - containerRect.left + container.scrollLeft,
          top: rect.top - containerRect.top + container.scrollTop,
          width: rect.width,
          height: rect.height
        });
      }
      const firstRect = rects[0];
      const button = {
        left: firstRect.left + firstRect.width + 8,
        top: Math.max(0, firstRect.top - 28)
      };
      onSelectionChange({ text, rects, button });
    };

    container.addEventListener('mouseup', handleMouseUp);
    return () => container.removeEventListener('mouseup', handleMouseUp);
  }, [onSelectionChange]);

  const canGoPrev = useMemo(() => currentPage > 1, [currentPage]);
  const canGoNext = useMemo(() => (numPages ? currentPage < numPages : false), [currentPage, numPages]);

  const changePage = useCallback(
    (delta: number) => {
      onSelectionChange(null);
      onPageChange(currentPage + delta);
    },
    [currentPage, onPageChange, onSelectionChange]
  );

  return (
    <div className="relative flex w-full flex-1 flex-col" ref={containerRef}>
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={() => canGoPrev && changePage(-1)}
            disabled={!canGoPrev}
            className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous Page
          </button>
          <button
            onClick={() => canGoNext && changePage(1)}
            disabled={!canGoNext}
            className="rounded-md bg-slate-900 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Page
          </button>
        </div>
        <span className="text-xs uppercase tracking-widest text-muted">
          Page {currentPage}
          {numPages ? ` / ${numPages}` : ''}
        </span>
      </div>

      <div className="relative flex flex-1 justify-center overflow-auto bg-gradient-to-br from-background via-background to-surface px-6 pb-32 pt-6">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoad}
          loading={<div className="text-muted">Loading PDF…</div>}
          className="flex justify-center"
        >
          <Page
            key={`page_${currentPage}`}
            pageNumber={currentPage}
            width={820}
            renderAnnotationLayer={false}
            renderTextLayer
            className="shadow-xl shadow-black/50"
          />
        </Document>
        {highlights.map((highlight) => (
          <div key={highlight.id} className="pointer-events-none absolute inset-0">
            {highlight.rects.map((rect, index) => (
              <div
                key={index}
                className="absolute rounded-sm bg-accent/30"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
