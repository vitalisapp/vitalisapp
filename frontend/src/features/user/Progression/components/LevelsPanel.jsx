import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icon.jsx';
import { useProgression } from '../hooks/useProgression.js';
import {
  LEVEL_ICON, nextLevel, stepsText, requirementPct, challengeTargetText,
  challengeBlockReason, challengeWorkoutState,
} from '../../../../lib/progression.js';

// Revision #4 — levels, the requirements toward the next one, and challenges.
// Essentials (logging, nutrition, safety, warm-ups) are never part of this.
function Bar({ pct, label }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
    </div>
  );
}

function Requirement({ req }) {
  const pct = requirementPct(req);
  return (
    <li className="rounded-xl border p-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}>
      <div className="flex items-start gap-2 mb-2">
        <Icon
          name={req.met ? 'check_circle' : 'radio_button_unchecked'}
          fill={req.met ? 1 : 0}
          className="text-[length:var(--fs-18)] shrink-0"
          style={{ color: req.met ? 'var(--success)' : 'var(--text-muted)' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{req.label}</p>
          <p className="text-[length:var(--fs-11)] leading-snug mt-0.5" style={{ color: 'var(--text-secondary)' }}>{req.hint}</p>
        </div>
        <span className="text-[length:var(--fs-11)] font-black tabular-nums shrink-0" style={{ color: req.met ? 'var(--success)' : 'var(--text-secondary)' }}>
          {req.met ? 'Done' : `${req.current}/${req.target}`}
        </span>
      </div>
      <Bar pct={pct} label={req.label} />
    </li>
  );
}

function ChallengeCard({ c, progression, onStart }) {
  const blocked = challengeBlockReason(c, progression);
  return (
    <li className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: c.completed ? 'var(--accent-border)' : 'var(--border-light)', background: 'var(--bg-primary)' }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.unlocked ? 'var(--accent-bg)' : 'var(--bg-tertiary)', color: c.unlocked ? 'var(--accent)' : 'var(--text-muted)' }}>
        <Icon name={c.unlocked ? (c.completed ? 'emoji_events' : c.icon) : 'lock'} fill={c.completed ? 1 : 0} className="text-[length:var(--fs-20)]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
        <p className="text-[length:var(--fs-11)] leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {c.completed ? `Completed · best ${c.bestValue}${c.mode === 'hold' ? ' s' : ' reps'}` : (blocked || `${challengeTargetText(c)} · ${c.description}`)}
        </p>
      </div>
      {c.unlocked && !c.blockedBy?.length && (
        <button
          type="button"
          onClick={() => onStart(c)}
          className="min-h-[40px] px-3 rounded-lg text-[length:var(--fs-11)] font-black uppercase tracking-wide shrink-0"
          style={{ background: c.completed ? 'transparent' : 'var(--accent)', color: c.completed ? 'var(--accent)' : 'var(--text-inverse)', border: c.completed ? '1px solid var(--accent-border)' : 'none' }}
        >
          {c.completed ? 'Retry' : 'Start'}
        </button>
      )}
    </li>
  );
}

export default function LevelsPanel() {
  const navigate = useNavigate();
  const { progression, loading, error, unavailable, refresh } = useProgression();

  if (loading) {
    return <div className="rounded-2xl border p-6 animate-pulse" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-tertiary)' }} aria-busy="true" />;
  }
  if (unavailable) {
    return (
      <p className="rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>
        Levels are being set up. All plans stay open until then.
      </p>
    );
  }
  if (error || !progression) {
    return (
      <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: 'var(--border-light)' }}>
        <p className="flex-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Couldn’t load your levels.</p>
        <button type="button" onClick={refresh} className="text-xs font-bold min-h-[40px] px-3" style={{ color: 'var(--accent)' }}>Retry</button>
      </div>
    );
  }

  const current = progression.levels.find((l) => l.level === progression.level);
  const next = nextLevel(progression);
  const startChallenge = (c) => navigate('/workouts', { state: challengeWorkoutState(c) });

  return (
    <div className="space-y-4">
      {/* Current level */}
      <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-tertiary)' }} aria-label="Your level">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
            <Icon name={LEVEL_ICON[progression.level] || 'military_tech'} fill={1} className="text-[length:var(--fs-24)]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[length:var(--fs-10)] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Level {progression.level} of {progression.maxLevel}
            </p>
            <h3 className="text-lg font-black leading-tight" style={{ color: 'var(--text-primary)' }}>{current?.name}</h3>
          </div>
        </div>
        <p className="text-xs leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
          Logging, nutrition tools, safety guidance and warm-ups are always available to everyone.
          Levels open optional advanced plans and challenges once you show you’re ready.
        </p>
      </section>

      {/* Next level */}
      {next ? (
        <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: 'var(--border-light)' }} aria-label={`Requirements for ${next.name}`}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              Next: Level {next.level} · {next.name}
            </h3>
            <span className="text-[length:var(--fs-11)] font-bold shrink-0" style={{ color: 'var(--text-secondary)' }}>{stepsText(next)}</span>
          </div>
          <p className="text-[length:var(--fs-11)] mb-3" style={{ color: 'var(--text-secondary)' }}>Unlocks: {next.unlocks.join(' · ')}</p>
          <div className="mb-4"><Bar pct={next.progressPct || 0} label={`Overall progress to ${next.name}`} /></div>
          <ul className="space-y-2">
            {next.requirements.map((r) => <Requirement key={r.key} req={r} />)}
          </ul>
          {progression.selfAdvanced && next.level === 2 && (
            <p className="text-[length:var(--fs-11)] mt-3" style={{ color: 'var(--text-muted)' }}>
              You said you’re an advanced trainee, so fewer sessions are needed for this level.
            </p>
          )}
        </section>
      ) : (
        <p className="rounded-2xl border p-4 text-sm font-bold" style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)' }}>
          You’ve unlocked every level. Keep training to set new challenge bests.
        </p>
      )}

      {/* Challenges */}
      {[2, 3].map((lvl) => {
        const list = progression.challenges.filter((c) => c.level === lvl);
        if (!list.length) return null;
        const open = progression.level >= lvl;
        return (
          <section key={lvl} aria-label={`Level ${lvl} challenges`}>
            <h3 className="text-[length:var(--fs-11)] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              {!open && <Icon name="lock" className="text-[length:var(--fs-14)]" />}
              Level {lvl} challenges
            </h3>
            <ul className="space-y-2">
              {list.map((c) => <ChallengeCard key={c.key} c={c} progression={progression} onStart={startChallenge} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
