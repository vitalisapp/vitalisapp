import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../../lib/apiClient.js';

/**
 * /go/:code — landing point for admin "Link QR" codes (e.g. a Google Meet
 * session). Resolves the code (counting one scan) and forwards to the link.
 * Sign-up QR codes that end up here are forwarded to /register?g=CODE.
 */
export default function AccessRedirect() {
  const { code = '' } = useParams();
  const [state, setState] = useState({ status: 'loading', label: '' });

  useEffect(() => {
    let alive = true;
    apiGet(`/api/public/access/${encodeURIComponent(code)}?scan=1`, { skipAuthRedirect: true })
      .then((data) => {
        if (!alive) return;
        if (!data?.valid) {
          setState({ status: data?.reason || 'invalid', label: data?.label || '' });
          return;
        }
        if (data.kind === 'link' && /^https?:\/\//i.test(data.linkUrl || '')) {
          window.location.replace(data.linkUrl);
          return;
        }
        window.location.replace(`/register?g=${encodeURIComponent(data.code)}`);
      })
      .catch(() => alive && setState({ status: 'error', label: '' }));
    return () => { alive = false; };
  }, [code]);

  const messages = {
    loading: ['Opening link…', 'One moment while we take you there.'],
    expired: ['This QR has expired', 'Ask the organiser for an updated QR code.'],
    disabled: ['This QR is turned off', 'Ask the organiser for an updated QR code.'],
    invalid: ['QR code not found', 'Check that you scanned the right code.'],
    error: ['Could not open the link', 'Check your internet connection and try again.'],
  };
  const [title, note] = messages[state.status] || messages.invalid;

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-full max-w-[360px] text-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] px-6 py-8" role="status" aria-live="polite">
        <span className="material-symbols-outlined text-[28px] text-[var(--accent)]" aria-hidden="true">
          {state.status === 'loading' ? 'qr_code_scanner' : 'link_off'}
        </span>
        <h1 className="mt-2 text-[16px] font-semibold">{title}{state.label && state.status !== 'loading' ? ` (${state.label})` : ''}</h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">{note}</p>
        {state.status !== 'loading' && (
          <Link to="/" className="inline-block mt-5 text-[13px] font-medium text-[var(--accent)]">Go to Vitalis</Link>
        )}
      </div>
    </main>
  );
}
