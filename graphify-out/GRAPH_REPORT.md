# Graph Report - vitalisapp  (2026-11-23)

## Corpus Check
- 580 files · ~384,488 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 24, (none) 3, .example 2)

## Summary
- 3159 nodes · 7955 edges · 153 communities (142 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 637 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eeb98a3f`
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
- email-delivery.test.js
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- buildSampleDataset
- ai.service.js
- foodLogs.service.js
- CameraWorkout
- AppError
- devDependencies
- Profile.jsx
- project.yml
- dependencies
- forgotpassword.service.js
- progressOverview.js
- ref_node_assert
- public.routes.js
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
- ChangeGoalModal.jsx
- account-validation.test.js
- settings.controller.js
- sms.service.js
- MacroCoachCard.jsx
- logs.controller.js
- app.js
- phoneVerification.service.js
- progress.controller.js
- frontend/package.json
- compilerOptions
- package.json
- goals.service.js
- trainingPrefs.service.js
- utils/nutrition.js
- scripts
- HistoryTab.jsx
- Sidebar.jsx
- validId
- bmi.js
- Onboarding.jsx
- allergies.service.js
- StreakJourney.jsx
- email-verification.test.js
- db.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- useProfile.js
- server.js
- bmi.service.js
- reminder.service.js
- main.jsx
- plans-personal.test.js
- food-traits.test.js
- messenger.service.js
- email.service.js
- verify-demo-sql.js
- AdminOverview.jsx
- migrate.js
- Notifications.jsx
- PersonalizationSection.jsx
- apiClient.js
- generate-email-assets.js
- App.jsx
- forgotpassword.routes.js
- ExerciseGuideModal.jsx
- brevo-transport.test.js
- sms-verification.test.js
- trainingPrefs.controller.js
- RightPanel.jsx
- security.controller.js
- CommunityFeed.jsx
- workoutLogs.service.js
- WeekCalendarCard.jsx
- ai-privacy.test.js
- Preferences.jsx
- geo.js
- controllers/README.md
- community.routes.js
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- streaks.test.js
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
- accessGroups.controller.js
- zod
- reminderScheduler.js
- Icon
- callGeminiWithFallback
- macro-coach.test.js
- Migrations — Vitalis (one table per file)
- unit/health.test.js
- Verification email delivery status
- express
- jwt.js
- goalProfile.test.js
- stats.routes.js
- rateLimits.js
- goals.controller.js
- useAvatar.js
- vite.config.js
- public.service.js
- WorkoutSummary.jsx
- community.test.js
- vercel.json
- react-router-dom
- usePoseEngine.js
- cookies.js
- sessionFit.js
- ForgotPassword.jsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 243 edges
2. `react` - 145 edges
3. `AppError` - 92 edges
4. `apiGet()` - 72 edges
5. `apiPost()` - 72 edges
6. `useAuth()` - 71 edges
7. `apiFetch()` - 53 edges
8. `Modal()` - 45 edges
9. `react-router-dom` - 45 edges
10. `Dashboard()` - 42 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `1. What the AI does in VITALIS` --references--> `analyzeFoodImage()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js

## Import Cycles
- None detected.

## Communities (153 total, 11 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.16
Nodes (14): react-webcam@^7.2.0, CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay() (+6 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.05
Nodes (71): resolveAssetUrl(), Spinner(), CameraScanner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb() (+63 more)

### Community 2 - "ExerciseBriefing.jsx"
Cohesion: 0.22
Nodes (13): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+5 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.07
Nodes (41): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, backoffSleep(), BREADED_FOOD_KEYWORDS, callOpenRouter() (+33 more)

### Community 5 - "admin.service.js"
Cohesion: 0.19
Nodes (13): assertMutableAdmin(), changeUserRole(), deleteCommunityPost(), deleteUser(), forceSignout(), getSmsStats(), _getTargetUser(), getUserDetail() (+5 more)

### Community 6 - "Log.jsx"
Cohesion: 0.06
Nodes (58): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS, BUCKET_CAPTION (+50 more)

### Community 7 - "Plans.jsx"
Cohesion: 0.10
Nodes (31): FilterPill(), PlanActions(), PlanCard(), PlanCover(), TabBar(), TAG_ICON, ContinueTrainingCard(), Explore() (+23 more)

### Community 8 - "backend/package.json"
Cohesion: 0.07
Nodes (35): author, dependencies, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1, google-auth-library@^10.6.2 (+27 more)

### Community 9 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.05
Nodes (68): rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument() (+60 more)

### Community 11 - "ForgotPasswordModal.jsx"
Cohesion: 0.25
Nodes (9): ChangePasswordModal(), ForgotPasswordModal(), STEP_LABELS, STEP_META, PasswordField(), PasswordStrength(), post(), useForgotPassword() (+1 more)

### Community 12 - "ActivityMap.jsx"
Cohesion: 0.10
Nodes (28): AppShell(), BottomNav(), FitRoute(), DOT, GpsBadge(), LABELS, LocationNotice(), MapResizer() (+20 more)

### Community 13 - "react"
Cohesion: 0.10
Nodes (32): API_BASE_URL, FAB(), FeedbackModal(), LogActivityModal(), Button(), ConfirmDialog(), Dropdown(), Input() (+24 more)

### Community 14 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (10): crypto, jwt, normalizeId(), record(), trackingToken(), assert, dbPath, { it } (+2 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (42): AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent, AdminMonitoring, AdminOverview (+34 more)

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
Cohesion: 0.13
Nodes (25): bcrypt, changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+17 more)

### Community 20 - "buildSampleDataset"
Cohesion: 0.31
Nodes (12): addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO(), pick() (+4 more)

### Community 21 - "ai.service.js"
Cohesion: 0.16
Nodes (20): aiConfigured(), getVisionModels(), safeParseAI(), aiSummary(), analyzePose(), buildNutritionSection(), buildProjection(), buildRuleSummary() (+12 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.12
Nodes (16): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), crypto, estimateFoodDensity(), getCached() (+8 more)

### Community 23 - "CameraWorkout"
Cohesion: 0.22
Nodes (14): formStatus(), FormStatusPill(), RepProgressRing(), useAICoach(), keyPoints(), useHoldTimer(), angle3(), assessPose() (+6 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (28): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+20 more)

### Community 25 - "devDependencies"
Cohesion: 0.10
Nodes (22): devDependencies, browserslist@^4.29.6, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/leaflet@^1.9.22 (+14 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.13
Nodes (26): activityLabel(), Toast(), VARIANTS, activityFactors, bmiCategory(), BodyMetricsPanel(), calcBMR(), ChangeGoalModal (+18 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, leaflet@^1.9.4, @mediapipe/drawing_utils@^0.3.1675466124, @mediapipe/pose@^0.5.1675469404, qrcode.react@^4.2.0 (+17 more)

### Community 29 - "forgotpassword.service.js"
Cohesion: 0.17
Nodes (11): sendPasswordResetOtpEmail(), bcrypt, checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure() (+3 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.09
Nodes (16): parseHistoryQuery(), assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach } (+8 more)

### Community 32 - "public.routes.js"
Cohesion: 0.40
Nodes (4): express, landingLimiter, router, visitLimiter

### Community 33 - "coachEngine.js"
Cohesion: 0.16
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth"
Cohesion: 0.16
Nodes (20): @tanstack/react-query@^5.102.8, applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeProvider(), AuthContext, AuthProvider() (+12 more)

### Community 35 - "activity.service.js"
Cohesion: 0.11
Nodes (7): downsampleRoute(), getActivityById(), isPlausibleActivity(), saveActivity(), toggleKudos(), assert, { describe, it }

### Community 36 - "verifyUser.js"
Cohesion: 0.10
Nodes (19): clearSessionCookie(), jwt, verifyUser(), express, read, router, express, router (+11 more)

### Community 37 - "plans.controller.js"
Cohesion: 0.13
Nodes (18): createPersonalSchema, deletePlanId(), enrollSchema, FOCUS_OPTIONS, getcontentPlanId(), INTENSITY_OPTIONS, patchPlanId(), postActivate() (+10 more)

### Community 38 - "dashboard.service.js"
Cohesion: 0.19
Nodes (10): addDaysISO(), getDashboard(), getDaySnapshot(), getWeekCalendar(), weekdayIndex(), dayKeys(), getStreakSummary(), shiftDay() (+2 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.10
Nodes (28): sharp@^0.35.5, postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore() (+20 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "auth-revocation.test.js"
Cohesion: 0.14
Nodes (9): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, mockRes(), res (+1 more)

### Community 43 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.12
Nodes (19): EXCLUSION_CATEGORIES, EXERCISES, availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF, exercisesPerSession() (+11 more)

### Community 45 - "MessengerPanel.jsx"
Cohesion: 0.08
Nodes (34): logout(), Build, Conventions, Frontend Architecture — Vitalis, Principles, Related, State, Structure (+26 more)

### Community 46 - "ChangeGoalModal.jsx"
Cohesion: 0.20
Nodes (15): GOAL_TYPES, PACES, checkTargetDate(), cleanExtraGoals(), EXCLUSION_CATEGORIES, EXPERIENCE_LEVELS, extraGoalBlockReason(), iso() (+7 more)

### Community 47 - "account-validation.test.js"
Cohesion: 0.17
Nodes (7): VALID_GENDERS, ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 48 - "settings.controller.js"
Cohesion: 0.14
Nodes (7): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS, assert, { describe, it }

### Community 49 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 50 - "MacroCoachCard.jsx"
Cohesion: 0.24
Nodes (10): EMPTY, round1(), todayKey(), useTodayMeals(), macroCoachMessage(), MacroCoachCard(), useActiveGoal(), qk (+2 more)

### Community 51 - "logs.controller.js"
Cohesion: 0.20
Nodes (3): express, router, write

### Community 52 - "app.js"
Cohesion: 0.20
Nodes (12): cookieParser, cors, createApp(), express, helmet, rateLimit, ALLOWED_ORIGINS, corsOptions (+4 more)

### Community 53 - "phoneVerification.service.js"
Cohesion: 0.23
Nodes (12): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+4 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "frontend/package.json"
Cohesion: 0.12
Nodes (15): browserslist, @bryllim/workout-guide@^1.0.0, framer-motion@^12.40.0, @mediapipe/camera_utils@^0.3.1675466862, socket.io-client@^4.8.3, tailwindcss@^4.2.2, name, private (+7 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 59 - "goals.service.js"
Cohesion: 0.19
Nodes (16): ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES, isoDate() (+8 more)

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
Cohesion: 0.14
Nodes (26): ICONS, NotificationProvider(), Toast(), ToastContainer(), ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab() (+18 more)

### Community 64 - "Sidebar.jsx"
Cohesion: 0.10
Nodes (30): AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES, normalize() (+22 more)

### Community 65 - "validId"
Cohesion: 0.06
Nodes (23): addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema, listComments(), paginationSchema, remove(), toggleLike() (+15 more)

### Community 66 - "bmi.js"
Cohesion: 0.35
Nodes (9): BmiInsight(), SleepNote(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange() (+1 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.13
Nodes (20): humanizeOption(), ALLERGEN_PRESETS, calcBmi(), Chip(), ChoiceCard(), DAY_NAMES, DAY_SHORT, EQUIPMENT_CHOICES (+12 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 70 - "email-verification.test.js"
Cohesion: 0.17
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 71 - "db.js"
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

### Community 75 - "useProfile.js"
Cohesion: 0.53
Nodes (5): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile()

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
Cohesion: 0.13
Nodes (13): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, installGlobalButtonLoading(), installServiceWorkerUpdate(), isTyping() (+5 more)

### Community 80 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (18): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), changeEmail() (+10 more)

### Community 84 - "verify-demo-sql.js"
Cohesion: 0.08
Nodes (24): conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql, OUT (+16 more)

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.06
Nodes (95): Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel(), SearchField() (+87 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "Notifications.jsx"
Cohesion: 0.11
Nodes (32): AccountPageShell(), getCachedProfile(), NotificationOverlay(), _profileCache, setCachedProfile(), Topbar(), getSettingsItems(), NotificationCard() (+24 more)

### Community 88 - "PersonalizationSection.jsx"
Cohesion: 0.26
Nodes (10): ActivityDetail(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, ALLERGEN_PRESETS, FieldLabel(), PersonalizationSection() (+2 more)

### Community 89 - "apiClient.js"
Cohesion: 0.12
Nodes (30): isDismissed(), VerifyEmailBanner(), GroupForm(), formatTime(), useActivityApi(), useWorkoutSession(), CoachCard(), optionCopy() (+22 more)

### Community 90 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 91 - "App.jsx"
Cohesion: 0.21
Nodes (5): App(), ENV_ERROR, AppProviders(), ErrorBoundary, NotificationStreamProvider()

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.12
Nodes (17): fieldLabel(), friendlyMessage(), validate(), emailSchema, express, otpSendLimiter, otpVerifyLimiter, passwordResetLimiter (+9 more)

### Community 93 - "ExerciseGuideModal.jsx"
Cohesion: 0.23
Nodes (16): getAllGuideExercises(), ExerciseGuideModal(), LEVEL, load(), norm(), useExerciseGuide(), DayTracker(), mapPlanSchedule() (+8 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 95 - "sms-verification.test.js"
Cohesion: 0.25
Nodes (10): assert, createDb(), crypto, dbPath, { describe, it, beforeEach, afterEach }, installDb(), lastCode(), loadService() (+2 more)

### Community 96 - "trainingPrefs.controller.js"
Cohesion: 0.29
Nodes (3): getExerciseGuide(), exerciseGuide(), EXPERIENCE_LEVELS

### Community 97 - "RightPanel.jsx"
Cohesion: 0.43
Nodes (4): NeuralStatusCard(), RightPanel(), SessionLog(), SessionLogRow()

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "CommunityFeed.jsx"
Cohesion: 0.17
Nodes (16): ErrorState(), LoadingState(), Avatar(), CommunityFeed(), PostSkeleton(), previewText(), renderRichText(), SCOPES (+8 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (12): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), replaceSets() (+4 more)

### Community 101 - "WeekCalendarCard.jsx"
Cohesion: 0.46
Nodes (7): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS

### Community 102 - "ai-privacy.test.js"
Cohesion: 0.08
Nodes (19): assert, { describe, it }, end, fs, path, personalize, src, start (+11 more)

### Community 103 - "Preferences.jsx"
Cohesion: 0.14
Nodes (17): PageHeader(), ThemeToggle(), VARIANTS, ThemeContext, Community(), SECTIONS, SectionTabs(), FAQS (+9 more)

### Community 104 - "geo.js"
Cohesion: 0.27
Nodes (10): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), DEFAULT_GATES, EARTH_RADIUS_M, evaluateFix() (+2 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "community.routes.js"
Cohesion: 0.29
Nodes (6): commentLimiter, createPostLimiter, express, likeLimiter, router, write

### Community 107 - "task-notifications-wiring.test.js"
Cohesion: 0.20
Nodes (9): assert, { describe, it, before, beforeEach }, fakeConn, fakeDb, ok, path, sent, src() (+1 more)

### Community 108 - "frontend/.prettierrc.json"
Cohesion: 0.25
Nodes (7): endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 109 - "streaks.test.js"
Cohesion: 0.29
Nodes (5): assert, dbPath, { describe, it, beforeEach }, fakeDb, scenario

### Community 110 - "VITALIS — AI Integration and Technical Justification"
Cohesion: 0.12
Nodes (16): anchorExpected(), isMainDish(), isMeatyFood(), parseServingQuantity(), validateAndCorrectMacros(), 2. Evaluation criteria, 3. Platform comparison, 4.1 Provider fallback chain (+8 more)

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
Cohesion: 0.14
Nodes (39): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+31 more)

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
Cohesion: 0.11
Nodes (30): CorrectionBanner(), DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), MobileWorkoutPills(), PICKER_OPTIONS, WORKOUT_OPTIONS (+22 more)

### Community 124 - "accessGroups.controller.js"
Cohesion: 0.36
Nodes (4): deleteOne(), getMembers(), idParam(), patchUpdate()

### Community 125 - "zod"
Cohesion: 0.29
Nodes (5): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, zod

### Community 127 - "Icon"
Cohesion: 0.09
Nodes (29): TONE, YearlyBmi(), Icon(), NetworkStatus(), COPY, paceToSeconds(), SplitRows(), StatsPanel() (+21 more)

### Community 128 - "callGeminiWithFallback"
Cohesion: 0.18
Nodes (12): buildSuggestPlanPrompt(), callGeminiWithFallback(), getGroq(), getGroqTextModel(), Groq, groq(), suggestPlanForMeal(), coachTip() (+4 more)

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
Nodes (25): writeLimiter(), express, router, write, express, router, write, express (+17 more)

### Community 137 - "jwt.js"
Cohesion: 0.53
Nodes (5): verifySession(), getme(), postDeactivate(), postlogout(), getClearCookieOptions()

### Community 138 - "goalProfile.test.js"
Cohesion: 0.31
Nodes (6): getGoalProfile(), GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 140 - "rateLimits.js"
Cohesion: 0.11
Nodes (25): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+17 more)

### Community 141 - "goals.controller.js"
Cohesion: 0.17
Nodes (17): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+9 more)

### Community 143 - "vite.config.js"
Cohesion: 0.13
Nodes (12): @tailwindcss/vite@^4.2.2, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, CSS_TARGETS, __dirname, JS_TARGETS, browserslist (+4 more)

### Community 144 - "public.service.js"
Cohesion: 0.20
Nodes (8): LANDING_MODULES, cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount(), safeCount(), safeManualLogPct()

### Community 151 - "community.test.js"
Cohesion: 0.20
Nodes (9): devDependencies, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, assert, { describe, it }, request (+1 more)

### Community 155 - "react-router-dom"
Cohesion: 0.25
Nodes (9): GOOGLE_CLIENT_ID, AdminBottomNav(), ADMIN_NAV, AdminShell(), AdminTopbarSearch(), useLogin(), Login(), @react-oauth/google (+1 more)

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
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Plans.jsx`, `Landing.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `useAvatar.js`, `AppRoutes.jsx`, `CameraWorkout`, `Profile.jsx`, `react-router-dom`, `dependencies`, `usePoseEngine.js`, `useAuth`, `ForgotPassword.jsx`, `MessengerPanel.jsx`, `ChangeGoalModal.jsx`, `MacroCoachCard.jsx`, `frontend/package.json`, `HistoryTab.jsx`, `Sidebar.jsx`, `Onboarding.jsx`, `StreakJourney.jsx`, `useProfile.js`, `main.jsx`, `AdminOverview.jsx`, `Notifications.jsx`, `PersonalizationSection.jsx`, `apiClient.js`, `App.jsx`, `ExerciseGuideModal.jsx`, `RightPanel.jsx`, `CommunityFeed.jsx`, `WeekCalendarCard.jsx`, `Preferences.jsx`, `geo.js`, `urlFilters.test.js`, `Dashboard.jsx`, `CameraWorkout.jsx`, `Icon`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `MealTracker.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05426356589147287 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `WebcamFeed.jsx`, `MealTracker.jsx`, `ExerciseBriefing.jsx`, `Log.jsx`, `Plans.jsx`, `Landing.jsx`, `ForgotPasswordModal.jsx`, `ActivityMap.jsx`, `react`, `WorkoutSummary.jsx`, `CameraWorkout`, `react-router-dom`, `MessengerPanel.jsx`, `ChangeGoalModal.jsx`, `MacroCoachCard.jsx`, `HistoryTab.jsx`, `Sidebar.jsx`, `bmi.js`, `Onboarding.jsx`, `StreakJourney.jsx`, `AdminOverview.jsx`, `Notifications.jsx`, `PersonalizationSection.jsx`, `apiClient.js`, `ExerciseGuideModal.jsx`, `RightPanel.jsx`, `CommunityFeed.jsx`, `WeekCalendarCard.jsx`, `Preferences.jsx`, `Dashboard.jsx`, `CameraWorkout.jsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `unit/health.test.js`, `admin.service.js`, `express`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `forgotpassword.service.js`, `plans.controller.js`, `dashboard.service.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.service.js`, `app.js`, `phoneVerification.service.js`, `goals.service.js`, `trainingPrefs.service.js`, `db.js`, `reminder.service.js`, `messenger.service.js`, `email.service.js`, `forgotpassword.routes.js`, `workoutLogs.service.js`, `accessGroups.controller.js`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07358156028368794 - nodes in this community are weakly interconnected._
- **Should `Log.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._