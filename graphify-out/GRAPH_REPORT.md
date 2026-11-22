# Graph Report - vitalisapp  (2026-11-22)

## Corpus Check
- 570 files · ~386,751 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 24, (none) 3, .example 2)

## Summary
- 3135 nodes · 7865 edges · 149 communities (137 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 635 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `815563a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- MealTracker.jsx
- Dashboard.jsx
- escapeHtml
- gemini.js
- admin.service.js
- Log.jsx
- Plans.jsx
- backend/package.json
- progressInsights.js
- Landing.jsx
- verifyUser.js
- ActivityMap.jsx
- ForgotPasswordModal.jsx
- workoutGuide.js
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- email-delivery.test.js
- ai.service.js
- foodLogs.service.js
- Preferences.jsx
- AppError
- devDependencies
- Profile.jsx
- project.yml
- dependencies
- CommunityFeed.jsx
- progressOverview.js
- ref_node_assert
- WeekCalendarCard.jsx
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
- react
- HistoryTab.jsx
- account-validation.test.js
- settings.controller.js
- ExerciseGuideModal.jsx
- ref_path
- logs.controller.js
- app.js
- phoneVerification.service.js
- progress.controller.js
- apiFetch
- compilerOptions
- package.json
- main.jsx
- goals.service.js
- trainingPrefs.service.js
- utils/nutrition.js
- scripts
- ExerciseBriefing.jsx
- validId
- VerifyPhone.jsx
- bmi.js
- allergies.service.js
- ProgressOverviewChart.jsx
- email-verification.test.js
- messenger.service.js
- workoutLogs.controller.js
- Vitalis
- compilerOptions
- buildSampleDataset
- src/components/index.js
- bmi.service.js
- reminder.service.js
- forgotpassword.service.js
- plans-personal.test.js
- food-traits.test.js
- geo.js
- PersonalizationSection.jsx
- callGeminiWithFallback
- Icon
- migrate.js
- notificationPresentation.js
- App.jsx
- apiClient.js
- generate-email-assets.js
- analyzeFoodImage
- forgotpassword.routes.js
- StreakJourney.jsx
- brevo-transport.test.js
- apiGet
- AddWorkoutModal.jsx
- sms.service.js
- useProfile.js
- workoutLogs.service.js
- Onboarding.jsx
- ForgotPassword.jsx
- Frontend Architecture — Vitalis
- controllers/README.md
- workout-history-pagination.test.js
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- community.test.js
- VITALIS — AI Integration and Technical Justification
- usePresence
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
- LegalModals.jsx
- ai-privacy.test.js
- reminderScheduler.js
- StatsTab.jsx
- Topbar.jsx
- server.js
- Migrations — Vitalis (one table per file)
- CoachCard.jsx
- Verification email delivery status
- reminder.routes.js
- cookies.js
- goalProfile.test.js
- rateLimits.js
- res
- StatsPanel.jsx
- verify-demo-sql.js
- goals.controller.js
- sessionFit.js
- css-custom-properties.d.ts
- setSessionCookie
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 245 edges
2. `react` - 144 edges
3. `AppError` - 90 edges
4. `apiGet()` - 74 edges
5. `apiPost()` - 72 edges
6. `useAuth()` - 71 edges
7. `apiFetch()` - 55 edges
8. `react-router-dom` - 44 edges
9. `Dashboard()` - 42 edges
10. `AppRoutes()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Safety and data minimization` --references--> `personalize()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/ai.service.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `Conventions` --references--> `logout()`  [INFERRED]
  frontend/docs/architecture.md → backend/src/services/auth.service.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js
- `4.2 Cost controls` --references--> `validateAndCorrectMacros()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/config/gemini.js

## Import Cycles
- None detected.

## Communities (149 total, 12 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.06
Nodes (63): resolveAssetUrl(), ErrorState(), Spinner(), CameraScanner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard() (+55 more)

### Community 2 - "Dashboard.jsx"
Cohesion: 0.15
Nodes (36): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+28 more)

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
Cohesion: 0.11
Nodes (38): YearlyBmi(), STATUS, SummaryInsights(), SummaryStats(), Trend(), BodyTab(), DAYS, dayTag() (+30 more)

### Community 7 - "Plans.jsx"
Cohesion: 0.09
Nodes (37): AdaptiveTipsCard(), TIP_ICONS, TIP_STYLES, GoalPlansPanel(), PersonalPlanSheet(), FilterPill(), PlanActions(), PlanCard() (+29 more)

### Community 8 - "backend/package.json"
Cohesion: 0.07
Nodes (35): author, dependencies, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1, google-auth-library@^10.6.2 (+27 more)

### Community 9 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "verifyUser.js"
Cohesion: 0.10
Nodes (21): writeLimiter(), express, router, write, express, router, write, express (+13 more)

### Community 12 - "ActivityMap.jsx"
Cohesion: 0.09
Nodes (29): FitRoute(), DOT, GpsBadge(), LABELS, COPY, LocationNotice(), MapResizer(), RecenterButton() (+21 more)

### Community 13 - "ForgotPasswordModal.jsx"
Cohesion: 0.21
Nodes (9): ChangePasswordModal(), STEP_LABELS, STEP_META, OtpInput(), PasswordField(), PasswordStrength(), post(), useForgotPassword() (+1 more)

### Community 14 - "workoutGuide.js"
Cohesion: 0.15
Nodes (22): DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), ExerciseChoiceModal(), MobileWorkoutPills(), PICKER_OPTIONS, BRYL_CREDIT, counterTypeFor() (+14 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.09
Nodes (41): AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent, AdminMonitoring, AdminOverview (+33 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.11
Nodes (13): aiQuota(), aiRouteLimiter, aiSummaryLimiter, express, router, analyzeUpload, express, mealUpload (+5 more)

### Community 17 - "progress.service.js"
Cohesion: 0.10
Nodes (31): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+23 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.09
Nodes (14): changeEmailSchema, changePasswordSchema, getverifyEmail(), googleLoginSchema, jwt, loginIpLimiter, loginSchema, postsmsVerify() (+6 more)

### Community 19 - "auth.service.js"
Cohesion: 0.09
Nodes (29): bcrypt, changeEmail(), changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount() (+21 more)

### Community 20 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (9): crypto, jwt, normalizeId(), record(), assert, dbPath, { it }, jwt (+1 more)

### Community 21 - "ai.service.js"
Cohesion: 0.17
Nodes (18): safeParseAI(), aiSummary(), buildNutritionSection(), buildProjection(), buildRuleSummary(), dailySummary(), fitnessAnalysis(), FOOD_POOL (+10 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.12
Nodes (16): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), crypto, estimateFoodDensity(), getCached() (+8 more)

### Community 23 - "Preferences.jsx"
Cohesion: 0.19
Nodes (13): ThemeToggle(), VARIANTS, ThemeContext, hourLabel(), ReminderSettings(), ROWS, clampStepGoal(), GOAL_PRESETS (+5 more)

### Community 24 - "AppError"
Cohesion: 0.12
Nodes (28): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+20 more)

### Community 25 - "devDependencies"
Cohesion: 0.12
Nodes (19): devDependencies, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, @types/leaflet@^1.9.22, @types/node@^26.6.5 (+11 more)

### Community 26 - "Profile.jsx"
Cohesion: 0.11
Nodes (29): LegalCenterModal(), activityLabel(), Toast(), VARIANTS, useAvatar(), activityFactors, bmiCategory(), BodyMetricsPanel() (+21 more)

### Community 27 - "project.yml"
Cohesion: 0.08
Nodes (25): activation_command, activation_command_timeout, added_modes, agent_interface, default_modes, encoding, excluded_apis, excluded_tools (+17 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (41): dependencies, @bryllim/workout-guide@^1.0.0, chart.js@^4.5.1, @fontsource/playfair-display@^5.3.0, @fontsource/poppins@^5.3.0, framer-motion@^12.40.0, leaflet@^1.9.4, @mediapipe/camera_utils@^0.3.1675466862 (+33 more)

### Community 29 - "CommunityFeed.jsx"
Cohesion: 0.15
Nodes (17): ICONS, NotificationProvider(), Toast(), ToastContainer(), useToast(), Avatar(), CommunityFeed(), PostSkeleton() (+9 more)

### Community 30 - "progressOverview.js"
Cohesion: 0.18
Nodes (22): addDays(), aggregateOverview(), buildBuckets(), chooseBucket(), diffDays(), endOfMonthISO(), findBucket(), fmtShort() (+14 more)

### Community 31 - "ref_node_assert"
Cohesion: 0.07
Nodes (23): asyncHandler(), assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach } (+15 more)

### Community 32 - "WeekCalendarCard.jsx"
Cohesion: 0.33
Nodes (9): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS, useActivityLogger() (+1 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.09
Nodes (24): bcrypt, { createHash }, LANDING_MODULES, cache, crypto, getLandingStats(), recordVisit(), safeActiveUserCount() (+16 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.16
Nodes (20): applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeProvider(), AuthContext, AuthProvider(), OFFLINE_CACHE_TTL_MS (+12 more)

### Community 35 - "activity.service.js"
Cohesion: 0.17
Nodes (7): downsampleRoute(), getActivityById(), isPlausibleActivity(), saveActivity(), toggleKudos(), assert, { describe, it }

### Community 36 - "routes/index.js"
Cohesion: 0.09
Nodes (29): verifySession(), clearSessionCookie(), jwt, requireMember(), verifyUser(), express, read, router (+21 more)

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
Cohesion: 0.05
Nodes (48): sharp@^0.35.5, fs, main(), path, fromAddress(), fromHeader(), mailConfigured(), nodemailer (+40 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): aiConfigured(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "auth-revocation.test.js"
Cohesion: 0.22
Nodes (7): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, __rows

### Community 43 - "accessGroups.service.js"
Cohesion: 0.23
Nodes (18): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), makeCode() (+10 more)

### Community 44 - "workoutRecommender.js"
Cohesion: 0.09
Nodes (23): EXCLUSION_CATEGORIES, EXERCISES, getExerciseGuide(), availableEquipment(), BASE_DAYS, cleanList(), DAY_DESCRIPTIONS, EQUIP_FROM_PREF (+15 more)

### Community 45 - "react"
Cohesion: 0.15
Nodes (20): FAB(), FeedbackModal(), LogActivityModal(), Button(), ConfirmDialog(), Input(), Modal(), SIZES (+12 more)

### Community 46 - "HistoryTab.jsx"
Cohesion: 0.23
Nodes (18): ActivityCard(), formatActivityDate(), HistorySkeleton(), HistoryTab(), KudosButton(), RouteThumbnail(), RunSummaryOverlay(), activityTitle() (+10 more)

### Community 47 - "account-validation.test.js"
Cohesion: 0.09
Nodes (19): VALID_GENDERS, fieldLabel(), friendlyMessage(), validate(), emailSchema, express, otpSendLimiter, otpVerifyLimiter (+11 more)

### Community 48 - "settings.controller.js"
Cohesion: 0.11
Nodes (10): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS (+2 more)

### Community 49 - "ExerciseGuideModal.jsx"
Cohesion: 0.23
Nodes (16): getAllGuideExercises(), ExerciseGuideModal(), LEVEL, load(), norm(), useExerciseGuide(), DayTracker(), mapPlanSchedule() (+8 more)

### Community 50 - "ref_path"
Cohesion: 0.15
Nodes (9): @tailwindcss/vite@^4.2.2, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, __dirname, @tailwindcss/vite, vite, vite-plugin-pwa (+1 more)

### Community 51 - "logs.controller.js"
Cohesion: 0.20
Nodes (3): express, router, write

### Community 52 - "app.js"
Cohesion: 0.22
Nodes (11): cookieParser, cors, createApp(), express, helmet, rateLimit, ALLOWED_ORIGINS, corsOptions (+3 more)

### Community 53 - "phoneVerification.service.js"
Cohesion: 0.12
Nodes (22): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+14 more)

### Community 54 - "progress.controller.js"
Cohesion: 0.12
Nodes (3): getOverview(), getSummary(), wantsSample()

### Community 55 - "apiFetch"
Cohesion: 0.24
Nodes (16): BodyMeasurementsPanel(), EMPTY(), FIELDS, todayKey(), WeightSummary(), apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity() (+8 more)

### Community 56 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowJs, baseUrl, checkJs, jsx, lib, module, moduleResolution (+7 more)

### Community 57 - "package.json"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, homepage, keywords, license, main (+7 more)

### Community 58 - "main.jsx"
Cohesion: 0.12
Nodes (15): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, @react-oauth/google@^0.13.4, installGlobalButtonLoading(), installServiceWorkerUpdate() (+7 more)

### Community 59 - "goals.service.js"
Cohesion: 0.18
Nodes (16): saveBmi(), ACTIVITY_LEVELS, carriedBody(), computeProgress(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES, isoDate() (+8 more)

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
Cohesion: 0.17
Nodes (18): ExerciseBriefing(), loadGuide(), METHOD, norm(), briefingFor(), COUNTER_GUIDES, GENERIC_GUIDE, HOLD_GUIDE (+10 more)

### Community 65 - "validId"
Cohesion: 0.05
Nodes (27): deleteOne(), getMembers(), idParam(), patchUpdate(), addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema (+19 more)

### Community 66 - "VerifyPhone.jsx"
Cohesion: 0.09
Nodes (34): ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, useLogin(), Login() (+26 more)

### Community 67 - "bmi.js"
Cohesion: 0.27
Nodes (11): BmiInsight(), SleepNote(), TONE, BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy() (+3 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "ProgressOverviewChart.jsx"
Cohesion: 0.19
Nodes (14): BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum(), fmtShortDate(), fmtValue() (+6 more)

### Community 70 - "email-verification.test.js"
Cohesion: 0.15
Nodes (6): assert, { it }, jwt, queries, tokens, welcome

### Community 71 - "messenger.service.js"
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

### Community 75 - "buildSampleDataset"
Cohesion: 0.27
Nodes (13): getSampleHistory(), addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO() (+5 more)

### Community 76 - "src/components/index.js"
Cohesion: 0.08
Nodes (33): AccountPageShell(), AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES (+25 more)

### Community 77 - "bmi.service.js"
Cohesion: 0.13
Nodes (19): summarizeYears(), yearlySummary(), createGoal(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance() (+11 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "forgotpassword.service.js"
Cohesion: 0.17
Nodes (11): sendPasswordResetOtpEmail(), bcrypt, checkOtpLock(), clearOtpFailures(), crypto, normEmail(), otpFailures, recordOtpFailure() (+3 more)

### Community 80 - "plans-personal.test.js"
Cohesion: 0.17
Nodes (8): assert, dbPath, { describe, it, beforeEach }, executed, fakeDb, mockRes(), res, queue

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 82 - "geo.js"
Cohesion: 0.27
Nodes (10): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), DEFAULT_GATES, EARTH_RADIUS_M, evaluateFix() (+2 more)

### Community 83 - "PersonalizationSection.jsx"
Cohesion: 0.27
Nodes (10): ActivityDetail(), ALLERGEN_PRESETS, FieldLabel(), PersonalizationSection(), PillGroup(), ageOn(), checkDob(), MAX_AGE (+2 more)

### Community 84 - "callGeminiWithFallback"
Cohesion: 0.16
Nodes (13): buildSuggestPlanPrompt(), callGeminiWithFallback(), genAI(), getGenAI(), getGroq(), getGroqTextModel(), Groq, groq() (+5 more)

### Community 85 - "Icon"
Cohesion: 0.06
Nodes (106): Icon(), Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel() (+98 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "notificationPresentation.js"
Cohesion: 0.17
Nodes (22): NotificationOverlay(), NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime(), formatRelativeTime() (+14 more)

### Community 88 - "App.jsx"
Cohesion: 0.25
Nodes (4): App(), AppProviders(), ErrorBoundary, NetworkStatus()

### Community 89 - "apiClient.js"
Cohesion: 0.27
Nodes (9): API_BASE_URL, NotificationStreamContext, NotificationStreamProvider(), abortError(), ApiError, doFetch(), inflightGets, isJsonResponse() (+1 more)

### Community 90 - "generate-email-assets.js"
Cohesion: 0.24
Nodes (9): COLORS, fs, GLYPHS, LOGO_SRC, main(), OUT_DIR, path, sharp (+1 more)

### Community 91 - "analyzeFoodImage"
Cohesion: 0.20
Nodes (15): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), callOpenRouter(), devError(), devLog(), devWarn() (+7 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.17
Nodes (9): commentLimiter, createPostLimiter, express, likeLimiter, router, write, express, router (+1 more)

### Community 93 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 95 - "apiGet"
Cohesion: 0.29
Nodes (8): todayKey(), useTodayMeals(), macroCoachMessage(), MacroCoachCard(), useActiveGoal(), apiGet(), qk, AccessRedirect()

### Community 96 - "AddWorkoutModal.jsx"
Cohesion: 0.36
Nodes (7): AddWorkoutModal(), clampReps(), clampSets(), clampWeight(), Field(), performedAtToIso(), TYPE_SUGGESTIONS

### Community 97 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 99 - "useProfile.js"
Cohesion: 0.36
Nodes (7): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), DEFAULT_AVATARS, getAvatarUrl()

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.18
Nodes (12): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), replaceSets() (+4 more)

### Community 101 - "Onboarding.jsx"
Cohesion: 0.09
Nodes (41): GoalDetailSheet(), goalIcon(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, GOAL_TYPES, goalLabel() (+33 more)

### Community 102 - "ForgotPassword.jsx"
Cohesion: 0.43
Nodes (7): ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn()

### Community 104 - "Frontend Architecture — Vitalis"
Cohesion: 0.29
Nodes (6): Build, Frontend Architecture — Vitalis, Principles, Related, State, Structure

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "workout-history-pagination.test.js"
Cohesion: 0.33
Nodes (3): parseHistoryQuery(), assert, { describe, it }

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

### Community 111 - "usePresence"
Cohesion: 0.70
Nodes (3): Dropdown(), prefersReducedMotion(), usePresence()

### Community 112 - "Database Migrations — Vitalis (ALTER-based)"
Cohesion: 0.20
Nodes (9): Community + Settings endpoints (in baseline), Database Migrations — Vitalis (ALTER-based), Fresh DB vs Existing DB, Frontend, Known drift (resolved — do not re-introduce), Layout, Running, Verification (+1 more)

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "Social.jsx"
Cohesion: 0.16
Nodes (19): logout(), Conventions, EmptyState(), useNotificationStream(), useDashboardData(), buildThread(), ContactAvatar(), ContactSkeleton() (+11 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "jsonwebtoken"
Cohesion: 0.32
Nodes (6): jsonwebtoken@^9.0.3, getSessionFromSocket(), getUserIdFromSocket(), jwt, parseCookies(), jsonwebtoken

### Community 117 - "build-database-sql.js"
Cohesion: 0.09
Nodes (21): conn, DEMO, dump(), esc(), { execFileSync }, fs, mysql, OUT (+13 more)

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
Cohesion: 0.13
Nodes (24): CorrectionBanner(), formStatus(), FormStatusPill(), RepProgressRing(), LEVELS, WorkoutFeedbackSheet(), scoreChip(), WorkoutSummary() (+16 more)

### Community 124 - "LegalModals.jsx"
Cohesion: 0.39
Nodes (7): AcknowledgeFooter(), DOCS, LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS, TermsOfUseModal()

### Community 125 - "ai-privacy.test.js"
Cohesion: 0.08
Nodes (19): assert, { describe, it }, end, fs, path, personalize, src, start (+11 more)

### Community 127 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 128 - "Topbar.jsx"
Cohesion: 0.12
Nodes (29): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), getCachedProfile(), _profileCache, setCachedProfile(), Topbar() (+21 more)

### Community 129 - "server.js"
Cohesion: 0.15
Nodes (9): socket.io@^4.8.3, app, http, io, { Server }, _jwt, missing, required (+1 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "CoachCard.jsx"
Cohesion: 0.53
Nodes (4): CoachCard(), optionCopy(), STATUS, useCoachWeek()

### Community 134 - "reminder.routes.js"
Cohesion: 0.40
Nodes (4): express, router, testLimiter, write

### Community 137 - "cookies.js"
Cohesion: 0.31
Nodes (7): getme(), postDeactivate(), postlogout(), baseCookieOptions(), getClearCookieOptions(), getCookieOptions(), isSecureRequest()

### Community 138 - "goalProfile.test.js"
Cohesion: 0.32
Nodes (5): GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 140 - "rateLimits.js"
Cohesion: 0.09
Nodes (29): aiLimiter(), coachLimiter(), feedbackLimiter(), loginLimiter(), logoutLimiter(), makeLimiter(), meLimiter(), messageLimiter() (+21 more)

### Community 142 - "StatsPanel.jsx"
Cohesion: 0.70
Nodes (4): paceToSeconds(), SplitRows(), StatsPanel(), StatusPill()

### Community 143 - "verify-demo-sql.js"
Cohesion: 0.20
Nodes (9): bcryptjs@^3.0.3, mysql2@^3.20.0, assert, bcrypt, fs, mysql, path, bcryptjs (+1 more)

### Community 144 - "goals.controller.js"
Cohesion: 0.17
Nodes (17): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), checkTargetDate(), EXPERIENCE_LEVELS (+9 more)

### Community 145 - "sessionFit.js"
Cohesion: 0.83
Nodes (3): estimateDayMinutes(), estimateExerciseSeconds(), fitDayToMinutes()

### Community 148 - "setSessionCookie"
Cohesion: 0.33
Nodes (6): notifyNewDevice(), postchangePassword(), postgoogleLogin(), postlogin(), postregister(), setSessionCookie()

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Topbar.jsx`, `WebcamFeed.jsx`, `Dashboard.jsx`, `MealTracker.jsx`, `CoachCard.jsx`, `Log.jsx`, `Plans.jsx`, `Landing.jsx`, `ActivityMap.jsx`, `ForgotPasswordModal.jsx`, `StatsPanel.jsx`, `AppRoutes.jsx`, `workoutGuide.js`, `css-custom-properties.d.ts`, `Preferences.jsx`, `Profile.jsx`, `dependencies`, `CommunityFeed.jsx`, `WeekCalendarCard.jsx`, `useAuth.jsx`, `HistoryTab.jsx`, `ExerciseGuideModal.jsx`, `apiFetch`, `main.jsx`, `ExerciseBriefing.jsx`, `VerifyPhone.jsx`, `bmi.js`, `ProgressOverviewChart.jsx`, `src/components/index.js`, `geo.js`, `PersonalizationSection.jsx`, `Icon`, `notificationPresentation.js`, `App.jsx`, `apiClient.js`, `StreakJourney.jsx`, `apiGet`, `AddWorkoutModal.jsx`, `useProfile.js`, `Onboarding.jsx`, `ForgotPassword.jsx`, `usePresence`, `Social.jsx`, `CameraWorkout.jsx`, `LegalModals.jsx`, `StatsTab.jsx`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Should `MealTracker.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05822784810126582 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `Topbar.jsx`, `WebcamFeed.jsx`, `Dashboard.jsx`, `MealTracker.jsx`, `CoachCard.jsx`, `Log.jsx`, `Plans.jsx`, `ActivityMap.jsx`, `ForgotPasswordModal.jsx`, `StatsPanel.jsx`, `workoutGuide.js`, `Preferences.jsx`, `Profile.jsx`, `CommunityFeed.jsx`, `WeekCalendarCard.jsx`, `react`, `HistoryTab.jsx`, `ExerciseGuideModal.jsx`, `apiFetch`, `ExerciseBriefing.jsx`, `bmi.js`, `ProgressOverviewChart.jsx`, `src/components/index.js`, `PersonalizationSection.jsx`, `notificationPresentation.js`, `App.jsx`, `StreakJourney.jsx`, `apiGet`, `Onboarding.jsx`, `Social.jsx`, `CameraWorkout.jsx`, `LegalModals.jsx`, `StatsTab.jsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `admin.service.js`, `verifyUser.js`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `ref_node_assert`, `plans.controller.js`, `dashboard.service.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.service.js`, `account-validation.test.js`, `app.js`, `phoneVerification.service.js`, `goals.service.js`, `trainingPrefs.service.js`, `validId`, `messenger.service.js`, `bmi.service.js`, `reminder.service.js`, `forgotpassword.service.js`, `workoutLogs.service.js`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07557354925775979 - nodes in this community are weakly interconnected._
- **Should `Log.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1073170731707317 - nodes in this community are weakly interconnected._