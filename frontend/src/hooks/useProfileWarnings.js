import { useEffect, useState } from 'react';
import { apiGet } from '../lib/apiClient.js';
import { collectProfileIssues } from '../lib/profileIssues.js';

export { collectProfileIssues };

// 30s in-memory cache — the header remounts on every dashboard/* navigation,
// so a short cache stops this from refiring a GET on every nav.
const _cache = new Map(); // userId -> { at, data }
const getCached = (uid) => {
  const e = _cache.get(uid);
  if (e && Date.now() - e.at < 30000) return e.data;
  return null;
};
const setCached = (uid, data) => {
  _cache.set(uid, { at: Date.now(), data });
  if (_cache.size > 50) _cache.delete(_cache.keys().next().value);
};

/**
 * Profile attention warnings for the header avatar, the account menu and the
 * Profile page. The rules live in lib/profileIssues.js so both the hook and
 * the page can use the exact same list.
 *
 * @param {number|string|null} authedUserId only pass a proven session user id
 * @param {object|null} user auth-context user
 * @returns {{ hasWarning: boolean, issues: Array<{section: string, message: string}>, reasons: string[] }}
 */
export function useProfileWarnings(authedUserId, user) {
  const [profile, setProfile] = useState(() => (authedUserId ? getCached(authedUserId) : null));

  useEffect(() => {
    if (!authedUserId) return undefined;
    let alive = true;
    // Async IIFE: keeps setState out of the synchronous effect body (lint) and
    // lets a cache hit resolve without an extra render pass.
    (async () => {
      const hit = getCached(authedUserId);
      if (hit) {
        if (alive) setProfile(hit);
        return;
      }
      try {
        const data = await apiGet(`/api/profile/${authedUserId}`);
        if (data) setCached(authedUserId, data);
        if (alive && data) setProfile(data);
      } catch { /* best-effort: fall back to whatever the auth user says */ }
    })();
    return () => { alive = false; };
  }, [authedUserId]);

  const issues = collectProfileIssues(user, profile);

  return {
    hasWarning: issues.length > 0,
    issues,
    // Kept for callers that only want readable phrases.
    reasons: issues.map((issue) => issue.message.toLowerCase()),
  };
}
