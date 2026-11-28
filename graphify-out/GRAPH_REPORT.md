# Graph Report - vitalisapp  (2026-11-28)

## Corpus Check
- 706 files · ~513,181 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3787 nodes · 9704 edges · 176 communities (163 shown, 13 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 726 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09a630ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- Register.jsx
- CameraWorkout.jsx
- escapeHtml
- gemini.js
- MealTracker
- Log.jsx
- auth-api.test.js
- backend/package.json
- warmupRecommender.js
- Landing.jsx
- react
- Icon
- main.jsx
- Topbar.jsx
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- vite.config.js
- ai.service.js
- foodLogs.service.js
- app/config/env.js
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
- AdminAccess.jsx
- activity.service.js
- filipinoDishes.js
- plans.controller.js
- react
- adminMonitoring.service.js
- upload.js
- coachPlan.service.js
- AdminMonitoring.jsx
- admin.service.js
- workoutRecommender.js
- owner.js
- ai-privacy.test.js
- useAuth.jsx
- DayTracker.jsx
- ChangeGoalModal.jsx
- piece-count.test.js
- AdminOverview.jsx
- app.js
- sms-verification.test.js
- progress.controller.js
- Sidebar.jsx
- compilerOptions
- package.json
- lib/fuzzyName.js
- goals.service.js
- trainingPrefs.service.js
- ActivityMap.jsx
- scripts
- Register.jsx
- lib/avatar.js
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
- Explore.jsx
- reminder.service.js
- VerifyPhone.jsx
- security.test.js
- food-traits.test.js
- messenger.service.js
- email.service.js
- ref_fs
- utils/nutrition.js
- migrate.js
- exportTable.js
- goalSelection.js
- config/db.js
- generate-endpoint-manifest.js
- password-policy.test.js
- progressInsights.js
- goal-personalization.test.js
- energy.service.js
- AddWorkoutModal.jsx
- StreakJourney.jsx
- accessGroups.service.js
- security.controller.js
- AdminShell.jsx
- workoutLogs.service.js
- progression.service.js
- run-tests.js
- ProgressOverviewChart.jsx
- settings.controller.js
- controllers/README.md
- CommunityFeed.jsx
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- energy.service.js
- VITALIS — AI Integration and Technical Justification
- goalLabel
- goal-activity-carry.test.js
- backend/.prettierrc.json
- DashboardWidgets.jsx
- foodImage.service.js
- mapAdapter.js
- forgotpassword.routes.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- email-delivery.test.js
- .prettierrc.json
- lib/progression.js
- RightPanel.jsx
- WeekCalendarCard.jsx
- reminderScheduler.js
- bmi.js
- useAuth
- Topbar.jsx
- Migrations — Vitalis (one table per file)
- useAuth
- Verification email delivery status
- reminderRules.js
- reminder.routes.js
- verifyUser.js
- clientDateFromQuery
- rateLimits.js
- activity-accuracy.test.js
- sms.service.js
- Frontend Architecture — Vitalis
- notification.controller.js
- auth-revocation.test.js
- plans-personal.test.js
- public.service.js
- build-database-sql.js
- fuzzy-name.test.js
- buildSampleDataset
- endpoint-inventory.test.js
- eval-filipino-scans.js
- goal-date-carry.test.js
- vercel.json
- email-verification.test.js
- css-custom-properties.d.ts
- ExerciseBriefing.jsx
- cookies.js
- apiFetch
- notification.service.js
- filipino/README.md
- devDependencies
- usePoseEngine.js
- reminder-rules.test.js
- workoutGuide.js
- RoutinePlayer.jsx
- dashboard.service.js
- password-login-compat.test.js
- sql-quotes.test.js
- unit/health.test.js
- res
- src/config/env.js

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 267 edges
2. `react` - 159 edges
3. `AppError` - 98 edges
4. `apiGet()` - 76 edges
5. `apiPost()` - 74 edges
6. `useAuth()` - 74 edges
7. `apiFetch()` - 53 edges
8. `react-router-dom` - 49 edges
9. `Modal()` - 48 edges
10. `Dashboard()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `4.2 Cost controls` --references--> `validateAndCorrectMacros()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js

## Import Cycles
- None detected.

## Communities (176 total, 13 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "Register.jsx"
Cohesion: 0.12
Nodes (27): PasswordChecklist(), ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn() (+19 more)

### Community 2 - "CameraWorkout.jsx"
Cohesion: 0.15
Nodes (19): CorrectionBanner(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), EarlyExitDialog(), ExerciseChoiceModal(), formStatus(), MobileWorkoutPills() (+11 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.06
Nodes (53): aiConfigured(), analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep() (+45 more)

### Community 5 - "MealTracker"
Cohesion: 0.06
Nodes (65): resolveAssetUrl(), Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips() (+57 more)

### Community 6 - "Log.jsx"
Cohesion: 0.10
Nodes (39): TONE, YearlyBmi(), STATUS, SummaryInsights(), SummaryStats(), Trend(), BodyTab(), DAYS (+31 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.12
Nodes (27): app, request, app, request, app, request, app, request (+19 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (44): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+36 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.11
Nodes (24): EXCLUSION_CATEGORIES, EXERCISES, COOLDOWN_MOVES, WARMUP_MOVES, CONFIG, dayRegions(), dose(), EXCLUSION_KEYS (+16 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "react"
Cohesion: 0.08
Nodes (45): API_BASE_URL, NotificationStreamContext, NotificationStreamProvider(), useToast(), getAccessCode(), useRegister(), CheckEmail(), useWorkoutSession() (+37 more)

### Community 12 - "Icon"
Cohesion: 0.08
Nodes (37): Icon(), ConfirmDialog(), TOAST_ICONS, COPY, paceToSeconds(), SplitRows(), StatsPanel(), StatusPill() (+29 more)

### Community 13 - "main.jsx"
Cohesion: 0.13
Nodes (14): @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, @react-oauth/google@^0.13.4, installGlobalButtonLoading(), installChunkErrorRecovery(), isChunkLoadError(), lazyWithReload(), reloadForNewBuild() (+6 more)

### Community 14 - "Topbar.jsx"
Cohesion: 0.27
Nodes (11): getCachedProfile(), _profileCache, setCachedProfile(), Topbar(), getSettingsItems(), useNotificationStream(), _cache, getCached() (+3 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (35): AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent, AdminMonitoring, AdminOverview (+27 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.11
Nodes (17): aiQuota(), aiRouteLimiter, aiSummaryLimiter, express, router, coachRouteLimiter, express, router (+9 more)

### Community 17 - "progress.service.js"
Cohesion: 0.10
Nodes (32): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+24 more)

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
Nodes (26): callGeminiWithFallback(), safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), coachTip(), dailySummary() (+18 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.11
Nodes (20): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100() (+12 more)

### Community 23 - "app/config/env.js"
Cohesion: 0.14
Nodes (9): App(), ENV_ERROR, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, AppProviders(), ErrorBoundary (+1 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (30): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), canSeePlan(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll() (+22 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/node@^26.6.5, @types/react@^19.2.14 (+9 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.10
Nodes (31): WarningBadge(), LegalCenterModal(), activityLabel(), Toast(), VARIANTS, useAvatar(), activityFactors, bmiCategory() (+23 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "frontend/package.json"
Cohesion: 0.07
Nodes (40): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0 (+32 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.31
Nodes (9): sendPasswordResetOtpEmail(), checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), requestResetCode() (+1 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.05
Nodes (30): createBrevoTransport(), parseHistoryQuery(), assert, { describe, it }, assert, { it }, message, options (+22 more)

### Community 32 - "geo.js"
Cohesion: 0.14
Nodes (17): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), createGpsTrack(), DEFAULT_GATES, deg2rad() (+9 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.16
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "AdminAccess.jsx"
Cohesion: 0.16
Nodes (42): Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel(), StateBlock() (+34 more)

### Community 35 - "activity.service.js"
Cohesion: 0.22
Nodes (15): getActivityById(), getAllForUser(), getDetail(), getStats(), paceFor(), resolveCalories(), saveActivity(), selectCompat() (+7 more)

### Community 36 - "filipinoDishes.js"
Cohesion: 0.23
Nodes (16): cleanName(), normalizedConfidence(), REVIEW_REASONS, reviewDish(), ALIAS_INDEX, BY_KEY, DISHES, findDish() (+8 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.12
Nodes (20): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), getDayRoutine(), INTENSITY_OPTIONS, patchPlanId() (+12 more)

### Community 38 - "react"
Cohesion: 0.10
Nodes (30): FeedbackModal(), LogActivityModal(), Button(), Input(), Modal(), SIZES, AcknowledgeFooter(), DOCS (+22 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (30): byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity(), latest() (+22 more)

### Community 40 - "upload.js"
Cohesion: 0.10
Nodes (28): sharp@^0.35.5, postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore() (+20 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "AdminMonitoring.jsx"
Cohesion: 0.29
Nodes (10): SearchField(), STATUS_META, StatusDot(), AdminMonitoring(), daysLabel(), EXPORT_COLUMNS, FLAG_GROUPS, FlagList() (+2 more)

### Community 43 - "admin.service.js"
Cohesion: 0.12
Nodes (20): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+12 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.08
Nodes (25): norm(), PLAN_GUIDES, planExerciseGuides(), getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS (+17 more)

### Community 45 - "owner.js"
Cohesion: 0.08
Nodes (26): writeLimiter(), express, router, write, express, router, write, express (+18 more)

### Community 46 - "ai-privacy.test.js"
Cohesion: 0.05
Nodes (27): assert, { describe, it }, end, fs, path, personalize, src, start (+19 more)

### Community 47 - "useAuth.jsx"
Cohesion: 0.12
Nodes (27): GOOGLE_CLIENT_ID, ICONS, NotificationProvider(), Toast(), ToastContainer(), applyRootTheme(), fetchServerTheme(), persistServerTheme() (+19 more)

### Community 48 - "DayTracker.jsx"
Cohesion: 0.11
Nodes (28): names, pkgDir, require, root, slugs, DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS (+20 more)

### Community 49 - "ChangeGoalModal.jsx"
Cohesion: 0.18
Nodes (17): EQUIPMENT_ICONS, LOCATIONS, MINS_PRESETS, ChangeGoalModal(), checkTargetDate(), cleanExtraGoals(), EXCLUSION_CATEGORIES, EXPERIENCE_LEVELS (+9 more)

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminOverview.jsx"
Cohesion: 0.11
Nodes (32): AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL, AdminUsageChart() (+24 more)

### Community 52 - "app.js"
Cohesion: 0.11
Nodes (19): app, http, io, { Server }, cookieParser, cors, createApp(), express (+11 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.10
Nodes (23): crypto, cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil() (+15 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "Sidebar.jsx"
Cohesion: 0.41
Nodes (9): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), LogoutConfirmDialog(), ADMIN_GROUPS, AdminRow(), AdminSidebar() (+1 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "lib/fuzzyName.js"
Cohesion: 0.42
Nodes (9): allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore(), names() (+1 more)

### Community 59 - "goals.service.js"
Cohesion: 0.19
Nodes (18): ACTIVITY_ALIASES, ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+10 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "ActivityMap.jsx"
Cohesion: 0.15
Nodes (19): DOT, GpsBadge(), LABELS, LocationNotice(), MapZoomControls(), RunAnalysisOverlay(), RunControls(), formatTime() (+11 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "Register.jsx"
Cohesion: 0.31
Nodes (8): readCode(), useAccessInvite(), Field(), Register(), VisibilityToggle(), NetworkNotice(), SUPPORTED, UNSUPPORTED

### Community 64 - "lib/avatar.js"
Cohesion: 0.36
Nodes (8): ContactAvatar(), AVATAR_SURFACES, avatarGradient(), avatarSurface(), hashSeed(), isPresetToken(), resolveAvatar(), RETIRED_HOSTS

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "MessengerPanel.jsx"
Cohesion: 0.17
Nodes (18): logout(), Conventions, EmptyState(), buildThread(), ContactSkeleton(), dayKeyOf(), dayLabel(), humanizeGoal() (+10 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.09
Nodes (34): ActivityDetail(), SleepNote(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, GOAL_TYPES, humanizeOption() (+26 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "planEngine.js"
Cohesion: 0.11
Nodes (23): saveBmi(), summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance() (+15 more)

### Community 70 - "taskNotifications.js"
Cohesion: 0.33
Nodes (8): activityMessage(), fmtMinutes(), MEASURE_LABELS, measurementMessage(), plural(), round1(), weighInMessage(), workoutMessage()

### Community 71 - "verifyUser.js"
Cohesion: 0.09
Nodes (20): router, router, express, router, write, express, landingLimiter, router (+12 more)

### Community 72 - "workoutLogs.controller.js"
Cohesion: 0.27
Nodes (6): getId(), parseLogId(), patchFeedback(), patchIdEnd(), postPause(), postResume()

### Community 73 - "Vitalis"
Cohesion: 0.14
Nodes (13): Docs, Environment, Features, Frontend, License, Prerequisites, Scripts, Setup — backend (+5 more)

### Community 74 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, checkJs, lib, module, resolveJsonModule, strict, target (+3 more)

### Community 75 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 76 - "Notifications.jsx"
Cohesion: 0.17
Nodes (23): NotificationOverlay(), NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime() (+15 more)

### Community 77 - "Explore.jsx"
Cohesion: 0.14
Nodes (21): ContinueTrainingCard(), Explore(), FilterPill(), EXPLORE_FILTERS, GUIDE_OPTS, LIBRARY_FILTERS, TAB_FILTER_PARAMS, CATEGORIES (+13 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.26
Nodes (16): activityFacts(), claim(), firstName(), getPrefs(), isMissingSchema(), reminderHistory(), runOnce(), savePrefs() (+8 more)

### Community 79 - "VerifyPhone.jsx"
Cohesion: 0.21
Nodes (14): VerificationLayout(), VerifyEmail(), VerifyPhone(), postVerifyRoute(), OtpInput(), formatPhMobile(), isValidPhMobile(), livePhoneError() (+6 more)

### Community 80 - "security.test.js"
Cohesion: 0.19
Nodes (10): app, bcrypt, jwt, registered, request, app, request, assertNoSensitiveFields() (+2 more)

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "messenger.service.js"
Cohesion: 0.14
Nodes (6): createMessage(), FRIEND_STATUSES, getMessagesBetween(), toWireMessage(), assert, { describe, it }

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (18): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), changeEmail() (+10 more)

### Community 84 - "ref_fs"
Cohesion: 0.12
Nodes (13): assert, bcrypt, fs, mysql, path, path, root, dir (+5 more)

### Community 85 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 86 - "migrate.js"
Cohesion: 0.23
Nodes (11): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+3 more)

### Community 87 - "exportTable.js"
Cohesion: 0.32
Nodes (11): ExportMenu(), csvCell(), download(), exportCsv(), exportXlsx(), fmtDateText(), normalize(), pad() (+3 more)

### Community 88 - "goalSelection.js"
Cohesion: 0.24
Nodes (16): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+8 more)

### Community 89 - "config/db.js"
Cohesion: 0.15
Nodes (9): isAivenHost, isLocalHost, mysql, pool, sslFlag, jwt, normalizeId(), record() (+1 more)

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.13
Nodes (12): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+4 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.14
Nodes (14): postresetPassword(), bcrypt, checkPassword(), COMMON, isWeakPassword(), messageFor(), needsRehash(), normalizeForCommon() (+6 more)

### Community 92 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 93 - "goal-personalization.test.js"
Cohesion: 0.14
Nodes (19): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+11 more)

### Community 94 - "energy.service.js"
Cohesion: 0.23
Nodes (11): addDaysISO(), getActiveGoalType(), getBurnByDay(), getBurnForDay(), queryWithLocalDate(), workoutKcal(), getDailyStats(), creditedKcal() (+3 more)

### Community 95 - "AddWorkoutModal.jsx"
Cohesion: 0.36
Nodes (7): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS

### Community 96 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 97 - "accessGroups.service.js"
Cohesion: 0.11
Nodes (25): VALID_GENDERS, cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list() (+17 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "AdminShell.jsx"
Cohesion: 0.22
Nodes (13): AdminBottomNav(), ADMIN_NAV, AdminShell(), AdminTopbarSearch(), useAdminFilters(), ADMIN_FILTERS, normalize(), page (+5 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (14): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), recordCalories() (+6 more)

### Community 101 - "progression.service.js"
Cohesion: 0.07
Nodes (39): BY_KEY, CHALLENGES, getChallenge(), completeSchema, keySchema, { z }, getPlansForUser(), assertCanStartPlan() (+31 more)

### Community 102 - "run-tests.js"
Cohesion: 0.19
Nodes (14): allTestFiles(), BACKEND, childEnv(), fs, globToRegExp(), JEST_BIN, main(), parseArgs() (+6 more)

### Community 103 - "ProgressOverviewChart.jsx"
Cohesion: 0.14
Nodes (18): chart.js@^4.5.1, react-chartjs-2@^5.3.1, BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum() (+10 more)

### Community 104 - "settings.controller.js"
Cohesion: 0.11
Nodes (10): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS (+2 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "CommunityFeed.jsx"
Cohesion: 0.17
Nodes (16): ErrorState(), Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES, TAG_ICONS (+8 more)

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.18
Nodes (10): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+2 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "energy.service.js"
Cohesion: 0.27
Nodes (10): DIFFICULTY_FACTOR, EAT_BACK_FACTOR, estimateActivityKcal(), estimateWorkoutKcal(), MET_RULES, metForSpeed(), metForWorkout(), normalizeType() (+2 more)

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.12
Nodes (15): buildSuggestPlanPrompt(), suggestPlanForMeal(), suggestPlan(), 1. What the AI does in VITALIS, 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls (+7 more)

### Community 111 - "goalLabel"
Cohesion: 0.33
Nodes (8): goalLabel(), GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), DEFAULT_AVATARS, getAvatarUrl()

### Community 112 - "goal-activity-carry.test.js"
Cohesion: 0.33
Nodes (6): assert, base, change(), dbPath, { describe, it, mock }, mkRes()

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "DashboardWidgets.jsx"
Cohesion: 0.13
Nodes (39): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+31 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "mapAdapter.js"
Cohesion: 0.07
Nodes (58): AccuracyCircle(), FitRoute(), GeoJsonLayer(), ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab(), KudosButton() (+50 more)

### Community 117 - "forgotpassword.routes.js"
Cohesion: 0.07
Nodes (30): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+22 more)

### Community 118 - "Dashboard Redesign — Visual Specification (References A & B)"
Cohesion: 0.29
Nodes (6): Audit baseline (before redesign), Dashboard Redesign — Visual Specification (References A & B), Desktop specification (Reference B), Guardrails for implementation, Mobile specification (Reference A), Reference-to-implementation mapping

### Community 119 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, copy:mediapipe, dev, frames, lint, prebuild, predev (+3 more)

### Community 120 - "Vitalis Frontend"
Cohesion: 0.29
Nodes (6): Conventions, Env, Requirements, Setup, Structure, Vitalis Frontend

### Community 121 - "email-delivery.test.js"
Cohesion: 0.25
Nodes (5): assert, dbPath, { it }, jwt, rows

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "RightPanel.jsx"
Cohesion: 0.43
Nodes (4): NeuralStatusCard(), RightPanel(), SessionLog(), SessionLogRow()

### Community 125 - "WeekCalendarCard.jsx"
Cohesion: 0.46
Nodes (7): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS

### Community 127 - "bmi.js"
Cohesion: 0.53
Nodes (7): BmiInsight(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange()

### Community 128 - "useAuth"
Cohesion: 0.25
Nodes (9): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute(), isCacheFresh(), MemberRoute(), ProtectedRoute() (+1 more)

### Community 129 - "Topbar.jsx"
Cohesion: 0.15
Nodes (12): LANDING_MODULES, ACTIVE_NAV_KEY, MAIN_NAV, MOBILE_MAIN_NAV, MOBILE_MORE_NAV, NAV_GROUPS, NAV_ITEMS, SIDEBAR_BOTTOM_NAV (+4 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "useAuth"
Cohesion: 0.10
Nodes (33): AccountPageShell(), AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES (+25 more)

### Community 135 - "reminderRules.js"
Cohesion: 0.16
Nodes (7): KIND_LABELS, DEFAULT_PREFS, dueReminders(), isQuietHour(), KINDS, nextVariant(), PREF_KEYS

### Community 137 - "reminder.routes.js"
Cohesion: 0.40
Nodes (4): express, router, testLimiter, write

### Community 138 - "verifyUser.js"
Cohesion: 0.18
Nodes (15): authenticate(), clearSessionCookie(), jwt, requireAdmin(), requireMember(), requireRole(), verifyUser(), withAuthenticatedUser() (+7 more)

### Community 139 - "clientDateFromQuery"
Cohesion: 0.14
Nodes (11): logDailyStats(), dayKeys(), getStreakSummary(), shiftDay(), weekdayIndex(), clientDateFromQuery(), assert, dbPath (+3 more)

### Community 140 - "rateLimits.js"
Cohesion: 0.12
Nodes (24): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+16 more)

### Community 141 - "activity-accuracy.test.js"
Cohesion: 0.29
Nodes (4): downsampleRoute(), isPlausibleActivity(), assert, { describe, it }

### Community 142 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 143 - "Frontend Architecture — Vitalis"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

### Community 144 - "notification.controller.js"
Cohesion: 0.24
Nodes (10): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+2 more)

### Community 145 - "auth-revocation.test.js"
Cohesion: 0.15
Nodes (14): signSession(), verifySession(), getme(), postlogout(), getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies() (+6 more)

### Community 146 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 147 - "public.service.js"
Cohesion: 0.24
Nodes (7): cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 148 - "build-database-sql.js"
Cohesion: 0.21
Nodes (12): addMissingColumns(), addMissingForeignKeys(), conn, DEMO, dump(), esc(), { execFileSync }, fs (+4 more)

### Community 149 - "fuzzy-name.test.js"
Cohesion: 0.30
Nodes (12): searchUsers(), allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore() (+4 more)

### Community 150 - "buildSampleDataset"
Cohesion: 0.31
Nodes (12): addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO(), pick() (+4 more)

### Community 151 - "endpoint-inventory.test.js"
Cohesion: 0.12
Nodes (13): collect(), { execSync }, files, fs, path, agent(), app, { execFileSync } (+5 more)

### Community 152 - "eval-filipino-scans.js"
Cohesion: 0.23
Nodes (10): fs, main(), path, DIR, evaluate(), fs, main(), parse() (+2 more)

### Community 153 - "goal-date-carry.test.js"
Cohesion: 0.33
Nodes (3): assert, dbPath, { describe, it, mock }

### Community 155 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 157 - "ExerciseBriefing.jsx"
Cohesion: 0.14
Nodes (22): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+14 more)

### Community 158 - "cookies.js"
Cohesion: 0.48
Nodes (6): postDeactivate(), baseCookieOptions(), getClearCookieOptions(), getCookieOptions(), isPlainHttpLoopback(), isSecureRequest()

### Community 159 - "apiFetch"
Cohesion: 0.10
Nodes (37): EMPTY, round1(), todayKey(), useTodayMeals(), macroCoachMessage(), CameraScanner(), MacroCoachCard(), apiAnalyzeFoodImage() (+29 more)

### Community 162 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, jest@^30.5.2, supertest@^6.3.4, @types/node@^26.6.4, @types/node, jest

### Community 163 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 166 - "reminder-rules.test.js"
Cohesion: 0.33
Nodes (3): assert, base, { describe, it }

### Community 167 - "workoutGuide.js"
Cohesion: 0.16
Nodes (22): Dropdown(), PICKER_OPTIONS, CHOOSER_FILTERS, CHOOSER_GROUPS, CHOOSER_OPTS, WorkoutChooser(), BRYL_CREDIT, EXERCISE_TYPE_LABELS (+14 more)

### Community 168 - "RoutinePlayer.jsx"
Cohesion: 0.35
Nodes (11): RoutineCard(), RoutinePlayer(), PlanDayRoutine(), useDayRoutine(), buildSteps(), currentSide(), formatDose(), formatSeconds() (+3 more)

### Community 169 - "dashboard.service.js"
Cohesion: 0.19
Nodes (6): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), EMPTY_BURN

### Community 171 - "password-login-compat.test.js"
Cohesion: 0.22
Nodes (5): assert, bcrypt, dbPath, { describe, it, beforeEach }, servicePath

### Community 172 - "sql-quotes.test.js"
Cohesion: 0.25
Nodes (7): assert, { describe, it }, DOUBLE_QUOTED_LITERAL, fs, jsFiles(), path, SRC

### Community 173 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

### Community 175 - "src/config/env.js"
Cohesion: 0.50
Nodes (3): _jwt, missing, required

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `useAuth` to `useAuth`, `Register.jsx`, `CameraWorkout.jsx`, `Topbar.jsx`, `Log.jsx`, `Landing.jsx`, `react`, `main.jsx`, `Topbar.jsx`, `AppRoutes.jsx`, `Profile.jsx`, `frontend/package.json`, `apiFetch`, `workoutGuide.js`, `useAuth.jsx`, `DayTracker.jsx`, `AdminOverview.jsx`, `Sidebar.jsx`, `ActivityMap.jsx`, `Register.jsx`, `Onboarding.jsx`, `Notifications.jsx`, `Explore.jsx`, `VerifyPhone.jsx`, `AdminShell.jsx`, `goalLabel`, `DashboardWidgets.jsx`, `lib/progression.js`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `Register.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12375533428165007 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `WebcamFeed.jsx`, `Register.jsx`, `CameraWorkout.jsx`, `useAuth`, `MealTracker`, `Log.jsx`, `Landing.jsx`, `Icon`, `main.jsx`, `Topbar.jsx`, `AppRoutes.jsx`, `app/config/env.js`, `Profile.jsx`, `css-custom-properties.d.ts`, `frontend/package.json`, `ExerciseBriefing.jsx`, `apiFetch`, `geo.js`, `AdminAccess.jsx`, `usePoseEngine.js`, `react`, `workoutGuide.js`, `RoutinePlayer.jsx`, `AdminMonitoring.jsx`, `useAuth.jsx`, `DayTracker.jsx`, `ChangeGoalModal.jsx`, `AdminOverview.jsx`, `Sidebar.jsx`, `ActivityMap.jsx`, `Register.jsx`, `MessengerPanel.jsx`, `Onboarding.jsx`, `Notifications.jsx`, `Explore.jsx`, `VerifyPhone.jsx`, `exportTable.js`, `goalSelection.js`, `AddWorkoutModal.jsx`, `StreakJourney.jsx`, `AdminShell.jsx`, `ProgressOverviewChart.jsx`, `CommunityFeed.jsx`, `goalLabel`, `DashboardWidgets.jsx`, `mapAdapter.js`, `RightPanel.jsx`, `WeekCalendarCard.jsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `Register.jsx`, `CameraWorkout.jsx`, `useAuth`, `MealTracker`, `Log.jsx`, `react`, `Topbar.jsx`, `app/config/env.js`, `Profile.jsx`, `ExerciseBriefing.jsx`, `apiFetch`, `AdminAccess.jsx`, `react`, `workoutGuide.js`, `RoutinePlayer.jsx`, `AdminMonitoring.jsx`, `useAuth.jsx`, `DayTracker.jsx`, `ChangeGoalModal.jsx`, `AdminOverview.jsx`, `Sidebar.jsx`, `ActivityMap.jsx`, `MessengerPanel.jsx`, `Onboarding.jsx`, `Notifications.jsx`, `Explore.jsx`, `exportTable.js`, `goalSelection.js`, `StreakJourney.jsx`, `AdminShell.jsx`, `ProgressOverviewChart.jsx`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `mapAdapter.js`, `lib/progression.js`, `RightPanel.jsx`, `WeekCalendarCard.jsx`, `bmi.js`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._
- **Should `MealTracker` be split into smaller, more focused modules?**
  _Cohesion score 0.057813911472448055 - nodes in this community are weakly interconnected._