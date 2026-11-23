# Graph Report - vitalisapp  (2026-11-24)

## Corpus Check
- 593 files · ~387,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 24, (none) 3, .example 2)

## Summary
- 3199 nodes · 8128 edges · 149 communities (142 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 645 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33310e8d`
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
- Explore.jsx
- backend/package.json
- progressInsights.js
- Landing.jsx
- ForgotPasswordModal.jsx
- ActivityMap.jsx
- react
- email-delivery.test.js
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- buildSampleDataset
- ai.service.js
- foodLogs.service.js
- CommunityFeed.jsx
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
- copy-mediapipe.mjs
- account-validation.test.js
- settings.controller.js
- sms.service.js
- MacroCoachCard.jsx
- logs.controller.js
- app.js
- phoneVerification.service.js
- progress.controller.js
- VerifyPhone.jsx
- compilerOptions
- package.json
- MealTrackerDiary.jsx
- goals.service.js
- trainingPrefs.service.js
- utils/nutrition.js
- scripts
- analyzeFoodImage
- AppNav.jsx
- validId
- migrations.test.js
- Onboarding.jsx
- allergies.service.js
- StreakJourney.jsx
- email-verification.test.js
- AddWorkoutModal.jsx
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- VerifyEmail.jsx
- server.js
- bmi.service.js
- reminder.service.js
- main.jsx
- plans-personal.test.js
- food-traits.test.js
- messenger.service.js
- email.service.js
- verify-demo-sql.js
- Icon
- migrate.js
- Notifications.jsx
- Frontend Architecture — Vitalis
- apiClient.js
- CoachCard.jsx
- forgotpassword.routes.js
- ExerciseGuideModal.jsx
- brevo-transport.test.js
- sms-verification.test.js
- useAuth
- security.controller.js
- CommunityFeed.jsx
- workoutLogs.service.js
- WeekCalendarCard.jsx
- ai-privacy.test.js
- Preferences.jsx
- controllers/README.md
- community.routes.js
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- VITALIS — AI Integration and Technical Justification
- urlFilters.test.js
- Database Migrations — Vitalis (ALTER-based)
- backend/.prettierrc.json
- Dashboard.jsx
- foodImage.service.js
- jsonwebtoken
- verify-demo-sql.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- taskNotifications.js
- .prettierrc.json
- CameraWorkout.jsx
- reminderScheduler.js
- apiPost
- callGeminiWithFallback
- macro-coach.test.js
- Migrations — Vitalis (one table per file)
- unit/health.test.js
- Verification email delivery status
- express
- jwt.js
- goalProfile.test.js
- energy.service.js
- rateLimits.js
- goals.controller.js
- vite.config.js
- public.service.js
- CameraWorkout
- app/config/env.js
- community.test.js
- ScanResult.jsx
- vercel.json
- Topbar.jsx
- foodInfo.test.js
- usePoseEngine.js
- cookies.js
- ForgotPassword.jsx
- css-custom-properties.d.ts

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 250 edges
2. `react` - 148 edges
3. `AppError` - 92 edges
4. `apiGet()` - 72 edges
5. `apiPost()` - 72 edges
6. `useAuth()` - 71 edges
7. `apiFetch()` - 53 edges
8. `Modal()` - 49 edges
9. `react-router-dom` - 47 edges
10. `Dashboard()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js
- `4.2 Cost controls` --references--> `validateAndCorrectMacros()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js

## Import Cycles
- None detected.

## Communities (149 total, 7 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.15
Nodes (25): DailySummaryCard(), formatNumber(), MacroCards(), MACROS, pctOf(), buildMonthGrid(), CalendarPopup(), EMPTY_FORM (+17 more)

### Community 2 - "ExerciseBriefing.jsx"
Cohesion: 0.14
Nodes (22): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+14 more)

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
Nodes (53): TONE, YearlyBmi(), BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum() (+45 more)

### Community 7 - "Explore.jsx"
Cohesion: 0.17
Nodes (19): ContinueTrainingCard(), Explore(), GoalPlansPanel(), GoalLinkBanner(), humanizeGoalType(), MyPlans(), PlanDetailOverlay(), FilterPill() (+11 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (41): author, dependencies, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1, google-auth-library@^10.6.2 (+33 more)

### Community 9 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "ForgotPasswordModal.jsx"
Cohesion: 0.22
Nodes (10): ChangePasswordModal(), ForgotPasswordModal(), STEP_LABELS, STEP_META, OtpInput(), PasswordField(), PasswordStrength(), post() (+2 more)

### Community 12 - "ActivityMap.jsx"
Cohesion: 0.05
Nodes (62): react-leaflet@^5.0.0, FitRoute(), DOT, GpsBadge(), LABELS, ActivityCard(), formatActivityDate(), HistorySkeleton() (+54 more)

### Community 13 - "react"
Cohesion: 0.12
Nodes (27): LogActivityModal(), Button(), ConfirmDialog(), Dropdown(), Input(), Modal(), SIZES, RunAnalysisOverlay() (+19 more)

### Community 14 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (9): crypto, jwt, normalizeId(), record(), assert, dbPath, { it }, jwt (+1 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (36): App(), AppProviders(), AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+28 more)

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
Cohesion: 0.11
Nodes (29): bcrypt, changeEmail(), changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount() (+21 more)

### Community 20 - "buildSampleDataset"
Cohesion: 0.31
Nodes (12): addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO(), pick() (+4 more)

### Community 21 - "ai.service.js"
Cohesion: 0.17
Nodes (18): safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), dailySummary(), fitnessAnalysis(), FOOD_POOL (+10 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.12
Nodes (16): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), crypto, estimateFoodDensity(), getCached() (+8 more)

### Community 23 - "CommunityFeed.jsx"
Cohesion: 0.15
Nodes (17): ICONS, NotificationProvider(), Toast(), ToastContainer(), useToast(), Avatar(), CommunityFeed(), PostSkeleton() (+9 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (28): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+20 more)

### Community 25 - "devDependencies"
Cohesion: 0.12
Nodes (19): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/leaflet@^1.9.22, @types/node@^26.6.5 (+11 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.11
Nodes (28): activityLabel(), Toast(), VARIANTS, useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR() (+20 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (36): browserslist, dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, @mediapipe/pose@0.5.1675469404 (+28 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.17
Nodes (11): sendPasswordResetOtpEmail(), bcrypt, checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure() (+3 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.08
Nodes (18): parseHistoryQuery(), assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach } (+10 more)

### Community 32 - "routes/index.js"
Cohesion: 0.12
Nodes (17): express, router, express, router, express, landingLimiter, router, visitLimiter (+9 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.16
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth"
Cohesion: 0.16
Nodes (20): applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeContext, ThemeProvider(), clearOfflineQueue(), AuthContext (+12 more)

### Community 35 - "activity.service.js"
Cohesion: 0.11
Nodes (7): downsampleRoute(), getActivityById(), isPlausibleActivity(), saveActivity(), toggleKudos(), assert, { describe, it }

### Community 36 - "verifyUser.js"
Cohesion: 0.12
Nodes (14): clearSessionCookie(), jwt, requireMember(), verifyUser(), express, read, router, express (+6 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.13
Nodes (18): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), INTENSITY_OPTIONS, patchPlanId(), postActivate() (+10 more)

### Community 38 - "dashboard.service.js"
Cohesion: 0.12
Nodes (18): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), EMPTY_BURN, getBurnByDay(), getBurnForDay() (+10 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.07
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.11
Nodes (26): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore(), compressImageBase64() (+18 more)

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
Nodes (23): EXCLUSION_CATEGORIES, EXERCISES, getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF (+15 more)

### Community 45 - "MessengerPanel.jsx"
Cohesion: 0.14
Nodes (24): Conventions, ErrorState(), useNotificationStream(), useDashboardData(), BodyMeasurementsPanel(), EMPTY(), FIELDS, todayKey() (+16 more)

### Community 46 - "copy-mediapipe.mjs"
Cohesion: 0.12
Nodes (12): assert, conn, { describe, it, before }, path, table, files, out, outRoot (+4 more)

### Community 47 - "account-validation.test.js"
Cohesion: 0.11
Nodes (15): VALID_GENDERS, fieldLabel(), friendlyMessage(), validate(), express, router, write, express (+7 more)

### Community 48 - "settings.controller.js"
Cohesion: 0.11
Nodes (10): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS (+2 more)

### Community 49 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 50 - "MacroCoachCard.jsx"
Cohesion: 0.24
Nodes (11): EMPTY, round1(), todayKey(), useTodayMeals(), macroCoachMessage(), MacroCoachCard(), useActiveGoal(), qk (+3 more)

### Community 51 - "logs.controller.js"
Cohesion: 0.20
Nodes (3): express, router, write

### Community 52 - "app.js"
Cohesion: 0.22
Nodes (11): cookieParser, cors, createApp(), express, helmet, rateLimit, ALLOWED_ORIGINS, corsOptions (+3 more)

### Community 53 - "phoneVerification.service.js"
Cohesion: 0.25
Nodes (12): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+4 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "VerifyPhone.jsx"
Cohesion: 0.12
Nodes (29): AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS, TermsOfUseModal() (+21 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "MealTrackerDiary.jsx"
Cohesion: 0.17
Nodes (20): resolveAssetUrl(), Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips() (+12 more)

### Community 59 - "goals.service.js"
Cohesion: 0.18
Nodes (17): saveBmi(), ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES (+9 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.24
Nodes (13): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+5 more)

### Community 61 - "utils/nutrition.js"
Cohesion: 0.28
Nodes (14): clamp(), DENSITY_WRAPPERS, kcalFromMacros(), normalizeFoodName(), normalizeGrams(), per100FromServing(), round1(), roundKcal() (+6 more)

### Community 62 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, foods:images (+9 more)

### Community 63 - "analyzeFoodImage"
Cohesion: 0.20
Nodes (15): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), callOpenRouter(), devError(), devLog(), devWarn() (+7 more)

### Community 64 - "AppNav.jsx"
Cohesion: 0.10
Nodes (25): AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, PageHeader() (+17 more)

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "migrations.test.js"
Cohesion: 0.22
Nodes (6): assert, { describe, it }, dir, EXPECTED, fs, path

### Community 67 - "Onboarding.jsx"
Cohesion: 0.06
Nodes (61): ActivityDetail(), BmiInsight(), SleepNote(), GoalDetailSheet(), goalIcon(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS (+53 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 70 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 71 - "AddWorkoutModal.jsx"
Cohesion: 0.36
Nodes (7): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS

### Community 72 - "workoutLogs.controller.js"
Cohesion: 0.27
Nodes (6): getId(), parseLogId(), patchFeedback(), patchIdEnd(), postPause(), postResume()

### Community 73 - "Vitalis"
Cohesion: 0.15
Nodes (12): Docs, Environment, Features, License, Prerequisites, Scripts, Setup — backend, Setup — frontend (+4 more)

### Community 74 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, checkJs, lib, module, resolveJsonModule, strict, target (+3 more)

### Community 75 - "VerifyEmail.jsx"
Cohesion: 0.46
Nodes (4): VerificationLayout(), CheckEmail(), VerifyEmail(), postVerifyRoute()

### Community 76 - "server.js"
Cohesion: 0.15
Nodes (9): socket.io@^4.8.3, app, http, io, { Server }, _jwt, missing, required (+1 more)

### Community 77 - "bmi.service.js"
Cohesion: 0.14
Nodes (18): summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance(), ACTIVITY_FACTORS (+10 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "main.jsx"
Cohesion: 0.10
Nodes (17): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, leaflet@^1.9.4, material-symbols@^0.44.0, @react-oauth/google@^0.13.4, installGlobalButtonLoading() (+9 more)

### Community 80 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "messenger.service.js"
Cohesion: 0.07
Nodes (11): isAivenHost, mysql, pool, sslFlag, createMessage(), FRIEND_STATUSES, updatePhone(), assertMode() (+3 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (17): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), deliver() (+9 more)

### Community 84 - "verify-demo-sql.js"
Cohesion: 0.06
Nodes (33): conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql, OUT (+25 more)

### Community 85 - "Icon"
Cohesion: 0.05
Nodes (111): Icon(), Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel() (+103 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "Notifications.jsx"
Cohesion: 0.18
Nodes (21): NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime(), getCategory() (+13 more)

### Community 88 - "Frontend Architecture — Vitalis"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

### Community 89 - "apiClient.js"
Cohesion: 0.19
Nodes (19): apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity(), apiSaveFoodLog(), compressImageToBase64(), dataUrlToBlob(), toScanResult(), uniqueKey() (+11 more)

### Community 90 - "CoachCard.jsx"
Cohesion: 0.53
Nodes (4): CoachCard(), optionCopy(), STATUS, useCoachWeek()

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.20
Nodes (9): emailSchema, express, otpSendLimiter, otpVerifyLimiter, passwordResetLimiter, resetSchema, router, verifySchema (+1 more)

### Community 93 - "ExerciseGuideModal.jsx"
Cohesion: 0.16
Nodes (23): getAllGuideExercises(), DayTracker(), mapPlanSchedule(), WEEKDAY_LETTERS, ExerciseGuideModal(), LEVEL, load(), norm() (+15 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 95 - "sms-verification.test.js"
Cohesion: 0.25
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 97 - "useAuth"
Cohesion: 0.27
Nodes (10): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute(), isCacheFresh(), useAuth(), MemberRoute() (+2 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "CommunityFeed.jsx"
Cohesion: 0.20
Nodes (14): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), AVATAR_SURFACES, avatarGradient(), avatarSurface() (+6 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (14): getUserWeightKg(), attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage() (+6 more)

### Community 101 - "WeekCalendarCard.jsx"
Cohesion: 0.33
Nodes (9): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS, useActivityLogger() (+1 more)

### Community 102 - "ai-privacy.test.js"
Cohesion: 0.22
Nodes (8): assert, { describe, it }, end, fs, path, personalize, src, start

### Community 103 - "Preferences.jsx"
Cohesion: 0.19
Nodes (14): AccountPageShell(), FeedbackModal(), ThemeToggle(), VARIANTS, FAQS, HelpSupport(), clampStepGoal(), GOAL_PRESETS (+6 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "community.routes.js"
Cohesion: 0.29
Nodes (6): commentLimiter, createPostLimiter, express, likeLimiter, router, write

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.18
Nodes (10): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+2 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

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
Cohesion: 0.15
Nodes (36): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+28 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "jsonwebtoken"
Cohesion: 0.32
Nodes (6): jsonwebtoken@^9.0.3, getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), jsonwebtoken

### Community 117 - "verify-demo-sql.js"
Cohesion: 0.20
Nodes (9): bcryptjs@^3.0.3, mysql2@^3.20.0, assert, bcrypt, fs, mysql, path, bcryptjs (+1 more)

### Community 118 - "Dashboard Redesign — Visual Specification (References A & B)"
Cohesion: 0.29
Nodes (6): Audit baseline (before redesign), Dashboard Redesign — Visual Specification (References A & B), Desktop specification (Reference B), Guardrails for implementation, Mobile specification (Reference A), Reference-to-implementation mapping

### Community 119 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, copy:mediapipe, dev, lint, prebuild, predev, preview (+2 more)

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
Cohesion: 0.18
Nodes (11): CorrectionBanner(), EarlyExitDialog(), formStatus(), FormStatusPill(), RepProgressRing(), LEVELS, WorkoutFeedbackSheet(), scoreChip() (+3 more)

### Community 127 - "apiPost"
Cohesion: 0.15
Nodes (20): useWorkoutSession(), AdaptiveTipsCard(), TIP_ICONS, TIP_STYLES, PersonalPlanSheet(), TabBar(), TrainingPrefsSheet(), formatDuration() (+12 more)

### Community 128 - "callGeminiWithFallback"
Cohesion: 0.16
Nodes (13): buildSuggestPlanPrompt(), callGeminiWithFallback(), genAI(), getGenAI(), getGroq(), getGroqTextModel(), Groq, groq() (+5 more)

### Community 129 - "macro-coach.test.js"
Cohesion: 0.33
Nodes (5): assert, { describe, it, before, after }, gemini, geminiPath, PLANS

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

### Community 134 - "express"
Cohesion: 0.09
Nodes (22): writeLimiter(), express, router, write, express, router, write, express (+14 more)

### Community 137 - "jwt.js"
Cohesion: 0.53
Nodes (5): verifySession(), getme(), postDeactivate(), postlogout(), getClearCookieOptions()

### Community 138 - "goalProfile.test.js"
Cohesion: 0.32
Nodes (5): GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 139 - "energy.service.js"
Cohesion: 0.18
Nodes (11): addDaysISO(), workoutKcal(), getDailyStats(), DIFFICULTY_FACTOR, estimateWorkoutKcal(), MET_RULES, metForWorkout(), normalizeType() (+3 more)

### Community 140 - "rateLimits.js"
Cohesion: 0.13
Nodes (23): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+15 more)

### Community 141 - "goals.controller.js"
Cohesion: 0.17
Nodes (17): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+9 more)

### Community 143 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 144 - "public.service.js"
Cohesion: 0.20
Nodes (8): LANDING_MODULES, cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 145 - "CameraWorkout"
Cohesion: 0.12
Nodes (30): DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), MobileWorkoutPills(), PICKER_OPTIONS, CHOOSER_FILTERS, CHOOSER_GROUPS (+22 more)

### Community 149 - "app/config/env.js"
Cohesion: 0.17
Nodes (12): API_BASE_URL, ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, NotificationStreamContext (+4 more)

### Community 151 - "community.test.js"
Cohesion: 0.40
Nodes (4): app, assert, { describe, it }, request

### Community 152 - "ScanResult.jsx"
Cohesion: 0.33
Nodes (9): cleanFoodName(), CorrectInput(), FOOD_ICON_MAP, iconFor(), KcalRing(), MacroBar(), ScanResult(), MEAL_SLOTS (+1 more)

### Community 155 - "Topbar.jsx"
Cohesion: 0.15
Nodes (23): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile() (+15 more)

### Community 156 - "foodInfo.test.js"
Cohesion: 0.47
Nodes (7): SugarSodiumCard(), goalIntakeNote(), LIMITS, limitStatus(), num(), status(), sugarSodiumTotals()

### Community 159 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 161 - "cookies.js"
Cohesion: 0.83
Nodes (3): baseCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 164 - "ForgotPassword.jsx"
Cohesion: 0.43
Nodes (7): ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Explore.jsx`, `Landing.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `AppRoutes.jsx`, `CameraWorkout`, `app/config/env.js`, `CommunityFeed.jsx`, `ScanResult.jsx`, `Profile.jsx`, `Topbar.jsx`, `dependencies`, `usePoseEngine.js`, `useAuth`, `ForgotPassword.jsx`, `css-custom-properties.d.ts`, `MessengerPanel.jsx`, `MacroCoachCard.jsx`, `VerifyPhone.jsx`, `MealTrackerDiary.jsx`, `AppNav.jsx`, `Onboarding.jsx`, `StreakJourney.jsx`, `AddWorkoutModal.jsx`, `VerifyEmail.jsx`, `main.jsx`, `Icon`, `Notifications.jsx`, `apiClient.js`, `CoachCard.jsx`, `ExerciseGuideModal.jsx`, `CommunityFeed.jsx`, `WeekCalendarCard.jsx`, `Preferences.jsx`, `urlFilters.test.js`, `Dashboard.jsx`, `CameraWorkout.jsx`, `apiPost`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Should `ExerciseBriefing.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `unit/health.test.js`, `admin.service.js`, `express`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `forgotpassword.service.js`, `plans.controller.js`, `dashboard.service.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.service.js`, `account-validation.test.js`, `app.js`, `phoneVerification.service.js`, `goals.service.js`, `trainingPrefs.service.js`, `validId`, `reminder.service.js`, `messenger.service.js`, `workoutLogs.service.js`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Explore.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `react`, `AppRoutes.jsx`, `CameraWorkout`, `CommunityFeed.jsx`, `ScanResult.jsx`, `Topbar.jsx`, `foodInfo.test.js`, `MessengerPanel.jsx`, `MacroCoachCard.jsx`, `VerifyPhone.jsx`, `MealTrackerDiary.jsx`, `AppNav.jsx`, `Onboarding.jsx`, `StreakJourney.jsx`, `Notifications.jsx`, `apiClient.js`, `CoachCard.jsx`, `ExerciseGuideModal.jsx`, `WeekCalendarCard.jsx`, `Preferences.jsx`, `Dashboard.jsx`, `CameraWorkout.jsx`, `apiPost`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._
- **Should `Log.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06838106370543542 - nodes in this community are weakly interconnected._