import { useEffect, useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { apiFetch, apiGet, apiPost } from '../../../../lib/apiClient.js';

// Section 5 — smart reminder switches. Saves each switch immediately.
const ROWS = [
  { key: 'log_reminders', title: 'Forgot to log', desc: 'Around 7 PM if nothing was logged today.', test: 'no_log' },
  { key: 'workout_reminders', title: 'Missed workout', desc: 'Around 8 PM if a planned workout was not done.', test: 'missed_workout' },
  { key: 'motivation', title: 'Motivation', desc: 'Morning encouragement, at most every few days.', test: 'inactive' },
  { key: 'progress', title: 'Weekly progress', desc: 'Sunday 6 PM check-in.', test: 'progress' },
  { key: 'email_weekly', title: 'Weekly progress email', desc: 'One short summary email every Sunday. Needs a verified email.' },
];

function hourLabel(h) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12} ${suffix}`;
}

export default function ReminderSettings() {
  const [prefs, setPrefs] = useState(null);
  const [tz, setTz] = useState('Asia/Manila');
  const [busyKey, setBusyKey] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    apiGet('/api/reminders/prefs')
      .then((d) => { if (alive) { setPrefs(d?.prefs || null); setTz(d?.timeZone || 'Asia/Manila'); } })
      .catch((e) => { if (alive) setError(e?.message || 'Could not load reminder settings.'); });
    return () => { alive = false; };
  }, []);

  const toggle = async (key) => {
    if (!prefs || busyKey) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setBusyKey(key);
    setError(''); setNote('');
    try {
      const d = await apiFetch('/api/reminders/prefs', { method: 'PUT', body: JSON.stringify({ [key]: next[key] }) });
      setPrefs(d?.prefs || next);
    } catch (e) {
      setPrefs(prefs);
      setError(e?.message || 'Could not save that setting.');
    } finally {
      setBusyKey('');
    }
  };

  const sendTest = async (kind) => {
    setBusyKey(`test:${kind}`);
    setError(''); setNote('');
    try {
      await apiPost('/api/reminders/test', { kind });
      setNote('Test reminder sent. Check your notifications.');
    } catch (e) {
      setError(e?.message || 'Could not send a test reminder.');
    } finally {
      setBusyKey('');
    }
  };

  return (
    <section className="pref-section" aria-labelledby="pref-reminders-title">
      <div className="pref-section-head">
        <span className="pref-section-icon" aria-hidden="true">
          <Icon name="notifications_active" />
        </span>
        <div className="pref-section-copy">
          <h2 id="pref-reminders-title">Reminders</h2>
          <p>Friendly nudges, never more than 2 a day and never between 9 PM and 7 AM ({tz.replace('_', ' ')} time).</p>
        </div>
      </div>

      <div className="pref-section-body">
        {!prefs && !error && <p className="pref-field-help">Loading…</p>}
        {prefs && (
          <ul className="pref-reminder-list">
            {ROWS.map((row) => {
              const on = Boolean(prefs[row.key]);
              return (
                <li key={row.key} className="pref-action-row">
                  <div className="pref-action-copy">
                    <span className="pref-action-title" id={`rem-${row.key}`}>{row.title}</span>
                    <span className="pref-action-desc">{row.desc}</span>
                  </div>
                  <div className="pref-reminder-controls">
                    {row.test && on && (
                      <button type="button" className="pref-reminder-test" disabled={Boolean(busyKey)} onClick={() => sendTest(row.test)}>
                        Test
                      </button>
                    )}
                    <button type="button" role="switch" aria-checked={on} aria-labelledby={`rem-${row.key}`}
                      disabled={busyKey === row.key}
                      className={`pref-switch${on ? ' is-on' : ''}`} onClick={() => toggle(row.key)}>
                      <span className="pref-switch-thumb" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {note && <p className="pref-field-help" role="status">{note}</p>}
        {error && <p className="pref-field-help pref-reminder-error" role="alert">{error}</p>}
        <p className="pref-field-help">Times: log check {hourLabel(19)}, missed workout {hourLabel(20)}, motivation {hourLabel(8)}, weekly check-in Sunday {hourLabel(18)}.</p>
      </div>
    </section>
  );
}
