# Graph Report - vitalisapp  (2026-11-22)

## Corpus Check
- 569 files · ~385,011 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 24, (none) 3, .example 2)

## Summary
- 3102 nodes · 7745 edges · 155 communities (140 shown, 15 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 633 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a46a02d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AdminMonitoring.jsx
- MealTracker.jsx
- Dashboard.jsx
- escapeHtml
- gemini.js
- admin.service.js
- Log.jsx
- Plans.jsx
- backend/package.json
- VerifyPhone.jsx
- Landing.jsx
- verifyUser.js
- ActivityMap.jsx
- ForgotPasswordModal.jsx
- workoutGuide.js
- AppRoutes.jsx
- rateLimits.js
- progress.service.js
- auth.controller.js
- auth.service.js
- fmtNum
- ai.service.js
- foodLogs.service.js
- Preferences.jsx
- AppError
- devDependencies
- Profile.jsx
- project.yml
- dependencies
- ExerciseGuideModal.jsx
- progressOverview.js
- ref_node_assert
- react
- coachEngine.js
- useAuth.jsx
- activity.service.js
- routes/index.js
- plans.controller.js
- dashboard.service.js
- adminMonitoring.service.js
- upload.js
- coachPlan.service.js
- auth-revocation.test.js
- accessGroups.service.js
- workoutRecommender.js
- Button
- AdminAccess.jsx
- account-validation.test.js
- settings.controller.js
- email.service.js
- verify-demo-sql.js
- logs.controller.js
- app.js
- phoneVerification.service.js
- progress.controller.js
- HistoryTab.jsx
- compilerOptions
- package.json
- main.jsx
- goals.service.js
- trainingPrefs.service.js
- utils/nutrition.js
- scripts
- ExerciseBriefing.jsx
- validId
- app/config/env.js
- frontend/package.json
- allergies.service.js
- planEngine.js
- email-verification.test.js
- messenger.service.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- ai.routes.js
- useAuth
- bmi.service.js
- reminder.service.js
- forgotpassword.service.js
- plans-personal.test.js
- food-traits.test.js
- check-syntax.js
- public.service.js
- callGeminiWithFallback
- AdminOverview.jsx
- migrate.js
- notificationPresentation.js
- foodLogs.controller.js
- Frontend Architecture — Vitalis
- generate-email-assets.js
- analyzeFoodImage
- forgotpassword.routes.js
- StreakJourney.jsx
- brevo-transport.test.js
- react
- geo.js
- sms.service.js
- security.routes.js
- exportTable.js
- workoutLogs.service.js
- Onboarding.jsx
- messenger.service.js
- upload-formats.test.js
- Topbar.jsx
- controllers/README.md
- create-migration.js
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- community.test.js
- VITALIS — AI Integration and Technical Justification
- Modal
- Database Migrations — Vitalis (ALTER-based)
- backend/.prettierrc.json
- Social.jsx
- foodImage.service.js
- jsonwebtoken
- build-database-sql.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- taskNotifications.js
- .prettierrc.json
- CameraWorkout.jsx
- Register.jsx
- ai-privacy.test.js
- reminderScheduler.js
- sms-verification.test.js
- CommunityFeed.jsx
- server.js
- Migrations — Vitalis (one table per file)
- trainingPrefs.controller.js
- Verification email delivery status
- session-dedupe.test.js
- cookies.js
- goalProfile.test.js
- stats.routes.js
- zod
- res
- workout-history-pagination.test.js
- goals.controller.js
- usePoseEngine.js
- Icon
- ThemeToggle.jsx
- email-delivery.test.js
- Toast.jsx
- vercel.json
- StatsTab.jsx
- unit/health.test.js
- StatsPanel.jsx
- sessionFit.js

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 218 edges
2. `react` - 144 edges
3. `AppError` - 92 edges
4. `apiGet()` - 74 edges
5. `apiPost()` - 72 edges
6. `useAuth()` - 69 edges
7. `apiFetch()` - 55 edges
8. `react-router-dom` - 44 edges
9. `Dashboard()` - 42 edges
10. `AppRoutes()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `4.2 Cost controls` --references--> `validateAndCorrectMacros()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js

## Import Cycles
- None detected.

## Communities (155 total, 15 thin omitted)

### Community 0 - "AdminMonitoring.jsx"
Cohesion: 0.18
Nodes (21): MiniStat(), SearchField(), StatusDot(), confirmLabel(), confirmMessage(), confirmTitle(), humanize(), UserDrawer() (+13 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.05
Nodes (73): resolveAssetUrl(), Spinner(), CameraScanner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb() (+65 more)

### Community 2 - "Dashboard.jsx"
Cohesion: 0.12
Nodes (44): AiCoachCard(), CardHead(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard(), MiniRow() (+36 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.08
Nodes (32): ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS, cleanSubject(), DEFAULT_GEMINI_MODELS, envList(), extractBalancedJSON() (+24 more)

### Community 5 - "admin.service.js"
Cohesion: 0.17
Nodes (12): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+4 more)

### Community 6 - "Log.jsx"
Cohesion: 0.06
Nodes (61): YearlyBmi(), AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS (+53 more)

### Community 7 - "Plans.jsx"
Cohesion: 0.13
Nodes (28): FilterPill(), PlanActions(), PlanCard(), PlanCover(), TabBar(), TAG_ICON, ContinueTrainingCard(), Explore() (+20 more)

### Community 8 - "backend/package.json"
Cohesion: 0.07
Nodes (39): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+31 more)

### Community 9 - "VerifyPhone.jsx"
Cohesion: 0.24
Nodes (10): NetworkNotice(), SUPPORTED, UNSUPPORTED, VerifyPhone(), OtpInput(), formatPhMobile(), isValidPhMobile(), maskPhMobile() (+2 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "verifyUser.js"
Cohesion: 0.10
Nodes (21): clearSessionCookie(), jwt, requireMember(), verifyUser(), express, router, express, router (+13 more)

### Community 12 - "ActivityMap.jsx"
Cohesion: 0.17
Nodes (18): FitRoute(), GpsBadge(), LocationNotice(), MapResizer(), RecenterButton(), RecenterMap(), RunAnalysisOverlay(), RunControls() (+10 more)

### Community 13 - "ForgotPasswordModal.jsx"
Cohesion: 0.29
Nodes (8): ChangePasswordModal(), ForgotPasswordModal(), STEP_LABELS, STEP_META, PasswordField(), PasswordStrength(), useForgotPassword(), getPasswordStrength()

### Community 14 - "workoutGuide.js"
Cohesion: 0.15
Nodes (22): DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), MobileWorkoutPills(), PICKER_OPTIONS, BRYL_CREDIT, counterTypeFor() (+14 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.06
Nodes (51): App(), AppProviders(), AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+43 more)

### Community 16 - "rateLimits.js"
Cohesion: 0.10
Nodes (28): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+20 more)

### Community 17 - "progress.service.js"
Cohesion: 0.06
Nodes (63): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+55 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.10
Nodes (17): changeEmailSchema, changePasswordSchema, googleLoginSchema, jwt, loginIpLimiter, loginSchema, notifyNewDevice(), postchangePassword() (+9 more)

### Community 19 - "auth.service.js"
Cohesion: 0.11
Nodes (28): bcrypt, changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+20 more)

