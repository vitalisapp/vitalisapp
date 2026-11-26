import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon.jsx';
import { buildSteps, currentSide, formatDose, formatSeconds, playerReducer } from '../../lib/routine.js';

// Guided follow-along for a warm-up or cool-down (Revision #3).
// Timed moves count down and advance on their own; rep moves wait for "Done".
// Every move can be skipped or switched to its easier version mid-routine.
export default function RoutinePlayer({
  phase = 'warmup',
  moves = [],
  initialSkipped = undefined,
  initialEasier = undefined,
  doneLabel = 'Finish',
  onDone = undefined,
  onClose = undefined,
}) {
  const isWarmup = phase === 'warmup';
  const title = isWarmup ? 'Warm-up' : 'Cool-down';
  const [skipped] = useState(() => new Set(initialSkipped || []));
  const [easier, setEasier] = useState(() => new Set(initialEasier || []));
  const steps = useMemo(() => buildSteps(moves, { skipped, easier }), [moves, skipped, easier]);

  const [state, dispatch] = useReducer(playerReducer, steps, (s) => ({
    index: 0, remaining: s[0]?.timerSeconds || 0, running: true, finished: s.length === 0,
  }));
  const { index, remaining, running, finished } = state;
  const step = steps[index];
  const side = currentSide(step, remaining);

  const goTo = useCallback((next) => dispatch({ type: 'goto', index: next, steps }), [steps]);
  const setRunning = (fn) => dispatch({ type: 'running', value: fn(running) });

  // 1 s ticks for timed steps only; the reducer advances at zero.
  useEffect(() => {
    if (!running || finished || !step?.timerSeconds) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick', steps }), 1000);
    return () => clearInterval(id);
  }, [running, finished, step?.timerSeconds, index, steps]);

  // Escape closes; never trap the user in a routine.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleEasier = () => {
    if (!step?.hasEasier) return;
    setEasier((prev) => {
      const next = new Set(prev);
      if (next.has(step.key)) next.delete(step.key); else next.add(step.key);
      return next;
    });
  };

  const pct = step?.timerSeconds ? Math.round(((step.timerSeconds - remaining) / step.timerSeconds) * 100) : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} routine`}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[92dvh] overflow-y-auto"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[length:var(--fs-10)] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {title}{!finished && steps.length ? ` · ${index + 1} of ${steps.length}` : ''}
          </p>
          <button type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <Icon name="close" className="text-[length:var(--fs-18)]" />
          </button>
        </div>

        {/* Step progress */}
        {!finished && steps.length > 0 && (
          <div className="flex gap-1 mb-5" aria-hidden="true">
            {steps.map((s, i) => (
              <span key={s.key} className="h-1 flex-1 rounded-full" style={{ background: i < index ? 'var(--accent)' : i === index ? 'var(--accent-border)' : 'var(--border-light)' }} />
            ))}
          </div>
        )}

        {finished ? (
          <div className="text-center py-4">
            <span className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--accent)' }}>
              <Icon name="check" className="text-[length:var(--fs-28)]" style={{ color: 'var(--text-inverse)' }} />
            </span>
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              {isWarmup ? 'Warmed up — you’re ready' : 'Cool-down complete'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {isWarmup ? 'Your muscles and joints are prepared for today’s session.' : 'Nice work. Drink some water and let your breathing settle.'}
            </p>
            <button
              type="button"
              onClick={onDone}
              className="w-full py-3.5 min-h-[52px] rounded-xl font-black text-sm uppercase tracking-wide"
              style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
            >
              {doneLabel}
            </button>
          </div>
        ) : step ? (
          <div aria-live="polite">
            <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{step.name}</h2>
            <p className="text-xs font-bold mt-1 mb-4" style={{ color: 'var(--accent)' }}>
              {formatDose(step)}
              {step.isEasier ? ` · easier version of ${step.originalName}` : ''}
            </p>

            {step.timerSeconds ? (
              <div className="rounded-2xl p-4 mb-4 text-center border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
                <p className="text-4xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatSeconds(remaining)}</p>
                {side && (
                  <p className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: side === 2 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {side === 1 ? 'Side 1 of 2' : 'Switch sides · side 2 of 2'}
                  </p>
                )}
                <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--border-light)' }}>
                  <div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-4 mb-4 text-center border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
                <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{formatDose(step)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Go at your own pace, then tap Done.</p>
              </div>
            )}

            <ol className="space-y-1.5 mb-3 list-decimal pl-5">
              {step.steps.map((line) => (
                <li key={line} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{line}</li>
              ))}
            </ol>
            {step.cue && (
              <p className="text-xs font-semibold flex items-start gap-1.5 mb-5" style={{ color: 'var(--text-muted)' }}>
                <Icon name="lightbulb" className="text-[length:var(--fs-14)] shrink-0" /> {step.cue}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mb-2">
              <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0}
                className="min-h-[44px] rounded-xl border text-xs font-bold disabled:opacity-40"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
                Back
              </button>
              {step.timerSeconds ? (
                <button type="button" onClick={() => setRunning((r) => !r)}
                  className="min-h-[44px] rounded-xl border text-xs font-bold"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
                  {running ? 'Pause' : 'Resume'}
                </button>
              ) : (
                <button type="button" onClick={() => goTo(index + 1)}
                  className="min-h-[44px] rounded-xl text-xs font-black"
                  style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
                  Done
                </button>
              )}
              <button type="button" onClick={() => goTo(index + 1)}
                className="min-h-[44px] rounded-xl border text-xs font-bold"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
                Skip
              </button>
            </div>
            {step.hasEasier && (
              <button type="button" onClick={toggleEasier} aria-pressed={step.isEasier}
                className="w-full min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ color: step.isEasier ? 'var(--accent)' : 'var(--text-muted)', background: 'var(--bg-hover)' }}>
                <Icon name="accessibility_new" className="text-[length:var(--fs-14)]" />
                {step.isEasier ? `Back to ${step.originalName}` : 'Too hard? Use the easier version'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
