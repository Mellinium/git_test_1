'use client';

import { useMemo } from 'react';
import type { Explanation } from '@/lib/types';

type StudySidebarProps = {
  pageNumber: number;
  explanations: Explanation[];
  notes: string;
  onNotesChange: (value: string) => void;
};

export function StudySidebar({ pageNumber, explanations, notes, onNotesChange }: StudySidebarProps) {
  const formattedPage = useMemo(() => pageNumber.toString(), [pageNumber]);

  return (
    <aside className="flex h-full min-h-screen w-full max-w-sm flex-col border-l border-slate-800 bg-surface/80 p-5">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Page {formattedPage}</h2>
          <p className="text-xs text-muted">Capture highlights and notes without leaving the page.</p>
        </div>
      </header>

      <section className="mb-6 flex-1 space-y-3 overflow-y-auto pr-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">AI explanations</h3>
        {explanations.length === 0 ? (
          <p className="rounded-lg bg-slate-900/60 p-3 text-xs text-muted">
            Select text in the PDF and click <strong>Explain</strong> to get quick breakdowns.
          </p>
        ) : (
          <div className="space-y-3">
            {explanations.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                <p className="mb-2 text-xs font-medium text-accent/80">
                  “{item.excerpt}”
                </p>
                <p className="text-sm text-slate-200">{item.text}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Notes</h3>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Notes for this page…"
          className="h-40 w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200 placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/60"
        />
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted">Notes are stored per page in your browser memory.</p>
      </section>
    </aside>
  );
}
