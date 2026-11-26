// Deterministic test environment. Values set here are NOT overridden by
// dotenv.config() (dotenv never overwrites existing process.env values).
process.env.NODE_ENV = "test";
process.env.DB_NAME = process.env.DB_TEST_NAME || "fitnessapp_test";
process.env.DB_TEST_NAME = process.env.DB_NAME;
process.env.JWT_SECRET = "vitalis-jest-secret-0123456789abcdef0123";
process.env.TZ = "UTC";

// Disable every external side effect at the environment level.
process.env.UNISMS_MOCK = "1";
process.env.SMS_VERIFY_DEV = "0";
process.env.ALLOW_DEV_LINKS = "0";
process.env.REMINDERS_ENABLED = "false";
process.env.BREVO_API_KEY = "";
process.env.BREVO_SMTP_LOGIN = "";
process.env.BREVO_SMTP_KEY = "";
process.env.EMAIL_USER = "";
process.env.EMAIL_PASS = "";
process.env.GOOGLE_CLIENT_ID = "";
process.env.GOOGLE_CLIENT_SECRET = "";
process.env.GEMINI_API_KEY = "";
process.env.GROQ_API_KEY = "";
process.env.OPENROUTER_API_KEY = "";
process.env.PEXELS_API_KEY = "";

// Keep rate limits from interfering with functional assertions. Security
// tests build isolated limiter instances where they need to assert limits.
process.env.GLOBAL_RATE_LIMIT = "100000";
process.env.AI_DAILY_LIMIT = "100000";

// The installed OpenRouter SDK is ESM-only; Jest 30 cannot require() it.
// AI providers are never exercised for real in tests, so stub the client at
// the module boundary (no network, no keys, no transform hacks).
jest.mock("@openrouter/sdk", () => ({ OpenRouter: jest.fn() }), { virtual: true });

require("./helpers/env-guard").assertTestEnvironment();
