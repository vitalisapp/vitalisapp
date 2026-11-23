# Graph Report - vitalisapp  (2026-11-23)

## Corpus Check
- 599 files · ~394,295 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3269 nodes · 8281 edges · 151 communities (143 shown, 8 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 644 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5452ef3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- MealTracker.jsx
- ExerciseBriefing.jsx
- escapeHtml
- gemini.js
- admin.service.js
- Log.jsx
- Plans.jsx
- backend/package.json
- progressInsights.js
- Landing.jsx
- ForgotPasswordModal.jsx
- ActivityMap.jsx
- react
- AdminOverview.jsx
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- buildSampleDataset
- ai.service.js
- foodLogs.service.js
- workoutGuide.js
- AppError
- devDependencies
- Profile.jsx
- project.yml
- dependencies
- forgotpassword.service.js
- progressOverview.js
- ref_node_assert
- routes/index.js
- coachEngine.js
- useAuth
- activity.service.js
- verifyUser.js
- plans.controller.js
- dashboard.service.js
- adminMonitoring.service.js
- upload.js
- coachPlan.service.js
- auth-revocation.test.js
- accessGroups.service.js
- workoutRecommender.js
- MessengerPanel.jsx
- HomeScreenWidgets.jsx
- account-validation.test.js
- settings.controller.js
- sms.service.js
- AdminAccess.jsx
- logs.controller.js
- app.js
- sms-verification.test.js
- progress.controller.js
- migrations.test.js
- compilerOptions
- package.json
- exportTable.js
- goals.service.js
- trainingPrefs.service.js
- utils/nutrition.js
- scripts
- HistoryTab.jsx
- Sidebar.jsx
- validId
- VerifyPhone.jsx
- Onboarding.jsx
- allergies.service.js
- email-verification.test.js
- db.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- lib/avatar.js
- AppShell.jsx
- bmi.service.js
- reminder.service.js
- main.jsx
- plans-personal.test.js
- food-traits.test.js
- useToastStore
- email.service.js
- verify-demo-sql.js
- AdminAccess.jsx
- migrate.js
- Notifications.jsx
- AdminAiUsage.jsx
- apiClient.js
- generate-email-assets.js
- Topbar.jsx
- forgotpassword.routes.js
- ExerciseGuideModal.jsx
- brevo-transport.test.js
- sw-widgets.js
- forgotpassword.routes.js
- security.controller.js
- CommunityFeed.jsx
- workoutLogs.service.js
- ai-privacy.test.js
- Preferences.jsx
- geo.js
- controllers/README.md
- widgets.service.js
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- widget-data.js
- VITALIS — AI Integration and Technical Justification
- urlFilters.test.js
- Database Migrations — Vitalis (ALTER-based)
- backend/.prettierrc.json
- Dashboard.jsx
- foodImage.service.js
- jsonwebtoken
- build-database-sql.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- taskNotifications.js
- .prettierrc.json
- CameraWorkout.jsx
- accessGroups.controller.js
- zod
- reminderScheduler.js
- Icon
- callGeminiWithFallback
- today-activity.json
- Migrations — Vitalis (one table per file)
- analyzeFoodImage
- Verification email delivery status
- express
- jwt.js
- goalProfile.test.js
- stats.routes.js
- rateLimits.js
- goals.controller.js
- vite.config.js
- public.service.js
- community.test.js
- vercel.json
- useAuth
- ExerciseGuideModal.jsx
- AdminCalendar.jsx
- usePoseEngine.js
- cookies.js
- sessionFit.js
- ForgotPassword.jsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 252 edges
2. `react` - 151 edges
3. `AppError` - 92 edges
4. `apiGet()` - 74 edges
5. `apiPost()` - 72 edges
6. `useAuth()` - 71 edges
7. `apiFetch()` - 53 edges
8. `Modal()` - 50 edges
9. `react-router-dom` - 45 edges
10. `Dashboard()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js

## Import Cycles
- None detected.

## Communities (151 total, 8 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.05
Nodes (71): resolveAssetUrl(), Spinner(), CameraScanner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb() (+63 more)

### Community 2 - "ExerciseBriefing.jsx"
Cohesion: 0.15
Nodes (21): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+13 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.08
Nodes (32): ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS, cleanSubject(), DEFAULT_GEMINI_MODELS, envList(), extractBalancedJSON() (+24 more)

### Community 5 - "admin.service.js"
Cohesion: 0.19
Nodes (13): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+5 more)

### Community 6 - "Log.jsx"
Cohesion: 0.07
Nodes (52): YearlyBmi(), BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum(), fmtShortDate() (+44 more)

### Community 7 - "Plans.jsx"
Cohesion: 0.09
Nodes (36): AdaptiveTipsCard(), TIP_ICONS, TIP_STYLES, FilterPill(), PlanActions(), PlanCard(), PlanCover(), TabBar() (+28 more)

### Community 8 - "backend/package.json"
Cohesion: 0.07
Nodes (41): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+33 more)

### Community 9 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.12
Nodes (34): WindowsWidgetGuide(), clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet() (+26 more)

### Community 11 - "ForgotPasswordModal.jsx"
Cohesion: 0.25
Nodes (9): ChangePasswordModal(), ForgotPasswordModal(), STEP_LABELS, STEP_META, PasswordField(), PasswordStrength(), post(), useForgotPassword() (+1 more)

### Community 12 - "ActivityMap.jsx"
Cohesion: 0.11
Nodes (26): FitRoute(), DOT, GpsBadge(), LABELS, LocationNotice(), MapResizer(), RecenterButton(), RecenterMap() (+18 more)

### Community 13 - "react"
Cohesion: 0.11
Nodes (30): FAB(), FeedbackModal(), LogActivityModal(), Button(), ConfirmDialog(), Input(), Modal(), SIZES (+22 more)

### Community 14 - "AdminOverview.jsx"
Cohesion: 0.19
Nodes (18): PageHero(), Panel(), STATUS_META, TOAST_ICONS, useAdminToast(), AdminAudit(), AdminOverview(), buildCategories() (+10 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (34): App(), ENV_ERROR, AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+26 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.10
Nodes (18): aiQuota(), aiRouteLimiter, aiSummaryLimiter, express, router, coachRouteLimiter, express, router (+10 more)

### Community 17 - "progress.service.js"
Cohesion: 0.10
Nodes (31): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+23 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.10
Nodes (20): changeEmailSchema, changePasswordSchema, getverifyEmail(), googleLoginSchema, jwt, loginIpLimiter, loginSchema, notifyNewDevice() (+12 more)

### Community 19 - "auth.service.js"
Cohesion: 0.10
Nodes (32): bcrypt, changeEmail(), changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount() (+24 more)

### Community 20 - "buildSampleDataset"
Cohesion: 0.27
Nodes (13): getSampleHistory(), addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO() (+5 more)

### Community 21 - "ai.service.js"
Cohesion: 0.17
Nodes (18): safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), dailySummary(), fitnessAnalysis(), FOOD_POOL (+10 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.12
Nodes (16): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), crypto, estimateFoodDensity(), getCached() (+8 more)

### Community 23 - "workoutGuide.js"
Cohesion: 0.17
Nodes (14): BRYL_CREDIT, counterTypeFor(), EXERCISE_TYPE_LABELS, exerciseTypeLabel(), getWorkoutMode(), guideFilterOptions(), HOLD_TYPES, isHoldExercise() (+6 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (28): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+20 more)

### Community 25 - "devDependencies"
Cohesion: 0.10
Nodes (23): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, lightningcss@^1.33.0, @types/leaflet@^1.9.22 (+15 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.11
Nodes (28): activityLabel(), Toast(), VARIANTS, useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR() (+20 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (41): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, leaflet@^1.9.4 (+33 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.17
Nodes (11): sendPasswordResetOtpEmail(), bcrypt, checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure() (+3 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.06
Nodes (26): asyncHandler(), assert, dbPath, { it }, jwt, rows, assert, { describe, it } (+18 more)

### Community 32 - "routes/index.js"
Cohesion: 0.13
Nodes (16): requireMember(), express, router, express, router, express, landingLimiter, router (+8 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.16
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth"
Cohesion: 0.15
Nodes (22): @tanstack/react-query@^5.102.8, AppProviders(), NotificationStreamProvider(), applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeProvider() (+14 more)

### Community 35 - "activity.service.js"
Cohesion: 0.11
Nodes (7): downsampleRoute(), getActivityById(), isPlausibleActivity(), saveActivity(), toggleKudos(), assert, { describe, it }

### Community 36 - "verifyUser.js"
Cohesion: 0.14
Nodes (11): jwt, verifyUser(), express, read, router, express, router, testLimiter (+3 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.13
Nodes (18): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), INTENSITY_OPTIONS, patchPlanId(), postActivate() (+10 more)

### Community 38 - "dashboard.service.js"
Cohesion: 0.12
Nodes (15): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), dayKeys(), getStreakSummary(), shiftDay() (+7 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.07
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.10
Nodes (27): sharp@^0.35.5, postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore() (+19 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): aiConfigured(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "auth-revocation.test.js"
Cohesion: 0.14
Nodes (9): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, mockRes(), res (+1 more)

### Community 43 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.09
Nodes (22): EXCLUSION_CATEGORIES, EXERCISES, getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF (+14 more)

### Community 45 - "MessengerPanel.jsx"
Cohesion: 0.12
Nodes (22): logout(), Build, Conventions, Frontend Architecture — Vitalis, Principles, Related, State, Structure (+14 more)

### Community 46 - "HomeScreenWidgets.jsx"
Cohesion: 0.09
Nodes (51): HomeScreenWidgets(), WidgetConfigModal(), Bars(), Chip(), clampPct(), Dots(), fmtInt(), GoalBody() (+43 more)

### Community 47 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 48 - "settings.controller.js"
Cohesion: 0.14
Nodes (7): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS, assert, { describe, it }

### Community 49 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 50 - "AdminAccess.jsx"
Cohesion: 0.31
Nodes (10): Kpi(), AdminAccess(), downloadPng(), GroupForm(), QrCard(), qrUrl(), slug(), STATUS_LABEL (+2 more)

### Community 51 - "logs.controller.js"
Cohesion: 0.20
Nodes (3): express, router, write

### Community 52 - "app.js"
Cohesion: 0.11
Nodes (18): app, http, io, { Server }, cookieParser, cors, createApp(), express (+10 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.11
Nodes (23): crypto, cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil() (+15 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "migrations.test.js"
Cohesion: 0.14
Nodes (10): assert, { describe, it }, dir, EXPECTED, fs, path, Data, loadData() (+2 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "exportTable.js"
Cohesion: 0.32
Nodes (11): ExportMenu(), csvCell(), download(), exportCsv(), exportXlsx(), fmtDateText(), normalize(), pad() (+3 more)

### Community 59 - "goals.service.js"
Cohesion: 0.16
Nodes (20): saveBmi(), ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+12 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 62 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, foods:images (+9 more)

### Community 63 - "HistoryTab.jsx"
Cohesion: 0.23
Nodes (18): ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab(), KudosButton(), RouteThumbnail(), RunSummaryOverlay(), activityTitle() (+10 more)

### Community 64 - "Sidebar.jsx"
Cohesion: 0.16
Nodes (18): normalize(), Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), LogoutConfirmDialog(), ACTIVE_NAV_KEY, MAIN_NAV (+10 more)

### Community 65 - "validId"
Cohesion: 0.06
Nodes (23): addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema, listComments(), paginationSchema, remove(), toggleLike() (+15 more)

### Community 66 - "VerifyPhone.jsx"
Cohesion: 0.10
Nodes (29): rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, getAccessCode(), readCode(), useAccessInvite(), useRegister() (+21 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.06
Nodes (61): ActivityDetail(), BmiInsight(), SleepNote(), TONE, ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES (+53 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 70 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 71 - "db.js"
Cohesion: 0.07
Nodes (11): isAivenHost, mysql, pool, sslFlag, createMessage(), FRIEND_STATUSES, updatePhone(), assertMode() (+3 more)

### Community 72 - "workoutLogs.controller.js"
Cohesion: 0.27
Nodes (6): getId(), parseLogId(), patchFeedback(), patchIdEnd(), postPause(), postResume()

### Community 73 - "Vitalis"
Cohesion: 0.15
Nodes (12): Docs, Environment, Features, License, Prerequisites, Scripts, Setup — backend, Setup — frontend (+4 more)

### Community 74 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, checkJs, lib, module, resolveJsonModule, strict, target (+3 more)

### Community 75 - "lib/avatar.js"
Cohesion: 0.20
Nodes (14): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), AVATAR_SURFACES, avatarGradient(), avatarSurface() (+6 more)

### Community 76 - "AppShell.jsx"
Cohesion: 0.16
Nodes (15): AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, isDismissed() (+7 more)

### Community 77 - "bmi.service.js"
Cohesion: 0.15
Nodes (15): summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance(), ACTIVITY_FACTORS (+7 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "main.jsx"
Cohesion: 0.11
Nodes (16): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, @react-oauth/google@^0.13.4, GOOGLE_CLIENT_ID, installGlobalButtonLoading() (+8 more)

### Community 80 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "useToastStore"
Cohesion: 0.15
Nodes (17): ICONS, NotificationProvider(), Toast(), ToastContainer(), useToast(), GoalDetailSheet(), goalIcon(), AddWorkoutModal() (+9 more)

### Community 83 - "email.service.js"
Cohesion: 0.13
Nodes (15): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), deliver() (+7 more)

### Community 84 - "verify-demo-sql.js"
Cohesion: 0.09
Nodes (19): collect(), { execSync }, files, fs, path, fs, main(), path (+11 more)

### Community 85 - "AdminAccess.jsx"
Cohesion: 0.17
Nodes (34): Badge(), ConfirmDialog(), MiniStat(), Pager(), SearchField(), StateBlock(), TableSkeleton(), StatusDot() (+26 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "Notifications.jsx"
Cohesion: 0.17
Nodes (22): NotificationOverlay(), NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime() (+14 more)

### Community 88 - "AdminAiUsage.jsx"
Cohesion: 0.21
Nodes (13): AdminSmsPanel(), LEVEL, AdminUsageChart(), compactNumber(), FALLBACK, readPalette(), usePalette(), withAlpha() (+5 more)

### Community 89 - "apiClient.js"
Cohesion: 0.12
Nodes (29): formatTime(), useActivityApi(), CheckEmail(), useWorkoutSession(), fmtShortDate(), POSES, poseTitle(), ProgressPhotosTab() (+21 more)

### Community 90 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 91 - "Topbar.jsx"
Cohesion: 0.17
Nodes (15): API_BASE_URL, getCachedProfile(), _profileCache, setCachedProfile(), Topbar(), Dropdown(), getSettingsItems(), NotificationStreamContext (+7 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.14
Nodes (14): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+6 more)

### Community 93 - "ExerciseGuideModal.jsx"
Cohesion: 0.36
Nodes (11): getAllGuideExercises(), DayTracker(), mapPlanSchedule(), matchExercise(), MUSCLE_HINTS, muscleFor(), _nameIndex(), normalizeEquipment() (+3 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 96 - "sw-widgets.js"
Cohesion: 0.30
Nodes (9): fetchSummary(), getTemplate(), getWidget(), instanceCount(), paint(), refresh(), refreshIntervalMs(), registerPeriodic() (+1 more)

### Community 97 - "forgotpassword.routes.js"
Cohesion: 0.20
Nodes (9): emailSchema, express, otpSendLimiter, otpVerifyLimiter, passwordResetLimiter, resetSchema, router, verifySchema (+1 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "CommunityFeed.jsx"
Cohesion: 0.18
Nodes (15): ErrorState(), Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES, TAG_ICONS (+7 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.12
Nodes (15): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), parseHistoryQuery() (+7 more)

### Community 102 - "ai-privacy.test.js"
Cohesion: 0.12
Nodes (13): assert, { describe, it }, end, fs, path, personalize, src, start (+5 more)

### Community 103 - "Preferences.jsx"
Cohesion: 0.18
Nodes (15): AccountPageShell(), PageHeader(), ThemeToggle(), VARIANTS, ThemeContext, FAQS, HelpSupport(), clampStepGoal() (+7 more)

### Community 104 - "geo.js"
Cohesion: 0.27
Nodes (10): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), DEFAULT_GATES, EARTH_RADIUS_M, evaluateFix() (+2 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "widgets.service.js"
Cohesion: 0.27
Nodes (6): getWidgetSummary(), shapeWidgetSummary(), toInt(), assert, dbPath, { describe, it }

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.20
Nodes (9): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+1 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "widget-data.js"
Cohesion: 0.40
Nodes (9): base(), dateLabel(), failed(), fmtInt(), localTodayIso(), signedOut(), timeLabel(), todayActivity() (+1 more)

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.17
Nodes (11): 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls, 4.3 Safety and data minimization, 4. How it is built (reliability and cost controls), 5. Internet connectivity requirements, 6. Summary (+3 more)

### Community 111 - "urlFilters.test.js"
Cohesion: 0.47
Nodes (7): useUrlFilters(), fromSlug(), readFilters(), toSlug(), writeFilters(), CONFIG, EQUIPMENT

### Community 112 - "Database Migrations — Vitalis (ALTER-based)"
Cohesion: 0.20
Nodes (9): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+1 more)

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "Dashboard.jsx"
Cohesion: 0.06
Nodes (72): CoachCard(), optionCopy(), STATUS, AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt() (+64 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "jsonwebtoken"
Cohesion: 0.32
Nodes (6): jsonwebtoken@^9.0.3, getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), jsonwebtoken

### Community 117 - "build-database-sql.js"
Cohesion: 0.18
Nodes (12): mysql2@^3.20.0, conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql (+4 more)

### Community 118 - "Dashboard Redesign — Visual Specification (References A & B)"
Cohesion: 0.29
Nodes (6): Audit baseline (before redesign), Dashboard Redesign — Visual Specification (References A & B), Desktop specification (Reference B), Guardrails for implementation, Mobile specification (Reference A), Reference-to-implementation mapping

### Community 119 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:unit

### Community 120 - "Vitalis Frontend"
Cohesion: 0.29
Nodes (6): Conventions, Env, Requirements, Setup, Structure, Vitalis Frontend

### Community 121 - "taskNotifications.js"
Cohesion: 0.33
Nodes (8): activityMessage(), fmtMinutes(), MEASURE_LABELS, measurementMessage(), plural(), round1(), weighInMessage(), workoutMessage()

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "CameraWorkout.jsx"
Cohesion: 0.12
Nodes (26): CorrectionBanner(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), formStatus(), MobileWorkoutPills(), PICKER_OPTIONS (+18 more)

### Community 124 - "accessGroups.controller.js"
Cohesion: 0.36
Nodes (4): deleteOne(), getMembers(), idParam(), patchUpdate()

### Community 125 - "zod"
Cohesion: 0.40
Nodes (3): coachSchema, WORKOUT_TYPES, { z }

### Community 127 - "Icon"
Cohesion: 0.12
Nodes (22): Icon(), NetworkStatus(), COPY, paceToSeconds(), SplitRows(), StatsPanel(), StatusPill(), formatBestDate() (+14 more)

### Community 128 - "callGeminiWithFallback"
Cohesion: 0.16
Nodes (13): buildSuggestPlanPrompt(), callGeminiWithFallback(), genAI(), getGenAI(), getGroq(), getGroqTextModel(), Groq, groq() (+5 more)

### Community 129 - "today-activity.json"
Cohesion: 0.33
Nodes (5): actions, body, $schema, type, version

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "analyzeFoodImage"
Cohesion: 0.20
Nodes (15): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), callOpenRouter(), devError(), devLog(), devWarn() (+7 more)

### Community 134 - "express"
Cohesion: 0.08
Nodes (25): writeLimiter(), express, router, write, express, router, write, express (+17 more)

### Community 137 - "jwt.js"
Cohesion: 0.43
Nodes (6): verifySession(), getme(), postDeactivate(), postlogout(), clearSessionCookie(), getClearCookieOptions()

### Community 138 - "goalProfile.test.js"
Cohesion: 0.32
Nodes (5): GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 140 - "rateLimits.js"
Cohesion: 0.13
Nodes (23): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+15 more)

### Community 141 - "goals.controller.js"
Cohesion: 0.17
Nodes (17): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+9 more)

### Community 143 - "vite.config.js"
Cohesion: 0.13
Nodes (11): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, vite@^8.0.1, vite-plugin-pwa@^1.3.0, CSS_TARGETS, __dirname, JS_TARGETS, browserslist (+3 more)

### Community 144 - "public.service.js"
Cohesion: 0.20
Nodes (8): LANDING_MODULES, cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 151 - "community.test.js"
Cohesion: 0.20
Nodes (9): devDependencies, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, assert, { describe, it }, request (+1 more)

### Community 155 - "useAuth"
Cohesion: 0.16
Nodes (17): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminBottomNav(), AdminRoute(), ADMIN_NAV, AdminShell() (+9 more)

### Community 156 - "ExerciseGuideModal.jsx"
Cohesion: 0.52
Nodes (5): ExerciseGuideModal(), LEVEL, load(), norm(), useExerciseGuide()

### Community 157 - "AdminCalendar.jsx"
Cohesion: 0.29
Nodes (10): AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), fmtAgo(), fmtShot(), localDayKey() (+2 more)

### Community 159 - "usePoseEngine.js"
Cohesion: 0.60
Nodes (4): loadMediaPipe(), POSE_SCRIPTS, startScriptLoad(), usePoseEngine()

### Community 161 - "cookies.js"
Cohesion: 0.83
Nodes (3): baseCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 162 - "sessionFit.js"
Cohesion: 0.83
Nodes (3): estimateDayMinutes(), estimateExerciseSeconds(), fitDayToMinutes()

### Community 164 - "ForgotPassword.jsx"
Cohesion: 0.43
Nodes (7): ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn()

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Plans.jsx`, `Landing.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `AdminOverview.jsx`, `AppRoutes.jsx`, `Profile.jsx`, `useAuth`, `dependencies`, `AdminCalendar.jsx`, `ExerciseGuideModal.jsx`, `usePoseEngine.js`, `useAuth`, `ForgotPassword.jsx`, `MessengerPanel.jsx`, `HomeScreenWidgets.jsx`, `AdminAccess.jsx`, `exportTable.js`, `HistoryTab.jsx`, `Sidebar.jsx`, `VerifyPhone.jsx`, `Onboarding.jsx`, `lib/avatar.js`, `AppShell.jsx`, `main.jsx`, `useToastStore`, `AdminAccess.jsx`, `Notifications.jsx`, `AdminAiUsage.jsx`, `apiClient.js`, `Topbar.jsx`, `CommunityFeed.jsx`, `Preferences.jsx`, `geo.js`, `urlFilters.test.js`, `Dashboard.jsx`, `CameraWorkout.jsx`, `Icon`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Should `MealTracker.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05355276907001045 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Plans.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `react`, `AdminOverview.jsx`, `workoutGuide.js`, `useAuth`, `ExerciseGuideModal.jsx`, `AdminCalendar.jsx`, `MessengerPanel.jsx`, `HomeScreenWidgets.jsx`, `AdminAccess.jsx`, `exportTable.js`, `HistoryTab.jsx`, `Sidebar.jsx`, `Onboarding.jsx`, `AppShell.jsx`, `useToastStore`, `AdminAccess.jsx`, `Notifications.jsx`, `AdminAiUsage.jsx`, `apiClient.js`, `Topbar.jsx`, `ExerciseGuideModal.jsx`, `CommunityFeed.jsx`, `Preferences.jsx`, `Dashboard.jsx`, `CameraWorkout.jsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `ExerciseBriefing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `admin.service.js`, `express`, `foodLogs.routes.js`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `forgotpassword.service.js`, `ref_node_assert`, `plans.controller.js`, `dashboard.service.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.service.js`, `app.js`, `sms-verification.test.js`, `goals.service.js`, `trainingPrefs.service.js`, `db.js`, `reminder.service.js`, `forgotpassword.routes.js`, `workoutLogs.service.js`, `accessGroups.controller.js`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._