import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { apiGet } from '../../../../lib/apiClient.js';
import { briefingFor, spokenBriefing } from '../constants/exerciseInstructions.js';
import { speak } from '../hooks/useRepCounter.js';
import './exerciseBriefing.css';

// Section 7 — shown before an exercise starts: picture frames, camera setup
// (distance / angle / what must be visible), step-by-step instructions, form
// cues, common mistakes and exactly how Vitalis counts. Can be read aloud.

let guideCache = null; // Section 3 exercise guide (steps / cues / mistakes)
function loadGuide() {
  if (!guideCache) {
    guideCache = apiGet('/api/training-preferences/exercise-guide')
      .then((d) => (Array.isArray(d?.exercises) ? d.exercises : []))
      .catch(() => { guideCache = null; return []; });
  }
  return guideCache;
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

const METHOD = {
  auto: { icon: 'auto_awesome', label: 'Counted automatically by the camera' },
  hold: { icon: 'timer', label: 'Timed while you hold the position' },
  manual: { icon: 'touch_app', label: 'You tap +1 for each rep' },
};

export default function ExerciseBriefing({ workout = undefined, onReady = undefined, onHide = undefined }) {
  const [library, setLibrary] = useState([]);
  const [frame, setFrame] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let alive = true;
    loadGuide().then((list) => { if (alive) setLibrary(list); });
    return () => { alive = false; };
  }, []);

  const frames = useMemo(() => (workout?.frames || []).filter(Boolean), [workout]);
  useEffect(() => {
    if (frames.length < 2) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 1300);
    return () => clearInterval(t);
  }, [frames.length]);

  // Stop reading when the briefing closes or the exercise changes.
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, [workout?.id]);

  const libraryGuide = useMemo(() => {
    const key = norm(workout?.label);
    return library.find((e) => norm(e.name) === key) || null;
  }, [library, workout?.label]);
  const b = useMemo(() => briefingFor(workout, libraryGuide), [workout, libraryGuide]);
  const method = METHOD[b.method];

  const toggleRead = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    speak(spokenBriefing(b), 0.95, 1.0);
    setSpeaking(true);
    const poll = setInterval(() => {
      if (!synth.speaking && !synth.pending) { setSpeaking(false); clearInterval(poll); }
    }, 500);
  };

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <section className="cw-brief glass-card" aria-labelledby="cw-brief-title">
      <header className="cw-brief-head">
        <div className="min-w-0">
          <span className="cw-brief-eyebrow">Before you start</span>
          <h2 id="cw-brief-title" className="cw-brief-title">{b.label}</h2>
          <p className="cw-brief-method"><Icon name={method.icon} /> {method.label}</p>
        </div>
        <button type="button" className="cw-brief-close" onClick={onHide} aria-label="Hide instructions">
          <Icon name="close" />
        </button>
      </header>

      <div className="cw-brief-grid">
        {frames.length > 0 && (
          <figure className="cw-brief-frames">
            <img src={frames[frame] || frames[0]} alt={`${b.label}, position ${frame + 1} of ${frames.length}`} />
            <div className="cw-brief-dots" role="group" aria-label="Movement positions">
              {frames.map((_, i) => (
                <button key={i} type="button" className={i === frame ? 'is-on' : ''} aria-label={`Show position ${i + 1}`} aria-pressed={i === frame} onClick={() => setFrame(i)} />
              ))}
            </div>
            <figcaption>Illustration: Bryl Lim / Everkinetic, CC BY-SA 4.0</figcaption>
          </figure>
        )}

        <div className="cw-brief-setup">
          <h3>Camera setup</h3>
          <div className="cw-brief-distance" aria-hidden="true">
            <Icon name="smartphone" />
            <span className="cw-brief-line"><span>about {b.setup.distanceM} m</span></span>
            <Icon name="accessibility_new" />
          </div>
          <ul className="cw-brief-checks">
            <li><Icon name="straighten" /> Place the phone <strong>about {b.setup.distanceM} meters</strong> ({b.setup.distanceM === 2 ? 'roughly 3 big steps' : 'roughly 2 big steps'}) away.</li>
            <li><Icon name={b.setup.view === 'side' ? 'switch_left' : 'person'} /> Stand <strong>{b.setup.view === 'side' ? 'sideways' : 'facing the camera'}</strong>.</li>
            <li><Icon name="crop_free" /> Keep <strong>{b.setup.frame.toLowerCase()}</strong> inside the frame.</li>
            <li><Icon name="stay_current_portrait" /> {b.setup.height}. Lean it against something steady.</li>
            <li><Icon name="light_mode" /> Use a bright room and avoid strong light behind you.</li>
          </ul>
        </div>
      </div>

      {b.steps.length > 0 && (
        <div className="cw-brief-block">
          <h3>How to do it</h3>
          <ol className="cw-brief-steps">
            {b.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      {(b.cues.length > 0 || b.mistakes.length > 0) && (
        <div className="cw-brief-two">
          {b.cues.length > 0 && (
            <div className="cw-brief-block">
              <h3><Icon name="check_circle" /> Good form</h3>
              <ul>{b.cues.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {b.mistakes.length > 0 && (
            <div className="cw-brief-block cw-brief-block--warn">
              <h3><Icon name="error" /> Avoid</h3>
              <ul>{b.mistakes.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <div className="cw-brief-count">
        <h3><Icon name="analytics" /> How Vitalis counts</h3>
        <p>{b.counting}</p>
        {b.method === 'auto' && (
          <p className="cw-brief-note">Reps only count while the tracking badge says &ldquo;Tracking active&rdquo;. If you only go part of the way, you&apos;ll hear a tip and the rep won&apos;t count, so move through the full range.</p>
        )}
        {b.easier && <p className="cw-brief-note"><strong>Easier option:</strong> {b.easier}</p>}
      </div>

      <div className="cw-brief-actions">
        {ttsSupported && (
          <button type="button" className="cw-brief-btn" onClick={toggleRead} aria-pressed={speaking}>
            <Icon name={speaking ? 'stop_circle' : 'volume_up'} /> {speaking ? 'Stop reading' : 'Read instructions aloud'}
          </button>
        )}
        <button type="button" className="cw-brief-btn cw-brief-btn--primary" onClick={() => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } onReady?.(); }}>
          <Icon name="play_arrow" /> I understand, start
        </button>
      </div>
    </section>
  );
}
