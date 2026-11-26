// Role gates (admin vs member) and resource-ownership enforcement.
const request = require("supertest");
const createApp = require("../../../src/app");
const { execute } = require("../helpers/db");
const { createUser, createAdmin, cleanupTrackedUsers, DEFAULT_PASSWORD } = require("../helpers/factories");
const { sessionCookie } = require("../helpers/auth");

const app = createApp();

afterEach(async () => {
  await cleanupTrackedUsers();
});

describe("vertical privilege escalation", () => {
  it("blocks members from admin endpoints and admits admins", async () => {
    const member = await createUser();
    const admin = await createAdmin();

    const denied = await request(app)
      .get("/api/admin/overview")
      .set("Cookie", sessionCookie(member));
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe("FORBIDDEN_ADMIN");

    const allowed = await request(app)
      .get("/api/admin/overview")
      .set("Cookie", sessionCookie(admin));
    expect(allowed.status).toBe(200);
  });

  it("blocks admins from member-only routes but admits members", async () => {
    const admin = await createAdmin();
    const member = await createUser();

    const denied = await request(app)
      .get("/api/community")
      .set("Cookie", sessionCookie(admin));
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe("FORBIDDEN_MEMBER");

    const allowed = await request(app)
      .get("/api/community")
      .set("Cookie", sessionCookie(member));
    expect(allowed.status).toBe(200);
  });

  it("ignores client-supplied role/id fields during profile update", async () => {
    const user = await createUser();
    const res = await request(app)
      .put("/api/profile/update")
      .set("Cookie", sessionCookie(user))
      .send({ fullName: "Legit Name", role: "admin", id: 999999, status: "active" });
    expect(res.status).toBe(200);

    const [rows] = await execute("SELECT role, id, name FROM users WHERE id = ?", [user.id]);
    expect(rows[0].role).toBe("member");
    expect(rows[0].id).toBe(user.id);
    expect(rows[0].name).toBe("Legit Name");
  });
});

describe("horizontal privilege escalation", () => {
  it("cannot read or analyze another user's resource", async () => {
    const alice = await createUser();
    const bob = await createUser();

    for (const path of [
      `/api/profile/${bob.id}`,
      `/api/activity/stats/${bob.id}`,
      `/api/activity/${bob.id}`,
      `/api/food-logs/${bob.id}`,
      `/api/goals/active/${bob.id}`,
    ]) {
      const res = await request(app).get(path).set("Cookie", sessionCookie(alice));
      expect([401, 403]).toContain(res.status);
    }

    const own = await request(app)
      .get(`/api/profile/${alice.id}`)
      .set("Cookie", sessionCookie(alice));
    expect(own.status).toBe(200);
  });

  it("cannot change another user's activity record", async () => {
    const alice = await createUser();
    const bob = await createUser();
    const [result] = await execute(
      "INSERT INTO activity_logs (user_id, duration, distance, is_gps) VALUES (?, ?, ?, 1)",
      [bob.id, 1800, 5],
    );
    const res = await request(app)
      .patch(`/api/activity/${result.insertId}`)
      .set("Cookie", sessionCookie(alice))
      .send({ duration: 10 });
    expect([404, 403]).toContain(res.status);

    const [rows] = await execute("SELECT duration FROM activity_logs WHERE id = ?", [result.insertId]);
    expect(rows[0].duration).toBe(1800);
  });
});
