// A personal plan belongs to the member who created it — nobody else can list,
// open, enroll in, edit, delete or activate it. Shared templates stay visible to all.
const request = require("supertest");
const createApp = require("../../../src/app");
const { execute } = require("../helpers/db");
const { createUser, cleanupTrackedUsers } = require("../helpers/factories");
const { sessionCookie } = require("../helpers/auth");

const app = createApp();

afterEach(async () => {
  await cleanupTrackedUsers();
});

async function makePersonalPlan(owner, title) {
  const res = await request(app)
    .post("/api/plans")
    .set("Cookie", sessionCookie(owner))
    .send({ title, tag: "Strength", intensity: "Moderate", targetFocus: "General", durationDays: 7 });
  expect(res.status).toBe(201);
  return res.body.planId;
}

describe("personal plan isolation", () => {
  it("stores the creator as owner and a non-template flag", async () => {
    const owner = await createUser();
    const planId = await makePersonalPlan(owner, `Iso Owner ${Date.now()}`);
    const [rows] = await execute("SELECT owner_user_id, is_template FROM plans WHERE id = ?", [planId]);
    expect(rows[0].owner_user_id).toBe(owner.id);
    expect(Number(rows[0].is_template)).toBe(0);
  });

  it("keeps the plan out of another member's list but shows templates", async () => {
    const owner = await createUser();
    const other = await createUser();
    const planId = await makePersonalPlan(owner, `Iso List ${Date.now()}`);

    const mine = await request(app).get(`/api/plans/${owner.id}`).set("Cookie", sessionCookie(owner));
    expect(mine.status).toBe(200);
    expect(mine.body.some((p) => p.id === planId)).toBe(true);

    const theirs = await request(app).get(`/api/plans/${other.id}`).set("Cookie", sessionCookie(other));
    expect(theirs.status).toBe(200);
    expect(theirs.body.some((p) => p.id === planId)).toBe(false);
    expect(theirs.body.every((p) => p.owner_user_id == null || p.owner_user_id === other.id)).toBe(true);
  });

  it("hides the plan's content, routine and enrollment from other members (404)", async () => {
    const owner = await createUser();
    const other = await createUser();
    const planId = await makePersonalPlan(owner, `Iso Open ${Date.now()}`);
    const asOther = (r) => r.set("Cookie", sessionCookie(other));

    expect((await request(app).get(`/api/plans/content/${planId}`).set("Cookie", sessionCookie(owner))).status).toBe(200);
    expect((await asOther(request(app).get(`/api/plans/content/${planId}`))).status).toBe(404);
    expect((await asOther(request(app).get(`/api/plans/${planId}/days/1/routine`))).status).toBe(404);
    expect((await asOther(request(app).post("/api/plans/enroll").send({ planId }))).status).toBe(404);
  });

  it("blocks other members from editing, deleting or activating it", async () => {
    const owner = await createUser();
    const other = await createUser();
    const planId = await makePersonalPlan(owner, `Iso Write ${Date.now()}`);
    const asOther = (r) => r.set("Cookie", sessionCookie(other));

    expect([403, 404]).toContain((await asOther(request(app).patch(`/api/plans/${planId}`).send({ description: "x" }))).status);
    expect([403, 404]).toContain((await asOther(request(app).delete(`/api/plans/${planId}`))).status);
    expect([403, 404]).toContain((await asOther(request(app).post(`/api/plans/${planId}/activate`))).status);
    const [rows] = await execute("SELECT COUNT(*) AS n FROM plans WHERE id = ?", [planId]);
    expect(Number(rows[0].n)).toBe(1);
  });

  it("deletes a member's personal plans with the member (foreign key cascade)", async () => {
    const owner = await createUser();
    const planId = await makePersonalPlan(owner, `Iso Cascade ${Date.now()}`);
    await execute("DELETE FROM users WHERE id = ?", [owner.id]);
    const [rows] = await execute("SELECT COUNT(*) AS n FROM plans WHERE id = ?", [planId]);
    expect(Number(rows[0].n)).toBe(0);
  });
});
