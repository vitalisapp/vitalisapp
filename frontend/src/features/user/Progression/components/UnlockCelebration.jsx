import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icon.jsx';
import { useProgression } from '../hooks/useProgression.js';
import { LEVEL_ICON } from '../../../../lib/progression.js';

// Revision #4 — shown once per newly earned level. Dismissing (or "See what's
// new") records it as seen on the server so it never repeats.
export default function UnlockCelebration({ suppressed = false }) {
  const navigate = useNavigate();
  const { progression, markSeen } = useProgression();
  const show = Boolean(progression?.celebrate && progression.newlyUnlocked?.length) && !suppressed;
  const top = show ? progression.newlyUnlocked[progression.newlyUnlocked.length - 1] : null;

  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') markSeen(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, markSeen]);

  if (!show || !top) return null;
  const unlocks = progression.newlyUnlocked.flatMap((l) => l.unlocks);

  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      role="dialog" aria-modal="true" aria-labelledby="unlock-title">
      <div className="w-full max-w-sm rounded-3xl p-6 text-center border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent-border)' }}>
        <span className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
          <Icon name={LEVEL_ICON[top.level] || 'military_tech'} fill={1} className="text-[length:var(--fs-32)]" />
        </span>
        <h2 id="unlock-title" className="text-xl font-black leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          Congratulations! You have unlocked the next level.
        </h2>
        <p className="text-sm font-bold mb-4" style={{ color: 'var(--accent)' }}>Level {top.level} · {top.name}</p>
        <ul className="text-left space-y-1.5 mb-6">
          {unlocks.map((u) => (
            <li key={u} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Icon name="lock_open" className="text-[length:var(--fs-16)] shrink-0" style={{ color: 'var(--accent)' }} /> {u}
            </li>
          ))}
        </ul>
        <button
          type="button"
          autoFocus
          onClick={() => { markSeen(); navigate('/plans?tab=levels'); }}
          className="w-full py-3.5 min-h-[52px] rounded-xl font-black text-sm uppercase tracking-wide mb-2"
          style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
        >
          See what’s new
        </button>
        <button type="button" onClick={markSeen} className="w-full min-h-[44px] text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          Later
        </button>
      </div>
    </div>,
    document.body,
  );
}
