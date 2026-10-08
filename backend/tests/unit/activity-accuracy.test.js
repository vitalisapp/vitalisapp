const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  downsampleRoute,
  isPlausibleActivity,
  ROUTE_MAX_CHARS,
} = require('../../src/services/activity.service');

function fakeRoute(n) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([14.6760 + i * 0.0001, 121.0437 + i * 0.0001]);
  return pts;
}

describe('activity route + plausibility (ActivityMap accuracy)', () => {
  it('keeps short routes intact as valid JSON', () => {
    const pts = fakeRoute(10);
    const out = downsampleRoute(pts);
    assert.deepEqual(JSON.parse(out), pts);
  });

  it('downsamples long runs to valid JSON within column limit, keeping endpoints', () => {
    const pts = fakeRoute(5000);
    assert.ok(JSON.stringify(pts).length > ROUTE_MAX_CHARS, 'fixture must exceed limit');
    const out = downsampleRoute(pts);
    assert.ok(out.length <= ROUTE_MAX_CHARS, `got ${out.length}`);
    const parsed = JSON.parse(out); // must not be truncated garbage
    assert.deepEqual(parsed[0], pts[0]);
    assert.deepEqual(parsed[parsed.length - 1], pts[pts.length - 1]);
    assert.ok(parsed.length < pts.length);
  });

  it('accepts string input and null', () => {
    const pts = fakeRoute(5);
    assert.deepEqual(JSON.parse(downsampleRoute(JSON.stringify(pts))), pts);
    assert.equal(downsampleRoute(null), null);
  });

  it('rejects GPS-glitch speeds over 50 km/h, allows real efforts', () => {
    assert.equal(isPlausibleActivity(1800, 10), true); // 10km in 30min = 20km/h
    assert.equal(isPlausibleActivity(7200, 42.2), true); // marathon in 2h
    assert.equal(isPlausibleActivity(5, 0.2), false); // 0.2km in 5s = 144km/h glitch
    assert.equal(isPlausibleActivity(3600, 100), false); // 100km/h avg
    assert.equal(isPlausibleActivity(0, 5), true); // no duration → no verdict
  });
});
