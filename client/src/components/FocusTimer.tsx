import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type FocusTimerProps = {
  defaultMinutes?: number;
};

export function FocusTimer({ defaultMinutes = 25 }: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [customMinutes, setCustomMinutes] = useState(defaultMinutes.toString());

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
  }, [secondsLeft, isRunning]);

  const formatted = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const start = useCallback(() => {
    if (secondsLeft > 0) {
      setIsRunning(true);
    }
  }, [secondsLeft]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    const minutes = Number.parseInt(customMinutes || `${defaultMinutes}`, 10) || defaultMinutes;
    setSecondsLeft(minutes * 60);
  }, [customMinutes, defaultMinutes]);

  const handleMinutesChange = useCallback(
    (value: string) => {
      if (/^\d*$/.test(value)) {
        setCustomMinutes(value);
        if (!isRunning && value) {
          setSecondsLeft(Number.parseInt(value, 10) * 60);
        }
      }
    },
    [isRunning]
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080d18]/95 px-6 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.75)] backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 text-slate-100">
        <div className="flex flex-1 items-center gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus Timer</label>
          <input
            aria-label="Timer minutes"
            value={customMinutes}
            onChange={(event) => handleMinutesChange(event.target.value)}
            className="w-20 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
          <span className={`text-2xl font-mono ${secondsLeft === 0 ? 'text-cyan-300' : 'text-white'}`}>{formatted}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={start}
            className="rounded-md bg-cyan-600/70 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500/80 disabled:opacity-40"
            disabled={isRunning || secondsLeft === 0}
          >
            Start
          </button>
          <button
            onClick={pause}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700/80"
          >
            Pause
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/60"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
