import { useState } from 'react';
import Icon from '../Icon.jsx';
import RoutinePlayer from './RoutinePlayer.jsx';
import { formatDose, routineSeconds } from '../../lib/routine.js';

// Warm-up / cool-down preview card (Revision #3). Shows the full list before
// starting; each move can be left out, and the guided player offers an easier
// version of every move. Purely presentational — data comes from the parent.
export default function RoutineCard({
  phase = 'warmup',
  block = null,
  rationale = undefined,
  loading = false,
  error = false,
  onRetry = undefined,
  doneLabel = undefined,
  onFinished = undefined,
  defaultOpen = false,
}) {
  const isWarmup = phase === 'warmup';
  const [open, setOpen] = useState(defaultOpen);
  const [skipped, setSkipped] = useState(() => new Set());
  const [playing, setPlaying] = useState(false);

  if (loading) {
    return (
      <div className="rounded-2xl border p-4 animate-pulse" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }} aria-busy="true">
        <div className="h-3 w-1/3 rounded mb-2" style={{ background: 'var(--border-light)' }} />
        <div className="h-3 w-2/3 rounded" style={{ background: 'var(--border-light)' }} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
        <Icon name="cloud_off" className="text-[length:var(--fs-18)] shrink-0" style={{ color: 'var(--text-muted)' }} />
        <p className="flex-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Couldn’t load your {isWarmup ? 'warm-up' : 'cool-down'}.
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-xs font-bold min-h-[36px] px-3 rounded-lg" style={{ color: 'var(--accent)' }}>
            Retry
          </button>
        )}
      </div>
    );
  }
  if (!block?.moves?.length) return null;

  const kept = block.moves.filter((m) => !skipped.has(m.key));
  const minutes = Math.max(1, Math.round(routineSeconds(block.moves, skipped) / 60));
  const toggleSkip = (key) => setSkipped((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-4 text-left min-h-[56px]"
      >
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          <Icon name={isWarmup ? 'local_fire_department' : 'self_improvement'} className="text-[length:var(--fs-18)]" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[length:var(--fs-10)] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {isWarmup ? 'Before you start' : 'After your workout'}
          </span>
          <span className="block text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>
            {isWarmup ? 'Warm-up' : 'Cool-down stretches'} · {minutes} min · {kept.length} moves
          </span>
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[length:var(--fs-20)] shrink-0" style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {rationale?.[0] && (
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{rationale[0]}</p>
          )}
          <ul className="space-y-1.5 mb-3">
            {block.moves.map((m) => {
              const off = skipped.has(m.key);
              return (
                <li key={m.key} className="flex items-center gap-2 rounded-xl px-3 py-2 border" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)', opacity: off ? 0.55 : 1 }}>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold truncate ${off ? 'line-through' : ''}`} style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                    <span className="block text-[length:var(--fs-11)]" style={{ color: 'var(--text-muted)' }}>
                      {formatDose(m)}{m.easier?.name ? ` · easier: ${m.easier.name}` : ''}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSkip(m.key)}
                    aria-pressed={off}
                    aria-label={off ? `Include ${m.name}` : `Leave out ${m.name}`}
                    className="text-[length:var(--fs-11)] font-bold min-h-[36px] px-2.5 rounded-lg shrink-0"
                    style={{ color: off ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    {off ? 'Add back' : 'Skip'}
                  </button>
                </li>
              );
            })}
          </ul>
          {block.notes?.map((n) => (
            <p key={n} className="text-[length:var(--fs-11)] flex items-start gap-1.5 mb-2" style={{ color: 'var(--text-muted)' }}>
              <Icon name="info" className="text-[length:var(--fs-14)] shrink-0 mt-px" /> {n}
            </p>
          ))}
          {!isWarmup && (
            <p className="text-[length:var(--fs-11)] mb-3" style={{ color: 'var(--text-muted)' }}>
              Stretch to mild tension, never pain, and breathe slowly through each hold.
            </p>
          )}
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={kept.length === 0}
            className="w-full py-3 min-h-[48px] rounded-xl font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            <Icon name="play_arrow" className="text-[length:var(--fs-18)]" fill={1} />
            {isWarmup ? 'Start guided warm-up' : 'Start guided cool-down'}
          </button>
        </div>
      )}

      {playing && (
        <RoutinePlayer
          phase={phase}
          moves={block.moves}
          initialSkipped={skipped}
          doneLabel={doneLabel || (isWarmup ? 'Continue' : 'Done')}
          onClose={() => setPlaying(false)}
          onDone={() => { setPlaying(false); onFinished?.(); }}
        />
      )}
    </div>
  );
}
