// Real-DB authentication tests through the HTTP layer (Supertest).
// External email/SMS providers are mocked; bcrypt + JWT + MySQL are real.
jest.mock("../../../src/services/email.service", () => {
  const actual = jest.requireActual("../../../src/services/email.service");
  return {
    ...actual,
    sendWelcomeEmail: jest.fn(async () => {}),
    sendVerificationEmail: jest.fn(async () => {}),
    sendEmailChangedNotice: jest.fn(async () => {}),
  };
});
jest.mock("../../../src/services/phoneVerification.service", () => ({
  sendCode: jest.fn(async () => ({ success: true })),
  verifyCode: jest.fn(async () => ({ success: true })),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const createApp = require("../../../src/app");
const { execute } = require("../helpers/db");
const { createUser, cleanupTrackedUsers, cleanupEmail, uniqueEmail, DEFAULT_PASSWORD } = require("../helpers/factories");
const { sessionCookie, cookieName } = require("../helpers/auth");
const { assertNoSensitiveFields } = require("../helpers/assertions");

const app = createApp();
const registered = [];

afterEach(async () => {
  await cleanupTrackedUsers();
  for (const email of registered.splice(0)) await cleanupEmail(email);
  jest.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  const valid = () => ({
    name: "QA Register",
    email: uniqueEmail("register"),
    password: DEFAULT_PASSWORD,
    agreed: true,
  });

  it("creates a hashed account and never echoes secrets", async () => {
    const body = valid();
    registered.push(body.email);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, email: body.email, needsVerification: true });
    assertNoSensitiveFields(res.body);

    const [rows] = await execute("SELECT password, is_verified FROM users WHERE email = ?", [body.email]);
    expect(rows).toHaveLength(1);
    expect(rows[0].password).not.toBe(body.password);
    expect(await bcrypt.compare(body.password, rows[0].password)).toBe(true);
  });

  it("rejects a duplicate email with EMAIL_EXISTS", async () => {
    const body = valid();
    registered.push(body.email);
    await request(app).post("/api/auth/register").send(body).expect(201);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("EMAIL_EXISTS");
  });

  it.each([
    ["invalid email", { email: "not-an-email" }],
    ["missing consent", { agreed: false }],
    ["weak password", { password: "short" }],
    ["missing name", { name: "" }],
  ])("rejects %s with 400", async (_label, patch) => {
    const body = { ...valid(), ...patch };
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(400);
    assertNoSensitiveFields(res.body);
  });

  it("rejects non-string input without a 5xx", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: [], email: {}, password: 42 });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe("POST /api/auth/login", () => {
  it("issues a signed httpOnly session cookie for valid credentials", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: DEFAULT_PASSWORD });
    expect(res.status).toBe(200);
    assertNoSensitiveFields(res.body);
    const cookies = res.headers["set-cookie"] || [];
    const session = cookies.find((c) => c.startsWith(`${cookieName()}=`));
    expect(session).toBeDefined();
    expect(session).toMatch(/HttpOnly/i);
    expect(session).toMatch(/SameSite=/i);
    const token = session.split(";")[0].split("=")[1];
    expect(jwt.decode(token)).toMatchObject({ id: user.id, email: user.email });
  });

  it("rejects a wrong password with 401 and an unknown account with 404", async () => {
    const user = await createUser();
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "WrongPass!12345" });
    expect(wrong.status).toBe(401);
    // The login controller deliberately omits error codes for credential
    // failures; assert the stable user-facing message instead.
    expect(wrong.body.error).toBe("Invalid credentials");

    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: uniqueEmail("missing"), password: DEFAULT_PASSWORD });
    // Documented product behavior (src/services/auth.service.js): signup
    // already reveals taken emails, so login returns an explicit 404 here.
    expect(unknown.status).toBe(404);
  });

  it.each([
    ["missing password", { email: "a@b.com" }],
    ["invalid email format", { email: "bad", password: "x" }],
    ["empty body", {}],
  ])("rejects %s with 400", async (_label, body) => {
    const res = await request(app).post("/api/auth/login").send(body);
    expect(res.status).toBe(400);
  });
});

describe("session tokens", () => {
  it("GET /api/auth/me accepts a valid cookie and rejects missing/tampered/expired tokens", async () => {
    const user = await createUser();
    const agent = request(app);
    await agent.get("/api/auth/me").set("Cookie", sessionCookie(user)).expect(200);

    const noCookie = await agent.get("/api/auth/me");
    expect(noCookie.status).toBe(401);
    expect(noCookie.body.code).toBe("NO_COOKIE");

    const tampered = `${cookieName()}=${sessionCookie(user).split("=")[1]}x`;
    const bad = await agent.get("/api/auth/me").set("Cookie", tampered);
    expect(bad.status).toBe(401);
    expect(bad.body.code).toBe("INVALID_SESSION");

    const expired = jwt.sign(
      { id: user.id, email: user.email, tv: 0 },
      process.env.JWT_SECRET,
      { algorithm: "HS256", issuer: "vitalis", audience: "vitalis-web", expiresIn: -10 },
    );
    const stale = await agent.get("/api/auth/me").set("Cookie", `${cookieName()}=${expired}`);
    expect(stale.status).toBe(401);
    expect(stale.body.code).toBe("INVALID_SESSION");
  });

  it("revokes a cookie whose token_version no longer matches", async () => {
    const user = await createUser({ token_version: 3 });
    const stale = await request(app)
      .get("/api/auth/me")
      .set("Cookie", sessionCookie(user, { tv: 0 }));
    expect(stale.status).toBe(401);
    expect(stale.body.code).toBe("SESSION_REVOKED");
  });

  it("logout clears the cookie and bumps token_version", async () => {
    const user = await createUser();
    const cookie = sessionCookie(user);
    const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect((res.headers["set-cookie"] || []).join(" ")).toMatch(new RegExp(`${cookieName()}=;`));

    const [rows] = await execute("SELECT token_version FROM users WHERE id = ?", [user.id]);
    expect(Number(rows[0].token_version)).toBe(1);

    const after = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(after.status).toBe(401);
    expect(after.body.code).toBe("SESSION_REVOKED");
  });

  it("blocks deactivated accounts on protected routes", async () => {
    const user = await createUser({ status: "deactivated" });
    const res = await request(app)
      .get(`/api/profile/${user.id}`)
      .set("Cookie", sessionCookie(user));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ACCOUNT_DEACTIVATED");
  });
});
