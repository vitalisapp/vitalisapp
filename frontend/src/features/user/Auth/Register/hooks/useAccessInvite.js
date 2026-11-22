import { useEffect, useState } from 'react';
import { apiGet } from '../../../../../lib/apiClient.js';

// Admin access QR (?g=CODE). The code is kept in sessionStorage so it
// survives a detour (e.g. Login ↔ Register, Google popup) within the tab.
const KEY = 'vitalis:access-code';
const SCANNED_KEY = 'vitalis:access-scanned';
const CODE_RE = /^[A-Z2-9]{6,16}$/;

function readCode() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('g');
    const norm = String(fromUrl || '').trim().toUpperCase();
    if (CODE_RE.test(norm)) {
      sessionStorage.setItem(KEY, norm);
      return norm;
    }
    const saved = sessionStorage.getItem(KEY) || '';
    return CODE_RE.test(saved) ? saved : '';
  } catch {
    return '';
  }
}

/** Current access-QR code (if any) — sent with register / Google sign-up. */
export function getAccessCode() {
  try {
    const saved = sessionStorage.getItem(KEY) || '';
    return CODE_RE.test(saved) ? saved : '';
  } catch {
    return '';
  }
}

/**
 * Resolve the access code for the register-page banner.
 * Counts one scan per browser session per code.
 * @returns {{ code: string, invite: null | { valid: boolean, label?: string, reason?: string } }}
 */
export function useAccessInvite() {
  const [code] = useState(readCode);
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    if (!code) return undefined;
    let alive = true;
    let countScan = false;
    try {
      countScan = sessionStorage.getItem(SCANNED_KEY) !== code;
      if (countScan) sessionStorage.setItem(SCANNED_KEY, code);
    } catch { /* ignore */ }
    apiGet(`/api/public/access/${encodeURIComponent(code)}${countScan ? '?scan=1' : ''}`, { skipAuthRedirect: true })
      .then((data) => {
        if (!alive) return;
        setInvite(data || null);
        // Expired/disabled/unknown codes are dropped so they are not sent.
        if (!data?.valid) {
          try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* banner is optional — never block sign-up */ });
    return () => { alive = false; };
  }, [code]);

  return { code, invite };
}