### Community 20 - "fmtNum"
Cohesion: 0.27
Nodes (19): Badge(), Kpi(), PageHero(), Pager(), Panel(), StateBlock(), TableSkeleton(), useAdminResource() (+11 more)

### Community 21 - "ai.service.js"
Cohesion: 0.17
Nodes (18): safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), dailySummary(), fitnessAnalysis(), FOOD_POOL (+10 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.12
Nodes (16): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), crypto, estimateFoodDensity(), getCached() (+8 more)

### Community 23 - "Preferences.jsx"
Cohesion: 0.13
Nodes (25): AccountPageShell(), PageHeader(), ErrorState(), LoadingState(), FeedbackModal(), FAQS, HelpSupport(), BodyMeasurementsPanel() (+17 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (28): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+20 more)

### Community 25 - "devDependencies"
Cohesion: 0.09
Nodes (25): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/leaflet@^1.9.22, @types/node@^26.6.5 (+17 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.13
Nodes (26): activityLabel(), useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR(), ChangeGoalModal, ChangePasswordModal (+18 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @fontsource/playfair-display@^5.3.0, framer-motion@^12.40.0, @mediapipe/camera_utils@^0.3.1675466862, @mediapipe/drawing_utils@^0.3.1675466124, qrcode.react@^4.2.0, react@^19.2.4, react-chartjs-2@^5.3.1 (+17 more)

### Community 29 - "ExerciseGuideModal.jsx"
Cohesion: 0.23
Nodes (16): getAllGuideExercises(), ExerciseGuideModal(), LEVEL, load(), norm(), useExerciseGuide(), DayTracker(), mapPlanSchedule() (+8 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.08
Nodes (20): assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach }, assert (+12 more)

### Community 32 - "react"
Cohesion: 0.17
Nodes (10): leaflet@^1.9.4, react-leaflet@^5.0.0, DOT, LABELS, createFinishIcon(), createStartIcon(), createUserIcon(), RouteReplay() (+2 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.17
Nodes (14): addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust(), SPREAD, stripWeek() (+6 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.09
Nodes (34): @tanstack/react-query@^5.102.8, applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeContext, ThemeProvider(), CameraOffPlaceholder() (+26 more)

### Community 35 - "activity.service.js"
Cohesion: 0.17
Nodes (7): downsampleRoute(), getActivityById(), isPlausibleActivity(), saveActivity(), toggleKudos(), assert, { describe, it }

### Community 36 - "routes/index.js"
Cohesion: 0.12
Nodes (17): express, router, express, router, express, router, express, landingLimiter (+9 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.13
Nodes (18): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), INTENSITY_OPTIONS, patchPlanId(), postActivate() (+10 more)

### Community 38 - "dashboard.service.js"
Cohesion: 0.12
Nodes (15): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), dayKeys(), getStreakSummary(), shiftDay() (+7 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.20
Nodes (13): ALLOWED_CATEGORIES, crypto, ensureUploadRoot(), fs, IMAGE_EXT, IMAGE_MIME, isAcceptedImage(), jpgIfImage() (+5 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): aiConfigured(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "auth-revocation.test.js"
Cohesion: 0.20
Nodes (10): signSession(), verifySession(), getme(), postlogout(), assert, authedReq(), dbPath, { describe, it } (+2 more)

### Community 43 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (19): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+11 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.12
Nodes (20): EXCLUSION_CATEGORIES, EXERCISES, availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF, EXCLUSION_KEYS (+12 more)

### Community 45 - "Button"
Cohesion: 0.19
Nodes (12): FAB(), EmptyState(), LogActivityModal(), Button(), ConfirmDialog(), Input(), LogoutConfirmDialog(), DeactivateAccountModal() (+4 more)

### Community 46 - "AdminAccess.jsx"
Cohesion: 0.18
Nodes (19): ConfirmDialog(), TOAST_ICONS, useAdminToast(), AdminAccess(), downloadPng(), GroupForm(), QrCard(), qrUrl() (+11 more)

### Community 47 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 48 - "settings.controller.js"
Cohesion: 0.18
Nodes (5): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS

### Community 49 - "email.service.js"
Cohesion: 0.11
Nodes (20): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), changeEmail() (+12 more)

### Community 50 - "verify-demo-sql.js"
Cohesion: 0.14
Nodes (8): fs, path, assert, bcrypt, fs, mysql, path, __dirname

### Community 52 - "app.js"
Cohesion: 0.22
Nodes (11): cookieParser, cors, createApp(), express, helmet, rateLimit, ALLOWED_ORIGINS, corsOptions (+3 more)

### Community 53 - "phoneVerification.service.js"
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

### Community 58 - "main.jsx"
Cohesion: 0.13
Nodes (13): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, installGlobalButtonLoading(), installServiceWorkerUpdate(), isTyping() (+5 more)

### Community 59 - "goals.service.js"
Cohesion: 0.19
Nodes (16): ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES, isoDate() (+8 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.24
Nodes (13): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+5 more)

### Community 61 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 62 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, foods:images (+9 more)

### Community 64 - "ExerciseBriefing.jsx"
Cohesion: 0.23
Nodes (12): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+4 more)

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "app/config/env.js"
Cohesion: 0.14
Nodes (14): API_BASE_URL, ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, NotificationStreamContext (+6 more)

### Community 67 - "frontend/package.json"
Cohesion: 0.12
Nodes (16): @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/poppins@^5.3.0, @mediapipe/pose@^0.5.1675469404, react-webcam@^7.2.0, tailwindcss@^4.2.2, name, private (+8 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "planEngine.js"
Cohesion: 0.21
Nodes (8): ACTIVITY_FACTORS, ageFromDob(), calcBmi(), calcBmr(), generatePlan(), PROTEIN_PER_KG, assert, { describe, it }

### Community 70 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 71 - "messenger.service.js"
Cohesion: 0.13
Nodes (9): isAivenHost, mysql, pool, sslFlag, updatePhone(), assertMode(), buildTips(), collectStats() (+1 more)

### Community 72 - "workoutLogs.controller.js"
Cohesion: 0.27
Nodes (6): getId(), parseLogId(), patchFeedback(), patchIdEnd(), postPause(), postResume()

### Community 73 - "Vitalis"
Cohesion: 0.15
Nodes (12): Docs, Environment, Features, License, Prerequisites, Scripts, Setup — backend, Setup — frontend (+4 more)

### Community 74 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, checkJs, lib, module, resolveJsonModule, strict, target (+3 more)

### Community 75 - "ai.routes.js"
Cohesion: 0.15
Nodes (12): aiQuota(), aiRouteLimiter, express, router, coachRouteLimiter, express, router, weekLimiter (+4 more)

### Community 76 - "useAuth"
Cohesion: 0.08
Nodes (40): AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, isDismissed() (+32 more)

### Community 77 - "bmi.service.js"
Cohesion: 0.22
Nodes (11): saveBmi(), summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance() (+3 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "forgotpassword.service.js"
Cohesion: 0.19
Nodes (9): bcrypt, checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure(), resetPassword() (+1 more)

### Community 80 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "check-syntax.js"
Cohesion: 0.29
Nodes (5): collect(), { execSync }, files, fs, path

### Community 83 - "public.service.js"
Cohesion: 0.20
Nodes (8): LANDING_MODULES, cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 84 - "callGeminiWithFallback"
Cohesion: 0.16
Nodes (13): buildSuggestPlanPrompt(), callGeminiWithFallback(), genAI(), getGenAI(), getGroq(), getGroqTextModel(), Groq, groq() (+5 more)

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.12
Nodes (27): AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL, AdminUsageChart() (+19 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "notificationPresentation.js"
Cohesion: 0.21
Nodes (15): NotificationCard(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime(), getCategory(), getNotificationMeta(), groupByDay() (+7 more)

### Community 88 - "foodLogs.controller.js"
Cohesion: 0.21
Nodes (11): main(), postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), categoryDir(), compressAndStore(), compressBufferAndStore() (+3 more)

### Community 89 - "Frontend Architecture — Vitalis"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

### Community 90 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 91 - "analyzeFoodImage"
Cohesion: 0.20
Nodes (15): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), callOpenRouter(), devError(), devLog(), devWarn() (+7 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.10
Nodes (21): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+13 more)

### Community 93 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 95 - "react"
Cohesion: 0.07
Nodes (50): TONE, ICONS, NotificationProvider(), Toast(), ToastContainer(), CSSProperties, react, formatTime() (+42 more)

### Community 96 - "geo.js"
Cohesion: 0.27
Nodes (10): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), DEFAULT_GATES, EARTH_RADIUS_M, evaluateFix() (+2 more)

### Community 97 - "sms.service.js"
Cohesion: 0.35
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 99 - "exportTable.js"
Cohesion: 0.32
Nodes (11): ExportMenu(), csvCell(), download(), exportCsv(), exportXlsx(), fmtDateText(), normalize(), pad() (+3 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (12): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), replaceSets() (+4 more)

### Community 101 - "Onboarding.jsx"
Cohesion: 0.06
Nodes (57): ActivityDetail(), BmiInsight(), SleepNote(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, humanizeOption() (+49 more)

### Community 103 - "upload-formats.test.js"
Cohesion: 0.29
Nodes (5): sharp@^0.35.5, assert, { describe, it }, sharp, sharp

### Community 104 - "Topbar.jsx"
Cohesion: 0.24
Nodes (13): ThemeToggle(), getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile(), Topbar(), getSettingsItems(), useNotificationStream() (+5 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "create-migration.js"
Cohesion: 0.29
Nodes (6): dir, files, fs, next, path, slug

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.20
Nodes (9): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+1 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "community.test.js"
Cohesion: 0.20
Nodes (9): devDependencies, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, assert, { describe, it }, request (+1 more)

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.17
Nodes (11): 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain, 4.2 Cost controls, 4.3 Safety and data minimization, 4. How it is built (reliability and cost controls), 5. Internet connectivity requirements, 6. Summary (+3 more)

### Community 111 - "Modal"
Cohesion: 0.27
Nodes (8): Dropdown(), Modal(), SIZES, INTENSITIES, PersonalPlanSheet(), TAGS, prefersReducedMotion(), usePresence()

### Community 112 - "Database Migrations — Vitalis (ALTER-based)"
Cohesion: 0.20
Nodes (9): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+1 more)

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "Social.jsx"
Cohesion: 0.20
Nodes (16): Conventions, useDashboardData(), buildThread(), ContactAvatar(), ContactSkeleton(), dayKeyOf(), dayLabel(), humanizeGoal() (+8 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "jsonwebtoken"
Cohesion: 0.32
Nodes (6): jsonwebtoken@^9.0.3, getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), jsonwebtoken

### Community 117 - "build-database-sql.js"
Cohesion: 0.22
Nodes (10): conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql, OUT (+2 more)

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
Cohesion: 0.20
Nodes (18): formStatus(), FormStatusPill(), RepProgressRing(), partialHint(), WORKOUT_OPTIONS, useAICoach(), keyPoints(), useHoldTimer() (+10 more)

### Community 124 - "Register.jsx"
Cohesion: 0.24
Nodes (14): AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS, TermsOfUseModal() (+6 more)

### Community 125 - "ai-privacy.test.js"
Cohesion: 0.11
Nodes (14): assert, { describe, it }, end, fs, path, personalize, src, start (+6 more)

### Community 127 - "sms-verification.test.js"
Cohesion: 0.25
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 128 - "CommunityFeed.jsx"
Cohesion: 0.11
Nodes (24): Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES, TAG_ICONS, TAGS (+16 more)

### Community 129 - "server.js"
Cohesion: 0.15
Nodes (9): socket.io@^4.8.3, app, http, io, { Server }, _jwt, missing, required (+1 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "trainingPrefs.controller.js"
Cohesion: 0.29
Nodes (3): getExerciseGuide(), exerciseGuide(), EXPERIENCE_LEVELS

### Community 134 - "session-dedupe.test.js"
Cohesion: 0.22
Nodes (5): assert, conn, { describe, it, before }, path, table

### Community 137 - "cookies.js"
Cohesion: 0.53
Nodes (5): postDeactivate(), baseCookieOptions(), getClearCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 138 - "goalProfile.test.js"
Cohesion: 0.32
Nodes (5): GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 140 - "zod"
Cohesion: 0.29
Nodes (5): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, zod

### Community 143 - "workout-history-pagination.test.js"
Cohesion: 0.33
Nodes (3): parseHistoryQuery(), assert, { describe, it }

### Community 144 - "goals.controller.js"
Cohesion: 0.17
Nodes (17): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+9 more)

### Community 145 - "usePoseEngine.js"
Cohesion: 0.60
Nodes (4): loadMediaPipe(), POSE_SCRIPTS, startScriptLoad(), usePoseEngine()

### Community 146 - "Icon"
Cohesion: 0.12
Nodes (20): Icon(), AdminBottomNav(), COPY, CameraToggleButton(), CorrectionBanner(), NeuralStatusCard(), RightPanel(), SessionBottomBar() (+12 more)

### Community 148 - "email-delivery.test.js"
Cohesion: 0.09
Nodes (12): bcrypt, { createHash }, crypto, jwt, normalizeId(), record(), trackingToken(), assert (+4 more)

### Community 160 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 161 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

### Community 162 - "StatsPanel.jsx"
Cohesion: 0.70
Nodes (4): paceToSeconds(), SplitRows(), StatsPanel(), StatusPill()

### Community 163 - "sessionFit.js"
Cohesion: 0.83
Nodes (3): estimateDayMinutes(), estimateExerciseSeconds(), fitDayToMinutes()

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `AdminMonitoring.jsx`, `CommunityFeed.jsx`, `Dashboard.jsx`, `MealTracker.jsx`, `Log.jsx`, `Plans.jsx`, `VerifyPhone.jsx`, `Landing.jsx`, `ActivityMap.jsx`, `ForgotPasswordModal.jsx`, `workoutGuide.js`, `AppRoutes.jsx`, `usePoseEngine.js`, `Icon`, `ThemeToggle.jsx`, `fmtNum`, `Toast.jsx`, `Preferences.jsx`, `Profile.jsx`, `dependencies`, `ExerciseGuideModal.jsx`, `react`, `StatsTab.jsx`, `useAuth.jsx`, `StatsPanel.jsx`, `Button`, `AdminAccess.jsx`, `HistoryTab.jsx`, `main.jsx`, `ExerciseBriefing.jsx`, `app/config/env.js`, `frontend/package.json`, `useAuth`, `AdminOverview.jsx`, `StreakJourney.jsx`, `geo.js`, `exportTable.js`, `Onboarding.jsx`, `Topbar.jsx`, `Modal`, `Social.jsx`, `CameraWorkout.jsx`, `Register.jsx`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Should `MealTracker.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05054945054945055 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `admin.service.js`, `verifyUser.js`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `unit/health.test.js`, `plans.controller.js`, `dashboard.service.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.service.js`, `email.service.js`, `app.js`, `phoneVerification.service.js`, `goals.service.js`, `trainingPrefs.service.js`, `validId`, `messenger.service.js`, `reminder.service.js`, `forgotpassword.service.js`, `foodLogs.controller.js`, `forgotpassword.routes.js`, `workoutLogs.service.js`, `messenger.service.js`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Dashboard.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11673469387755102 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `AdminMonitoring.jsx`, `MealTracker.jsx`, `Dashboard.jsx`, `Log.jsx`, `Plans.jsx`, `ActivityMap.jsx`, `ForgotPasswordModal.jsx`, `workoutGuide.js`, `AppRoutes.jsx`, `ThemeToggle.jsx`, `fmtNum`, `Preferences.jsx`, `ExerciseGuideModal.jsx`, `react`, `StatsTab.jsx`, `StatsPanel.jsx`, `useAuth.jsx`, `Button`, `AdminAccess.jsx`, `HistoryTab.jsx`, `ExerciseBriefing.jsx`, `useAuth`, `AdminOverview.jsx`, `notificationPresentation.js`, `StreakJourney.jsx`, `react`, `exportTable.js`, `Onboarding.jsx`, `Topbar.jsx`, `Modal`, `Social.jsx`, `CameraWorkout.jsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._