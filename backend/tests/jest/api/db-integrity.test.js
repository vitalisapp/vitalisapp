// Real MySQL behavior on the isolated *_test schema: constraints, cascades,
// transactions and cleanup. No database layer is mocked here.
const request = require("supertest");
const createApp = require("../../../src/app");
const { execute, query } = require("../helpers/db");
const { createUser, cleanupTrackedUsers, cleanupEmail, uniqueEmail, DEFAULT_PASSWORD } = require("../helpers/factories");
const { sessionCookie } = require("../helpers/auth");

const app = createApp();

afterEach(async () => {
  await cleanupTrackedUsers();
});

describe("constraints", () => {
  it("enforces UNIQUE(email) at the database layer", async () => {
    const user = await createUser();
    await expect(
      execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        ["Duplicate", user.email, "x"],
      ),
    ).rejects.toMatchObject({ code: "ER_DUP_ENTRY" });
  });

  it("maps duplicate registration to a controlled 400 (no partial rows)", async () => {
    const email = uniqueEmail("dupcheck");
    const body = { name: "QA User", email, password: DEFAULT_PASSWORD, agreed: true };
    await request(app).post("/api/auth/register").send(body).expect(201);
    try {
      const second = await request(app).post("/api/auth/register").send(body);
      expect(second.status).toBe(400);
      const [rows] = await execute("SELECT COUNT(*) AS n FROM users WHERE email = ?", [email]);
      expect(rows[0].n).toBe(1);
    } finally {
      await cleanupEmail(email);
    }
  });

  it("rejects orphan foreign keys", async () => {
    await expect(
      execute(
        "INSERT INTO activity_logs (user_id, duration, is_gps) VALUES (?, 60, 1)",
        [2147483647],
      ),
    ).rejects.toMatchObject({ code: "ER_NO_REFERENCED_ROW_2" });
  });
});

describe("cascades and transactions", () => {
  it("cascades child rows when a test user is deleted", async () => {
    const user = await createUser();
    const [r] = await execute(
      "INSERT INTO activity_logs (user_id, duration, is_gps) VALUES (?, 900, 1)",
      [user.id],
    );
    const id = r.insertId;
    await execute("DELETE FROM users WHERE id = ?", [user.id]);
    const [rows] = await execute("SELECT id FROM activity_logs WHERE id = ?", [id]);
    expect(rows).toHaveLength(0);
  });

  it("rolls back a failed transaction without leaving a partial write", async () => {
    const conn = await require("../../../src/config/db").getConnection();
    const email = uniqueEmail("rollback");
    try {
      await conn.beginTransaction();
      await conn.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        ["Rollback", email, "x"],
      );
      await conn.rollback();
    } finally {
      conn.release();
    }
    const [rows] = await execute("SELECT id FROM users WHERE email = ?", [email]);
    expect(rows).toHaveLength(0);
  });

  it("persists an API write and removes it on API delete", async () => {
    const user = await createUser();
    const created = await request(app)
      .post("/api/activity/save")
      .set("Cookie", sessionCookie(user))
      .send({ duration: 1800, distance: 6.2, is_gps: true });
    expect(created.status).toBe(200);
    const id = created.body.id;
    expect(id).toEqual(expect.any(Number));

    let [rows] = await query("SELECT duration, distance FROM activity_logs WHERE id = ?", [id]);
    expect(rows[0].duration).toBe(1800);

    await request(app)
      .delete(`/api/activity/${id}`)
      .set("Cookie", sessionCookie(user))
      .expect(200);
    [rows] = await query("SELECT id FROM activity_logs WHERE id = ?", [id]);
    expect(rows).toHaveLength(0);
  });
});
