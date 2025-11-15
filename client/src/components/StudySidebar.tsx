import type { Explanation } from '../lib/types';

type StudySidebarProps = {
  pageNumber: number;
  explanations: Explanation[];
  notes: string;
  onNotesChange: (next: string) => void;
};

export function StudySidebar({ pageNumber, explanations, notes, onNotesChange }: StudySidebarProps) {
  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-l border-slate-800 bg-surface text-slate-100">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Page {pageNumber}</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Study notes</h2>
      </div>
      <div className="focuspdf-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-6">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">AI explanations</h3>
          <div className="mt-3 space-y-3">
            {explanations.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3 text-xs text-slate-400">
                Highlight text in the PDF and press “Explain” to add quick explanations here.
              </p>
            )}
            {explanations.map((explanation) => (
              <article key={explanation.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 shadow-inner shadow-black/40">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">Selection</p>
                <p className="mt-1 line-clamp-3 text-sm italic text-slate-200">“{explanation.selectedText}”</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-100">{explanation.explanation}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Notes</h3>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Notes for this page..."
            className="mt-3 h-40 w-full resize-none rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
        </section>
      </div>
    </aside>
  );
}
