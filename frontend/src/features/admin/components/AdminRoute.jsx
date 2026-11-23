import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '../../../components/feedback/LoadingState.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import '../admin.css';

/**
 * Frontend gate for the admin console. The real enforcement is `requireAdmin`
 * on every /api/admin route — this only keeps the UI honest. A member typing
 * /admin (or any sub-path) is silently redirected to their own dashboard;
 * there is no restricted-area screen to keep probing.
 */
export default function AdminRoute({ children = undefined }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader message="Checking clearance…" />;
  if (!user) return <Navigate to="/login" replace />;
  // Role middleware — members get their own dashboard, never the console.
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
