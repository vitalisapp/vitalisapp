# Graph Report - vitalisapp  (2026-11-26)

## Corpus Check
- 683 files · ~448,775 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3718 nodes · 9461 edges · 162 communities (149 shown, 13 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 717 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2d642cf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- ChangeGoalModal.jsx
- src/components/index.js
- escapeHtml
- gemini.js
- Log.jsx
- auth-api.test.js
- backend/package.json
- warmupRecommender.js
- Landing.jsx
- react-router-dom
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
- mapAdapter.js
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
- PersonalizationSection.jsx
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
- useAuth
- validId
- apiGet
- Onboarding.jsx
- allergies.service.js
- planEngine.js
- taskNotifications.js
- verifyUser.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- generate-email-assets.js
- routePaths.test.js
- Register.jsx
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
- react
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
- jwt.js
- exportTable.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- check-syntax.js
- .prettierrc.json
- lib/progression.js
- ActivityMap.jsx
- forgotpassword.routes.js
- reminderScheduler.js
- socketHandler.js
- AdminAiUsage.jsx
- StreakJourney.jsx
- Migrations — Vitalis (one table per file)
- supertest
- Verification email delivery status
- cookies.js
- routes/index.js
- dashboard.service.js
- rateLimits.js
- goals.controller.js
- sms.service.js
- errors.js
- email-delivery.test.js
- auth-revocation.test.js
- plans-personal.test.js
- public.service.js
- build-database-sql.js
- useProfileWarnings.js
- Database Migrations — Vitalis (ALTER-based)
- endpoint-inventory.test.js
- password-login-compat.test.js
- config/db.js
- vercel.json
- usePoseEngine.js
- filipino/README.md
- src/config/env.js
- eval-filipino-scans.js

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 269 edges
2. `react` - 158 edges
3. `AppError` - 97 edges
4. `apiGet()` - 76 edges
5. `useAuth()` - 74 edges
6. `apiPost()` - 74 edges
7. `apiFetch()` - 53 edges
8. `Modal()` - 49 edges
9. `react-router-dom` - 49 edges
10. `Dashboard()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `Backend (Jest + Supertest)` --references--> `requireMember()`  [INFERRED]
  README.md → backend/src/middleware/verifyUser.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js

## Import Cycles
- None detected.

## Communities (162 total, 13 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "ChangeGoalModal.jsx"
Cohesion: 0.15
Nodes (21): GoalDetailSheet(), goalIcon(), GOAL_TYPES, goalLabel(), EQUIPMENT_ICONS, LOCATIONS, MINS_PRESETS, ChangeGoalModal() (+13 more)

### Community 2 - "src/components/index.js"
Cohesion: 0.17
Nodes (12): EmptyState(), FeedbackModal(), LogActivityModal(), Input(), FAQS, HelpSupport(), URL_FILTERS, useAccountBasePath() (+4 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.07
Nodes (50): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS (+42 more)

### Community 6 - "Log.jsx"
Cohesion: 0.06
Nodes (59): YearlyBmi(), AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS (+51 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.09
Nodes (28): app, bcrypt, jwt, registered, request, app, request, app (+20 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (46): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+38 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.11
Nodes (24): EXCLUSION_CATEGORIES, EXERCISES, COOLDOWN_MOVES, WARMUP_MOVES, CONFIG, dayRegions(), dose(), EXCLUSION_KEYS (+16 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "react-router-dom"
Cohesion: 0.10
Nodes (29): ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, useLogin(), Login() (+21 more)

### Community 12 - "Icon"
Cohesion: 0.09
Nodes (31): Icon(), COPY, LocationNotice(), RecenterButton(), RunControls(), paceToSeconds(), SplitRows(), StatsPanel() (+23 more)

### Community 13 - "Explore.jsx"
Cohesion: 0.09
Nodes (35): AdaptiveTipsCard(), TIP_ICONS, TIP_STYLES, ContinueTrainingCard(), Explore(), GoalPlansPanel(), GoalLinkBanner(), humanizeGoalType() (+27 more)

### Community 14 - "ScanResult.jsx"
Cohesion: 0.06
Nodes (65): resolveAssetUrl(), Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips() (+57 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (38): App(), AppProviders(), AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+30 more)

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
Cohesion: 0.12
Nodes (28): bcrypt, changeEmail(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+20 more)

### Community 20 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 21 - "ai.service.js"
Cohesion: 0.12
Nodes (23): safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), dailySummary(), fitnessAnalysis(), FOOD_POOL (+15 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.09
Nodes (34): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100() (+26 more)

### Community 23 - "goalSelection.js"
Cohesion: 0.24
Nodes (16): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+8 more)

### Community 24 - "AppError"
Cohesion: 0.13
Nodes (30): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+22 more)

### Community 25 - "devDependencies"
Cohesion: 0.14
Nodes (17): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/node@^26.6.5, @types/react@^19.2.14 (+9 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.11
Nodes (29): WarningBadge(), activityLabel(), Toast(), VARIANTS, useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel() (+21 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "frontend/package.json"
Cohesion: 0.07
Nodes (39): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, maplibre-gl@^6.19.0 (+31 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.31
Nodes (9): sendPasswordResetOtpEmail(), checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), requestResetCode() (+1 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.06
Nodes (26): asyncHandler(), assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach } (+18 more)

### Community 32 - "mapAdapter.js"
Cohesion: 0.06
Nodes (57): AccuracyCircle(), FitRoute(), GeoJsonLayer(), createMarkerElement(), MapMarker(), MapZoomControls(), RecenterMap(), ROUTE_LAYOUT (+49 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.11
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.11
Nodes (33): API_BASE_URL, NotificationStreamContext, NotificationStreamProvider(), applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeContext (+25 more)

### Community 35 - "activity.service.js"
Cohesion: 0.14
Nodes (20): downsampleRoute(), getActivityById(), getAllForUser(), getDetail(), getStats(), isPlausibleActivity(), paceFor(), resolveCalories() (+12 more)

### Community 36 - "filipinoDishes.js"
Cohesion: 0.23
Nodes (16): cleanName(), normalizedConfidence(), REVIEW_REASONS, reviewDish(), ALIAS_INDEX, BY_KEY, DISHES, findDish() (+8 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.12
Nodes (20): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), getDayRoutine(), INTENSITY_OPTIONS, patchPlanId() (+12 more)

### Community 38 - "react"
Cohesion: 0.13
Nodes (20): Button(), ConfirmDialog(), Dropdown(), Modal(), SIZES, RunAnalysisOverlay(), QuickLog(), downloadTextFile() (+12 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.13
Nodes (23): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore() (+15 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.13
Nodes (22): aiConfigured(), callGeminiWithFallback(), getGroqTextModel(), withTimeout(), analyzePose(), coachTip(), saveBmi(), getCoachingCue() (+14 more)

### Community 42 - "ExerciseBriefing.jsx"
Cohesion: 0.11
Nodes (33): CorrectionBanner(), EarlyExitDialog(), ExerciseBriefing(), loadGuide(), METHOD, norm(), formStatus(), FormStatusPill() (+25 more)

### Community 43 - "admin.service.js"
Cohesion: 0.19
Nodes (13): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+5 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.12
Nodes (18): getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF, exerciseGuide(), exercisesPerSession() (+10 more)

### Community 45 - "owner.js"
Cohesion: 0.09
Nodes (22): express, router, write, express, router, write, express, router (+14 more)

### Community 46 - "migrations.test.js"
Cohesion: 0.06
Nodes (26): assert, { describe, it }, end, fs, path, personalize, src, start (+18 more)

### Community 47 - "ForgotPasswordModal.jsx"
Cohesion: 0.11
Nodes (29): PasswordChecklist(), ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn() (+21 more)

### Community 48 - "DayTracker.jsx"
Cohesion: 0.16
Nodes (22): DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS, ExerciseGuideModal(), LEVEL, load(), norm(), useExerciseGuide() (+14 more)

### Community 49 - "PersonalizationSection.jsx"
Cohesion: 0.21
Nodes (12): ActivityDetail(), SleepNote(), ALLERGEN_PRESETS, FieldLabel(), PersonalizationSection(), PillGroup(), ageOn(), checkDob() (+4 more)

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminAccess.jsx"
Cohesion: 0.13
Nodes (46): ConfirmDialog(), MiniStat(), Pager(), SearchField(), StateBlock(), TableSkeleton(), StatusDot(), confirmLabel() (+38 more)

### Community 52 - "app.js"
Cohesion: 0.11
Nodes (19): app, http, io, { Server }, cookieParser, cors, createApp(), express (+11 more)

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
Cohesion: 0.13
Nodes (29): DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), MobileWorkoutPills(), PICKER_OPTIONS, CHOOSER_FILTERS, CHOOSER_GROUPS (+21 more)

### Community 59 - "goals.service.js"
Cohesion: 0.15
Nodes (18): ACTIVITY_ALIASES, ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+10 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "AdminAiUsage.jsx"
Cohesion: 0.31
Nodes (9): Badge(), Kpi(), PageHero(), AdminAiUsage(), WINDOWS, AdminAudit(), ACTION_META, metaForAction() (+1 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 64 - "useAuth"
Cohesion: 0.10
Nodes (28): AppMobileTitle(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, PageHeader(), isDismissed() (+20 more)

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "apiGet"
Cohesion: 0.09
Nodes (37): logout(), Conventions, ErrorState(), useNotificationStream(), useWorkoutSession(), CoachCard(), optionCopy(), STATUS (+29 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.11
Nodes (19): ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, humanizeOption(), PACES, ALLERGEN_PRESETS, calcBmi() (+11 more)

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

### Community 76 - "routePaths.test.js"
Cohesion: 0.14
Nodes (14): LANDING_MODULES, normalize(), ACTIVE_NAV_KEY, getSettingsItems(), MAIN_NAV, MOBILE_MAIN_NAV, MOBILE_MORE_NAV, NAV_GROUPS (+6 more)

### Community 77 - "Register.jsx"
Cohesion: 0.26
Nodes (13): AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS, TermsOfUseModal() (+5 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "main.jsx"
Cohesion: 0.13
Nodes (13): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, installGlobalButtonLoading(), installServiceWorkerUpdate(), isTyping() (+5 more)

### Community 80 - "settings.controller.js"
Cohesion: 0.18
Nodes (5): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 83 - "email.service.js"
Cohesion: 0.13
Nodes (15): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), deliver() (+7 more)

### Community 84 - "ref_fs"
Cohesion: 0.12
Nodes (14): fs, main(), path, assert, bcrypt, fs, mysql, path (+6 more)

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.12
Nodes (31): Panel(), AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL (+23 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "Topbar.jsx"
Cohesion: 0.11
Nodes (32): getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile(), Topbar(), NotificationCard(), NotificationEmpty(), NotificationSkeleton() (+24 more)

### Community 88 - "apiClient.js"
Cohesion: 0.12
Nodes (28): EMPTY, round1(), todayKey(), useTodayMeals(), apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity(), apiSaveFoodLog() (+20 more)

### Community 89 - "RoutinePlayer.jsx"
Cohesion: 0.35
Nodes (11): RoutineCard(), RoutinePlayer(), PlanDayRoutine(), useDayRoutine(), buildSteps(), currentSide(), formatDose(), formatSeconds() (+3 more)

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.10
Nodes (16): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+8 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.12
Nodes (18): postresetPassword(), changePassword(), syncPasswordHealth(), resetPassword(), bcrypt, checkPassword(), COMMON, hashPassword() (+10 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.14
Nodes (14): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+6 more)

### Community 93 - "express"
Cohesion: 0.10
Nodes (18): writeLimiter(), express, read, router, express, router, write, express (+10 more)

### Community 94 - "ExerciseLibrary.jsx"
Cohesion: 0.50
Nodes (6): fromSlug(), readFilters(), toSlug(), writeFilters(), CONFIG, EQUIPMENT

### Community 95 - "sms-verification.test.js"
Cohesion: 0.19
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 96 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 97 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "Sidebar.jsx"
Cohesion: 0.19
Nodes (18): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), LogoutConfirmDialog(), ADMIN_GROUPS, AdminRow(), AdminSidebar() (+10 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.12
Nodes (17): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), parseHistoryQuery() (+9 more)

### Community 101 - "progression.service.js"
Cohesion: 0.09
Nodes (36): BY_KEY, CHALLENGES, getChallenge(), getPlansForUser(), assertCanStartPlan(), challengeView(), collectStats(), completeChallenge() (+28 more)

### Community 102 - "run-tests.js"
Cohesion: 0.19
Nodes (14): allTestFiles(), BACKEND, childEnv(), fs, globToRegExp(), JEST_BIN, main(), parseArgs() (+6 more)

### Community 103 - "react"
Cohesion: 0.12
Nodes (19): AccountPageShell(), TONE, ThemeToggle(), VARIANTS, CSSProperties, react, DOT, LABELS (+11 more)

### Community 104 - "bmi.js"
Cohesion: 0.45
Nodes (8): BmiInsight(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange(), SLEEP_CHOICES

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "CommunityFeed.jsx"
Cohesion: 0.16
Nodes (14): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute(), Avatar(), CommunityFeed(), PostSkeleton() (+6 more)

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.18
Nodes (10): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+2 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "energy.service.js"
Cohesion: 0.15
Nodes (21): addDaysISO(), getActiveGoalType(), getBurnByDay(), getBurnForDay(), queryWithLocalDate(), workoutKcal(), getDailyStats(), creditedKcal() (+13 more)

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.12
Nodes (15): buildSuggestPlanPrompt(), suggestPlanForMeal(), suggestPlan(), 1. What the AI does in VITALIS, 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls (+7 more)

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
Nodes (44): AppQuickJump(), AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile() (+36 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "jwt.js"
Cohesion: 0.53
Nodes (5): verifySession(), getme(), postDeactivate(), postlogout(), getClearCookieOptions()

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

### Community 121 - "check-syntax.js"
Cohesion: 0.29
Nodes (5): collect(), { execSync }, files, fs, path

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "ActivityMap.jsx"
Cohesion: 0.13
Nodes (22): ICONS, NotificationProvider(), Toast(), ToastContainer(), GpsBadge(), RouteReplay(), formatTime(), useActivityApi() (+14 more)

### Community 125 - "forgotpassword.routes.js"
Cohesion: 0.08
Nodes (17): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, completeSchema, keySchema, { z }, emailSchema (+9 more)

### Community 127 - "socketHandler.js"
Cohesion: 0.47
Nodes (4): getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies()

### Community 128 - "AdminAiUsage.jsx"
Cohesion: 0.22
Nodes (13): AdminBottomNav(), ADMIN_NAV, AdminShell(), AdminTopbarSearch(), useAdminFilters(), ADMIN_FILTERS, normalize(), page (+5 more)

### Community 129 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "supertest"
Cohesion: 0.16
Nodes (12): devDependencies, jest@^30.5.2, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, request, assertNoSensitiveFields() (+4 more)

### Community 134 - "cookies.js"
Cohesion: 0.83
Nodes (3): baseCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 138 - "routes/index.js"
Cohesion: 0.18
Nodes (9): requireMember(), aiRouteLimiter, aiSummaryLimiter, express, router, express, router, express (+1 more)

### Community 139 - "dashboard.service.js"
Cohesion: 0.12
Nodes (17): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), EMPTY_BURN, logDailyStats(), dayKeys() (+9 more)

### Community 140 - "rateLimits.js"
Cohesion: 0.09
Nodes (29): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+21 more)

### Community 141 - "goals.controller.js"
Cohesion: 0.10
Nodes (19): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+11 more)

### Community 142 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 143 - "errors.js"
Cohesion: 0.20
Nodes (5): updatePhone(), assertMode(), buildTips(), collectStats(), getInsights()

### Community 144 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (10): crypto, jwt, normalizeId(), record(), trackingToken(), assert, dbPath, { it } (+2 more)

### Community 145 - "auth-revocation.test.js"
Cohesion: 0.14
Nodes (9): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, mockRes(), res (+1 more)

### Community 146 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 147 - "public.service.js"
Cohesion: 0.24
Nodes (7): cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 148 - "build-database-sql.js"
Cohesion: 0.22
Nodes (10): conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql, OUT (+2 more)

### Community 149 - "useProfileWarnings.js"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

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

### Community 159 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 173 - "src/config/env.js"
Cohesion: 0.50
Nodes (3): _jwt, missing, required

### Community 174 - "eval-filipino-scans.js"
Cohesion: 0.38
Nodes (6): DIR, evaluate(), fs, main(), parse(), path

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `react-router-dom` to `AdminAiUsage.jsx`, `ChangeGoalModal.jsx`, `src/components/index.js`, `Log.jsx`, `Landing.jsx`, `Explore.jsx`, `AppRoutes.jsx`, `Profile.jsx`, `frontend/package.json`, `useAuth.jsx`, `react`, `ExerciseBriefing.jsx`, `ForgotPasswordModal.jsx`, `DayTracker.jsx`, `CameraWorkout.jsx`, `useAuth`, `apiGet`, `Onboarding.jsx`, `routePaths.test.js`, `Register.jsx`, `main.jsx`, `AdminOverview.jsx`, `Topbar.jsx`, `apiClient.js`, `ExerciseLibrary.jsx`, `Sidebar.jsx`, `react`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `lib/progression.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Should `ChangeGoalModal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1476923076923077 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `AdminAiUsage.jsx`, `WebcamFeed.jsx`, `src/components/index.js`, `ChangeGoalModal.jsx`, `StreakJourney.jsx`, `Log.jsx`, `Landing.jsx`, `react-router-dom`, `Icon`, `Explore.jsx`, `ScanResult.jsx`, `AppRoutes.jsx`, `goalSelection.js`, `Profile.jsx`, `frontend/package.json`, `usePoseEngine.js`, `mapAdapter.js`, `useAuth.jsx`, `react`, `ExerciseBriefing.jsx`, `ForgotPasswordModal.jsx`, `DayTracker.jsx`, `PersonalizationSection.jsx`, `AdminAccess.jsx`, `HistoryTab.jsx`, `CameraWorkout.jsx`, `AdminAiUsage.jsx`, `useAuth`, `apiGet`, `Onboarding.jsx`, `routePaths.test.js`, `Register.jsx`, `main.jsx`, `AdminOverview.jsx`, `Topbar.jsx`, `apiClient.js`, `RoutinePlayer.jsx`, `ExerciseLibrary.jsx`, `Sidebar.jsx`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `exportTable.js`, `ActivityMap.jsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `dashboard.service.js`, `errors.js`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `forgotpassword.service.js`, `ref_node_assert`, `plans.controller.js`, `upload.js`, `coachPlan.service.js`, `admin.service.js`, `owner.js`, `app.js`, `sms-verification.test.js`, `goals.service.js`, `trainingPrefs.service.js`, `validId`, `reminder.service.js`, `messenger.service.js`, `password-policy.test.js`, `forgotpassword.routes.js`, `accessGroups.service.js`, `workoutLogs.service.js`, `progression.service.js`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._
- **Should `admin.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._