import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import Icon from '../../../../components/Icon.jsx';
import { useExerciseGuide } from '../hooks/useExerciseGuide.js';
import { matchExercise } from '../utils/exerciseMatch.js';
import { frameUrl } from '../../CameraWorkout/constants/workoutGuide.js';
import { speak } from '../../CameraWorkout/hooks/useRepCounter.js';

// Picture for one step: bundled copy first (no CDN dependency), then the CDN,
// then a plain placeholder (parent keys this by slug so the stage resets) — the modal never shows a broken image.
function ExerciseFrame({ slug, frame, name }) {
  const [stage, setStage] = useState(0);
  const sources = [`/exercise-frames/${slug}/frame-${frame}.png`, frameUrl(slug, frame)].filter(Boolean);
  const src = sources[stage];
  return (
    <div className="rounded-xl overflow-hidden border flex items-center justify-center" style={{ background: '#161b22', borderColor: 'var(--border-light)', aspectRatio: '4 / 3' }}>
      {src ? (
        <img key={src} src={src} alt={`${name}, step ${frame} of 3`} className="max-h-full max-w-full object-contain"
          onError={() => setStage((s) => s + 1)} />
      ) : (
        <div className="flex flex-col items-center gap-1 text-center px-4" style={{ color: 'var(--text-muted)' }}>
          <Icon name="image_not_supported" className="text-[28px]" />
          <span className="text-[12px]">Picture unavailable — follow the steps below.</span>
        </div>
      )}
    </div>
  );
}

const LEVEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

// Section 3 — how to do an exercise: pictures, steps, form cues, common
// mistakes, and a "Don't recommend this" action that feeds the recommender.
export default function ExerciseGuideModal({ name = undefined, detail = undefined, onClose = undefined, excluded = false, onToggleExclude = undefined }) {
  const { guide, loading } = useExerciseGuide(name);
  const match = name ? matchExercise(name) : null;
  const [frame, setFrame] = useState(1);
  const [auto, setAuto] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const tts = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Fresh exercise: back to picture 1 and auto-play the 3 frames like a demo.
  useEffect(() => { setFrame(1); setAuto(true); }, [name]);
  useEffect(() => {
    if (!auto || !match?.slug) return undefined;
    const t = setInterval(() => setFrame((f) => (f % 3) + 1), 1200);
    return () => clearInterval(t);
  }, [auto, match?.slug]);

  // Section 7: stop reading when the guide closes.
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, [name]);

  const readAloud = () => {
    const synth = window.speechSynthesis;
    if (!synth || !guide) return;
    if (reading) { synth.cancel(); setReading(false); return; }
    const text = [`${name}.`, ...guide.steps.map((st, i) => `Step ${i + 1}. ${st}`),
      guide.cues.length ? `Good form: ${guide.cues.join('. ')}.` : '',
      guide.mistakes.length ? `Avoid: ${guide.mistakes.join('. ')}.` : ''].filter(Boolean).join(' ');
    speak(text, 0.95, 1.0);
    setReading(true);
    const poll = setInterval(() => { if (!synth.speaking && !synth.pending) { setReading(false); clearInterval(poll); } }, 500);
  };

  const toggle = async () => {
    if (!onToggleExclude || busy) return;
    setBusy(true);
    try { await onToggleExclude(name, !excluded); } finally { setBusy(false); }
  };

  return (
    <Modal
      isOpen={Boolean(name)}
      onClose={onClose}
      title={name || ''}
      subtitle={guide ? `${guide.muscle} · ${LEVEL[guide.level] || ''}${guide.impact === 'high' ? ' · High impact' : ''}` : match ? `${match.primaryMuscle} · ${match.equipment}` : undefined}
      icon="menu_book"
      zIndex={140}
      footer={onToggleExclude ? (
        <button type="button" onClick={toggle} disabled={busy}
          className="h-10 px-4 rounded-lg border text-[13px] font-semibold disabled:opacity-50"
          style={{ borderColor: 'var(--border-medium)', color: excluded ? 'var(--accent)' : 'var(--text-primary)' }}>
          <Icon name={excluded ? 'undo' : 'block'} className="text-[16px] align-[-3px] mr-1.5" />
          {excluded ? 'Allow in my plans again' : "Don't recommend this"}
        </button>
      ) : undefined}
    >
      {match?.slug && (
        <div className="mb-4">
          <ExerciseFrame key={match.slug} slug={match.slug} frame={frame} name={name} />
          <div className="flex items-center justify-center gap-1.5 mt-2" role="group" aria-label="Picture steps">
            {[1, 2, 3].map((f) => (
              <button key={f} type="button" onClick={() => { setAuto(false); setFrame(f); }} aria-pressed={frame === f} aria-label={`Show picture ${f}`}
                className="h-8 min-w-8 px-2 rounded-md text-[12px] font-semibold border"
                style={{
                  background: frame === f ? 'var(--accent-bg)' : 'transparent',
                  borderColor: frame === f ? 'var(--accent-border)' : 'var(--border-light)',
                  color: frame === f ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {f}
              </button>
            ))}
            <button type="button" onClick={() => setAuto((a) => !a)} aria-pressed={auto}
              aria-label={auto ? 'Pause pictures' : 'Play pictures'}
              className="h-8 w-8 rounded-md border flex items-center justify-center"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
              <Icon name={auto ? 'pause' : 'play_arrow'} className="text-[16px]" />
            </button>
          </div>
        </div>
      )}

      {detail && (
        <p className="mb-3 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Today: {detail}
        </p>
      )}

      {loading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading instructions…</p>}

      {!loading && !guide && (
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {match
            ? `Works your ${String(match.primaryMuscle || 'body').toLowerCase()} (${match.equipment || 'bodyweight'}). Follow the pictures, move slowly with good control, and stop if you feel sharp pain.`
            : 'Written steps for this exercise are not available yet. Follow the pictures and move slowly with good control.'}
        </p>
      )}

      {guide && tts && (
        <button type="button" onClick={readAloud} aria-pressed={reading}
          className="mb-3 h-10 px-4 rounded-full border text-[13px] font-semibold inline-flex items-center gap-1.5"
          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}>
          <Icon name={reading ? 'stop_circle' : 'volume_up'} className="text-[18px]" />
          {reading ? 'Stop reading' : 'Read instructions aloud'}
        </button>
      )}

      {guide && (
        <div className="space-y-4 text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>How to do it</h4>
            <ol className="list-decimal pl-5 space-y-1">
              {guide.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </section>
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Form tips</h4>
            <ul className="space-y-1">
              {guide.cues.map((c) => (
                <li key={c} className="flex gap-2"><Icon name="check_circle" className="text-[16px] shrink-0 mt-0.5" style={{ color: 'var(--success, #10b981)' }} />{c}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Common mistakes</h4>
            <ul className="space-y-1">
              {guide.mistakes.map((m) => (
                <li key={m} className="flex gap-2"><Icon name="cancel" className="text-[16px] shrink-0 mt-0.5" style={{ color: 'var(--warning, #f59e0b)' }} />{m}</li>
              ))}
            </ul>
          </section>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Stop if you feel sharp pain, dizziness or chest discomfort.
          </p>
        </div>
      )}
    </Modal>
  );
}
