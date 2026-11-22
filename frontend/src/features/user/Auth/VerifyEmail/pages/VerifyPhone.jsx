import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiPost } from '../../../../../lib/apiClient.js';
import { useAuth } from '../../../../../hooks/useAuth.jsx';
import { postVerifyRoute } from '../utils/postVerifyRoute.js';
import { SMS_SENDER_ID } from '../../../../../app/config/env.js';
import { isValidPhMobile, livePhoneError, PHONE_INVALID_MSG, PHONE_RETRY_CODES } from '../../../../../lib/phone.js';
import VerificationLayout from '../components/VerificationLayout.jsx';
import NetworkNotice from '../components/NetworkNotice.jsx';
import OtpInput from '../../../Profile/components/OtpInput.jsx';
import '../../../Profile/password-ui.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// PHONE VERIFICATION — SMS branch of registration.
// The backend never returns the code, so this screen only ever shows masked
// state. A successful code activates the account; the user then signs in.
const VerifyPhone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, refreshAuth } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [phoneMasked, setPhoneMasked] = useState(location.state?.phoneMasked || '');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(Number(location.state?.retryAfter) || 0);
  const firstSendFailed = location.state?.deliveryStatus === 'failed';
  const [error, setError] = useState(
    firstSendFailed
      ? location.state?.deliveryError?.message
        || "We couldn't send the first code. Check the number and request a new one."
      : '',
  );
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [changingNumber, setChangingNumber] = useState(firstSendFailed);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [mockMode, setMockMode] = useState(Boolean(location.state?.smsMocked) && !import.meta.env.PROD);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = async (event) => {
    event?.preventDefault?.();
    if (busy) return;
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Enter the email address you signed up with.');
      return;
    }
    if (changingNumber && !isValidPhMobile(phoneInput)) {
      setPhoneError(PHONE_INVALID_MSG);
      return;
    }

    setBusy(true);
    setError('');
    setPhoneError('');
    setSuccess('');
    try {
      const data = await apiPost('/api/auth/sms-otp', {
        email: trimmedEmail,
        ...(changingNumber && phoneInput ? { phone: phoneInput.trim() } : {}),
      });
      setPhoneMasked(data.phoneMasked || phoneMasked);
      setCooldown(Number(data.retryAfter) || 60);
      setChangingNumber(false);
      setPhoneInput('');
      setCode('');
      if (data.mocked && !import.meta.env.PROD) setMockMode(true);
      setSuccess(`A new 6-digit code was sent to ${data.phoneMasked || 'your phone'}.`);
    } catch (err) {
      setError(err.message || 'We could not send a code right now. Try again.');
      if (err?.details?.retryAfter) setCooldown(Number(err.details.retryAfter) || 0);
      // Bad format, number in use, or a network our sender can't reach:
      // open the number form so the user can switch to a Globe/TM/DITO SIM.
      if (PHONE_RETRY_CODES.has(err?.code)) setChangingNumber(true);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event?.preventDefault?.();
    if (busy) return;
    if (code.length !== 6) {
      setError('Enter the 6-digit code from the SMS.');
      return;
    }
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiPost('/api/auth/sms-verify', { email: email.trim(), code }, { skipAuthRedirect: true });
      setCode('');
      // The backend signs the user in on a correct code — go straight in.
      if (data.signedIn && data.user) {
        setUser(data.user);
        if (await refreshAuth({ silent: true })) {
          navigate(postVerifyRoute(data.user), { replace: true });
          return;
        }
        // Cookie blocked: the account is verified, fall back to signing in.
        setSuccess('Phone verified. Your browser blocked the session cookie — sign in to continue.');
        return;
      }
      setSuccess(data.message || 'Phone verified. Sign in to continue.');
    } catch (err) {
      setError(err.message || 'That code could not be verified.');
      if (err?.code === 'OTP_EXPIRED' || err?.code === 'OTP_LOCKED') setCode('');
    } finally {
      setBusy(false);
    }
  };

  const verified = Boolean(success) && !error;

  return (
    <VerificationLayout>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10">
        <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-[var(--accent)]">
          smartphone
        </span>
      </div>
      <h1 className="mb-2 font-['Bebas_Neue'] text-[32px] leading-none tracking-wider">VERIFY YOUR PHONE</h1>
      <p className="mb-1 text-xs text-[#c4c9b0]/60">
        {phoneMasked ? 'We sent a 6-digit code to:' : 'Confirm your number to receive a 6-digit code.'}
      </p>
      {phoneMasked && (
        <p className="mb-6 break-all text-sm font-bold text-[var(--accent)]">{phoneMasked}</p>
      )}
      {!phoneMasked && <div className="mb-4" />}

      {!location.state?.email && (
        <div className="mb-4 text-left">
          <label htmlFor="sms-email" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
            Account email
          </label>
          <input
            id="sms-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => { setEmail(event.target.value); if (error) setError(''); }}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-[16px] text-[#e5e2e1] outline-none transition-colors placeholder:text-white/20 focus:border-[var(--accent)]/50"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-left text-xs leading-relaxed text-red-400">
          {error}
        </p>
      )}

      {success && (
        <div role="status" aria-live="polite" className="mb-4 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 p-3 text-left text-xs leading-relaxed text-[#e5e2e1]">
          <span aria-hidden="true" className="material-symbols-outlined mr-1 align-middle text-[16px] text-[var(--accent)]">
            check_circle
          </span>
          {success}
        </div>
      )}

      {verified ? (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full rounded-xl bg-[var(--accent)] p-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-dark)]"
        >
          Continue to Sign In
        </button>
      ) : (
        <form onSubmit={verify} noValidate>
          <p id="sms-otp-label" className="mb-2 text-xs text-[#c4c9b0]/60">
            Enter the 6-digit code
          </p>
          <div className="mb-4 flex justify-center">
            <OtpInput value={code} onChange={(next) => { setCode(next); if (error) setError(''); }} labelledBy="sms-otp-label" />
          </div>

          {mockMode && (
            <p className="mb-3 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-2 text-center text-[11px] text-[#c4c9b0]/60">
              Mock mode (no SMS sent): use code <strong className="text-[var(--accent)]">000000</strong>
            </p>
          )}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="mb-3 w-full rounded-xl bg-[var(--accent)] p-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify Code'}
          </button>
        </form>
      )}

      {!verified && (
        <div className="mt-1 space-y-2 text-[12px] text-[#c4c9b0]/50">
          <p>
            {phoneMasked ? <>Didn&apos;t receive it?</> : 'Need a code?'}{' '}
            <button
              type="button"
              onClick={sendCode}
              disabled={busy || cooldown > 0}
              className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[var(--accent-dark)] hover:text-[var(--accent)] disabled:opacity-50"
            >
              {busy ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : phoneMasked ? 'Resend Code' : 'Send Code'}
            </button>
          </p>
          <p>
            Wrong number?{' '}
            <button
              type="button"
              onClick={() => { setChangingNumber((open) => !open); setError(''); setPhoneError(''); }}
              className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[var(--accent-dark)] hover:text-[var(--accent)]"
            >
              {changingNumber ? 'Cancel' : 'Change Number'}
            </button>
          </p>
        </div>
      )}

      {changingNumber && !verified && (
        <form onSubmit={sendCode} noValidate className="mt-4 text-left">
          <label htmlFor="sms-phone" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
            Mobile number
          </label>
          <input
            id="sms-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="09XXXXXXXXX"
            value={phoneInput}
            aria-invalid={phoneError ? true : undefined}
            onChange={(event) => { setPhoneInput(event.target.value); setPhoneError(livePhoneError(event.target.value)); }}
            className={`w-full rounded-xl border bg-white/5 p-3 text-[16px] text-[#e5e2e1] outline-none transition-colors placeholder:text-white/20 ${phoneError ? 'border-red-500/60' : 'border-white/10 focus:border-[var(--accent)]/50'}`}
          />
          {phoneError && <p className="mt-1.5 px-1 text-[11px] text-red-400">{phoneError}</p>}
          <NetworkNotice senderId={SMS_SENDER_ID} className="mt-2.5" />
          <button
            type="submit"
            disabled={busy}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] font-semibold uppercase tracking-widest transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send Code to This Number'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => navigate('/login')}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-[11px] font-semibold uppercase tracking-widest transition-colors hover:bg-white/10"
      >
        Back to Sign In
      </button>
    </VerificationLayout>
  );
};

export default VerifyPhone;
