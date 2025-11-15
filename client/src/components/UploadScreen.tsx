import { ChangeEvent } from 'react';

type UploadScreenProps = {
  onFileSelected: (file: File) => void;
};

export function UploadScreen({ onFileSelected }: UploadScreenProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#070a13] px-6 text-center text-slate-200">
      <h1 className="text-4xl font-semibold tracking-wide text-white">FocusPDF</h1>
      <p className="max-w-xl text-sm text-slate-400">
        Upload a PDF to enter focus mode. You&apos;ll get a clean reader, per-page notes, and quick explanations for
        highlighted text.
      </p>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-10 py-8 text-slate-200 shadow-lg shadow-black/40 transition hover:border-cyan-400/60 hover:bg-slate-900/60">
        <span className="text-sm uppercase tracking-widest text-slate-400">Choose PDF</span>
        <input type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
        <span className="mt-3 text-lg font-medium text-white">Click to select</span>
      </label>
    </div>
  );
}
