// Central route registry: method + path -> file.
const authRoutes = require('./auth.routes');
const messengerRoutes = require('./messenger.routes');
const dashboardRoutes = require('./dashboard.routes');
const sleepRoutes = require('./sleep.routes');
const logsRoutes = require('./logs.routes');
const analyticsRoutes = require('./analytics.routes');
const plansRoutes = require('./plans.routes');
const profileRoutes = require('./profile.routes');
const aiRoutes = require('./ai.routes');
const foodLogs = require('./foodLogs.routes');
const bmiRoutes = require('./bmi.routes');
const activityRoutes = require('./activity.routes');
const securityRoutes = require('./security.routes');
const notificationRoutes = require('./notification.routes');
const coachRoutes = require('./coach.routes');
const workoutLogRoutes = require('./workoutLogs.routes');
const forgotPasswordRoutes = require('./forgotpassword.routes');
const feedbackRoutes = require('./feedback.routes');
const statsRoutes = require('./stats.routes');

const goalsRoutes = require('./goals.routes');
const checkinsRoutes = require('./checkins.routes');
const nutrientGoalsRoutes = require('./nutrientGoals.routes');
const communityRoutes = require('./community.routes');
const settingsRoutes = require('./settings.routes');
const publicRoutes = require('./public.routes');

function mountRoutes(app) {
  app.use('/api/public', publicRoutes); // no-auth aggregates (landing page)
  app.use('/api/goals', goalsRoutes);
  app.use('/api/checkins', checkinsRoutes);
  app.use('/api/nutrient-goals', nutrientGoalsRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/bmi', bmiRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', messengerRoutes); // /contacts, /messages, /users/search, /friends
  app.use('/api', dashboardRoutes); // /dashboard
  app.use('/api/sleep', sleepRoutes);
  app.use('/api/logs', logsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/plans', plansRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api', aiRoutes);
  app.use('/api/food-logs', foodLogs);
  // Removed modules return 410 Gone for legacy clients.
  app.use('/api/clinic', (req, res) => res.status(410).json({ error: 'Virtual Clinic has been removed. Use AI Coach instead.', code: 'CLINIC_REMOVED' }));
  app.use('/api/atelier', (req, res) => res.status(410).json({ error: 'Atelier module has been removed.', code: 'ATELIER_REMOVED' }));
  app.use('/api/live-coaching', (req, res) => res.status(410).json({ error: 'Live Coaching page has been removed. Use Training workouts instead.', code: 'LIVE_COACHING_REMOVED' }));
  app.use('/api/workout-sessions', (req, res) => res.status(410).json({ error: 'Workout sessions endpoint has been removed. Use /api/workout-logs instead.', code: 'SESSIONS_REMOVED' }));
  app.use('/api/nutrition', (req, res) => res.status(410).json({ error: 'Nutrition endpoint has been removed. Use /api/food-logs instead.', code: 'NUTRITION_REMOVED' }));
  app.use('/api/activity', activityRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/coach', coachRoutes);
  app.use('/api/workout-logs', workoutLogRoutes);
  app.use('/api/forgot-password', forgotPasswordRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/stats', statsRoutes);

  // Debug helper - GET /api/_routes lists all mounted prefixes (non-prod only)
  app.get('/api/_routes', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      routes: [
        'GET  /api/health',
        'GET  /health',
        'GET  /api/readyz',
        'GET  /api/version',
        'GET  /api/_routes',
        'POST /api/auth/register | POST /api/auth/login | GET /api/auth/me | POST /api/auth/logout | POST /api/auth/google-login | POST /api/auth/change-password | PATCH /api/auth/change-email | POST /api/auth/send-verification | GET /api/auth/verify-email | POST /api/auth/complete-onboarding',
        'GET  /api/public/* (landing aggregates, no auth)',
        'GET|POST /api/bmi',
        'GET  /api/dashboard/:userId',
        'GET|POST /api/sleep/*',
        'GET|POST /api/logs/*',
        'GET  /api/analytics/*',
        'GET|POST|PUT|DELETE /api/plans/*',
        'GET|PUT /api/profile/*',
        'POST /api/ai-chat | POST /api/analyze-pose | POST /api/ai/clinical-analysis | POST /api/ai/coach | GET /api/ai/history/:userId | GET /api/logs/latest/:userId | POST /api/ai/run-analysis',
        'GET|POST|PUT|DELETE /api/food-logs/* (incl. POST /analyze-pic 10mb)',
        'GET|POST|PUT|DELETE /api/activity/*',
        'GET|POST /api/goals/* | GET|POST /api/checkins/* | GET|PUT /api/nutrient-goals/*',
        'GET|POST|DELETE /api/community/*',
        'GET|PUT /api/settings',
        'GET|POST /api/security/*',
        'GET|POST /api/notifications/*',
        'GET|POST /api/coach/*',
        'GET|POST|PUT|DELETE /api/workout-logs/*',
        'POST /api/forgot-password/*',
        'GET|POST /api/feedback/*',
        'GET  /api/stats/*',
        'WS   /socket.io (messenger + dashboard rooms)',
        '410  /api/clinic | /api/atelier | /api/live-coaching | /api/workout-sessions | /api/nutrition (removed modules)',
      ],
    });
  });
}

module.exports = mountRoutes;
module.exports.mountRoutes = mountRoutes;
