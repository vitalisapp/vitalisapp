import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../../../../lib/apiClient.js';
import { useAuth } from '../../../../../hooks/useAuth.jsx';
import VerificationLayout from '../components/VerificationLayout.jsx';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const current = result?.token === token && result?.attempt === attempt;
  const state = !token ? 'no-token' : current ? result.state : 'verifying';
  const errorCode = current ? result.code : '';
  const invalidLink = errorCode === 'EXPIRED_TOKEN' || errorCode === 'INVALID_TOKEN';

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const data = await apiGet(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          timeoutMs: 15000,
          skipAuthRedirect: true,
        });
        if (!active) return;
        if (!data?.success) throw new Error('Could not confirm verification. Please try again.');
        // A blocking refresh unmounts this page via AppRoutes' loading gate,
        // causing another verification on every remount. Keep it mounted.
        // Read the actual session: this link may belong to a different account.
        await refreshAuth({ silent: true }).catch(() => {});
        if (active) setResult({ token, attempt, state: 'done' });
      } catch (err) {
        if (!active) return;
        setResult({
          token, attempt, state: 'failed', code: err.code || '',
          error: err.code === 'TIMEOUT'
            ? 'The server is taking too long to respond. Please try again.'
            : err.message || 'Could not reach the server. Please try again.',
        });
      }
    })();
    // Ignore stale completions after navigation/token changes. apiGet shares
    // in-flight requests, including StrictMode's second effect invocation.
    return () => { active = false; };
    // Auth context changes after the silent refresh; only a new link or an
    // explicit retry should submit another verification request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, attempt]);

  const title = {
    verifying: 'VERIFYING YOUR EMAIL',
    done: 'EMAIL VERIFIED',
    failed: errorCode === 'EXPIRED_TOKEN' ? 'LINK EXPIRED' : errorCode === 'INVALID_TOKEN' ? 'INVALID LINK' : 'COULD NOT VERIFY',
    'no-token': 'VERIFY EMAIL',
  }[state];
  const message = {
    verifying: 'Please wait while we confirm your email address.',
    done: 'Your Vitalis account is now active.',
    failed: current ? result.error : '',
    'no-token': 'Open the verification link from your inbox, or request a new one.',
  }[state];
  const continuePath = !user ? '/login' : user.role === 'admin' ? '/admin' : user.onboardingCompleted === false ? '/onboarding' : '/dashboard';
  const buttonClass = 'w-full rounded-xl bg-[var(--accent)] p-4 text-sm font-bold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-light)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]';

  return (
    <VerificationLayout>
      <div className="flex min-h-[360px] flex-col items-center" aria-busy={state === 'verifying'}>
        <div aria-hidden="true" className={`mx-auto mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${state === 'failed' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
          {state === 'verifying' ? (
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[var(--accent)] motion-reduce:animate-none" />
          ) : (
            <span className="material-symbols-outlined text-[36px]">{state === 'done' ? 'check' : state === 'failed' ? 'error' : 'mail'}</span>
          )}
        </div>
        <div className="w-full" role="status" aria-live="polite" aria-atomic="true">
          <h1 className="mb-3 font-['Bebas_Neue'] text-[30px] leading-tight tracking-wide">{title}</h1>
          <p className="min-h-[72px] break-words text-sm leading-relaxed text-[#c4c9b0]">{message}</p>
        </div>
        <div className="mt-auto w-full pt-6">
          {state === 'verifying' && <p className="text-xs text-white/50">This usually takes a few seconds.</p>}
          {state === 'done' && <button type="button" onClick={() => navigate(continuePath, { replace: true })} className={buttonClass}>Continue</button>}
          {state === 'failed' && !invalidLink && (
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className={buttonClass}>Try Again</button>
          )}
          {(state === 'failed' || state === 'no-token') && (
            <button type="button" onClick={() => navigate('/check-email')} className={state === 'failed' && !invalidLink ? 'mt-4 p-2 text-sm text-[var(--accent)] underline underline-offset-4' : buttonClass}>
              {state === 'no-token' ? 'Go to Check Email' : 'Request New Link'}
            </button>
          )}
        </div>
      </div>
    </VerificationLayout>
  );
};

export default VerifyEmail;
