import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiFetch, ApiError, cancelInflightRequests } from '../lib/apiClient.js';
import { safeGet, safeGetJSON, safeSet, safeSetJSON, safeRemove } from '../lib/storage.js';
import { disconnectSocket } from '../lib/socket.js';
import { queryClient } from '../lib/queryClient.js';

// Wipes cached user + query caches so the next account on a shared device
// never sees the previous user's data.
function purgeClientSession() {
  safeRemove('vitalis_user');
  safeRemove('vitalis_user_ts');
  safeRemove('vitalis:onboarding');
  cancelInflightRequests();
  queryClient.clear();
  disconnectSocket();
}

// Stale cache must never grant access forever.
export const OFFLINE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// eslint-disable-next-line react-refresh/only-export-components
export function isCacheFresh() {
  const ts = Number(safeGet('vitalis_user_ts', '0'));
  if (!ts) return false;
  return Date.now() - ts < OFFLINE_CACHE_TTL_MS;
}

const AuthContext = createContext({
  user: null,
  loading: true,
  sessionValid: null,
  refreshAuth: async () => false,
  logout: async () => {},
  setUser: /** @type {import('react').Dispatch<any>} */ (() => {}),
});

export const AuthProvider = ({ children = undefined }) => {
  const [user, setUser] = useState(() => {
    return safeGetJSON('vitalis_user', null);
  });
  // Instant reload: a cached user from the last 24h renders the app right away
  // while /me verifies in the background (the API still enforces auth on every
  // call; a 401 purges the session and the route guards redirect to /login).
  // Only a stale cache blocks on /me. Captured at init because the sync effect
  // below rewrites vitalis_user_ts before the probe effect runs.
  const bootFromCacheRef = useRef(null);
  if (bootFromCacheRef.current === null) {
    bootFromCacheRef.current = Boolean(safeGetJSON('vitalis_user', null)) && isCacheFresh();
  }
  const [loading, setLoading] = useState(() => !bootFromCacheRef.current);
  // null = probing, true = proven via /me, false = no session.
  const [sessionValid, setSessionValid] = useState(null);
  // StrictMode double-mounts effects: probe /me only once per load.
  const probedRef = useRef(false);

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      safeSetJSON('vitalis_user', user);
      safeSet('vitalis_user_ts', String(Date.now()));
    } else {
      safeRemove('vitalis_user');
      safeRemove('vitalis_user_ts');
    }
  }, [user]);

  // True when the /me cookie probe succeeds (catches blocked third-party cookies).
  // Silent refreshes keep the current screen mounted (used after profile saves
  // and right after login/register, so the auth page stays mounted to show
  // errors instead of flashing the full-screen loader).
  // fallbackUser: the login/register response, used only to fill fields /me
  // leaves empty (avatar) — the user is set from the PROVEN /me session.
  const refreshAuth = async ({ silent = false, fallbackUser = null } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch('/api/auth/me', { timeoutMs: 5000, skipAuthRedirect: true });

      if (!data?.user) {
        setUser(null);
        setSessionValid(false);
        return false;
      }

      // Merge so that avatar_url saved via profile update is never lost.
      setUser(prev => {
        const base = prev ?? fallbackUser;
        return {
          ...base,
          ...data.user,
          avatar: data.user.avatar_url || data.user.avatar || base?.avatar || null,
        };
      });
      setSessionValid(true);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        if (import.meta.env.DEV) console.warn('Auth refresh rate-limited (429) — backing off');
        if (!isCacheFresh()) setUser(null);
        setSessionValid(false);
        return false;
      }
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setUser(null);
        purgeClientSession();
        setSessionValid(false);
        return false;
      }
      // Offline: keep fresh cache for the offline shell only.
      if (!isCacheFresh()) setUser(null);
      setSessionValid(false);
      if (error?.code !== 'ABORTED' && import.meta.env.DEV) {
        console.warn('Auth refresh: backend unreachable, running offline', error.message);
      }
      // keep previous user only if fresh; just stop loading
      return false;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', timeoutMs: 5000, skipAuthRedirect: true });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setSessionValid(false);
      purgeClientSession();
      // Notify providers holding module-level session flags (e.g. ThemeContext).
      try { window.dispatchEvent(new CustomEvent('vitalis:logout')); } catch { /* noop */ }
    }
  };

  useEffect(() => {
    // No cached user: skip the /me probe (avoids a red 401 on login screens).
    if (!safeGetJSON('vitalis_user', null)) {
      setLoading(false);
      setSessionValid(false);
    } else if (!probedRef.current) {
      probedRef.current = true;
      refreshAuth({ silent: bootFromCacheRef.current });
    }
    // Central 401 → logout so every apiClient call converges on one path
    const onUnauthorized = () => {
      setUser(null);
      setSessionValid(false);
      purgeClientSession();
    };
    window.addEventListener('vitalis:unauthorized', onUnauthorized);
    return () => window.removeEventListener('vitalis:unauthorized', onUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sessionValid, refreshAuth, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);