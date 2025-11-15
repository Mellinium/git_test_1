'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { UploadScreen } from '@/components/UploadScreen';
import { PdfViewer, type SelectionInfo } from '@/components/PdfViewer';
import { StudySidebar } from '@/components/StudySidebar';
import { FocusTimer } from '@/components/FocusTimer';
import { extractTextForPage } from '@/lib/pdf';
import type { Explanation, Highlight } from '@/lib/types';

type ExplainResponse = {
  explanation: string;
};

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function HomePage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageText, setPageText] = useState('');
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesByPage, setNotesByPage] = useState<Record<number, string>>({});
  const [explanationsByPage, setExplanationsByPage] = useState<Record<number, Explanation[]>>({});
  const [highlightsByPage, setHighlightsByPage] = useState<Record<number, Highlight[]>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedNotes = window.localStorage.getItem('focuspdf.notes');
    if (storedNotes) {
      try {
        setNotesByPage(JSON.parse(storedNotes));
      } catch (error) {
        console.warn('Failed to parse stored notes', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('focuspdf.notes', JSON.stringify(notesByPage));
  }, [notesByPage]);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setSelection(null);
    setExplanationsByPage({});
    setHighlightsByPage({});
    setNotesByPage({});
    setCurrentPage(1);
    setPdfDocument(null);

    setFileUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
  }, []);

  const handleDocumentLoad = useCallback(async (document: PDFDocumentProxy) => {
    setPdfDocument(document);
    setNumPages(document.numPages);
    try {
      const text = await extractTextForPage(document, 1);
      setPageText(text);
    } catch (error) {
      console.error('Failed to extract page text', error);
      setPageText('');
    }
  }, []);

  useEffect(() => {
    if (!pdfDocument) return;
    let cancelled = false;
    const load = async () => {
      try {
        const text = await extractTextForPage(pdfDocument, currentPage);
        if (!cancelled) {
          setPageText(text);
        }
      } catch (error) {
        console.error('Failed to extract page text', error);
        if (!cancelled) {
          setPageText('');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pdfDocument, currentPage]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!numPages) return;
      const clamped = Math.min(Math.max(1, page), numPages);
      setSelection(null);
      setCurrentPage(clamped);
    },
    [numPages]
  );

  const activeHighlights = useMemo(() => {
    const persistent = highlightsByPage[currentPage] ?? [];
    if (selection) {
      return [...persistent, { id: 'selection-preview', rects: selection.rects }];
    }
    return persistent;
  }, [highlightsByPage, currentPage, selection]);

  const handleExplain = useCallback(async () => {
    if (!selection || !fileUrl) return;
    setLoadingExplanation(true);
    setError(null);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText: selection.text,
          pageText,
          pageNumber: currentPage
        })
      });

      if (!response.ok) {
        const { error: errorMessage } = await response.json();
        throw new Error(errorMessage || 'Explain request failed');
      }

      const data: ExplainResponse = await response.json();
      const explanationText = data.explanation?.trim() ?? '';

      const newHighlight: Highlight = {
        id: generateId(),
        rects: selection.rects
      };
      // Highlights and explanations are keyed by the `currentPage` so they always line up with
      // the visible PDF page that produced the text selection.
      setHighlightsByPage((previous) => ({
        ...previous,
        [currentPage]: [...(previous[currentPage] ?? []), newHighlight]
      }));

      const excerpt = selection.text.slice(0, 120) + (selection.text.length > 120 ? '…' : '');
      const explanation: Explanation = {
        id: generateId(),
        excerpt,
        text: explanationText
      };
      setExplanationsByPage((previous) => ({
        ...previous,
        [currentPage]: [...(previous[currentPage] ?? []), explanation]
      }));

      setSelection(null);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Unable to explain selection');
    } finally {
      setLoadingExplanation(false);
    }
  }, [selection, fileUrl, pageText, currentPage]);

  const currentNotes = notesByPage[currentPage] ?? '';
  const currentExplanations = explanationsByPage[currentPage] ?? [];

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotesByPage((previous) => ({
        ...previous,
        [currentPage]: value
      }));
    },
    [currentPage]
  );

  if (!fileUrl) {
    return <UploadScreen onFileSelect={handleFileSelect} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <div className="flex flex-1 flex-row">
        <div className="relative flex min-h-screen flex-1">
          <PdfViewer
            file={fileUrl}
            currentPage={currentPage}
            numPages={numPages}
            highlights={activeHighlights}
            onDocumentLoad={handleDocumentLoad}
            onPageChange={handlePageChange}
            onSelectionChange={setSelection}
          />

          {selection && (
            <button
              onClick={handleExplain}
              disabled={loadingExplanation}
              style={{ left: selection.button.left, top: selection.button.top }}
              className="absolute z-30 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-slate-950 shadow-lg shadow-black/40 transition hover:bg-accent/90 disabled:cursor-wait disabled:opacity-60"
            >
              {loadingExplanation ? 'Explaining…' : 'Explain'}
            </button>
          )}

          {error && (
            <div className="absolute right-5 top-5 z-30 rounded-lg border border-red-500/50 bg-red-950/70 px-4 py-2 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>

        <StudySidebar
          pageNumber={currentPage}
          explanations={currentExplanations}
          notes={currentNotes}
          onNotesChange={handleNotesChange}
        />
      </div>
      <FocusTimer />

      <section className="px-6 pb-6 text-xs text-muted">
        <h4 className="mb-2 font-semibold text-slate-200">How it works</h4>
        <ul className="space-y-1 list-disc pl-5">
          <li>
            PDF is loaded in-memory using a Blob URL created from the uploaded file. Pages are rendered via pdf.js through the
            react-pdf wrapper.
          </li>
          <li>
            When you select text on the page, the browser selection API captures the exact text and bounding rectangles relative to
            the current page, letting us attach highlights and the Explain button to the correct spot.
          </li>
          <li>
            Explanations and notes are keyed by <code>pageNumber</code>, so switching pages swaps in the relevant content instantly.
          </li>
        </ul>
      </section>
    </div>
  );
}
