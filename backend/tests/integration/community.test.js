// tests/integration/community.test.js — auth guards for Community + Settings.
// No DB rows needed: unauthenticated requests must 401 before any query runs.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../../src/app');

const app = createApp();

describe('Community + Settings auth guards', () => {
  it('GET /api/community without session → 401', async () => {
    const res = await request(app).get('/api/community');
    assert.equal(res.status, 401);
  });

  it('POST /api/community without session → 401 (not 400)', async () => {
    const res = await request(app).post('/api/community').send({ text: 'hi', tag: 'General' });
    assert.equal(res.status, 401);
  });

  it('POST /api/community/:id/like without session → 401', async () => {
    const res = await request(app).post('/api/community/1/like');
    assert.equal(res.status, 401);
  });

  it('DELETE /api/community/:id/like without session → 401', async () => {
    const res = await request(app).delete('/api/community/1/like');
    assert.equal(res.status, 401);
  });

  it('GET /api/community/:id/comments without session → 401', async () => {
    const res = await request(app).get('/api/community/1/comments');
    assert.equal(res.status, 401);
  });

  it('POST /api/community/:id/comments without session → 401', async () => {
    const res = await request(app).post('/api/community/1/comments').send({ text: 'nice' });
    assert.equal(res.status, 401);
  });

  it('DELETE /api/community/:id without session → 401', async () => {
    const res = await request(app).delete('/api/community/1');
    assert.equal(res.status, 401);
  });

  it('GET /api/settings without session → 401', async () => {
    const res = await request(app).get('/api/settings');
    assert.equal(res.status, 401);
  });

  it('PUT /api/settings without session → 401 (not 400)', async () => {
    const res = await request(app).put('/api/settings').send({ units: 'bogus' });
    assert.equal(res.status, 401);
  });
});
