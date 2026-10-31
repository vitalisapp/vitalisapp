import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiPost, apiPatch } from '../../../../../lib/apiClient.js';
import VerificationLayout from '../components/VerificationLayout.jsx';

// CHECK YOUR EMAIL — shown after register or when an unverified user signs in.
// Resend link, change email, back to sign in. Unverified users cannot proceed.
const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [devLink, setDevLink] = useState(location.state?.devLink || null);
  const [deliveryToken, setDeliveryToken] = useState(location.state?.deliveryToken || null);
  const [deliveryStatus, setDeliveryStatus] = useState(location.state?.deliveryStatus || 'idle');
  const [cooldown, setCooldown] = useState(location.state?.deliveryStatus ? 30 : 0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [changing, setChanging] = useState(false);
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isProd = import.meta.env.PROD;

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!deliveryToken) return;
    let cancelled = false;
    let timer;
    const deadline = Date.now() + 120000;
    const poll = async () => {
      try {
        const data = await apiPost('/api/auth/verification-delivery', { token: deliveryToken }, { skipAuthRedirect: true });
        if (cancelled) return;
        if (data.status === 'delivered' || data.status === 'failed') {
          setDeliveryStatus(data.status);
          return;
        }
        if (Date.now() >= deadline) { setDeliveryStatus('unconfirmed'); return; }
        setDeliveryStatus(data.status === 'delayed' ? 'delayed' : 'waiting');
        timer = setTimeout(poll, 5000);
      } catch {
        if (!cancelled) setDeliveryStatus('unconfirmed');
      }
    };
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [deliveryToken]);

  const applyDelivery = (data) => {
    setDeliveryToken(data.deliveryToken || null);
    setDeliveryStatus(data.deliveryStatus || 'requested');
    setCooldown(30);
    setDevLink(data.devVerificationLink || null);
  };
  const waiting = busy || deliveryStatus === 'waiting' || deliveryStatus === 'delayed' || (deliveryStatus === 'accepted' && Boolean(deliveryToken));
  const deliveryMessage = busy ? 'Sending verification email…' : {
    accepted: deliveryToken ? 'Waiting for delivery confirmation…' : 'Email accepted for sending. Delivery is not confirmed. Check your inbox and spam folder.',
    waiting: 'Waiting for delivery confirmation…',
    delayed: 'Your email provider has delayed delivery. We’re still checking…',
    delivered: 'Delivered to your email provider. Check your inbox or spam folder.',
    failed: 'Couldn’t send or deliver your verification email. Check the address and try again.',
    unconfirmed: 'Delivery hasn’t been confirmed yet. Check your inbox and spam folder before requesting another email.',
    requested: 'If this account needs verification, an email was requested. Check your inbox.',
  }[deliveryStatus];

  const resend = async () => {
    if (busy || cooldown > 0) return;
    const trimmed = email.trim();
    if (!trimmed) { setError('Enter your email address first.'); return; }
    if (!EMAIL_RE.test(trimmed)) { setError('Enter a valid email address.'); return; }
    if (trimmed !== email) setEmail(trimmed);
    setDeliveryToken(null); setDeliveryStatus('idle');
    setBusy(true); setError('');
    try {
      const data = await apiPost('/api/auth/send-verification', { email: trimmed });
      applyDelivery(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    if (busy) return;
    const cur = email.trim();
    const next = newEmail.trim();
    if (!EMAIL_RE.test(cur)) { setError('Current email looks invalid.'); return; }
    if (!EMAIL_RE.test(next)) { setError('Enter a valid new email address.'); return; }
    if (next.toLowerCase() === cur.toLowerCase()) { setError('New email must be different.'); return; }
    if (!password) { setError('Enter your current password.'); return; }
    setDeliveryToken(null); setDeliveryStatus('idle');
    setBusy(true); setError('');
    try {
      const data = await apiPatch('/api/auth/change-email', { email: cur, password, newEmail: next });
      setEmail(data.email);
      setChanging(false); setPassword(''); setNewEmail('');
      applyDelivery(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <VerificationLayout>
          <div className="w-16 h-16 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[28px] text-[var(--accent)]">mark_email_unread</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-[32px] tracking-wider leading-none mb-2">CHECK YOUR EMAIL</h1>
          <p className="text-xs text-[#c4c9b0]/60 mb-1">Verification email address:</p>
          <p className="text-sm font-bold text-[var(--accent)] mb-6 break-all">{email || 'your inbox'}</p>
          {!location.state?.email && (
            <input type="email" aria-label="Account email" placeholder="Enter your account email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-[16px]" />
          )}

          {error && <p className="bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 mb-4">{error}</p>}
          {deliveryMessage && (
            <div role="status" aria-live="polite" className={`border rounded-xl p-4 mb-4 text-xs leading-relaxed ${deliveryStatus === 'failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-[#c4c9b0]'}`}>
              {waiting && <span aria-hidden="true" className="block mx-auto mb-3 h-5 w-5 rounded-full border-2 border-white/15 border-t-[var(--accent)] animate-spin motion-reduce:animate-none" />}
              {!busy && deliveryStatus === 'delivered' && <span aria-hidden="true" className="material-symbols-outlined block mb-2 text-[var(--accent)]">check_circle</span>}
              {deliveryMessage}
            </div>
          )}

          {!isProd && devLink && (
            <a href={devLink} className="block bg-white/5 border border-dashed border-white/20 rounded-lg text-[11px] text-white/60 p-3 mb-4 break-all hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors">
              Dev mode: open verification link →
            </a>
          )}

          <button onClick={() => navigate('/login')}
            className="w-full bg-white/5 border border-white/10 rounded-xl text-[11px] font-semibold tracking-widest uppercase p-3.5 mb-3 hover:bg-white/10 transition-colors">
            Back to Sign In
          </button>

          {!changing ? (
            <div className="mt-2 text-[12px] text-[#c4c9b0]/50 space-y-2">
              <p>Didn't receive it?{' '}
                <button onClick={resend} disabled={busy || cooldown > 0} className="text-[var(--accent-dark)] font-semibold hover:text-[var(--accent)] disabled:opacity-50 bg-transparent border-none cursor-pointer p-0">
                  {busy ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
                </button>
              </p>
              <p>Wrong email?{' '}
                <button onClick={() => setChanging(true)} className="text-[var(--accent-dark)] font-semibold hover:text-[var(--accent)] bg-transparent border-none cursor-pointer p-0">
                  Change Email Address
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={changeEmail} className="mt-2 space-y-3 text-left">
              <input type="password" required placeholder="Current password" value={password} onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl text-[16px] p-3 outline-none focus:border-[var(--accent)]/50 placeholder:text-white/10" />
              <input type="email" required placeholder="New email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl text-[16px] p-3 outline-none focus:border-[var(--accent)]/50 placeholder:text-white/10" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setChanging(false)} className="flex-1 bg-white/5 border border-white/10 rounded-xl text-[11px] font-semibold uppercase p-3">Cancel</button>
                <button type="submit" disabled={busy} className="flex-1 bg-[var(--accent)] text-[var(--text-inverse)] font-bold text-[11px] uppercase p-3 rounded-xl disabled:opacity-50">
                  {busy ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          )}
    </VerificationLayout>
  );
};

export default CheckEmail;
