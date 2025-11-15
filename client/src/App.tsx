import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FocusTimer } from './components/FocusTimer';
import { PdfViewer, type SelectionInfo } from './components/PdfViewer';
import { StudySidebar } from './components/StudySidebar';
import { UploadScreen } from './components/UploadScreen';
import type { Explanation, Highlight } from './lib/types';
import { extractPageText } from './lib/pdf';

type NotesByPage = Record<number, string>;
type HighlightsByPage = Record<number, Highlight[]>;
type ExplanationsByPage = Record<number, Explanation[]>;

const STORAGE_KEY = 'focuspdf-notes';

export default function App() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>();
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const [highlightsByPage, setHighlightsByPage] = useState<HighlightsByPage>({});
  const [explanationsByPage, setExplanationsByPage] = useState<ExplanationsByPage>({});
  const [notesByPage, setNotesByPage] = useState<NotesByPage>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as NotesByPage) : {};
    } catch (error) {
      console.warn('Failed to parse stored notes', error);
      return {};
    }
  });
  const [isExplaining, setIsExplaining] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notesByPage));
    } catch (error) {
      console.warn('Failed to persist notes', error);
    }
  }, [notesByPage]);

  const handleFileSelected = useCallback((file: File) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setCurrentPage(1);
    setNumPages(undefined);
    setPdfDocument(null);
    setSelectionInfo(null);
    setHighlightsByPage({});
    setExplanationsByPage({});
  }, [fileUrl]);

  const handleDocumentLoad = useCallback((doc: PDFDocumentProxy) => {
    setPdfDocument(doc);
    setNumPages(doc.numPages);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage((prev) => {
      if (numPages) {
        const next = Math.min(Math.max(page, 1), numPages);
        return next;
      }
      return Math.max(1, page);
    });
  }, [numPages]);

  const currentHighlights = useMemo(() => highlightsByPage[currentPage] ?? [], [highlightsByPage, currentPage]);
  const currentExplanations = useMemo(() => explanationsByPage[currentPage] ?? [], [explanationsByPage, currentPage]);
  const currentNotes = useMemo(() => notesByPage[currentPage] ?? '', [notesByPage, currentPage]);

  const updateNotes = useCallback((text: string) => {
    setNotesByPage((prev) => ({ ...prev, [currentPage]: text }));
  }, [currentPage]);

  const handleExplain = useCallback(async () => {
    if (!selectionInfo || !pdfDocument) return;
    setIsExplaining(true);
    setStatusMessage('');

    const highlight: Highlight = {
      id: `${currentPage}-${Date.now()}`,
      rects: selectionInfo.rects,
      text: selectionInfo.text,
      createdAt: Date.now()
    };

    setHighlightsByPage((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] ?? []), highlight]
    }));

    try {
      const pageText = await extractPageText(pdfDocument, currentPage);
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedText: selectionInfo.text,
          pageText,
          pageNumber: currentPage
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data: { explanation: string } = await response.json();
      const explanation: Explanation = {
        id: highlight.id,
        selectedText: selectionInfo.text,
        explanation: data.explanation,
        createdAt: Date.now()
      };

      setExplanationsByPage((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] ?? []), explanation]
      }));
      setStatusMessage(null);
    } catch (error) {
      console.error(error);
      setStatusMessage('Could not reach the AI service. Please check the server and try again.');
      setHighlightsByPage((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] ?? []).filter((item) => item.id !== highlight.id)
      }));
    } finally {
      setIsExplaining(false);
      setSelectionInfo(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [currentPage, pdfDocument, selectionInfo]);

  if (!fileUrl) {
    return <UploadScreen onFileSelected={handleFileSelected} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-900/80 bg-[#080d18]/80 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70">FocusPDF</p>
          <h1 className="text-2xl font-semibold text-white">Focused study mode</h1>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Current page links notes, highlights &amp; explanations together.</p>
        </div>
      </header>

      {statusMessage && (
        <div className="bg-red-900/30 px-6 py-3 text-sm text-red-200">
          {statusMessage}
        </div>
      )}

      <main className="relative flex flex-1 overflow-hidden">
        <div className="flex w-full flex-1 flex-col">
          <div className="relative flex flex-1">
            <PdfViewer
              file={fileUrl}
              currentPage={currentPage}
              numPages={numPages}
              highlights={currentHighlights}
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
              onSelectionChange={setSelectionInfo}
            />
            {selectionInfo && (
              <button
                type="button"
                onClick={handleExplain}
                disabled={isExplaining}
                style={{ left: selectionInfo.button.left, top: selectionInfo.button.top }}
                className="absolute z-40 rounded-md bg-cyan-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#020409] shadow-lg shadow-black/40 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {isExplaining ? 'Thinking…' : 'Explain'}
              </button>
            )}
          </div>
        </div>
        <StudySidebar
          pageNumber={currentPage}
          explanations={currentExplanations}
          notes={currentNotes}
          onNotesChange={updateNotes}
        />
      </main>

      <FocusTimer />
    </div>
  );
}
