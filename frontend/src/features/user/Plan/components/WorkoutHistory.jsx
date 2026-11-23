import { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { apiGet } from '../../../../lib/apiClient.js';

// ── WORKOUT HISTORY: completed camera sessions (spec T) ──
// Display helpers only — the data is the unchanged GET /api/workout-logs list.
const prettyExercise = (type) => {
  const s = String(type || 'Workout').replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s === 0) return null;
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h${m % 60 ? ` ${m % 60}m` : ''}`;
};

const historyDayKey = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toDateString() : 'unknown';
};

const historyDayLabel = (key) => {
  if (key === 'unknown') return 'Undated';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === today.toDateString()) return 'Today';
  if (key === yesterday.toDateString()) return 'Yesterday';
  const d = new Date(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
};

const STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  paused: 'Paused',
  abandoned: 'Ended early',
  cancelled: 'Cancelled',
};

const WorkoutHistory = ({ onBrowse = undefined }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiGet('/api/workout-logs');
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => ({
    sessions: logs.length,
    reps: logs.reduce((sum, l) => sum + (Number(l.rep_count) || 0), 0),
    seconds: logs.reduce((sum, l) => sum + (Number(l.duration_seconds) || 0), 0),
  }), [logs]);

  // Group by calendar day, newest first (API order is preserved).
  const days = useMemo(() => {
    const groups = [];
    const index = new Map();
    for (const log of logs) {
      const key = historyDayKey(log.start_time);
      if (!index.has(key)) {
        const g = { key, label: historyDayLabel(key), logs: [] };
        index.set(key, g);
        groups.push(g);
      }
      index.get(key).logs.push(log);
    }
    return groups;
  }, [logs]);

  if (loading) {
    return (
      <div className="wh" aria-busy="true" aria-label="Loading workout history">
        <div className="wh-stats">
          {[0, 1, 2].map((i) => (
            <div key={i} className="wh-stat">
              <span className="wh-skel" style={{ width: 64, height: 10 }} />
              <span className="wh-skel" style={{ width: 48, height: 20, marginTop: 10 }} />
            </div>
          ))}
        </div>
        <div className="wh-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="wh-row">
              <span className="wh-skel" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <span style={{ flex: 1, display: 'grid', gap: 8 }}>
                <span className="wh-skel" style={{ width: '40%', height: 12 }} />
                <span className="wh-skel" style={{ width: '26%', height: 10 }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wh-empty">
        <span className="wh-empty-icon"><Icon name="cloud_off" /></span>
        <p className="wh-empty-title">Couldn’t load your history</p>
        <p className="wh-empty-sub">Check your connection and try again.</p>
        <button type="button" className="wh-btn" onClick={load}>Try again</button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="wh-empty">
        <span className="wh-empty-icon"><Icon name="history" /></span>
        <p className="wh-empty-title">No workouts yet</p>
        <p className="wh-empty-sub">Start a camera workout or pick an exercise from the Library.</p>
        {onBrowse && <button type="button" className="wh-btn" onClick={onBrowse}>Browse library</button>}
      </div>
    );
  }

  return (
    <div className="wh">
      <div className="wh-head">
        <h2 className="wh-title">Workout history</h2>
        <span className="wh-sub">
          {logs.length >= 50 ? 'Latest 50 sessions' : `${logs.length} ${logs.length === 1 ? 'session' : 'sessions'}`}
        </span>
      </div>

      <dl className="wh-stats">
        <div className="wh-stat"><dt>Sessions</dt><dd>{summary.sessions}</dd></div>
        <div className="wh-stat"><dt>Total reps</dt><dd>{summary.reps.toLocaleString()}</dd></div>
        <div className="wh-stat"><dt>Active time</dt><dd>{formatDuration(summary.seconds) || '0 min'}</dd></div>
      </dl>

      {days.map((day) => (
        <section key={day.key} className="wh-day" aria-label={day.label}>
          <h3 className="wh-day-label">{day.label}</h3>
          <ul className="wh-list">
            {day.logs.map((log) => {
              const reps = Number(log.rep_count) || 0;
              const duration = formatDuration(log.duration_seconds);
              const status = String(log.status || '').toLowerCase();
              const started = log.start_time ? new Date(log.start_time) : null;
              const time = started && !Number.isNaN(started.getTime())
                ? started.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : null;
              const meta = [time, duration, log.difficulty_rating ? `Felt ${log.difficulty_rating}/5` : null].filter(Boolean);
              return (
                <li key={log.id} className="wh-row">
                  <span className="wh-icon" aria-hidden="true"><Icon name="exercise" /></span>
                  <div className="wh-main">
                    <p className="wh-name">{prettyExercise(log.workout_type)}</p>
                    <p className="wh-meta">
                      {meta.length ? meta.join(' · ') : '—'}
                      {status && status !== 'completed' && (
                        <span className="wh-status">{STATUS_LABEL[status] || status.replace(/_/g, ' ')}</span>
                      )}
                    </p>
                  </div>
                  <span className={`wh-reps${reps === 0 ? ' is-zero' : ''}`}>
                    <span className="wh-reps-value">{reps}</span>
                    <span className="wh-reps-unit">{reps === 1 ? 'rep' : 'reps'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default WorkoutHistory;
