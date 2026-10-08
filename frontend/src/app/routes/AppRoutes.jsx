import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ProtectedRoute, PublicRoute } from '../../hooks/useMiddleware.jsx';
import { ErrorBoundary } from '../../components/ErrorBoundary.jsx';
import BrandLoader from '../../components/ui/BrandLoader.jsx';

const Dashboard = lazy(() => import('../../features/Dashboard/pages/Dashboard.jsx'));
const Plans = lazy(() => import('../../features/Plan/pages/Plans.jsx'));
const Analytics = lazy(() => import('../../features/Analytics/pages/Analytics.jsx'));
const CameraWorkout = lazy(() => import('../../features/CameraWorkout/pages/CameraWorkout.jsx'));
const Log = lazy(() => import('../../features/Log/pages/Log.jsx'));
const Landing = lazy(() => import('../../pages/Landing/Landing.jsx'));
const NutritionTracker = lazy(() => import('../../features/MealTracker/pages/MealTracker.jsx'));
const Onboarding = lazy(() => import('../../features/Onboarding/pages/Onboarding.jsx'));
const Community = lazy(() => import('../../features/Community/pages/Community.jsx'));
const Profile = lazy(() => import('../../features/Profile/pages/Profile.jsx'));
const ActivityMap = lazy(() => import('../../features/ActivityMap/pages/ActivityMap.jsx'));
const Register = lazy(() => import('../../features/Auth/Register/pages/Register.jsx'));
const Login = lazy(() => import('../../features/Auth/Login/pages/Login.jsx'));
const ClinicalMessenger = lazy(() => import('../../features/Social/pages/Social.jsx'));
const Notifications = lazy(() => import('../../features/Notifications/pages/Notifications.jsx'));
const Preferences = lazy(() => import('../../features/Preferences/pages/Preferences.jsx'));
const HelpSupport = lazy(() => import('../../features/HelpSupport/pages/HelpSupport.jsx'));
const ForgotPassword = lazy(() => import('../../features/Auth/ForgotPassword/pages/ForgotPassword.jsx'));
const CheckEmail = lazy(() => import('../../features/Auth/VerifyEmail/pages/CheckEmail.jsx'));
const VerifyEmail = lazy(() => import('../../features/Auth/VerifyEmail/pages/VerifyEmail.jsx'));
const NotFound = lazy(() => import('../../pages/NotFound/NotFound.jsx'));

const RouteFallback = () => (
  <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]" role="status" aria-busy="true" aria-live="polite">
    <BrandLoader size="lg" message="Loading Vitalis…" />
    <div className="w-48 max-w-[60vw] space-y-2" aria-hidden="true">
      <div className="h-2 rounded-full bg-[var(--bg-hover)] animate-pulse" />
      <div className="h-2 rounded-full bg-[var(--bg-hover)] animate-pulse w-3/4 mx-auto" />
    </div>
  </div>
);

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  return (
    <ErrorBoundary>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/messenger" element={<ProtectedRoute><ClinicalMessenger /></ProtectedRoute>} />
        <Route path="/dashboard/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/dashboard/activity-map" element={<ProtectedRoute><ActivityMap /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/dashboard/workouts" element={<ProtectedRoute><CameraWorkout /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/logs" element={<ProtectedRoute><Log /></ProtectedRoute>} />
        <Route path="/dashboard/meal-tracker" element={<ProtectedRoute><NutritionTracker /></ProtectedRoute>} />
        <Route path="/dashboard/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/dashboard/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
        <Route path="/dashboard/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Legacy removed-module path — redirect to dashboard */}
        <Route path="/dashboard/virtual-clinic" element={<Navigate to="/dashboard" replace />} />
        {/* BMI lives inside Profile — redirect dead ROUTES.BMI link instead of falling to * */}
        <Route path="/dashboard/bmi" element={<Navigate to="/dashboard/profile" replace />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
}
