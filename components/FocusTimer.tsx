'use client';

import { useEffect, useMemo, useState } from 'react';

const DEFAULT_MINUTES = 25;

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [hrs, mins, secs];
  const formatted = parts
    .map((part, index) => (index === 0 && hrs === 0 ? null : part.toString().padStart(2, '0')))
    .filter(Boolean);
  if (formatted.length === 0) {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return formatted.join(':');
}

export function FocusTimer() {
  const [customMinutes, setCustomMinutes] = useState(DEFAULT_MINUTES);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_MINUTES * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
    }
  }, [secondsLeft, running]);

  const statusLabel = useMemo(() => {
    if (secondsLeft === 0) {
      return 'Time\'s up';
    }
    return running ? 'Focusing…' : 'Paused';
  }, [running, secondsLeft]);

  const handleStart = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(customMinutes * 60);
    }
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(customMinutes * 60);
  };

  const handleMinutesChange = (value: number) => {
    const minutes = Number.isNaN(value) ? DEFAULT_MINUTES : Math.max(1, Math.min(180, Math.floor(value)));
    setCustomMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setRunning(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-surface/95 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-muted">Focus Timer</span>
          <span className={`text-base font-semibold ${secondsLeft === 0 ? 'text-accent' : ''}`}>
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-muted">{statusLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 rounded-md bg-surface px-3 py-1 text-muted ring-1 ring-slate-800">
            Duration
            <input
              type="number"
              min={1}
              max={180}
              value={customMinutes}
              onChange={(event) => handleMinutesChange(Number(event.target.value))}
              className="w-16 rounded bg-transparent text-right text-slate-100 focus:outline-none"
            />
            <span>min</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStart}
              className="rounded-md bg-accent/20 px-3 py-1 font-medium text-accent transition hover:bg-accent/30"
            >
              Start
            </button>
            <button
              onClick={handlePause}
              className="rounded-md bg-slate-800 px-3 py-1 font-medium text-slate-100 transition hover:bg-slate-700"
            >
              Pause
            </button>
            <button
              onClick={handleReset}
              className="rounded-md bg-slate-900 px-3 py-1 font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
