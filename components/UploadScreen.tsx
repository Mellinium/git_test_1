'use client';

import { ChangeEvent } from 'react';

type UploadScreenProps = {
  onFileSelect: (file: File) => void;
};

export function UploadScreen({ onFileSelect }: UploadScreenProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-surface text-center">
      <h1 className="mb-6 text-4xl font-semibold tracking-tight text-slate-100">FocusPDF</h1>
      <p className="mb-10 max-w-md text-sm text-muted">
        Upload a PDF to study with focused reading, quick AI explanations, and per-page notes. Dark mode only for peak concentration.
      </p>
      <label className="group inline-flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-surface px-10 py-12 text-sm text-muted transition hover:border-accent hover:bg-surface/80">
        <span className="text-xs uppercase tracking-widest text-slate-500">Choose your PDF</span>
        <span className="text-lg font-medium text-slate-200">Click or drag a file</span>
        <input type="file" accept="application/pdf" onChange={handleChange} className="hidden" />
      </label>
    </div>
  );
}
