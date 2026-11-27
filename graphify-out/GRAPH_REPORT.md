# Graph Report - vitalisapp  (2026-11-27)

## Corpus Check
- 692 files · ~473,741 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3757 nodes · 9535 edges · 183 communities (168 shown, 15 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 720 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3b84d73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- ChangeGoalModal.jsx
- CameraWorkout.jsx
- escapeHtml
- gemini.js
- Log.jsx
- auth-api.test.js
- backend/package.json
- warmupRecommender.js
- Landing.jsx
- apiClient.js
- Icon
- Explore.jsx
- ScanResult.jsx
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- vite.config.js
- ai.service.js
- foodLogs.service.js
- goalSelection.js
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
- useAuth.jsx
- activity.service.js
- filipinoDishes.js
- plans.controller.js
- react
- adminMonitoring.service.js
- upload.js
- coachPlan.service.js
- ExerciseBriefing.jsx
- admin.service.js
- workoutRecommender.js
- owner.js
- migrations.test.js
- ForgotPasswordModal.jsx
- DayTracker.jsx
- goalLabel
- piece-count.test.js
- AdminAccess.jsx
- app.js
- sms-verification.test.js
- progress.controller.js
- HistoryTab.jsx
- compilerOptions
- package.json
- CameraWorkout.jsx
- goals.service.js
- trainingPrefs.service.js
- AdminAiUsage.jsx
- scripts
- account-validation.test.js
- MealTracker.jsx
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
- src/components/index.js
- ActivityMap/components/index.js
- reminder.service.js
- main.jsx
- settings.controller.js
- food-traits.test.js
- messenger.service.js
- email.service.js
- ref_fs
- AdminOverview.jsx
- migrate.js
- Topbar.jsx
- apiClient.js
- RoutinePlayer.jsx
- generate-endpoint-manifest.js
- password-policy.test.js
- forgotpassword.routes.js
- express
- ExerciseLibrary.jsx
- sms-verification.test.js
- email-verification.test.js
- accessGroups.service.js
- security.controller.js
- Sidebar.jsx
- workoutLogs.service.js
- progression.service.js
- run-tests.js
- Preferences.jsx
- bmi.js
- controllers/README.md
- CommunityFeed.jsx
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- energy.service.js
- VITALIS — AI Integration and Technical Justification
- brevo-transport.test.js
- goal-activity-carry.test.js
- backend/.prettierrc.json
- DashboardWidgets.jsx
- foodImage.service.js
- mapAdapter.js
- exportTable.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- AdminAccess.jsx
- .prettierrc.json
- lib/progression.js
- ActivityMap.jsx
- forgotpassword.routes.js
- reminderScheduler.js
- backend/tests/unit/progression.test.js
- AdminAiUsage.jsx
- StreakJourney.jsx
- Migrations — Vitalis (one table per file)
- security.test.js
- Verification email delivery status
- utils/nutrition.js
- ProgressOverviewChart.jsx
- fuzzy-name.test.js
- routes/index.js
- dashboard.service.js
- rateLimits.js
- goals.controller.js
- sms.service.js
- errors.js
- email-delivery.test.js
- res
- plans-personal.test.js
- public.service.js
- build-database-sql.js
- useProfileWarnings.js
- Database Migrations — Vitalis (ALTER-based)
- endpoint-inventory.test.js
- password-login-compat.test.js
- config/db.js
- vercel.json
- copy-mediapipe.mjs
- community.controller.js
- nutrientGoals.controller.js
- usePoseEngine.js
- lib/fuzzyName.js
- filipino/README.md
- utils/goalSetup.js
- ai-privacy.test.js
- LoadingState.jsx
- useProfileWarnings.js
- accessGroups.controller.js
- WeekCalendarCard.jsx
- upload-formats.test.js
- streaks.test.js
- eval-filipino-scans.js
- VitalisMap.jsx
- workout-history-pagination.test.js
- goal-date-carry.test.js
- macro-coach.test.js
- StatsTab.jsx
- lazyWithReload.js
- unit/health.test.js
- StatsPanel.jsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 267 edges
2. `react` - 159 edges
3. `AppError` - 96 edges
4. `apiGet()` - 76 edges
5. `useAuth()` - 74 edges
6. `apiPost()` - 74 edges
7. `apiFetch()` - 53 edges
8. `react-router-dom` - 49 edges
9. `Modal()` - 48 edges
10. `Dashboard()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `1. What the AI does in VITALIS` --references--> `suggestPlanForMeal()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `Backend (Jest + Supertest)` --references--> `requireMember()`  [INFERRED]
  README.md → backend/src/middleware/verifyUser.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js

## Import Cycles
- None detected.

## Communities (183 total, 15 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "ChangeGoalModal.jsx"
Cohesion: 0.19
Nodes (15): EQUIPMENT_ICONS, LOCATIONS, MINS_PRESETS, checkTargetDate(), cleanExtraGoals(), EXCLUSION_CATEGORIES, EXPERIENCE_LEVELS, extraGoalBlockReason() (+7 more)

### Community 2 - "CameraWorkout.jsx"
Cohesion: 0.14
Nodes (23): CorrectionBanner(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), EarlyExitDialog(), ExerciseChoiceModal(), formStatus(), MobileWorkoutPills() (+15 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.06
Nodes (56): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS (+48 more)

### Community 6 - "Log.jsx"
Cohesion: 0.10
Nodes (40): YearlyBmi(), downloadTextFile(), ExportTab(), STATUS, SummaryInsights(), SummaryStats(), Trend(), BodyTab() (+32 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.10
Nodes (26): app, bcrypt, jwt, registered, request, app, request, app (+18 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (46): author, dependencies, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1, google-auth-library@^10.6.2 (+38 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.12
Nodes (22): COOLDOWN_MOVES, WARMUP_MOVES, CONFIG, dayRegions(), dose(), EXCLUSION_KEYS, firstStrengthExercise(), isRestDay() (+14 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "apiClient.js"
Cohesion: 0.11
Nodes (34): TONE, formatTime(), useActivityApi(), CheckEmail(), useWorkoutSession(), useCoachWeek(), AdaptiveTipsCard(), TabBar() (+26 more)

### Community 12 - "Icon"
Cohesion: 0.18
Nodes (13): Icon(), COPY, CameraToggleButton(), NeuralStatusCard(), RightPanel(), SessionBottomBar(), SessionHeader(), SessionLog() (+5 more)

### Community 13 - "Explore.jsx"
Cohesion: 0.14
Nodes (22): ContinueTrainingCard(), Explore(), GoalPlansPanel(), GoalLinkBanner(), humanizeGoalType(), MyPlans(), PlanDetailOverlay(), FilterPill() (+14 more)

### Community 14 - "ScanResult.jsx"
Cohesion: 0.06
Nodes (65): resolveAssetUrl(), Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips() (+57 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.07
Nodes (39): App(), AppProviders(), AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+31 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.18
Nodes (10): aiQuota(), coachRouteLimiter, express, router, weekLimiter, analyzeUpload, express, mealUpload (+2 more)

### Community 17 - "progress.service.js"
Cohesion: 0.06
Nodes (63): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+55 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.10
Nodes (20): changeEmailSchema, changePasswordSchema, getverifyEmail(), googleLoginSchema, jwt, loginIpLimiter, loginSchema, notifyNewDevice() (+12 more)

### Community 19 - "auth.service.js"
Cohesion: 0.14
Nodes (23): bcrypt, checkRateLimit(), clearAttempts(), crypto, deactivateAccount(), getMe(), getRateLimit(), googleClient (+15 more)

### Community 20 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 21 - "ai.service.js"
Cohesion: 0.11
Nodes (26): aiConfigured(), getVisionModels(), safeParseAI(), aiSummary(), analyzePose(), buildNutritionSection(), buildProjection(), buildRuleSummary() (+18 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.11
Nodes (20): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100() (+12 more)

### Community 23 - "goalSelection.js"
Cohesion: 0.22
Nodes (17): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+9 more)

### Community 24 - "AppError"
Cohesion: 0.13
Nodes (30): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+22 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/node@^26.6.5, @types/react@^19.2.14 (+9 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.08
Nodes (35): activityLabel(), GOAL_TYPES, VARIANTS, useAvatar(), GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone() (+27 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "frontend/package.json"
Cohesion: 0.07
Nodes (38): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, maplibre-gl@^6.19.0 (+30 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.31
Nodes (9): sendPasswordResetOtpEmail(), checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), requestResetCode() (+1 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.10
Nodes (15): assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach }, assert (+7 more)

### Community 32 - "geo.js"
Cohesion: 0.14
Nodes (17): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), createGpsTrack(), DEFAULT_GATES, deg2rad() (+9 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.11
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.12
Nodes (31): GOOGLE_CLIENT_ID, applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeProvider(), AdminBottomNav(), ADMIN_NAV (+23 more)

### Community 35 - "activity.service.js"
Cohesion: 0.14
Nodes (19): downsampleRoute(), getActivityById(), getAllForUser(), getDetail(), getStats(), isPlausibleActivity(), paceFor(), resolveCalories() (+11 more)

### Community 36 - "filipinoDishes.js"
Cohesion: 0.23
Nodes (16): cleanName(), normalizedConfidence(), REVIEW_REASONS, reviewDish(), ALIAS_INDEX, BY_KEY, DISHES, findDish() (+8 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.12
Nodes (20): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), getDayRoutine(), INTENSITY_OPTIONS, patchPlanId() (+12 more)

### Community 38 - "react"
Cohesion: 0.09
Nodes (36): LogActivityModal(), Button(), ConfirmDialog(), Dropdown(), Input(), Modal(), SIZES, CSSProperties (+28 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.13
Nodes (21): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore(), compressImageBuffer() (+13 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "ExerciseBriefing.jsx"
Cohesion: 0.14
Nodes (22): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+14 more)

### Community 43 - "admin.service.js"
Cohesion: 0.19
Nodes (13): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+5 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.09
Nodes (22): EXCLUSION_CATEGORIES, EXERCISES, getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF (+14 more)

### Community 45 - "owner.js"
Cohesion: 0.09
Nodes (22): express, router, write, express, router, write, express, router (+14 more)

### Community 46 - "migrations.test.js"
Cohesion: 0.12
Nodes (11): assert, { describe, it }, dir, EXPECTED, fs, path, assert, conn (+3 more)

### Community 47 - "ForgotPasswordModal.jsx"
Cohesion: 0.06
Nodes (57): ENV_ERROR, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, PasswordChecklist(), ErrorBox(), ForgotPassword() (+49 more)

### Community 48 - "DayTracker.jsx"
Cohesion: 0.19
Nodes (20): getAllGuideExercises(), DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS, ExerciseGuideModal(), LEVEL, load(), norm() (+12 more)

### Community 49 - "goalLabel"
Cohesion: 0.10
Nodes (23): API_BASE_URL, NotificationStreamContext, NotificationStreamProvider(), ICONS, NotificationProvider(), Toast(), ToastContainer(), useToast() (+15 more)

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminAccess.jsx"
Cohesion: 0.16
Nodes (34): Badge(), Kpi(), MiniStat(), Pager(), SearchField(), StateBlock(), TableSkeleton(), STATUS_META (+26 more)

### Community 52 - "app.js"
Cohesion: 0.09
Nodes (22): app, http, io, { Server }, cookieParser, cors, createApp(), express (+14 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.25
Nodes (12): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+4 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "HistoryTab.jsx"
Cohesion: 0.23
Nodes (18): ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab(), KudosButton(), RouteThumbnail(), RunSummaryOverlay(), activityTitle() (+10 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "CameraWorkout.jsx"
Cohesion: 0.15
Nodes (19): CHOOSER_FILTERS, CHOOSER_GROUPS, CHOOSER_OPTS, BRYL_CREDIT, counterTypeFor(), EXERCISE_TYPE_LABELS, exerciseTypeLabel(), getWorkoutMode() (+11 more)

### Community 59 - "goals.service.js"
Cohesion: 0.16
Nodes (18): ACTIVITY_ALIASES, ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+10 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "AdminAiUsage.jsx"
Cohesion: 0.29
Nodes (9): AdminUsageChart(), compactNumber(), FALLBACK, readPalette(), usePalette(), withAlpha(), WINDOWS, fmtDay() (+1 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 64 - "MealTracker.jsx"
Cohesion: 0.16
Nodes (19): macroCoachMessage(), CameraScanner(), MacroCoachCard(), DailySummaryCard(), formatNumber(), MacroCards(), MACROS, pctOf() (+11 more)

### Community 65 - "validId"
Cohesion: 0.26
Nodes (11): getcontactsUserId(), getfriendsRequests(), getfriendsStatus(), getmessagesUserIdContactId(), postfriendsAccept(), postfriendsAdd(), postfriendsDecline(), postfriendsRequest() (+3 more)

### Community 66 - "MessengerPanel.jsx"
Cohesion: 0.18
Nodes (16): logout(), Conventions, EmptyState(), useNotificationStream(), buildThread(), ContactAvatar(), ContactSkeleton(), dayKeyOf() (+8 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.09
Nodes (33): ActivityDetail(), SleepNote(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, humanizeOption(), PACES (+25 more)

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
Cohesion: 0.11
Nodes (16): authenticate(), clearSessionCookie(), jwt, requireAdmin(), requireRole(), verifyUser(), withAuthenticatedUser(), express (+8 more)

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

### Community 76 - "src/components/index.js"
Cohesion: 0.09
Nodes (25): LANDING_MODULES, AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES (+17 more)

### Community 77 - "ActivityMap/components/index.js"
Cohesion: 0.18
Nodes (16): AccuracyCircle(), GeoJsonLayer(), createMarkerElement(), MapMarker(), ROUTE_LAYOUT, RouteLayer(), RouteReplay(), changeOwners() (+8 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "main.jsx"
Cohesion: 0.11
Nodes (16): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, @react-oauth/google@^0.13.4, installGlobalButtonLoading(), installServiceWorkerUpdate() (+8 more)

### Community 80 - "settings.controller.js"
Cohesion: 0.18
Nodes (5): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (17): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), deliver() (+9 more)

### Community 84 - "ref_fs"
Cohesion: 0.14
Nodes (11): assert, bcrypt, fs, mysql, path, dir, files, fs (+3 more)

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.16
Nodes (23): Panel(), AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL (+15 more)

### Community 86 - "migrate.js"
Cohesion: 0.20
Nodes (11): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+3 more)

### Community 87 - "Topbar.jsx"
Cohesion: 0.13
Nodes (29): getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile(), Topbar(), WarningBadge(), getSettingsItems(), NotificationCard() (+21 more)

### Community 88 - "apiClient.js"
Cohesion: 0.14
Nodes (23): EMPTY, round1(), todayKey(), useTodayMeals(), apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity(), apiSaveFoodLog() (+15 more)

### Community 89 - "RoutinePlayer.jsx"
Cohesion: 0.35
Nodes (11): RoutineCard(), RoutinePlayer(), PlanDayRoutine(), useDayRoutine(), buildSteps(), currentSide(), formatDose(), formatSeconds() (+3 more)

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.13
Nodes (12): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+4 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.11
Nodes (20): bcryptjs@^3.0.3, postresetPassword(), changePassword(), syncPasswordHealth(), resetPassword(), bcrypt, checkPassword(), COMMON (+12 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.14
Nodes (14): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+6 more)

### Community 93 - "express"
Cohesion: 0.10
Nodes (18): writeLimiter(), express, read, router, express, router, write, express (+10 more)

### Community 94 - "ExerciseLibrary.jsx"
Cohesion: 0.47
Nodes (7): useUrlFilters(), fromSlug(), readFilters(), toSlug(), writeFilters(), CONFIG, EQUIPMENT

### Community 95 - "sms-verification.test.js"
Cohesion: 0.19
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 96 - "email-verification.test.js"
Cohesion: 0.07
Nodes (29): jsonwebtoken@^9.0.3, signSession(), verifySession(), getme(), postDeactivate(), postlogout(), getSessionFromSocket(), getUserIdFromSocket() (+21 more)

### Community 97 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (9): get(), logUserSession(), UAParser, getCookieOptions(), ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert (+1 more)

### Community 99 - "Sidebar.jsx"
Cohesion: 0.22
Nodes (16): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), LogoutConfirmDialog(), ADMIN_GROUPS, AdminRow(), AdminSidebar() (+8 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (14): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), recordCalories() (+6 more)

### Community 101 - "progression.service.js"
Cohesion: 0.19
Nodes (19): BY_KEY, CHALLENGES, getChallenge(), getPlansForUser(), assertCanStartPlan(), challengeView(), collectStats(), completeChallenge() (+11 more)

### Community 102 - "run-tests.js"
Cohesion: 0.19
Nodes (14): allTestFiles(), BACKEND, childEnv(), fs, globToRegExp(), JEST_BIN, main(), parseArgs() (+6 more)

### Community 103 - "Preferences.jsx"
Cohesion: 0.13
Nodes (20): AccountPageShell(), PageHeader(), FeedbackModal(), ThemeToggle(), VARIANTS, ThemeContext, Community(), SECTIONS (+12 more)

### Community 104 - "bmi.js"
Cohesion: 0.53
Nodes (7): BmiInsight(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange()

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "CommunityFeed.jsx"
Cohesion: 0.18
Nodes (15): ErrorState(), Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES, TAG_ICONS (+7 more)

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
Cohesion: 0.15
Nodes (12): 1. What the AI does in VITALIS, 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls, 4.3 Safety and data minimization, 4. How it is built (reliability and cost controls), 5. Internet connectivity requirements (+4 more)

### Community 111 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 112 - "goal-activity-carry.test.js"
Cohesion: 0.33
Nodes (6): assert, base, change(), dbPath, { describe, it, mock }, mkRes()

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "DashboardWidgets.jsx"
Cohesion: 0.12
Nodes (42): CoachCard(), optionCopy(), STATUS, AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt() (+34 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "mapAdapter.js"
Cohesion: 0.20
Nodes (18): FitRoute(), RecenterButton(), RecenterMap(), useVitalisMap(), ACCURACY_MAX_RADIUS_M, accuracyCircleFeatureCollection(), boundsOf(), EMPTY_FEATURE_COLLECTION (+10 more)

### Community 117 - "exportTable.js"
Cohesion: 0.32
Nodes (11): ExportMenu(), csvCell(), download(), exportCsv(), exportXlsx(), fmtDateText(), normalize(), pad() (+3 more)

### Community 118 - "Dashboard Redesign — Visual Specification (References A & B)"
Cohesion: 0.29
Nodes (6): Audit baseline (before redesign), Dashboard Redesign — Visual Specification (References A & B), Desktop specification (Reference B), Guardrails for implementation, Mobile specification (Reference A), Reference-to-implementation mapping

### Community 119 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, copy:mediapipe, dev, lint, prebuild, predev, preview (+2 more)

### Community 120 - "Vitalis Frontend"
Cohesion: 0.29
Nodes (6): Conventions, Env, Requirements, Setup, Structure, Vitalis Frontend

### Community 121 - "AdminAccess.jsx"
Cohesion: 0.17
Nodes (19): ConfirmDialog(), PageHero(), TOAST_ICONS, useAdminToast(), AdminAccess(), downloadPng(), GroupForm(), PUBLIC_ORIGIN (+11 more)

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "ActivityMap.jsx"
Cohesion: 0.16
Nodes (15): DOT, GpsBadge(), LABELS, LocationNotice(), MapZoomControls(), RunControls(), useRunControls(), useWindowWidth() (+7 more)

### Community 125 - "forgotpassword.routes.js"
Cohesion: 0.08
Nodes (17): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, completeSchema, keySchema, { z }, emailSchema (+9 more)

### Community 127 - "backend/tests/unit/progression.test.js"
Cohesion: 0.13
Nodes (17): activeWeeks(), avg(), evaluate(), INTENSITY_LEVEL, LEVELS, requirementsFor(), round1(), weekIndex() (+9 more)

### Community 128 - "AdminAiUsage.jsx"
Cohesion: 0.33
Nodes (9): useAdminFilters(), ADMIN_FILTERS, normalize(), page, readAdminFilters(), windowDays, writeAdminFilters(), change() (+1 more)

### Community 129 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "security.test.js"
Cohesion: 0.38
Nodes (5): app, request, assertNoSensitiveFields(), assertNoStackTrace(), SENSITIVE_KEYS

### Community 134 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 135 - "ProgressOverviewChart.jsx"
Cohesion: 0.19
Nodes (14): BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum(), fmtShortDate(), fmtValue() (+6 more)

### Community 137 - "fuzzy-name.test.js"
Cohesion: 0.30
Nodes (12): searchUsers(), allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore() (+4 more)

### Community 138 - "routes/index.js"
Cohesion: 0.18
Nodes (9): requireMember(), aiRouteLimiter, aiSummaryLimiter, express, router, express, router, express (+1 more)

### Community 139 - "dashboard.service.js"
Cohesion: 0.17
Nodes (12): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), EMPTY_BURN, logDailyStats(), dayKeys() (+4 more)

### Community 140 - "rateLimits.js"
Cohesion: 0.09
Nodes (29): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+21 more)

### Community 141 - "goals.controller.js"
Cohesion: 0.17
Nodes (8): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), parseExperience(), parseSecondaryGoals()

### Community 142 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 143 - "errors.js"
Cohesion: 0.20
Nodes (5): updatePhone(), assertMode(), buildTips(), collectStats(), getInsights()

### Community 144 - "email-delivery.test.js"
Cohesion: 0.11
Nodes (14): crypto, changeEmail(), createVerificationToken(), resendVerification(), sendVerificationEmail(), jwt, normalizeId(), record() (+6 more)

### Community 146 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 147 - "public.service.js"
Cohesion: 0.24
Nodes (7): cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 148 - "build-database-sql.js"
Cohesion: 0.21
Nodes (11): addMissingColumns(), conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql (+3 more)

### Community 149 - "useProfileWarnings.js"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

### Community 150 - "Database Migrations — Vitalis (ALTER-based)"
Cohesion: 0.20
Nodes (9): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+1 more)

### Community 151 - "endpoint-inventory.test.js"
Cohesion: 0.12
Nodes (13): collect(), { execSync }, files, fs, path, agent(), app, { execFileSync } (+5 more)

### Community 152 - "password-login-compat.test.js"
Cohesion: 0.22
Nodes (5): assert, bcrypt, dbPath, { describe, it, beforeEach }, servicePath

### Community 153 - "config/db.js"
Cohesion: 0.25
Nodes (4): isAivenHost, mysql, pool, sslFlag

### Community 156 - "copy-mediapipe.mjs"
Cohesion: 0.14
Nodes (8): files, out, outRoot, root, SKIP, src, { version }, html

### Community 157 - "community.controller.js"
Cohesion: 0.15
Nodes (10): addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema, listComments(), paginationSchema, remove(), toggleLike() (+2 more)

### Community 159 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 160 - "lib/fuzzyName.js"
Cohesion: 0.42
Nodes (9): allowedTypos(), editDistance(), isTightSubsequence(), normalize(), rankByName(), scoreName(), tokenScore(), names() (+1 more)

### Community 162 - "utils/goalSetup.js"
Cohesion: 0.33
Nodes (9): checkTargetDate(), EXPERIENCE_LEVELS, GOAL_KEYS, isoDay(), LABEL, safeWeeklyRate(), startOfUtcDay(), targetFeasibility() (+1 more)

### Community 166 - "ai-privacy.test.js"
Cohesion: 0.22
Nodes (8): assert, { describe, it }, end, fs, path, personalize, src, start

### Community 167 - "LoadingState.jsx"
Cohesion: 0.36
Nodes (5): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute()

### Community 168 - "useProfileWarnings.js"
Cohesion: 0.36
Nodes (5): _cache, getCached(), setCached(), useProfileWarnings(), collectProfileIssues()

### Community 169 - "accessGroups.controller.js"
Cohesion: 0.36
Nodes (4): deleteOne(), getMembers(), idParam(), patchUpdate()

### Community 171 - "WeekCalendarCard.jsx"
Cohesion: 0.46
Nodes (7): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS

### Community 172 - "upload-formats.test.js"
Cohesion: 0.29
Nodes (6): sharp@^0.35.5, assert, { describe, it }, file(), sharp, sharp

### Community 173 - "streaks.test.js"
Cohesion: 0.29
Nodes (5): assert, dbPath, { describe, it, beforeEach }, fakeDb, scenario

### Community 174 - "eval-filipino-scans.js"
Cohesion: 0.22
Nodes (10): fs, main(), path, DIR, evaluate(), fs, main(), parse() (+2 more)

### Community 175 - "VitalisMap.jsx"
Cohesion: 0.43
Nodes (6): FALLBACK_CENTER, VitalisMap(), markMapRemoved(), VitalisMapContext, carryOverVitalisLayers(), mapStyleUrl()

### Community 176 - "workout-history-pagination.test.js"
Cohesion: 0.33
Nodes (3): parseHistoryQuery(), assert, { describe, it }

### Community 177 - "goal-date-carry.test.js"
Cohesion: 0.33
Nodes (3): assert, dbPath, { describe, it, mock }

### Community 178 - "macro-coach.test.js"
Cohesion: 0.33
Nodes (5): assert, { describe, it, before, after }, gemini, geminiPath, PLANS

### Community 179 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 180 - "lazyWithReload.js"
Cohesion: 0.60
Nodes (4): installChunkErrorRecovery(), isChunkLoadError(), lazyWithReload(), reloadForNewBuild()

### Community 181 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

### Community 182 - "StatsPanel.jsx"
Cohesion: 0.70
Nodes (4): paceToSeconds(), SplitRows(), StatsPanel(), StatusPill()

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `useAuth.jsx` to `AdminAiUsage.jsx`, `CameraWorkout.jsx`, `Log.jsx`, `Landing.jsx`, `apiClient.js`, `AppRoutes.jsx`, `Profile.jsx`, `frontend/package.json`, `react`, `LoadingState.jsx`, `ForgotPasswordModal.jsx`, `DayTracker.jsx`, `goalLabel`, `CameraWorkout.jsx`, `MealTracker.jsx`, `Onboarding.jsx`, `src/components/index.js`, `main.jsx`, `AdminOverview.jsx`, `Topbar.jsx`, `ExerciseLibrary.jsx`, `Sidebar.jsx`, `Preferences.jsx`, `DashboardWidgets.jsx`, `lib/progression.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `CameraWorkout.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `WebcamFeed.jsx`, `StreakJourney.jsx`, `CameraWorkout.jsx`, `ChangeGoalModal.jsx`, `Log.jsx`, `ProgressOverviewChart.jsx`, `Landing.jsx`, `apiClient.js`, `Icon`, `Explore.jsx`, `ScanResult.jsx`, `AppRoutes.jsx`, `goalSelection.js`, `Profile.jsx`, `frontend/package.json`, `usePoseEngine.js`, `geo.js`, `useAuth.jsx`, `useProfileWarnings.js`, `ExerciseBriefing.jsx`, `WeekCalendarCard.jsx`, `VitalisMap.jsx`, `ForgotPasswordModal.jsx`, `goalLabel`, `DayTracker.jsx`, `AdminAccess.jsx`, `StatsTab.jsx`, `lazyWithReload.js`, `StatsPanel.jsx`, `HistoryTab.jsx`, `CameraWorkout.jsx`, `AdminAiUsage.jsx`, `MealTracker.jsx`, `MessengerPanel.jsx`, `Onboarding.jsx`, `src/components/index.js`, `ActivityMap/components/index.js`, `main.jsx`, `AdminOverview.jsx`, `Topbar.jsx`, `apiClient.js`, `RoutinePlayer.jsx`, `ExerciseLibrary.jsx`, `Sidebar.jsx`, `Preferences.jsx`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `mapAdapter.js`, `exportTable.js`, `AdminAccess.jsx`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `StreakJourney.jsx`, `CameraWorkout.jsx`, `ChangeGoalModal.jsx`, `Log.jsx`, `ProgressOverviewChart.jsx`, `apiClient.js`, `Explore.jsx`, `ScanResult.jsx`, `AppRoutes.jsx`, `goalSelection.js`, `useAuth.jsx`, `react`, `ExerciseBriefing.jsx`, `WeekCalendarCard.jsx`, `VitalisMap.jsx`, `DayTracker.jsx`, `goalLabel`, `ForgotPasswordModal.jsx`, `AdminAccess.jsx`, `StatsTab.jsx`, `StatsPanel.jsx`, `HistoryTab.jsx`, `CameraWorkout.jsx`, `AdminAiUsage.jsx`, `MealTracker.jsx`, `Onboarding.jsx`, `src/components/index.js`, `AdminOverview.jsx`, `Topbar.jsx`, `RoutinePlayer.jsx`, `Sidebar.jsx`, `Preferences.jsx`, `bmi.js`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `mapAdapter.js`, `exportTable.js`, `AdminAccess.jsx`, `lib/progression.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06246799795186892 - nodes in this community are weakly interconnected._
- **Should `admin.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._