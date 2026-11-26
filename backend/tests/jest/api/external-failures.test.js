// External integrations are mocked so failures cannot create real side effects
// or charges. The app must keep responding predictably when a provider fails.
jest.mock("../../../src/services/email.service", () => {
  const actual = jest.requireActual("../../../src/services/email.service");
  return {
    ...actual,
    sendWelcomeEmail: jest.fn(async () => {
      throw new Error("SMTP provider unavailable (mocked)");
    }),
    sendVerificationEmail: jest.fn(async () => {
      throw new Error("SMTP provider unavailable (mocked)");
    }),
  };
});
jest.mock("../../../src/services/phoneVerification.service", () => ({
  sendCode: jest.fn(async () => ({ success: true, mocked: true })),
  verifyCode: jest.fn(async () => ({ success: true, mocked: true })),
}));

const request = require("supertest");
const createApp = require("../../../src/app");
const { cleanupEmail, uniqueEmail, DEFAULT_PASSWORD } = require("../helpers/factories");
const emailService = require("../../../src/services/email.service");
const sms = require("../../../src/services/phoneVerification.service");

const app = createApp();

afterEach(() => {
  jest.clearAllMocks();
});

describe("provider failures", () => {
  it("registration succeeds even when the welcome-email provider throws", async () => {
    const email = uniqueEmail("mailfail");
    try {
      const res = await request(app).post("/api/auth/register").send({
        name: "QA User",
        email,
        password: DEFAULT_PASSWORD,
        agreed: true,
      });
      expect(res.status).toBe(201);
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
    } finally {
      await cleanupEmail(email);
    }
  });

  it("uses mocked SMS delivery (no network, no credits)", async () => {
    expect(process.env.UNISMS_MOCK).toBe("1");
    await expect(sms.sendCode({ email: "qa@example.test", phone: "09171234567" })).resolves.toMatchObject({
      mocked: true,
    });
    expect(sms.sendCode).toHaveBeenCalled();
  });

  it("does not crash the health endpoint when providers are unusable", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
