# Graph Report - vitalisapp  (2026-11-26)

## Corpus Check
- 681 files · ~447,910 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 25, (none) 3, .example 2)

## Summary
- 3694 nodes · 9445 edges · 177 communities (162 shown, 15 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 716 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1ef04cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WebcamFeed.jsx
- MealTracker.jsx
- AdminMonitoring.jsx
- escapeHtml
- gemini.js
- Log.jsx
- auth-api.test.js
- backend/package.json
- warmupRecommender.js
- Landing.jsx
- VerifyPhone.jsx
- Icon
- ChangeGoalModal.jsx
- scanReview.js
- AppRoutes.jsx
- foodLogs.routes.js
- progress.service.js
- auth.controller.js
- auth.service.js
- vite.config.js
- ai.service.js
- foodLogs.service.js
- ScanResult.jsx
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
- CameraWorkout.jsx
- admin.service.js
- workoutRecommender.js
- owner.js
- migrations.test.js
- ForgotPasswordModal.jsx
- goalSelection.js
- MealTrackerDiary.jsx
- piece-count.test.js
- AdminAccess.jsx
- app.js
- sms-verification.test.js
- progress.controller.js
- HistoryTab.jsx
- compilerOptions
- package.json
- workoutGuide.js
- goals.service.js
- trainingPrefs.service.js
- progressInsights.js
- scripts
- account-validation.test.js
- AppNav.jsx
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
- react-router-dom
- Register.jsx
- reminder.service.js
- main.jsx
- app/config/env.js
- food-traits.test.js
- messenger.service.js
- email.service.js
- ref_fs
- AdminOverview.jsx
- migrate.js
- Notifications.jsx
- apiClient.js
- RoutinePlayer.jsx
- generate-endpoint-manifest.js
- password-policy.test.js
- forgotpassword.routes.js
- express
- brevo-transport.test.js
- ActivityMap.jsx
- auth-revocation.test.js
- accessGroups.service.js
- security.controller.js
- Sidebar.jsx
- workoutLogs.service.js
- progression.service.js
- run-tests.js
- Preferences.jsx
- useNutritionTracker.js
- controllers/README.md
- CommunityFeed.jsx
- task-notifications-wiring.test.js
- frontend/.prettierrc.json
- energy.service.js
- VITALIS — AI Integration and Technical Justification
- foodInfo.test.js
- MealTrackerDiary.jsx
- backend/.prettierrc.json
- DashboardWidgets.jsx
- foodImage.service.js
- bmi.service.js
- exportTable.js
- Dashboard Redesign — Visual Specification (References A & B)
- scripts
- Vitalis Frontend
- geo.js
- .prettierrc.json
- lib/progression.js
- MacroCoachCard.jsx
- zod
- reminderScheduler.js
- useVitalisMap.js
- AdminAiUsage.jsx
- StreakJourney.jsx
- Migrations — Vitalis (one table per file)
- external-failures.test.js
- Verification email delivery status
- buildSampleDataset
- bmi.js
- routes/index.js
- dashboard.service.js
- rateLimits.js
- goals.controller.js
- sms.service.js
- errors.js
- email-delivery.test.js
- community.controller.js
- plans-personal.test.js
- public.service.js
- build-database-sql.js
- useProfileWarnings.js
- Database Migrations — Vitalis (ALTER-based)
- endpoint-inventory.test.js
- password-login-compat.test.js
- config/db.js
- vercel.json
- goalProfile.test.js
- ForgotPasswordModal.jsx
- security.test.js
- usePoseEngine.js
- StatsTab.jsx
- filipino/README.md
- nutrientGoals.controller.js
- settings.controller.js
- utils/goalSetup.js
- useProfile.js
- useProfileWarnings.js
- accessGroups.controller.js
- WeekCalendarCard.jsx
- src/config/env.js
- eval-filipino-scans.js
- VitalisMap.jsx
- unit/health.test.js

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 269 edges
2. `react` - 158 edges
3. `AppError` - 98 edges
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
- `Backend (Jest + Supertest)` --references--> `createApp()`  [INFERRED]
  README.md → backend/src/app.js
- `4.2 Cost controls` --references--> `aiLimiter()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/middleware/rateLimits.js
- `4.2 Cost controls` --references--> `imageHash()`  [INFERRED]
  docs/AI_INTEGRATION.md → backend/src/services/foodLogs.service.js

## Import Cycles
- None detected.

## Communities (177 total, 15 thin omitted)

### Community 0 - "WebcamFeed.jsx"
Cohesion: 0.19
Nodes (12): CameraOffPlaceholder(), CoachFeedbackOverlay(), BONES, isFaceLandmark(), PoseSkeletonOverlay(), PoseStatusBadge(), RepCounterOverlay(), ScanLineOverlay() (+4 more)

### Community 1 - "MealTracker.jsx"
Cohesion: 0.19
Nodes (17): CameraScanner(), DailySummaryCard(), formatNumber(), MacroCards(), MACROS, pctOf(), buildMonthGrid(), CalendarPopup() (+9 more)

### Community 2 - "AdminMonitoring.jsx"
Cohesion: 0.29
Nodes (10): SearchField(), STATUS_META, StatusDot(), AdminMonitoring(), daysLabel(), EXPORT_COLUMNS, FLAG_GROUPS, FlagList() (+2 more)

### Community 3 - "escapeHtml"
Cohesion: 0.08
Nodes (32): renderKeyValueTable(), emojiTile(), featureCell(), renderFeatureGrid(), renderSteps(), renderCode(), renderIconCallout(), renderPanel() (+24 more)

### Community 4 - "gemini.js"
Cohesion: 0.07
Nodes (49): analyzeFoodImage(), analyzeWithGeminiVision(), analyzeWithGroqVision(), analyzeWithOpenRouterVision(), ANCHOR_DB, anchorExpected(), backoffSleep(), BREADED_FOOD_KEYWORDS (+41 more)

### Community 6 - "Log.jsx"
Cohesion: 0.07
Nodes (52): YearlyBmi(), BUCKET_CAPTION, BUCKET_WORD, FALLBACK_PALETTE, fmtAxis(), fmtChange(), fmtNum(), fmtShortDate() (+44 more)

### Community 7 - "auth-api.test.js"
Cohesion: 0.09
Nodes (27): app, bcrypt, jwt, registered, request, app, request, app (+19 more)

### Community 8 - "backend/package.json"
Cohesion: 0.06
Nodes (45): author, dependencies, bcryptjs@^3.0.3, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.0, express@^5.2.1, express-rate-limit@^7.4.1 (+37 more)

### Community 9 - "warmupRecommender.js"
Cohesion: 0.11
Nodes (24): EXCLUSION_CATEGORIES, EXERCISES, COOLDOWN_MOVES, WARMUP_MOVES, CONFIG, dayRegions(), dose(), EXCLUSION_KEYS (+16 more)

### Community 10 - "Landing.jsx"
Cohesion: 0.13
Nodes (33): clearInstallEvent(), detectInstallPlatform(), getInstallEvent(), subscribers, subscribeToInstall(), Brand(), DownloadPhoneSet(), DownloadPhoneStatus() (+25 more)

### Community 11 - "VerifyPhone.jsx"
Cohesion: 0.24
Nodes (13): VerificationLayout(), VerifyEmail(), VerifyPhone(), postVerifyRoute(), formatPhMobile(), isValidPhMobile(), livePhoneError(), maskPhMobile() (+5 more)

### Community 12 - "Icon"
Cohesion: 0.10
Nodes (30): Icon(), TOAST_ICONS, COPY, CameraToggleButton(), CorrectionBanner(), NeuralStatusCard(), RightPanel(), SessionBottomBar() (+22 more)

### Community 13 - "ChangeGoalModal.jsx"
Cohesion: 0.16
Nodes (19): GoalDetailSheet(), goalIcon(), goalLabel(), EQUIPMENT_ICONS, LOCATIONS, MINS_PRESETS, ChangeGoalModal(), checkTargetDate() (+11 more)

### Community 14 - "scanReview.js"
Cohesion: 0.35
Nodes (11): formatAmount(), isPer100(), MAX_GRAMS, normalizeGrams(), round1(), roundKcal(), scaleFromPer100(), scalePortion() (+3 more)

### Community 15 - "AppRoutes.jsx"
Cohesion: 0.08
Nodes (38): App(), AppProviders(), AccessRedirect, ActivityMap, AdminAccess, AdminAiUsage, AdminAudit, AdminContent (+30 more)

### Community 16 - "foodLogs.routes.js"
Cohesion: 0.18
Nodes (10): aiQuota(), coachRouteLimiter, express, router, weekLimiter, analyzeUpload, express, mealUpload (+2 more)

### Community 17 - "progress.service.js"
Cohesion: 0.10
Nodes (32): computeBmi(), activeMinutesExpr(), analyzePhoto(), assembleOverview(), buildDiary(), buildExportCsv(), cadenceLabel(), CADENCES (+24 more)

### Community 18 - "auth.controller.js"
Cohesion: 0.06
Nodes (38): verifySession(), changeEmailSchema, changePasswordSchema, getme(), getverifyEmail(), googleLoginSchema, jwt, loginIpLimiter (+30 more)

### Community 19 - "auth.service.js"
Cohesion: 0.12
Nodes (31): bcrypt, changePassword(), checkRateLimit(), clearAttempts(), createVerificationToken(), crypto, deactivateAccount(), getMe() (+23 more)

### Community 20 - "vite.config.js"
Cohesion: 0.11
Nodes (15): @tailwindcss/vite@^4.2.2, browserslist@^4.29.6, lightningcss@^1.33.0, vite@^8.0.1, vite-plugin-pwa@^1.3.0, @vitejs/plugin-react@^6.0.1, CSS_TARGETS, __dirname (+7 more)

### Community 21 - "ai.service.js"
Cohesion: 0.13
Nodes (26): aiConfigured(), callGeminiWithFallback(), getGroqTextModel(), getVisionModels(), safeParseAI(), aiSummary(), analyzePose(), buildNutritionSection() (+18 more)

### Community 22 - "foodLogs.service.js"
Cohesion: 0.09
Nodes (34): stripDataUriPrefix(), buildFoodDensityPrompt(), analysisCache, analyzeAndClamp(), analyzeImage(), clampReference(), clampReview(), cleanPer100() (+26 more)

### Community 23 - "ScanResult.jsx"
Cohesion: 0.13
Nodes (26): asItem(), EXTRA, FIELDS, NumberField(), ScanItemEditor(), toDraft(), withValues(), cleanFoodName() (+18 more)

### Community 24 - "AppError"
Cohesion: 0.11
Nodes (31): ADJUST_NOTES, adjustLinkedPlan(), autoCreateFromGoal(), completeProgress(), createPersonalPlan(), deletePersonalPlan(), enroll(), generateForAllGoals() (+23 more)

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
Cohesion: 0.07
Nodes (21): assert, { describe, it }, assert, { describe, it }, plan, assert, { describe, it, beforeEach, afterEach }, assert (+13 more)

### Community 32 - "mapAdapter.js"
Cohesion: 0.17
Nodes (20): AccuracyCircle(), GeoJsonLayer(), ROUTE_LAYOUT, RouteLayer(), ACCURACY_LAYERS, ACCURACY_MAX_RADIUS_M, accuracyCircleFeatureCollection(), EMPTY_FEATURE_COLLECTION (+12 more)

### Community 33 - "coachEngine.js"
Cohesion: 0.16
Nodes (16): bcrypt, { createHash }, addDays(), buildWeek(), cleanTitle(), isoLocal(), parseIso(), proposeAdjust() (+8 more)

### Community 34 - "useAuth.jsx"
Cohesion: 0.14
Nodes (25): NotificationStreamContext, NotificationStreamProvider(), applyRootTheme(), fetchServerTheme(), persistServerTheme(), resolveEffective(), ThemeProvider(), AuthContext (+17 more)

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
Cohesion: 0.13
Nodes (24): FeedbackModal(), LogActivityModal(), Button(), ConfirmDialog(), Dropdown(), Input(), Modal(), SIZES (+16 more)

### Community 39 - "adminMonitoring.service.js"
Cohesion: 0.13
Nodes (31): listUsers(), byAttention(), FLAG_GROUPS, fmt(), getEngagement(), getMonitoring(), getStatusMap(), getUserActivity() (+23 more)

### Community 40 - "upload.js"
Cohesion: 0.13
Nodes (23): postanalyzePic(), postUserId(), postUserIdSuggestPlan(), sendMealSummaryEmail(), ALLOWED_CATEGORIES, categoryDir(), compressAndStore(), compressBufferAndStore() (+15 more)

### Community 41 - "coachPlan.service.js"
Cohesion: 0.18
Nodes (15): withTimeout(), applyChoice(), CHOICES, computeWeek(), getWeek(), loadActivity(), loadContext(), loadStats() (+7 more)

### Community 42 - "CameraWorkout.jsx"
Cohesion: 0.08
Nodes (42): EarlyExitDialog(), ExerciseBriefing(), loadGuide(), METHOD, norm(), ExerciseChoiceModal(), formStatus(), FormStatusPill() (+34 more)

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
Cohesion: 0.14
Nodes (21): PasswordChecklist(), ErrorBox(), ForgotPassword(), OtpInput(), post(), StepBar(), STEPS, SubmitBtn() (+13 more)

### Community 48 - "goalSelection.js"
Cohesion: 0.23
Nodes (17): GoalMultiSelect(), CLASH, clashKey(), conflictFor(), describeGoalMix(), fromList(), makeMain(), MAX_GOALS (+9 more)

### Community 49 - "MealTrackerDiary.jsx"
Cohesion: 0.27
Nodes (12): Spinner(), CatalogNameField(), FIT_LABEL, fmt(), FoodInfoCard(), FoodThumb(), TraitChips(), ManualMealForm() (+4 more)

### Community 50 - "piece-count.test.js"
Cohesion: 0.24
Nodes (9): findStatedCount(), reconcilePieceCount(), replaceCount(), SCALED_FIELDS, scaleTotals(), totalsBasis(), validCount(), assert (+1 more)

### Community 51 - "AdminAccess.jsx"
Cohesion: 0.16
Nodes (44): Badge(), ConfirmDialog(), Kpi(), MiniStat(), PageHero(), Pager(), Panel(), StateBlock() (+36 more)

### Community 52 - "app.js"
Cohesion: 0.14
Nodes (15): app, http, io, { Server }, cookieParser, cors, createApp(), express (+7 more)

### Community 53 - "sms-verification.test.js"
Cohesion: 0.13
Nodes (22): cleanStr(), putupdate(), buildMessage(), crypto, hashValue(), safeEqualHex(), secondsUntil(), sendCode() (+14 more)

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

### Community 58 - "workoutGuide.js"
Cohesion: 0.06
Nodes (65): DesktopWorkoutSelector(), PICKER_OPTIONS, statusOf(), MobileWorkoutPills(), PICKER_OPTIONS, CHOOSER_FILTERS, CHOOSER_GROUPS, CHOOSER_OPTS (+57 more)

### Community 59 - "goals.service.js"
Cohesion: 0.21
Nodes (16): ACTIVITY_LEVELS, carriedBody(), computeProgress(), createGoal(), getActiveGoalRow(), getLatestBmiWeight(), GOAL_TYPES, isoDate() (+8 more)

### Community 60 - "trainingPrefs.service.js"
Cohesion: 0.22
Nodes (14): cleanEquipment(), cleanPreferredDays(), cleanStringList(), DAY_NAMES, EQUIPMENT_OPTIONS, equipmentMatchesCatalog(), get(), LOCATION_OPTIONS (+6 more)

### Community 61 - "progressInsights.js"
Cohesion: 0.24
Nodes (19): addDays(), buildProgressSummary(), buildTimeline(), diffDays(), goalDirection(), isISO(), minutesInsight(), nutritionInsights() (+11 more)

### Community 62 - "scripts"
Cohesion: 0.06
Nodes (35): scripts, db:create, db:migrate, db:migrate:dry, db:sql, db:status, dev, eval:filipino (+27 more)

### Community 63 - "account-validation.test.js"
Cohesion: 0.16
Nodes (8): VALID_GENDERS, makeCode(), ageOn(), checkDob(), assert, { describe, it }, NOW, { z }

### Community 64 - "AppNav.jsx"
Cohesion: 0.12
Nodes (18): LANDING_MODULES, BottomNav(), normalize(), ACTIVE_NAV_KEY, MAIN_NAV, MOBILE_MAIN_NAV, MOBILE_MORE_NAV, NAV_GROUPS (+10 more)

### Community 65 - "validId"
Cohesion: 0.26
Nodes (11): getcontactsUserId(), getfriendsRequests(), getfriendsStatus(), getmessagesUserIdContactId(), postfriendsAccept(), postfriendsAdd(), postfriendsDecline(), postfriendsRequest() (+3 more)

### Community 66 - "MessengerPanel.jsx"
Cohesion: 0.17
Nodes (16): logout(), Conventions, EmptyState(), ErrorState(), buildThread(), ContactAvatar(), ContactSkeleton(), dayKeyOf() (+8 more)

### Community 67 - "Onboarding.jsx"
Cohesion: 0.10
Nodes (33): ActivityDetail(), SleepNote(), ACTIVITY_LEVELS, EXERCISE_FREQ, EXERCISE_FREQ_LABELS, FOCUSES, GOAL_TYPES, humanizeOption() (+25 more)

### Community 68 - "allergies.service.js"
Cohesion: 0.29
Nodes (11): ALLERGEN_GROUPS, attachMatches(), escapeRegExp(), getAllergies(), groupIndex(), matchAllergies(), norm(), sanitizeList() (+3 more)

### Community 69 - "planEngine.js"
Cohesion: 0.14
Nodes (14): ACTIVITY_FACTORS, ageFromDob(), calcBmi(), calcBmr(), generatePlan(), PROTEIN_PER_KG, proteinPerKgFor(), assert (+6 more)

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

### Community 76 - "react-router-dom"
Cohesion: 0.15
Nodes (17): AccountPageShell(), AppMobileTitle(), AppQuickJump(), AppTextLink(), AppTopbarLeft(), getPageTitle(), QUICK_LINKS, TITLES (+9 more)

### Community 77 - "Register.jsx"
Cohesion: 0.19
Nodes (16): AcknowledgeFooter(), DOCS, LegalCenterModal(), LegalDocument(), PRIVACY_SECTIONS, PrivacyPolicyModal(), TERMS_SECTIONS, TermsOfUseModal() (+8 more)

### Community 78 - "reminder.service.js"
Cohesion: 0.06
Nodes (38): addClient(), broadcast(), clientCount(), clients, notifyUser(), post(), removeClient(), stream() (+30 more)

### Community 79 - "main.jsx"
Cohesion: 0.13
Nodes (13): @fontsource/bebas-neue@^5.3.0, @fontsource/dm-sans@^5.3.0, @fontsource/inter@^5.2.8, @fontsource/manrope@^5.2.8, material-symbols@^0.44.0, installGlobalButtonLoading(), installServiceWorkerUpdate(), isTyping() (+5 more)

### Community 80 - "app/config/env.js"
Cohesion: 0.15
Nodes (14): API_BASE_URL, ENV_ERROR, GOOGLE_CLIENT_ID, rawApi, rawSocket, SMS_SENDER_ID, SOCKET_URL, useLogin() (+6 more)

### Community 81 - "food-traits.test.js"
Cohesion: 0.13
Nodes (22): getFoodCatalog(), searchFoodCatalog(), CATEGORIES, dailyLimits(), describeFood(), foodTraits(), FRIED, goalFit() (+14 more)

### Community 83 - "email.service.js"
Cohesion: 0.12
Nodes (18): fromAddress(), fromHeader(), mailConfigured(), nodemailer, settings, transportOptions, post(), changeEmail() (+10 more)

### Community 84 - "ref_fs"
Cohesion: 0.12
Nodes (14): fs, main(), path, assert, bcrypt, fs, mysql, path (+6 more)

### Community 85 - "AdminOverview.jsx"
Cohesion: 0.11
Nodes (32): AdminCalendar(), DOW, MONTHS, monthStart(), sameDay(), AdminSmsPanel(), LEVEL, AdminUsageChart() (+24 more)

### Community 86 - "migrate.js"
Cohesion: 0.27
Nodes (10): ensureMigrationsTable(), fs, getApplied(), getFiles(), IGNORED_ERRNOS, MIGRATIONS_DIR, path, run() (+2 more)

### Community 87 - "Notifications.jsx"
Cohesion: 0.15
Nodes (24): PageHeader(), NotificationOverlay(), NotificationCard(), NotificationEmpty(), NotificationSkeleton(), CATEGORY_META, dayDiff(), formatFullTime() (+16 more)

### Community 88 - "apiClient.js"
Cohesion: 0.08
Nodes (46): TONE, CheckEmail(), CoachCard(), optionCopy(), STATUS, useCoachWeek(), BodyMeasurementsPanel(), EMPTY() (+38 more)

### Community 89 - "RoutinePlayer.jsx"
Cohesion: 0.46
Nodes (9): RoutineCard(), RoutinePlayer(), buildSteps(), currentSide(), formatDose(), formatSeconds(), playerReducer(), routineSeconds() (+1 more)

### Community 90 - "generate-endpoint-manifest.js"
Cohesion: 0.10
Nodes (16): APP_ENDPOINTS, endpoints, filesByVar, fs, mounts, OUT, path, payload (+8 more)

### Community 91 - "password-policy.test.js"
Cohesion: 0.15
Nodes (13): postresetPassword(), bcrypt, checkPassword(), COMMON, isWeakPassword(), messageFor(), normalizeForCommon(), RULES (+5 more)

### Community 92 - "forgotpassword.routes.js"
Cohesion: 0.14
Nodes (14): fieldLabel(), friendlyMessage(), validate(), commentLimiter, createPostLimiter, express, likeLimiter, router (+6 more)

### Community 93 - "express"
Cohesion: 0.10
Nodes (18): writeLimiter(), express, read, router, express, router, write, express (+10 more)

### Community 94 - "brevo-transport.test.js"
Cohesion: 0.33
Nodes (5): createBrevoTransport(), assert, { it }, message, options

### Community 95 - "ActivityMap.jsx"
Cohesion: 0.13
Nodes (21): DOT, GpsBadge(), LABELS, LocationNotice(), RouteReplay(), RunAnalysisOverlay(), RunControls(), paceToSeconds() (+13 more)

### Community 96 - "auth-revocation.test.js"
Cohesion: 0.14
Nodes (9): signSession(), assert, authedReq(), dbPath, { describe, it }, jwtLib, mockRes(), res (+1 more)

### Community 97 - "accessGroups.service.js"
Cohesion: 0.24
Nodes (17): cleanText(), create(), crypto, getById(), isMissingSchema(), KINDS, list(), members() (+9 more)

### Community 98 - "security.controller.js"
Cohesion: 0.16
Nodes (8): get(), logUserSession(), UAParser, ensureDeviceCookie(), getDeviceId(), { randomUUID }, assert, { test }

### Community 99 - "Sidebar.jsx"
Cohesion: 0.17
Nodes (22): Sidebar(), SidebarAccount(), SidebarRow(), SidebarSection(), getCachedProfile(), _profileCache, setCachedProfile(), Topbar() (+14 more)

### Community 100 - "workoutLogs.service.js"
Cohesion: 0.12
Nodes (17): attachSetSummary(), cleanExerciseName(), cleanWorkoutType(), createManualWorkout(), endWorkout(), listWorkouts(), listWorkoutsPage(), parseHistoryQuery() (+9 more)

### Community 101 - "progression.service.js"
Cohesion: 0.09
Nodes (36): BY_KEY, CHALLENGES, getChallenge(), getPlansForUser(), assertCanStartPlan(), challengeView(), collectStats(), completeChallenge() (+28 more)

### Community 102 - "run-tests.js"
Cohesion: 0.19
Nodes (14): allTestFiles(), BACKEND, childEnv(), fs, globToRegExp(), JEST_BIN, main(), parseArgs() (+6 more)

### Community 103 - "Preferences.jsx"
Cohesion: 0.15
Nodes (17): ThemeToggle(), VARIANTS, ICONS, NotificationProvider(), Toast(), ToastContainer(), ThemeContext, clampStepGoal() (+9 more)

### Community 104 - "useNutritionTracker.js"
Cohesion: 0.42
Nodes (9): apiAnalyzeFoodImage(), apiDeleteFoodLog(), apiEstimateFoodDensity(), apiSaveFoodLog(), compressImageToBase64(), dataUrlToBlob(), toScanResult(), uniqueKey() (+1 more)

### Community 105 - "controllers/README.md"
Cohesion: 0.25
Nodes (7): const authService = require('../services/authService');, // controllers/authController.js, Controllers — keep route handlers thin, Current routes still contain SQL directly (intentional: no logic changed). Move logic here gradually., Each file should export async (req,res,next) functions and call services., Example:, exports.login = async (req,res,next) => { try { const user = await authService.login(req.body); res.json(user);} catch(e){ next(e);} }

### Community 106 - "CommunityFeed.jsx"
Cohesion: 0.13
Nodes (17): FullPageLoader(), LoadingState(), BrandLoader(), SIZES, AdminRoute(), Avatar(), CommunityFeed(), PostSkeleton() (+9 more)

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

### Community 111 - "foodInfo.test.js"
Cohesion: 0.47
Nodes (7): SugarSodiumCard(), goalIntakeNote(), LIMITS, limitStatus(), num(), status(), sugarSodiumTotals()

### Community 112 - "MealTrackerDiary.jsx"
Cohesion: 0.42
Nodes (8): resolveAssetUrl(), DiarySkeleton(), formatNumber(), loggedTime(), MEAL_META, MealDiary(), MealItem(), MealThumbnail()

### Community 113 - "backend/.prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 114 - "DashboardWidgets.jsx"
Cohesion: 0.14
Nodes (37): AiCoachCard(), CardHead(), DashboardGreeting(), DashboardHero(), EmptyPrompt(), GRID_LINES, IconTile(), MacroFocusCard() (+29 more)

### Community 115 - "foodImage.service.js"
Cohesion: 0.32
Nodes (10): configured(), fetchPhoto(), fillAll(), fillInBackground(), fillOne(), inflight, needsImage(), searchQuery() (+2 more)

### Community 116 - "bmi.service.js"
Cohesion: 0.24
Nodes (10): summarizeYears(), yearlySummary(), BMI_CLASSES, classifyBmi(), healthyWeightRange(), parseSleepHours(), sleepGuidance(), bmiCategory() (+2 more)

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

### Community 121 - "geo.js"
Cohesion: 0.14
Nodes (17): DEFAULT_MAP_CENTER, statusFromError(), useGeolocation(), EMPTY_METRICS, useRunTimer(), createGpsTrack(), DEFAULT_GATES, deg2rad() (+9 more)

### Community 122 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): endOfLine, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 123 - "lib/progression.js"
Cohesion: 0.27
Nodes (15): ChallengeResultCard(), Bar(), ChallengeCard(), LevelsPanel(), Requirement(), challengeBlockReason(), challengeResultText(), challengeTargetText() (+7 more)

### Community 124 - "MacroCoachCard.jsx"
Cohesion: 0.18
Nodes (15): formatTime(), useActivityApi(), useDashboardData(), EMPTY, round1(), todayKey(), useTodayMeals(), localTodayIso() (+7 more)

### Community 125 - "zod"
Cohesion: 0.08
Nodes (17): zod@^3.23.8, coachSchema, WORKOUT_TYPES, { z }, completeSchema, keySchema, { z }, emailSchema (+9 more)

### Community 127 - "useVitalisMap.js"
Cohesion: 0.19
Nodes (16): FitRoute(), createMarkerElement(), MapMarker(), MapZoomControls(), RecenterButton(), RecenterMap(), changeOwners(), isMapAlive() (+8 more)

### Community 128 - "AdminAiUsage.jsx"
Cohesion: 0.23
Nodes (12): AdminBottomNav(), ADMIN_NAV, AdminShell(), AdminTopbarSearch(), ADMIN_FILTERS, normalize(), page, readAdminFilters() (+4 more)

### Community 129 - "StreakJourney.jsx"
Cohesion: 0.26
Nodes (13): DOW, DOW_SHORT, Flame(), formatLongDate(), HeatGrid(), MILESTONES, monthDay(), parseISO() (+5 more)

### Community 130 - "Migrations — Vitalis (one table per file)"
Cohesion: 0.50
Nodes (3): History, Migrations — Vitalis (one table per file), Rules

### Community 132 - "external-failures.test.js"
Cohesion: 0.13
Nodes (13): devDependencies, jest@^30.5.2, supertest@^6.3.4, @types/node@^26.6.4, @types/node, app, assert, { describe, it } (+5 more)

### Community 134 - "buildSampleDataset"
Cohesion: 0.31
Nodes (12): addDays(), between(), buildSampleDataset(), daySeed(), MEALS, pad(), parseISO(), pick() (+4 more)

### Community 137 - "bmi.js"
Cohesion: 0.38
Nodes (8): BmiInsight(), BMI_CLASSES, bmiScalePosition(), calcBmi(), classifyBmi(), distanceToHealthy(), healthyWeightRange(), sleepGuidance()

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
Cohesion: 0.29
Nodes (8): patchActiveUserId(), patchchangeUserId(), postUserId(), enumField(), numOrNull(), validDob(), parseExperience(), parseSecondaryGoals()

### Community 142 - "sms.service.js"
Cohesion: 0.31
Nodes (10): getAccount(), isConfigured(), isMock(), isUnsupportedNetwork(), providerDetail(), readJson(), senderId(), sendSms() (+2 more)

### Community 143 - "errors.js"
Cohesion: 0.24
Nodes (6): assertMode(), buildTips(), collectStats(), getInsights(), assert, { describe, it }

### Community 144 - "email-delivery.test.js"
Cohesion: 0.12
Nodes (10): crypto, jwt, normalizeId(), record(), trackingToken(), assert, dbPath, { it } (+2 more)

### Community 145 - "community.controller.js"
Cohesion: 0.15
Nodes (10): addComment(), ALLOWED_TAGS, createCommentSchema, createPostSchema, listComments(), paginationSchema, remove(), toggleLike() (+2 more)

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
Cohesion: 0.12
Nodes (13): collect(), { execSync }, files, fs, path, agent(), app, { execFileSync } (+5 more)

### Community 152 - "password-login-compat.test.js"
Cohesion: 0.22
Nodes (5): assert, bcrypt, dbPath, { describe, it, beforeEach }, servicePath

### Community 153 - "config/db.js"
Cohesion: 0.25
Nodes (4): isAivenHost, mysql, pool, sslFlag

### Community 156 - "goalProfile.test.js"
Cohesion: 0.32
Nodes (5): GOAL_PROFILES, GOAL_TYPES, assert, BASE, { describe, it }

### Community 157 - "ForgotPasswordModal.jsx"
Cohesion: 0.27
Nodes (7): ForgotPasswordModal(), STEP_LABELS, STEP_META, OtpInput(), PasswordField(), post(), useForgotPassword()

### Community 158 - "security.test.js"
Cohesion: 0.38
Nodes (5): app, request, assertNoSensitiveFields(), assertNoStackTrace(), SENSITIVE_KEYS

### Community 159 - "usePoseEngine.js"
Cohesion: 0.43
Nodes (7): loadFromFirstSource(), loadMediaPipe(), localCopyAvailable(), pickModelComplexity(), POSE_SOURCES, startScriptLoad(), usePoseEngine()

### Community 160 - "StatsTab.jsx"
Cohesion: 0.60
Nodes (5): formatBestDate(), LoadingState(), ProgressArt(), StatCard(), StatsTab()

### Community 163 - "settings.controller.js"
Cohesion: 0.18
Nodes (5): putSettingsSchema, { z }, ALLOWED_THEMES, ALLOWED_UNITS, DEFAULTS

### Community 166 - "utils/goalSetup.js"
Cohesion: 0.33
Nodes (9): checkTargetDate(), EXPERIENCE_LEVELS, GOAL_KEYS, isoDay(), LABEL, safeWeeklyRate(), startOfUtcDay(), targetFeasibility() (+1 more)

### Community 168 - "useProfile.js"
Cohesion: 0.36
Nodes (7): GOAL_KEYS, prettyBio(), toE164Phone(), toLocalPhone(), useProfile(), DEFAULT_AVATARS, getAvatarUrl()

### Community 169 - "useProfileWarnings.js"
Cohesion: 0.36
Nodes (5): _cache, getCached(), setCached(), useProfileWarnings(), collectProfileIssues()

### Community 171 - "accessGroups.controller.js"
Cohesion: 0.36
Nodes (4): deleteOne(), getMembers(), idParam(), patchUpdate()

### Community 172 - "WeekCalendarCard.jsx"
Cohesion: 0.46
Nodes (7): dayNumber(), fullDateLabel(), monthShort(), parseISO(), rangeLabel(), WeekCalendarCard(), WEEKDAYS

### Community 173 - "src/config/env.js"
Cohesion: 0.50
Nodes (3): _jwt, missing, required

### Community 174 - "eval-filipino-scans.js"
Cohesion: 0.38
Nodes (6): DIR, evaluate(), fs, main(), parse(), path

### Community 175 - "VitalisMap.jsx"
Cohesion: 0.53
Nodes (5): FALLBACK_CENTER, VitalisMap(), markMapRemoved(), carryOverVitalisLayers(), mapStyleUrl()

### Community 176 - "unit/health.test.js"
Cohesion: 0.50
Nodes (3): asyncHandler(), assert, { describe, it }

## Knowledge Gaps
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `react-router-dom` to `AdminAiUsage.jsx`, `MealTracker.jsx`, `Log.jsx`, `Landing.jsx`, `VerifyPhone.jsx`, `ChangeGoalModal.jsx`, `AppRoutes.jsx`, `Profile.jsx`, `frontend/package.json`, `useAuth.jsx`, `react`, `useProfile.js`, `CameraWorkout.jsx`, `ForgotPasswordModal.jsx`, `workoutGuide.js`, `AppNav.jsx`, `Onboarding.jsx`, `Register.jsx`, `main.jsx`, `app/config/env.js`, `AdminOverview.jsx`, `Notifications.jsx`, `apiClient.js`, `ActivityMap.jsx`, `Sidebar.jsx`, `Preferences.jsx`, `CommunityFeed.jsx`, `DashboardWidgets.jsx`, `lib/progression.js`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Should `escapeHtml` be split into smaller, more focused modules?**
  _Cohesion score 0.07621326042378673 - nodes in this community are weakly interconnected._
- **Why does `AppError` connect `AppError` to `dashboard.service.js`, `errors.js`, `progress.service.js`, `auth.service.js`, `foodLogs.service.js`, `forgotpassword.service.js`, `plans.controller.js`, `upload.js`, `coachPlan.service.js`, `accessGroups.controller.js`, `admin.service.js`, `owner.js`, `unit/health.test.js`, `app.js`, `sms-verification.test.js`, `goals.service.js`, `trainingPrefs.service.js`, `reminder.service.js`, `messenger.service.js`, `email.service.js`, `forgotpassword.routes.js`, `accessGroups.service.js`, `workoutLogs.service.js`, `progression.service.js`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `gemini.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `AdminAiUsage.jsx`, `WebcamFeed.jsx`, `AdminMonitoring.jsx`, `StreakJourney.jsx`, `MealTracker.jsx`, `Log.jsx`, `Landing.jsx`, `VerifyPhone.jsx`, `Icon`, `ChangeGoalModal.jsx`, `AppRoutes.jsx`, `ScanResult.jsx`, `Profile.jsx`, `frontend/package.json`, `ForgotPasswordModal.jsx`, `usePoseEngine.js`, `mapAdapter.js`, `StatsTab.jsx`, `useAuth.jsx`, `useProfile.js`, `useProfileWarnings.js`, `CameraWorkout.jsx`, `WeekCalendarCard.jsx`, `VitalisMap.jsx`, `goalSelection.js`, `ForgotPasswordModal.jsx`, `MealTrackerDiary.jsx`, `AdminAccess.jsx`, `HistoryTab.jsx`, `workoutGuide.js`, `AppNav.jsx`, `MessengerPanel.jsx`, `Onboarding.jsx`, `react-router-dom`, `Register.jsx`, `main.jsx`, `app/config/env.js`, `AdminOverview.jsx`, `Notifications.jsx`, `apiClient.js`, `RoutinePlayer.jsx`, `ActivityMap.jsx`, `Sidebar.jsx`, `Preferences.jsx`, `useNutritionTracker.js`, `CommunityFeed.jsx`, `MealTrackerDiary.jsx`, `DashboardWidgets.jsx`, `exportTable.js`, `geo.js`, `MacroCoachCard.jsx`, `useVitalisMap.js`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `admin.controller.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Log.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._