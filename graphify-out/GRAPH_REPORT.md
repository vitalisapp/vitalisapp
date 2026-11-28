# Graph Report - vitalisapp  (2026-11-28)

## Corpus Check
- 703 files · ~509,446 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3823 nodes · 9623 edges · 181 communities (170 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 723 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `686807ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- ForgotPassword.jsx
- CameraWorkout.jsx
- escapeHtml
- gemini.js
- scanReview.js
- Log.jsx
- auth-api.test.js
- backend/package.json
- warmupRecommender.js
- Landing.jsx
- react
- Icon
- main.jsx
- ScanResult.jsx
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- vite.config.js
- ai.service.js
- foodLogs.service.js
- Preferences.jsx
- AppError
- devDependencies
- Profile.jsx
- project.yml
- frontend/package.json
- forgotpassword.service.js
- progressOverview.js
- ref_node_assert
- geo.js
- coachEngine.js
- App.jsx
- activity.service.js
- filipinoDishes.js
- plans.controller.js
- react
- adminMonitoring.service.js
- upload.js
- coachPlan.service.js
- goalSelection.js
- admin.service.js
- workoutRecommender.js
- owner.js
- ai-privacy.test.js
- useAuth.jsx
- DayTracker.jsx
- MealTracker
- piece-count.test.js
- AdminOverview.jsx
- app.js
- sms-verification.test.js
- progress.controller.js
- HistoryTab.jsx
- compilerOptions
- package.json
- authorization.test.js
- goals.service.js
- trainingPrefs.service.js
- lib/goalSetup.js
- scripts
- account-validation.test.js
- useProfile.js
- validId
- MessengerPanel.jsx
- Onboarding.jsx
- allergies.service.js
- planEngine.js
- taskNotifications.js
- verifyUser.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- generate-email-assets.js
- Notifications.jsx
- server.js
- reminder.service.js
- Register.jsx
- supertest
- food-traits.test.js
- messenger.service.js
- email.service.js
- ref_fs
- utils/nutrition.js
- migrate.js
- bmi.service.js
- MealTracker.jsx
- Conventions
- generate-endpoint-manifest.js
- password-policy.test.js
- community.routes.js
- bmi.js
- lib/fuzzyName.js
- sms-verification.test.js
- StreakJourney.jsx
- accessGroups.service.js
- security.controller.js
- Topbar.jsx
- workoutLogs.service.js
- progression.service.js
- run-tests.js
- foodInfo.test.js
- settings.controller.js
- controllers/README.md
- CommunityFeed.jsx
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- energy.service.js
- VITALIS — AI Integration and Technical Justification
- useNutritionTracker.js
- goal-activity-carry.test.js
- backend/.prettierrc.json
- DashboardWidgets.jsx
- foodImage.service.js
- ActivityMap.jsx
- messenger.service.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- callGeminiWithFallback
- .prettierrc.json
- lib/progression.js
- accessGroups.controller.js
- forgotpassword.routes.js
- reminderScheduler.js
- backend/tests/unit/progression.test.js
- VerifyEmail.jsx
- src/components/index.js
- Migrations — Vitalis (one table per file)
- app/config/env.js
- Verification email delivery status
- WeekCalendarCard.jsx
- check-syntax.js
- fuzzy-name.test.js
- routes/index.js
- dashboard.service.js
- rateLimits.js
- goal-personalization.test.js
- sms.service.js
- errors.js
- email-delivery.test.js
- auth-revocation.test.js
- plans-personal.test.js
- public.service.js
- build-database-sql.js
- create-migration.js
- routePaths.test.js
- endpoint-inventory.test.js
- FoodInfoCard.jsx
- progression.controller.js
- vercel.json
- useUrlFilters
- ExerciseBriefing.jsx
- useAuth
- Dashboard.jsx
- unit/health.test.js
- filipino/README.md
- admin.routes.js
- usePoseEngine.js
- zod
- workoutGuide.js
- RoutinePlayer.jsx
- estimateFoodDensity
- password-login-compat.test.js
- sql-quotes.test.js
- streaks.test.js
- goals.controller.js
- AddWorkoutModal.jsx
- RightPanel.jsx
- brevo-transport.test.js
- StatsTab.jsx
- CoachCard.jsx
- lazyWithReload.js

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 263 edges
2. `react` - 159 edges
3. `AppError` - 93 edges
4. `apiGet()` - 76 edges
5. `apiPost()` - 74 edges
6. `useAuth()` - 74 edges
7. `apiFetch()` - 53 edges
8. `react-router-dom` - 49 edges
9. `Modal()` - 47 edges
10. `Dashboard()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `Backend (Jest + Supertest)` --references--> `requireMember()`  [INFERRED]
  README.md → backend/src/middleware/verifyUser.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js

## Import Cycles
- None detected.

## Communities (181 total, 11 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "ForgotPassword.jsx"
Cohesion: 0.13
Nodes (21): PasswordChecklist(), ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn() (+13 more)

### Community 2 - "CameraWorkout.jsx"
Cohesion: 0.17
Nodes (20): CorrectionBanner(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), EarlyExitDialog(), ExerciseChoiceModal(), formStatus(), MobileWorkoutPills() (+12 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.07
Nodes (46): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS (+38 more)

### Community 5 - "scanReview.js"
Cohesion: 0.21
Nodes (18): formatAmount(), isPer100(), kcalFromMacros(), MAX_GRAMS, normalizeGrams(), round1(), roundKcal(), scaleFromPer100() (+10 more)

### Community 6 - "Log.jsx"
Cohesion: 0.08
Nodes (50): YearlyBmi(), BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum(), fmtShortDate() (+42 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.13
Nodes (22): app, bcrypt, jwt, registered, request, app, request, app (+14 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (46): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+38 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.09
Nodes (24): EXCLUSION_CATEGORIES, EXERCISES, COOLDOWN_MOVES, WARMUP_MOVES, CONFIG, dayRegions(), dose(), EXCLUSION_KEYS (+16 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "react"
Cohesion: 0.09
Nodes (36): Principles, isDismissed(), VerifyEmailBanner(), GroupForm(), toLocalInput(), formatTime(), useActivityApi(), LEVELS (+28 more)

### Community 12 - "Icon"
Cohesion: 0.06
Nodes (58): TONE, Icon(), ConfirmDialog(), paceToSeconds(), SplitRows(), StatsPanel(), StatusPill(), CameraToggleButton() (+50 more)

### Community 13 - "main.jsx"
Cohesion: 0.11
Nodes (16): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, @react-oauth/google@^0.13.4, installGlobalButtonLoading(), installServiceWorkerUpdate() (+8 more)

### Community 14 - "ScanResult.jsx"
Cohesion: 0.18
Nodes (19): asItem(), EXTRA, FIELDS, NumberField(), ScanItemEditor(), toDraft(), withValues(), cleanFoodName() (+11 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (35): AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent, AdminMonitoring, AdminOverview (+27 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.14
Nodes (13): aiQuota(), coachRouteLimiter, express, router, weekLimiter, analyzeUpload, express, mealUpload (+5 more)

### Community 17 - "progress.service.js"
Cohesion: 0.06
Nodes (63): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+55 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.10
Nodes (20): changeEmailSchema, changePasswordSchema, getverifyEmail(), googleLoginSchema, jwt, loginIpLimiter, loginSchema, notifyNewDevice() (+12 more)

### Community 19 - "auth.service.js"
Cohesion: 0.12
Nodes (30): bcrypt, changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+22 more)

### Community 20 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 21 - "ai.service.js"
Cohesion: 0.11
Nodes (26): aiConfigured(), getVisionModels(), safeParseAI(), aiSummary(), analyzePose(), buildNutritionSection(), buildProjection(), buildRuleSummary() (+18 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.07
Nodes (15): stripDataUriPrefix(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100(), crypto (+7 more)

### Community 23 - "Preferences.jsx"
Cohesion: 0.15
Nodes (21): AccountPageShell(), PageHeader(), ErrorState(), FAQS, HelpSupport(), URL_FILTERS, NotificationSkeleton(), getCategoryIcon() (+13 more)

### Community 24 - "AppError"
Cohesion: 0.09
Nodes (31): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), canSeePlan(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll() (+23 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/node@^26.6.5, @types/react@^19.2.14 (+9 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.09
Nodes (29): WarningBadge(), activityLabel(), VARIANTS, useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR() (+21 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "frontend/package.json"
Cohesion: 0.07
Nodes (37): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, maplibre-gl@^6.19.0 (+29 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.31
Nodes (9): sendPasswordResetOtpEmail(), checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), requestResetCode() (+1 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.09
Nodes (19): assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach }, assert (+11 more)

### Community 32 - "geo.js"
Cohesion: 0.14
Nodes (17): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), createGpsTrack(), DEFAULT_GATES, deg2rad() (+9 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.11
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "App.jsx"
Cohesion: 0.24
Nodes (5): App(), AppProviders(), ErrorBoundary, NetworkStatus(), NotificationStreamProvider()

### Community 35 - "activity.service.js"
Cohesion: 0.15
Nodes (18): downsampleRoute(), getActivityById(), getAllForUser(), getDetail(), getStats(), isPlausibleActivity(), paceFor(), resolveCalories() (+10 more)

### Community 36 - "filipinoDishes.js"
Cohesion: 0.16
Nodes (22): DIR, evaluate(), fs, main(), parse(), path, cleanName(), normalizedConfidence() (+14 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.12
Nodes (20): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), getDayRoutine(), INTENSITY_OPTIONS, patchPlanId() (+12 more)

### Community 38 - "react"
Cohesion: 0.09
Nodes (33): FeedbackModal(), LogActivityModal(), Button(), Dropdown(), Input(), Modal(), SIZES, CSSProperties (+25 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.07
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.11
Nodes (27): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore() (+19 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "goalSelection.js"
Cohesion: 0.23
Nodes (17): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+9 more)

### Community 43 - "admin.service.js"
Cohesion: 0.16
Nodes (14): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), _getTargetUser(), getUserDetail(), ROLES (+6 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.12
Nodes (18): getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF, exerciseGuide(), exercisesPerSession() (+10 more)

### Community 45 - "owner.js"
Cohesion: 0.07
Nodes (31): writeLimiter(), express, router, write, express, router, write, express (+23 more)

### Community 46 - "ai-privacy.test.js"
Cohesion: 0.05
Nodes (27): assert, { describe, it }, end, fs, path, personalize, src, start (+19 more)

### Community 47 - "useAuth.jsx"
Cohesion: 0.16
Nodes (22): applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeContext, ThemeProvider(), AuthContext, AuthProvider() (+14 more)

### Community 48 - "DayTracker.jsx"
Cohesion: 0.15
Nodes (23): DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS, ExerciseGuideModal(), LEVEL, PlanDayRoutine(), useDayRoutine(), load() (+15 more)

### Community 49 - "MealTracker"
Cohesion: 0.21
Nodes (16): resolveAssetUrl(), Spinner(), DiarySkeleton(), formatNumber(), loggedTime(), MEAL_META, MealDiary(), MealItem() (+8 more)

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminOverview.jsx"
Cohesion: 0.06
Nodes (104): Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel(), SearchField() (+96 more)

### Community 52 - "app.js"
Cohesion: 0.12
Nodes (18): cookieParser, cors, createApp(), express, helmet, rateLimit, isAllowed(), errorHandler() (+10 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.23
Nodes (12): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+4 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "HistoryTab.jsx"
Cohesion: 0.14
Nodes (26): ICONS, NotificationProvider(), Toast(), ToastContainer(), ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab() (+18 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "authorization.test.js"
Cohesion: 0.17
Nodes (9): app, request, app, makePersonalPlan(), request, cookieName(), jwt, sessionCookie() (+1 more)

### Community 59 - "goals.service.js"
Cohesion: 0.15
Nodes (19): saveBmi(), ACTIVITY_ALIASES, ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight() (+11 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "lib/goalSetup.js"
Cohesion: 0.21
Nodes (16): GoalDetailSheet(), goalIcon(), goalLabel(), ChangeGoalModal(), checkTargetDate(), cleanExtraGoals(), EXCLUSION_CATEGORIES, EXPERIENCE_LEVELS (+8 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 64 - "useProfile.js"
Cohesion: 0.36
Nodes (7): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), DEFAULT_AVATARS, getAvatarUrl()

### Community 65 - "validId"
Cohesion: 0.06
Nodes (23): addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema, listComments(), paginationSchema, remove(), toggleLike() (+15 more)

### Community 66 - "MessengerPanel.jsx"
Cohesion: 0.21
Nodes (16): useDashboardData(), buildThread(), ContactSkeleton(), dayKeyOf(), dayLabel(), humanizeGoal(), MessengerPanel(), RelationshipAction() (+8 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.09
Nodes (34): ActivityDetail(), SleepNote(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, GOAL_TYPES, humanizeOption() (+26 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "planEngine.js"
Cohesion: 0.19
Nodes (12): ACTIVITY_FACTORS, ageFromDob(), calcBmi(), calcBmr(), generatePlan(), PROTEIN_PER_KG, proteinPerKgFor(), assert (+4 more)

### Community 70 - "taskNotifications.js"
Cohesion: 0.33
Nodes (8): activityMessage(), fmtMinutes(), MEASURE_LABELS, measurementMessage(), plural(), round1(), weighInMessage(), workoutMessage()

### Community 71 - "verifyUser.js"
Cohesion: 0.10
Nodes (21): authenticate(), clearSessionCookie(), jwt, requireAdmin(), requireRole(), verifyUser(), withAuthenticatedUser(), express (+13 more)

### Community 72 - "workoutLogs.controller.js"
Cohesion: 0.27
Nodes (6): getId(), parseLogId(), patchFeedback(), patchIdEnd(), postPause(), postResume()

### Community 73 - "Vitalis"
Cohesion: 0.17
Nodes (11): Docs, Environment, Features, License, Prerequisites, Scripts, Setup — backend, Setup — frontend (+3 more)

### Community 74 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, checkJs, lib, module, resolveJsonModule, strict, target (+3 more)

### Community 75 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 76 - "Notifications.jsx"
Cohesion: 0.23
Nodes (14): NotificationCard(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime(), getCategory(), getNotificationMeta(), groupByDay() (+6 more)

### Community 77 - "server.js"
Cohesion: 0.15
Nodes (9): app, http, io, { Server }, ALLOWED_ORIGINS, corsOptions, _jwt, missing (+1 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "Register.jsx"
Cohesion: 0.12
Nodes (29): SMS_SENDER_ID, AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS (+21 more)

### Community 80 - "supertest"
Cohesion: 0.29
Nodes (7): devDependencies, jest@^30.5.2, supertest@^6.3.4, @types/node@^26.6.4, @types/node, jest, supertest

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "messenger.service.js"
Cohesion: 0.18
Nodes (9): createMessage(), getMessagesBetween(), getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), toWireMessage(), assert (+1 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (18): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), changeEmail() (+10 more)

### Community 84 - "ref_fs"
Cohesion: 0.14
Nodes (10): fs, main(), path, assert, bcrypt, fs, mysql, path (+2 more)

### Community 85 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 86 - "migrate.js"
Cohesion: 0.20
Nodes (11): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+3 more)

### Community 87 - "bmi.service.js"
Cohesion: 0.24
Nodes (10): summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance(), bmiCategory() (+2 more)

### Community 88 - "MealTracker.jsx"
Cohesion: 0.19
Nodes (14): DailySummaryCard(), formatNumber(), MacroCards(), MACROS, pctOf(), buildMonthGrid(), CalendarPopup(), EMPTY_FORM (+6 more)

### Community 89 - "Conventions"
Cohesion: 0.20
Nodes (8): logout(), Build, Conventions, Frontend Architecture — Vitalis, Related, State, Structure, EmptyState()

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.13
Nodes (12): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+4 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.14
Nodes (14): postresetPassword(), bcrypt, checkPassword(), COMMON, isWeakPassword(), messageFor(), needsRehash(), normalizeForCommon() (+6 more)

### Community 92 - "community.routes.js"
Cohesion: 0.29
Nodes (6): commentLimiter, createPostLimiter, express, likeLimiter, router, write

### Community 93 - "bmi.js"
Cohesion: 0.53
Nodes (7): BmiInsight(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange()

### Community 94 - "lib/fuzzyName.js"
Cohesion: 0.42
Nodes (9): allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore(), names() (+1 more)

### Community 95 - "sms-verification.test.js"
Cohesion: 0.19
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 96 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 97 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 98 - "security.controller.js"
Cohesion: 0.10
Nodes (16): postDeactivate(), get(), logUserSession(), UAParser, baseCookieOptions(), getClearCookieOptions(), getCookieOptions(), isPlainHttpLoopback() (+8 more)

### Community 99 - "Topbar.jsx"
Cohesion: 0.10
Nodes (33): API_BASE_URL, Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), ThemeToggle(), VARIANTS, getCachedProfile() (+25 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.12
Nodes (17): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), parseHistoryQuery() (+9 more)

### Community 101 - "progression.service.js"
Cohesion: 0.20
Nodes (18): BY_KEY, CHALLENGES, getChallenge(), assertCanStartPlan(), challengeView(), collectStats(), completeChallenge(), computeLevel() (+10 more)

### Community 102 - "run-tests.js"
Cohesion: 0.19
Nodes (14): allTestFiles(), BACKEND, childEnv(), fs, globToRegExp(), JEST_BIN, main(), parseArgs() (+6 more)

### Community 103 - "foodInfo.test.js"
Cohesion: 0.47
Nodes (7): SugarSodiumCard(), goalIntakeNote(), LIMITS, limitStatus(), num(), status(), sugarSodiumTotals()

### Community 104 - "settings.controller.js"
Cohesion: 0.10
Nodes (10): isAivenHost, isLocalHost, mysql, pool, sslFlag, putSettingsSchema, { z }, ALLOWED_THEMES (+2 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "CommunityFeed.jsx"
Cohesion: 0.13
Nodes (18): Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES, TAG_ICONS, TAGS (+10 more)

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.18
Nodes (10): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+2 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "energy.service.js"
Cohesion: 0.15
Nodes (22): activityKcal(), addDaysISO(), getActiveGoalType(), getBurnByDay(), getBurnForDay(), queryWithLocalDate(), workoutKcal(), getDailyStats() (+14 more)

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.17
Nodes (11): 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls, 4.3 Safety and data minimization, 4. How it is built (reliability and cost controls), 5. Internet connectivity requirements, 6. Summary (+3 more)

### Community 111 - "useNutritionTracker.js"
Cohesion: 0.42
Nodes (9): apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity(), apiSaveFoodLog(), compressImageToBase64(), dataUrlToBlob(), toScanResult(), uniqueKey() (+1 more)

### Community 112 - "goal-activity-carry.test.js"
Cohesion: 0.33
Nodes (6): assert, base, change(), dbPath, { describe, it, mock }, mkRes()

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "DashboardWidgets.jsx"
Cohesion: 0.16
Nodes (32): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+24 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "ActivityMap.jsx"
Cohesion: 0.07
Nodes (58): AccuracyCircle(), FitRoute(), GeoJsonLayer(), DOT, GpsBadge(), LABELS, COPY, LocationNotice() (+50 more)

### Community 118 - "Dashboard Redesign — Visual Specification (References A & B)"
Cohesion: 0.29
Nodes (6): Audit baseline (before redesign), Dashboard Redesign — Visual Specification (References A & B), Desktop specification (Reference B), Guardrails for implementation, Mobile specification (Reference A), Reference-to-implementation mapping

### Community 119 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, copy:mediapipe, dev, lint, prebuild, predev, preview (+2 more)

### Community 120 - "Vitalis Frontend"
Cohesion: 0.29
Nodes (6): Conventions, Env, Requirements, Setup, Structure, Vitalis Frontend

### Community 121 - "callGeminiWithFallback"
Cohesion: 0.19
Nodes (11): buildSuggestPlanPrompt(), callGeminiWithFallback(), getGroq(), getGroqTextModel(), Groq, groq(), suggestPlanForMeal(), coachTip() (+3 more)

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "accessGroups.controller.js"
Cohesion: 0.36
Nodes (4): deleteOne(), getMembers(), idParam(), patchUpdate()

### Community 125 - "forgotpassword.routes.js"
Cohesion: 0.08
Nodes (26): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+18 more)

### Community 127 - "backend/tests/unit/progression.test.js"
Cohesion: 0.13
Nodes (17): activeWeeks(), avg(), evaluate(), INTENSITY_LEVEL, LEVELS, requirementsFor(), round1(), weekIndex() (+9 more)

### Community 128 - "VerifyEmail.jsx"
Cohesion: 0.46
Nodes (4): VerificationLayout(), CheckEmail(), VerifyEmail(), postVerifyRoute()

### Community 129 - "src/components/index.js"
Cohesion: 0.12
Nodes (21): AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, AppShell() (+13 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "app/config/env.js"
Cohesion: 0.27
Nodes (7): ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SOCKET_URL, useLogin(), Login()

### Community 134 - "WeekCalendarCard.jsx"
Cohesion: 0.46
Nodes (7): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS

### Community 135 - "check-syntax.js"
Cohesion: 0.29
Nodes (5): collect(), { execSync }, files, fs, path

### Community 137 - "fuzzy-name.test.js"
Cohesion: 0.32
Nodes (11): allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore(), assert (+3 more)

### Community 138 - "routes/index.js"
Cohesion: 0.18
Nodes (9): requireMember(), aiRouteLimiter, aiSummaryLimiter, express, router, express, router, express (+1 more)

### Community 139 - "dashboard.service.js"
Cohesion: 0.17
Nodes (12): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), EMPTY_BURN, logDailyStats(), dayKeys() (+4 more)

### Community 140 - "rateLimits.js"
Cohesion: 0.09
Nodes (29): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+21 more)

### Community 141 - "goal-personalization.test.js"
Cohesion: 0.19
Nodes (12): checkTargetDate(), EXPERIENCE_LEVELS, GOAL_KEYS, isoDay(), LABEL, parseSecondaryGoals(), safeWeeklyRate(), startOfUtcDay() (+4 more)

### Community 142 - "sms.service.js"
Cohesion: 0.27
Nodes (11): getSmsStats(), getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId() (+3 more)

### Community 143 - "errors.js"
Cohesion: 0.24
Nodes (6): assertMode(), buildTips(), collectStats(), getInsights(), assert, { describe, it }

### Community 144 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (10): crypto, jwt, normalizeId(), record(), trackingToken(), assert, dbPath, { it } (+2 more)

### Community 145 - "auth-revocation.test.js"
Cohesion: 0.08
Nodes (18): signSession(), verifySession(), getme(), postlogout(), assert, authedReq(), dbPath, { describe, it } (+10 more)

### Community 146 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 147 - "public.service.js"
Cohesion: 0.24
Nodes (7): cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 148 - "build-database-sql.js"
Cohesion: 0.21
Nodes (12): addMissingColumns(), addMissingForeignKeys(), conn, DEMO, dump(), esc(), { execFileSync }, fs (+4 more)

### Community 149 - "create-migration.js"
Cohesion: 0.29
Nodes (6): dir, files, fs, next, path, slug

### Community 150 - "routePaths.test.js"
Cohesion: 0.25
Nodes (6): LANDING_MODULES, MAIN_NAV, appRoutes, memberRoutes, require, topLevelRoutes

### Community 151 - "endpoint-inventory.test.js"
Cohesion: 0.22
Nodes (8): agent(), app, { execFileSync }, fs, manifest, manifestPath, path, request

### Community 152 - "FoodInfoCard.jsx"
Cohesion: 0.50
Nodes (6): CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips()

### Community 153 - "progression.controller.js"
Cohesion: 0.29
Nodes (3): completeSchema, keySchema, { z }

### Community 156 - "useUrlFilters"
Cohesion: 0.47
Nodes (7): useUrlFilters(), fromSlug(), readFilters(), toSlug(), writeFilters(), CONFIG, EQUIPMENT

### Community 157 - "ExerciseBriefing.jsx"
Cohesion: 0.14
Nodes (22): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+14 more)

### Community 158 - "useAuth"
Cohesion: 0.27
Nodes (10): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute(), isCacheFresh(), useAuth(), MemberRoute() (+2 more)

### Community 159 - "Dashboard.jsx"
Cohesion: 0.19
Nodes (14): EMPTY, round1(), todayKey(), useTodayMeals(), EMPTY_LIST, EMPTY_MEALS, EMPTY_STATS, NUTRIENT_META (+6 more)

### Community 160 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

### Community 162 - "admin.routes.js"
Cohesion: 0.50
Nodes (3): express, read, router

### Community 163 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 166 - "zod"
Cohesion: 0.29
Nodes (5): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, zod

### Community 167 - "workoutGuide.js"
Cohesion: 0.17
Nodes (18): CHOOSER_FILTERS, CHOOSER_GROUPS, CHOOSER_OPTS, BRYL_CREDIT, counterTypeFor(), EXERCISE_TYPE_LABELS, exerciseTypeLabel(), getAllGuideExercises() (+10 more)

### Community 168 - "RoutinePlayer.jsx"
Cohesion: 0.46
Nodes (9): RoutineCard(), RoutinePlayer(), buildSteps(), currentSide(), formatDose(), formatSeconds(), playerReducer(), routineSeconds() (+1 more)

### Community 169 - "estimateFoodDensity"
Cohesion: 0.40
Nodes (5): buildFoodDensityPrompt(), estimateFoodDensity(), isMissingTableError(), readDensityCache(), writeDensityCache()

### Community 171 - "password-login-compat.test.js"
Cohesion: 0.22
Nodes (5): assert, bcrypt, dbPath, { describe, it, beforeEach }, servicePath

### Community 172 - "sql-quotes.test.js"
Cohesion: 0.25
Nodes (7): assert, { describe, it }, DOUBLE_QUOTED_LITERAL, fs, jsFiles(), path, SRC

### Community 173 - "streaks.test.js"
Cohesion: 0.29
Nodes (5): assert, dbPath, { describe, it, beforeEach }, fakeDb, scenario

### Community 174 - "goals.controller.js"
Cohesion: 0.12
Nodes (10): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), parseExperience(), assert (+2 more)

### Community 175 - "AddWorkoutModal.jsx"
Cohesion: 0.36
Nodes (7): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS

### Community 176 - "RightPanel.jsx"
Cohesion: 0.43
Nodes (4): NeuralStatusCard(), RightPanel(), SessionLog(), SessionLogRow()

### Community 177 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 178 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 179 - "CoachCard.jsx"
Cohesion: 0.67
Nodes (3): CoachCard(), optionCopy(), STATUS

### Community 180 - "lazyWithReload.js"
Cohesion: 0.60
Nodes (4): installChunkErrorRecovery(), isChunkLoadError(), lazyWithReload(), reloadForNewBuild()

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `Preferences.jsx` to `VerifyEmail.jsx`, `src/components/index.js`, `ForgotPassword.jsx`, `CameraWorkout.jsx`, `app/config/env.js`, `Log.jsx`, `Landing.jsx`, `Icon`, `main.jsx`, `AppRoutes.jsx`, `routePaths.test.js`, `Profile.jsx`, `frontend/package.json`, `useUrlFilters`, `useAuth`, `Dashboard.jsx`, `react`, `workoutGuide.js`, `DayTracker.jsx`, `AdminOverview.jsx`, `lib/goalSetup.js`, `useProfile.js`, `Onboarding.jsx`, `Register.jsx`, `MealTracker.jsx`, `Topbar.jsx`, `CommunityFeed.jsx`, `ActivityMap.jsx`, `lib/progression.js`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `ForgotPassword.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1330049261083744 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `VerifyEmail.jsx`, `src/components/index.js`, `ForgotPassword.jsx`, `CameraWorkout.jsx`, `app/config/env.js`, `WebcamFeed.jsx`, `WeekCalendarCard.jsx`, `Log.jsx`, `Landing.jsx`, `react`, `Icon`, `main.jsx`, `ScanResult.jsx`, `AppRoutes.jsx`, `Preferences.jsx`, `FoodInfoCard.jsx`, `Profile.jsx`, `frontend/package.json`, `ExerciseBriefing.jsx`, `useUrlFilters`, `Dashboard.jsx`, `geo.js`, `usePoseEngine.js`, `workoutGuide.js`, `RoutinePlayer.jsx`, `goalSelection.js`, `useAuth.jsx`, `RightPanel.jsx`, `AddWorkoutModal.jsx`, `StatsTab.jsx`, `AdminOverview.jsx`, `MealTracker`, `DayTracker.jsx`, `lazyWithReload.js`, `HistoryTab.jsx`, `lib/goalSetup.js`, `useProfile.js`, `MessengerPanel.jsx`, `Onboarding.jsx`, `Register.jsx`, `MealTracker.jsx`, `StreakJourney.jsx`, `Topbar.jsx`, `CommunityFeed.jsx`, `useNutritionTracker.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `src/components/index.js`, `CameraWorkout.jsx`, `Log.jsx`, `WeekCalendarCard.jsx`, `react`, `ScanResult.jsx`, `Preferences.jsx`, `FoodInfoCard.jsx`, `ExerciseBriefing.jsx`, `Dashboard.jsx`, `App.jsx`, `react`, `workoutGuide.js`, `RoutinePlayer.jsx`, `goalSelection.js`, `RightPanel.jsx`, `MealTracker`, `StatsTab.jsx`, `AdminOverview.jsx`, `CoachCard.jsx`, `HistoryTab.jsx`, `lib/goalSetup.js`, `Onboarding.jsx`, `Notifications.jsx`, `Register.jsx`, `MealTracker.jsx`, `bmi.js`, `StreakJourney.jsx`, `Topbar.jsx`, `foodInfo.test.js`, `DashboardWidgets.jsx`, `ActivityMap.jsx`, `lib/progression.js`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07137254901960784 - nodes in this community are weakly interconnected._
- **Should `Log.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._