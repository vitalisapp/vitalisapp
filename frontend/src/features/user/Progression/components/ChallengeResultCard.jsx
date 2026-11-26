import Icon from '../../../../components/Icon.jsx';
import { challengeResultText } from '../../../../lib/progression.js';

// Revision #4 — post-workout result of a challenge, verified by the server
// against the saved workout log.
export default function ChallengeResultCard({ challenge, result }) {
  if (!challenge || !result) return null;
  if (result.loading) {
    return (
      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }} aria-busy="true">
        Checking your challenge…
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="rounded-2xl border p-4 flex items-start gap-2" role="alert" style={{ borderColor: 'var(--border-light)' }}>
        <Icon name="info" className="text-[length:var(--fs-18)] shrink-0" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.error}</p>
      </div>
    );
  }
  const done = Boolean(result.completed);
  return (
    <div className="rounded-2xl border p-4 flex items-start gap-3" role="status"
      style={{ borderColor: done ? 'var(--accent-border)' : 'var(--border-light)', background: done ? 'var(--accent-bg)' : 'var(--bg-card)' }}>
      <Icon name={done ? 'emoji_events' : 'flag'} fill={done ? 1 : 0} className="text-[length:var(--fs-22)] shrink-0"
        style={{ color: done ? 'var(--accent)' : 'var(--text-muted)' }} />
      <div className="min-w-0">
        <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{challenge.name}</p>
        <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{challengeResultText(result, challenge)}</p>
      </div>
    </div>
  );
}
