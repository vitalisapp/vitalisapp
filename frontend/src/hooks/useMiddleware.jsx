import { Navigate } from "react-router-dom";
import { useAuth, isCacheFresh } from "./useAuth.jsx";
import { safeGet } from "../lib/storage.js";
import { FullPageLoader } from "../components/feedback/LoadingState.jsx";

// Same loader as the route fallback so stages never swap loader sizes.
const GuardFallback = FullPageLoader;

// Users with incomplete onboarding go to /onboarding first.
// Email confirmation is soft: unverified users get full access and the
// VerifyEmailBanner (AppShell) reminds them to confirm.
export const ProtectedRoute = ({ children = undefined, requireOnboarding = true }) => {
  const { user, loading, sessionValid } = useAuth();

  if (loading) return <GuardFallback />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (sessionValid === false && !isCacheFresh()) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && user.onboardingCompleted === false) {
    const skipped = safeGet('vitalis:onboarding') === 'skipped';
    let sessionSkipped = false;
    try { sessionSkipped = sessionStorage.getItem('vitalis:onboarding:session-skip') === '1'; } catch { /* ignore */ }
    if (!skipped && !sessionSkipped) return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Blocks logged-in users from Login/Register pages.
export const PublicRoute = ({ children = undefined }) => {
  const { user, loading, sessionValid } = useAuth();

  if (loading) return <GuardFallback />;
  // Redirect only on proven session or fresh cache (avoids dashboard↔login bounce).
  if (user && (sessionValid !== false || isCacheFresh())) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

// Member-only wrapper: an admin typing any member page URL straight into the
// address bar is redirected to their own console. Members pass through to
// ProtectedRoute (onboarding check still applies).
export const MemberRoute = ({ children = undefined, requireOnboarding = true }) => {
  const { user, loading } = useAuth();

  if (loading) return <GuardFallback />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <ProtectedRoute requireOnboarding={requireOnboarding}>
      {children}
    </ProtectedRoute>
  );
};
