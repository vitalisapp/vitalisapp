// Cross-module API integration with real business logic + DB persistence.
const request = require("supertest");
const createApp = require("../../../src/app");
const { execute, query } = require("../helpers/db");
const { createUser, cleanupTrackedUsers } = require("../helpers/factories");
const { sessionCookie } = require("../helpers/auth");

const app = createApp();

afterEach(async () => {
  await cleanupTrackedUsers();
});

describe("activity module", () => {
  it("creates, updates, reads and deletes an activity with persisted values", async () => {
    const user = await createUser();
    const cookie = sessionCookie(user);

    const created = await request(app)
      .post("/api/activity/save")
      .set("Cookie", cookie)
      .send({ duration: 1800, distance: 6.2, pace: "4:50", is_gps: false, measured_calories: 540 });
    expect(created.status).toBe(200);
    const id = created.body.id;

    const updated = await request(app)
      .patch(`/api/activity/${id}`)
      .set("Cookie", cookie)
      .send({ duration: 2400, distance: 8 });
    expect(updated.status).toBe(200);

    const [rows] = await query("SELECT duration, distance FROM activity_logs WHERE id = ?", [id]);
    expect(rows[0].duration).toBe(2400);
    expect(Number(rows[0].distance)).toBe(8);

    const list = await request(app).get(`/api/activity/${user.id}`).set("Cookie", cookie);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    await request(app).delete(`/api/activity/${id}`).set("Cookie", cookie).expect(200);
  });

  it("rejects implausible GPS data using real business rules", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/api/activity/save")
      .set("Cookie", sessionCookie(user))
      .send({ duration: 60, distance: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/implausible/i);
  });
});

describe("settings module", () => {
  it("upserts validated settings and reads them back", async () => {
    const user = await createUser();
    const cookie = sessionCookie(user);

    const put = await request(app)
      .put("/api/settings")
      .set("Cookie", cookie)
      .send({ units: "metric", step_goal: 8000 });
    expect(put.status).toBe(200);

    const get = await request(app).get("/api/settings").set("Cookie", cookie);
    expect(get.status).toBe(200);
    expect(get.body.settings).toMatchObject({ units: "metric", step_goal: 8000 });

    const [rows] = await execute("SELECT units, step_goal FROM user_settings WHERE user_id = ?", [user.id]);
    expect(rows[0].units).toBe("metric");
    expect(rows[0].step_goal).toBe(8000);
  });

  it("rejects invalid enum and out-of-range values", async () => {
    const user = await createUser();
    const cookie = sessionCookie(user);
    for (const body of [{ units: "bogus" }, { step_goal: 1 }, {}]) {
      const res = await request(app).put("/api/settings").set("Cookie", cookie).send(body);
      expect(res.status).toBe(400);
    }
  });
});

describe("community module", () => {
  it("creates a post, enforces ownership on delete, and persists comments/likes", async () => {
    const author = await createUser();
    const other = await createUser();
    const authorCookie = sessionCookie(author);
    const otherCookie = sessionCookie(other);

    const created = await request(app)
      .post("/api/community")
      .set("Cookie", authorCookie)
      .send({ text: "QA post for integration", tag: "General" });
    expect(created.status).toBe(201);
    const postId = created.body.post.id;

    const liked = await request(app)
      .post(`/api/community/${postId}/like`)
      .set("Cookie", otherCookie);
    expect(liked.status).toBe(200);

    const commented = await request(app)
      .post(`/api/community/${postId}/comments`)
      .set("Cookie", otherCookie)
      .send({ text: "QA comment" });
    expect(commented.status).toBe(201);

    const [postRows] = await query("SELECT user_id FROM community_posts WHERE id = ?", [postId]);
    expect(postRows[0].user_id).toBe(author.id);

    const forbidden = await request(app)
      .delete(`/api/community/${postId}`)
      .set("Cookie", otherCookie);
    expect(forbidden.status).toBe(403);

    await request(app).delete(`/api/community/${postId}`).set("Cookie", authorCookie).expect(200);
  });

  it("rejects unsupported tags and oversized pagination", async () => {
    const user = await createUser();
    const cookie = sessionCookie(user);
    const tag = await request(app)
      .post("/api/community")
      .set("Cookie", cookie)
      .send({ text: "x", tag: "Invalid" });
    expect(tag.status).toBe(400);

    const page = await request(app)
      .get("/api/community?limit=999&offset=-1")
      .set("Cookie", cookie);
    expect(page.status).toBe(400);
  });
});
