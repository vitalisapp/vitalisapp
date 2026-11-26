// Every registered endpoint is accounted for here:
//  1) the manifest is checked against the current route source (new routes fail),
//  2) every auth-protected endpoint rejects unauthenticated requests,
//  3) public health/legacy endpoints keep their expected behavior.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const request = require("supertest");
const createApp = require("../../../src/app");

const manifestPath = path.join(__dirname, "..", "fixtures", "endpoints.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const app = createApp();
const agent = () => request(app);

function concrete(p) {
  return p.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, "1");
}

describe("endpoint inventory", () => {
  it("matches the registered Express routes (fails when a new route has no manifest entry)", () => {
    const script = path.join(__dirname, "..", "..", "..", "scripts", "generate-endpoint-manifest.js");
    const out = execFileSync(process.execPath, [script, "--check"], { encoding: "utf8" });
    expect(out).toMatch(/manifest current/);
  });

  it("contains no duplicate method+path entries", () => {
    const ids = manifest.endpoints.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(manifest.endpoints.filter((e) => e.auth))(
    "rejects unauthenticated %s",
    async ({ method, path: routePath }) => {
      const res = await agent()[method.toLowerCase()](concrete(routePath));
      expect(res.status).toBe(401);
      expect(res.body).not.toHaveProperty("password");
    },
  );

  it.each([
    ["/api/health", 200],
    ["/health", 200],
    ["/api/version", 200],
    ["/api/_routes", 200],
    ["/api/public/landing-stats", 200],
    ["/api/auth/me", 401],
  ])("keeps public endpoint %s reachable (status %i)", async (routePath, status) => {
    const res = await agent().get(routePath);
    expect(res.status).toBe(status);
    if (routePath === "/api/health") {
      expect(res.body).toMatchObject({ ok: true });
      expect(res.body.time).toEqual(expect.any(String));
    }
  });

  it.each([
    "/api/clinic",
    "/api/atelier",
    "/api/live-coaching",
    "/api/workout-sessions",
    "/api/nutrition",
  ])("returns 410 for removed module %s", async (routePath) => {
    const res = await agent().get(routePath);
    expect(res.status).toBe(410);
    expect(res.body.code).toMatch(/_REMOVED$/);
  });

  it("reports the manifest size used by the coverage matrix", () => {
    expect(manifest.total).toBeGreaterThanOrEqual(170);
  });
});
