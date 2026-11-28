# Graph Report - vitalisapp  (2026-11-28)

## Corpus Check
- 697 files · ~474,645 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3779 nodes · 9581 edges · 177 communities (161 shown, 16 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 723 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da9478c9`
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
- dependencies
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
- MealTrackerQuickLog.jsx
- admin.service.js
- workoutRecommender.js
- owner.js
- ai-privacy.test.js
- ForgotPasswordModal.jsx
- DayTracker.jsx
- useToastStore
- piece-count.test.js
- AdminAccess.jsx
- app.js
- sms-verification.test.js
- progress.controller.js
- HistoryTab.jsx
- compilerOptions
- package.json
- warmup-recommender.test.js
- goals.service.js
- trainingPrefs.service.js
- auth-api.test.js
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
- react-router-dom
- supertest
- food-traits.test.js
- messenger.service.js
- email.service.js
- ref_fs
- AdminOverview.jsx
- migrate.js
- Topbar.jsx
- MacroCoachCard.jsx
- cookies.js
- generate-endpoint-manifest.js
- password-policy.test.js
- forgotpassword.routes.js
- express
- foodInfo.test.js
- sms-verification.test.js
- email-verification.test.js
- accessGroups.service.js
- security.controller.js
- Topbar.jsx
- workoutLogs.service.js
- progression.service.js
- run-tests.js
- Preferences.jsx
- bmi.js
- controllers/README.md
- BodyMeasurementsPanel.jsx
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
- AddWorkoutModal.jsx
- .prettierrc.json
- lib/progression.js
- ActivityMap.jsx
- forgotpassword.routes.js
- reminderScheduler.js
- backend/tests/unit/progression.test.js
- AdminMonitoring.jsx
- StreakJourney.jsx
- Migrations — Vitalis (one table per file)
- security.test.js
- Verification email delivery status
- trainingPrefs.controller.js
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
- Database Migrations — Vitalis (ALTER-based)
- endpoint-inventory.test.js
- password-login-compat.test.js
- config/db.js
- vercel.json
- useProfile.js
- CoachCard.jsx
- src/config/env.js
- admin.routes.js
- Toast.jsx
- filipino/README.md
- @fontsource/bebas-neue
- react-chartjs-2
- write-excel-file
- useProfileWarnings.js
- WeekCalendarCard.jsx
- sql-quotes.test.js
- streaks.test.js
- VitalisMap.jsx
- StatsTab.jsx
- lazyWithReload.js
- StatsPanel.jsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 267 edges
2. `react` - 159 edges
3. `AppError` - 96 edges
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

## Communities (177 total, 16 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "ChangeGoalModal.jsx"
Cohesion: 0.16
Nodes (19): GoalDetailSheet(), goalIcon(), goalLabel(), EQUIPMENT_ICONS, LOCATIONS, MINS_PRESETS, ChangeGoalModal(), checkTargetDate() (+11 more)

### Community 2 - "CameraWorkout.jsx"
Cohesion: 0.05
Nodes (72): Dropdown(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), EarlyExitDialog(), ExerciseBriefing(), loadGuide(), METHOD (+64 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.06
Nodes (57): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS (+49 more)

### Community 6 - "Log.jsx"
Cohesion: 0.07
Nodes (54): YearlyBmi(), downloadTextFile(), ExportTab(), BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange() (+46 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.11
Nodes (19): app, request, app, request, app, request, app, request (+11 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (43): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+35 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.20
Nodes (14): CONFIG, dayRegions(), dose(), EXCLUSION_KEYS, firstStrengthExercise(), isRestDay(), KEYWORD_REGIONS, LEVELS (+6 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "apiClient.js"
Cohesion: 0.12
Nodes (27): useWorkoutSession(), AdaptiveTipsCard(), TabBar(), TrainingPrefsSheet(), formatDuration(), historyDayKey(), historyDayLabel(), prettyExercise() (+19 more)

### Community 12 - "Icon"
Cohesion: 0.11
Nodes (27): Icon(), NetworkStatus(), ConfirmDialog(), CameraToggleButton(), CorrectionBanner(), NeuralStatusCard(), RightPanel(), SessionBottomBar() (+19 more)

### Community 13 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, chart.js@^4.5.1, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, framer-motion@^12.40.0, maplibre-gl@^6.19.0, material-symbols@^0.44.0 (+18 more)

### Community 14 - "ScanResult.jsx"
Cohesion: 0.11
Nodes (39): asItem(), EXTRA, FIELDS, NumberField(), ScanItemEditor(), toDraft(), withValues(), cleanFoodName() (+31 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (45): AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent, AdminMonitoring, AdminOverview (+37 more)

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
Cohesion: 0.13
Nodes (28): bcrypt, changeEmail(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+20 more)

### Community 20 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 21 - "ai.service.js"
Cohesion: 0.11
Nodes (26): aiConfigured(), getVisionModels(), safeParseAI(), aiSummary(), analyzePose(), buildNutritionSection(), buildProjection(), buildRuleSummary() (+18 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.09
Nodes (34): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100() (+26 more)

### Community 23 - "goalSelection.js"
Cohesion: 0.23
Nodes (17): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+9 more)

### Community 24 - "AppError"
Cohesion: 0.13
Nodes (30): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+22 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/node@^26.6.5, @types/react@^19.2.14 (+9 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.12
Nodes (25): activityLabel(), useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR(), ChangeGoalModal, ChangePasswordModal (+17 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "frontend/package.json"
Cohesion: 0.11
Nodes (17): browserslist, @bryllim/workout-guide@^1.0.0, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, @mediapipe/pose@0.5.1675469404, react-webcam@^7.2.0, socket.io-client@^4.8.3, name (+9 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.31
Nodes (9): sendPasswordResetOtpEmail(), checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), requestResetCode() (+1 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.07
Nodes (24): parseHistoryQuery(), asyncHandler(), assert, { describe, it }, assert, { describe, it }, plan, assert (+16 more)

### Community 32 - "geo.js"
Cohesion: 0.14
Nodes (17): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), createGpsTrack(), DEFAULT_GATES, deg2rad() (+9 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.11
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.10
Nodes (27): App(), API_BASE_URL, ENV_ERROR, AppProviders(), ErrorBoundary, NotificationStreamContext, NotificationStreamProvider(), applyRootTheme() (+19 more)

### Community 35 - "activity.service.js"
Cohesion: 0.14
Nodes (19): downsampleRoute(), getActivityById(), getAllForUser(), getDetail(), getStats(), isPlausibleActivity(), paceFor(), resolveCalories() (+11 more)

### Community 36 - "filipinoDishes.js"
Cohesion: 0.16
Nodes (22): DIR, evaluate(), fs, main(), parse(), path, cleanName(), normalizedConfidence() (+14 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.05
Nodes (33): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS (+25 more)

### Community 38 - "react"
Cohesion: 0.09
Nodes (35): FeedbackModal(), LogActivityModal(), Button(), Input(), Modal(), SIZES, CSSProperties, react (+27 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.11
Nodes (26): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore(), compressImageBase64() (+18 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "MealTrackerQuickLog.jsx"
Cohesion: 0.27
Nodes (12): Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips(), ManualMealForm() (+4 more)

### Community 43 - "admin.service.js"
Cohesion: 0.19
Nodes (13): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+5 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.17
Nodes (15): availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF, exercisesPerSession(), FALLBACK, humanGoal() (+7 more)

### Community 45 - "owner.js"
Cohesion: 0.08
Nodes (26): writeLimiter(), express, router, write, express, router, write, express (+18 more)

### Community 46 - "ai-privacy.test.js"
Cohesion: 0.05
Nodes (27): assert, { describe, it }, end, fs, path, personalize, src, start (+19 more)

### Community 47 - "ForgotPasswordModal.jsx"
Cohesion: 0.11
Nodes (28): PasswordChecklist(), ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn() (+20 more)

### Community 48 - "DayTracker.jsx"
Cohesion: 0.09
Nodes (41): RoutineCard(), RoutinePlayer(), getAllGuideExercises(), DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS, ExerciseGuideModal(), LEVEL (+33 more)

### Community 49 - "useToastStore"
Cohesion: 0.31
Nodes (8): ICONS, NotificationProvider(), Toast(), ToastContainer(), useToast(), timers, useNotification(), useToastStore

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminAccess.jsx"
Cohesion: 0.15
Nodes (44): Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel(), StateBlock() (+36 more)

### Community 52 - "app.js"
Cohesion: 0.14
Nodes (15): app, http, io, { Server }, cookieParser, cors, createApp(), express (+7 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.23
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

### Community 58 - "warmup-recommender.test.js"
Cohesion: 0.18
Nodes (10): EXCLUSION_CATEGORIES, EXERCISES, COOLDOWN_MOVES, WARMUP_MOVES, assert, byKey, CARDIO, { describe, it } (+2 more)

### Community 59 - "goals.service.js"
Cohesion: 0.16
Nodes (18): ACTIVITY_ALIASES, ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+10 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "auth-api.test.js"
Cohesion: 0.21
Nodes (11): jsonwebtoken@^9.0.3, app, bcrypt, jwt, registered, request, cookieName(), jwt (+3 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "account-validation.test.js"
Cohesion: 0.16
Nodes (8): VALID_GENDERS, makeCode(), ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 64 - "MealTracker.jsx"
Cohesion: 0.12
Nodes (29): CameraScanner(), DailySummaryCard(), formatNumber(), MacroCards(), MACROS, pctOf(), apiAnalyzeFoodImage(), apiDeleteFoodLog() (+21 more)

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "MessengerPanel.jsx"
Cohesion: 0.07
Nodes (46): logout(), Build, Conventions, Frontend Architecture — Vitalis, Principles, Related, State, Structure (+38 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.10
Nodes (32): ActivityDetail(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, humanizeOption(), PACES, ALLERGEN_PRESETS (+24 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "planEngine.js"
Cohesion: 0.12
Nodes (22): summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance(), ACTIVITY_FACTORS (+14 more)

### Community 70 - "taskNotifications.js"
Cohesion: 0.33
Nodes (8): activityMessage(), fmtMinutes(), MEASURE_LABELS, measurementMessage(), plural(), round1(), weighInMessage(), workoutMessage()

### Community 71 - "verifyUser.js"
Cohesion: 0.11
Nodes (19): authenticate(), clearSessionCookie(), jwt, requireAdmin(), requireRole(), verifyUser(), withAuthenticatedUser(), express (+11 more)

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
Nodes (28): LANDING_MODULES, AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES (+20 more)

### Community 77 - "ActivityMap/components/index.js"
Cohesion: 0.17
Nodes (15): AccuracyCircle(), GeoJsonLayer(), COPY, createMarkerElement(), MapMarker(), MapZoomControls(), RecenterButton(), changeOwners() (+7 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "react-router-dom"
Cohesion: 0.07
Nodes (42): GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, useLogin(), Login(), AcknowledgeFooter(), LegalCenterModal() (+34 more)

### Community 80 - "supertest"
Cohesion: 0.17
Nodes (11): devDependencies, jest@^30.5.2, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, assert, { describe, it } (+3 more)

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "messenger.service.js"
Cohesion: 0.09
Nodes (10): createMessage(), FRIEND_STATUSES, getMessagesBetween(), getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), toWireMessage() (+2 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (17): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), deliver() (+9 more)

### Community 84 - "ref_fs"
Cohesion: 0.18
Nodes (8): fs, main(), path, assert, bcrypt, fs, mysql, path

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.11
Nodes (32): AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL, AdminUsageChart() (+24 more)

### Community 86 - "migrate.js"
Cohesion: 0.20
Nodes (11): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+3 more)

### Community 87 - "Topbar.jsx"
Cohesion: 0.13
Nodes (29): NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime(), getCategory() (+21 more)

### Community 88 - "MacroCoachCard.jsx"
Cohesion: 0.31
Nodes (7): EMPTY, round1(), todayKey(), useTodayMeals(), macroCoachMessage(), MacroCoachCard(), useActiveGoal()

### Community 89 - "cookies.js"
Cohesion: 0.33
Nodes (8): verifySession(), getme(), postDeactivate(), postlogout(), baseCookieOptions(), getClearCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.13
Nodes (12): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+4 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.12
Nodes (18): postresetPassword(), changePassword(), syncPasswordHealth(), resetPassword(), bcrypt, checkPassword(), COMMON, hashPassword() (+10 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.14
Nodes (14): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+6 more)

### Community 93 - "express"
Cohesion: 0.14
Nodes (11): express, router, express, landingLimiter, router, visitLimiter, express, router (+3 more)

### Community 94 - "foodInfo.test.js"
Cohesion: 0.47
Nodes (7): SugarSodiumCard(), goalIntakeNote(), LIMITS, limitStatus(), num(), status(), sugarSodiumTotals()

### Community 95 - "sms-verification.test.js"
Cohesion: 0.19
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 96 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 97 - "accessGroups.service.js"
Cohesion: 0.24
Nodes (17): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), members() (+9 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "Topbar.jsx"
Cohesion: 0.15
Nodes (22): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile() (+14 more)

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
Cohesion: 0.15
Nodes (18): AccountPageShell(), PageHeader(), ThemeToggle(), VARIANTS, FAQS, HelpSupport(), URL_FILTERS, hourLabel() (+10 more)

### Community 104 - "bmi.js"
Cohesion: 0.30
Nodes (10): BmiInsight(), SleepNote(), TONE, BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy() (+2 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "BodyMeasurementsPanel.jsx"
Cohesion: 0.22
Nodes (14): resolveAssetUrl(), ErrorState(), BodyMeasurementsPanel(), EMPTY(), FIELDS, todayKey(), WeightSummary(), DiarySkeleton() (+6 more)

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.18
Nodes (10): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+2 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "energy.service.js"
Cohesion: 0.17
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
Cohesion: 0.14
Nodes (38): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+30 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "mapAdapter.js"
Cohesion: 0.16
Nodes (20): FitRoute(), ROUTE_LAYOUT, RouteLayer(), ACCURACY_LAYERS, ACCURACY_MAX_RADIUS_M, accuracyCircleFeatureCollection(), boundsOf(), EMPTY_FEATURE_COLLECTION (+12 more)

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

### Community 121 - "AddWorkoutModal.jsx"
Cohesion: 0.36
Nodes (7): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "ActivityMap.jsx"
Cohesion: 0.17
Nodes (16): DOT, GpsBadge(), LABELS, LocationNotice(), RecenterMap(), RouteReplay(), RunAnalysisOverlay(), RunControls() (+8 more)

### Community 125 - "forgotpassword.routes.js"
Cohesion: 0.20
Nodes (9): emailSchema, express, otpSendLimiter, otpVerifyLimiter, passwordResetLimiter, resetSchema, router, verifySchema (+1 more)

### Community 127 - "backend/tests/unit/progression.test.js"
Cohesion: 0.13
Nodes (17): activeWeeks(), avg(), evaluate(), INTENSITY_LEVEL, LEVELS, requirementsFor(), round1(), weekIndex() (+9 more)

### Community 128 - "AdminMonitoring.jsx"
Cohesion: 0.17
Nodes (19): SearchField(), STATUS_META, StatusDot(), useAdminFilters(), AdminMonitoring(), daysLabel(), EXPORT_COLUMNS, FLAG_GROUPS (+11 more)

### Community 129 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "security.test.js"
Cohesion: 0.38
Nodes (5): app, request, assertNoSensitiveFields(), assertNoStackTrace(), SENSITIVE_KEYS

### Community 134 - "trainingPrefs.controller.js"
Cohesion: 0.29
Nodes (3): getExerciseGuide(), exerciseGuide(), EXPERIENCE_LEVELS

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
Cohesion: 0.13
Nodes (23): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+15 more)

### Community 141 - "goal-personalization.test.js"
Cohesion: 0.08
Nodes (22): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+14 more)

### Community 142 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 143 - "errors.js"
Cohesion: 0.15
Nodes (7): updatePhone(), assertMode(), buildTips(), collectStats(), getInsights(), assert, { describe, it }

### Community 144 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (9): crypto, jwt, normalizeId(), record(), assert, dbPath, { it }, jwt (+1 more)

### Community 145 - "auth-revocation.test.js"
Cohesion: 0.13
Nodes (9): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, mockRes(), res (+1 more)

### Community 146 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 147 - "public.service.js"
Cohesion: 0.24
Nodes (7): cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 148 - "build-database-sql.js"
Cohesion: 0.21
Nodes (11): addMissingColumns(), conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql (+3 more)

### Community 149 - "create-migration.js"
Cohesion: 0.29
Nodes (6): dir, files, fs, next, path, slug

### Community 150 - "Database Migrations — Vitalis (ALTER-based)"
Cohesion: 0.20
Nodes (9): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+1 more)

### Community 151 - "endpoint-inventory.test.js"
Cohesion: 0.22
Nodes (8): agent(), app, { execFileSync }, fs, manifest, manifestPath, path, request

### Community 152 - "password-login-compat.test.js"
Cohesion: 0.22
Nodes (5): assert, bcrypt, dbPath, { describe, it, beforeEach }, servicePath

### Community 153 - "config/db.js"
Cohesion: 0.25
Nodes (4): isAivenHost, mysql, pool, sslFlag

### Community 156 - "useProfile.js"
Cohesion: 0.43
Nodes (6): GOAL_TYPES, GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile()

### Community 157 - "CoachCard.jsx"
Cohesion: 0.60
Nodes (4): CoachCard(), optionCopy(), STATUS, useCoachWeek()

### Community 158 - "src/config/env.js"
Cohesion: 0.50
Nodes (3): _jwt, missing, required

### Community 159 - "admin.routes.js"
Cohesion: 0.50
Nodes (3): express, read, router

### Community 168 - "useProfileWarnings.js"
Cohesion: 0.36
Nodes (5): _cache, getCached(), setCached(), useProfileWarnings(), collectProfileIssues()

### Community 171 - "WeekCalendarCard.jsx"
Cohesion: 0.28
Nodes (12): formatTime(), useActivityApi(), dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard() (+4 more)

### Community 172 - "sql-quotes.test.js"
Cohesion: 0.22
Nodes (8): assert, { describe, it }, DOUBLE_QUOTED_LITERAL, fs, jsFiles(), path, SRC, file()

### Community 173 - "streaks.test.js"
Cohesion: 0.29
Nodes (5): assert, dbPath, { describe, it, beforeEach }, fakeDb, scenario

### Community 175 - "VitalisMap.jsx"
Cohesion: 0.43
Nodes (6): FALLBACK_CENTER, VitalisMap(), markMapRemoved(), VitalisMapContext, carryOverVitalisLayers(), mapStyleUrl()

### Community 179 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 180 - "lazyWithReload.js"
Cohesion: 0.60
Nodes (4): installChunkErrorRecovery(), isChunkLoadError(), lazyWithReload(), reloadForNewBuild()

### Community 182 - "StatsPanel.jsx"
Cohesion: 0.70
Nodes (4): paceToSeconds(), SplitRows(), StatsPanel(), StatusPill()

## Knowledge Gaps
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `react-router-dom` to `AdminMonitoring.jsx`, `ChangeGoalModal.jsx`, `CameraWorkout.jsx`, `Log.jsx`, `Landing.jsx`, `apiClient.js`, `dependencies`, `AppRoutes.jsx`, `Profile.jsx`, `frontend/package.json`, `useProfile.js`, `react`, `ForgotPasswordModal.jsx`, `DayTracker.jsx`, `MealTracker.jsx`, `Onboarding.jsx`, `src/components/index.js`, `AdminOverview.jsx`, `Topbar.jsx`, `Topbar.jsx`, `Preferences.jsx`, `DashboardWidgets.jsx`, `lib/progression.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `CameraWorkout.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.050102951269732326 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `AdminMonitoring.jsx`, `WebcamFeed.jsx`, `CameraWorkout.jsx`, `ChangeGoalModal.jsx`, `StreakJourney.jsx`, `Log.jsx`, `Landing.jsx`, `apiClient.js`, `Icon`, `dependencies`, `ScanResult.jsx`, `AppRoutes.jsx`, `goalSelection.js`, `Profile.jsx`, `frontend/package.json`, `useProfile.js`, `geo.js`, `Toast.jsx`, `useAuth.jsx`, `useProfileWarnings.js`, `MealTrackerQuickLog.jsx`, `WeekCalendarCard.jsx`, `VitalisMap.jsx`, `DayTracker.jsx`, `useToastStore`, `ForgotPasswordModal.jsx`, `AdminAccess.jsx`, `StatsTab.jsx`, `lazyWithReload.js`, `StatsPanel.jsx`, `HistoryTab.jsx`, `MealTracker.jsx`, `MessengerPanel.jsx`, `Onboarding.jsx`, `src/components/index.js`, `ActivityMap/components/index.js`, `react-router-dom`, `AdminOverview.jsx`, `Topbar.jsx`, `MacroCoachCard.jsx`, `Topbar.jsx`, `Preferences.jsx`, `bmi.js`, `BodyMeasurementsPanel.jsx`, `DashboardWidgets.jsx`, `mapAdapter.js`, `exportTable.js`, `AddWorkoutModal.jsx`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `AdminMonitoring.jsx`, `WebcamFeed.jsx`, `CameraWorkout.jsx`, `StreakJourney.jsx`, `ChangeGoalModal.jsx`, `Log.jsx`, `apiClient.js`, `ScanResult.jsx`, `goalSelection.js`, `CoachCard.jsx`, `react`, `MealTrackerQuickLog.jsx`, `WeekCalendarCard.jsx`, `VitalisMap.jsx`, `DayTracker.jsx`, `useToastStore`, `ForgotPasswordModal.jsx`, `AdminAccess.jsx`, `StatsTab.jsx`, `StatsPanel.jsx`, `HistoryTab.jsx`, `MealTracker.jsx`, `Onboarding.jsx`, `src/components/index.js`, `ActivityMap/components/index.js`, `react-router-dom`, `AdminOverview.jsx`, `Topbar.jsx`, `MacroCoachCard.jsx`, `foodInfo.test.js`, `Topbar.jsx`, `Preferences.jsx`, `bmi.js`, `BodyMeasurementsPanel.jsx`, `DashboardWidgets.jsx`, `exportTable.js`, `lib/progression.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06101190476190476 - nodes in this community are weakly interconnected._
- **Should `admin.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._