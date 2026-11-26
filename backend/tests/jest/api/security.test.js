// Controlled, non-destructive security regressions through Supertest.
const request = require("supertest");
const createApp = require("../../../src/app");
const { assertNoSensitiveFields, assertNoStackTrace } = require("../helpers/assertions");

const app = createApp();
const ALLOWED_ORIGIN = "http://localhost:5173";

describe("security headers and CORS", () => {
  it("sets baseline protective headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toMatch(/default-src/);
  });

  it("allows only configured origins", async () => {
    const allowed = await request(app).get("/api/health").set("Origin", ALLOWED_ORIGIN);
    expect(allowed.headers["access-control-allow-origin"]).toBe(ALLOWED_ORIGIN);

    const blocked = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("blocks cross-origin mutations with an untrusted Origin (CSRF guard)", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Origin", "https://evil.example")
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("CSRF_BLOCKED");
  });

  it("allows the same mutation from a configured Origin", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Origin", ALLOWED_ORIGIN)
      .send({});
    expect(res.status).toBe(200);
  });

  it("advertises rate-limit headers on a non-skipped route", async () => {
    const res = await request(app).get("/api/public/access/no-such-code");
    const headers = Object.keys(res.headers).filter((k) => k.toLowerCase().startsWith("ratelimit"));
    expect(headers.length).toBeGreaterThan(0);
  });
});

describe("error handling and injection", () => {
  it("returns a structured 404 without a stack trace", async () => {
    const res = await request(app).get("/api/definitely-not-a-route");
    expect(res.status).toBe(404);
    assertNoStackTrace(res.body);
    assertNoSensitiveFields(res.body);
  });

  it("handles malformed JSON without exposing internals", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{not-json");
    expect(res.status).toBe(400);
    assertNoStackTrace(res.body);
  });

  it.each([
    "' OR 1=1 --",
    "admin'--",
    "'; DROP TABLE users; --",
  ])("does not execute SQL injection payload %s", async (payload) => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload, password: "anything" });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    assertNoStackTrace(res.body);
  });

  it("rejects path traversal against stored uploads", async () => {
    const res = await request(app).get("/uploads/%2e%2e/.env");
    expect([403, 404]).toContain(res.status);
    expect(JSON.stringify(res.body)).not.toMatch(/DB_HOST|JWT_SECRET|DB_PASS/);
  });

  it("never exposes password hashes or config on public responses", async () => {
    for (const path of ["/api/health", "/api/version", "/api/_routes"]) {
      const res = await request(app).get(path);
      assertNoSensitiveFields(res.body);
      assertNoStackTrace(res.body);
    }
  });
});
