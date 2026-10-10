// tests/integration/socket-relay.test.js — send-chat relay is friends-only,
// sender-bound, rate-limited, and never persists (REST owns the DB write).
// socketHandler is driven with a mocked io + socket; db is stubbed via
// require.cache; cookies carry real JWTs signed with src/config/jwt.
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-min-32-chars-0123456789ab';

let __friends = [];
let __userRow = { token_version: 0, is_verified: 1 };
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    execute: async (sql) => {
      if (/FROM friendships/i.test(sql)) return [__friends];
      if (/FROM users/i.test(sql)) return [[__userRow]];
      return [[]];
    },
    query: async () => [[]],
  },
};

const jwtLib = require('jsonwebtoken');
const { signSession } = require('../../src/config/jwt');
const { COOKIE_NAME } = require('../../src/utils/cookies');
const makeHandler = require('../../src/sockets/socketHandler');

function mockIo() {
  const state = { connCb: null, emitted: [] };
  return {
    state,
    on: (ev, cb) => { if (ev === 'connection') state.connCb = cb; },
    to: (room) => ({
      emit: (ev, msg) => { state.emitted.push({ room: String(room), ev, msg }); },
    }),
  };
}

function mockSocket({ userId = 7, tv = 0, authed = true } = {}) {
  const handlers = {};
  const emitted = [];
  const token = authed ? signSession(jwtLib, { id: userId, email: 't@example.com', tv }) : null;
  return {
    handlers,
    emitted,
    data: {},
    connected: true,
    handshake: { headers: { cookie: token ? `${COOKIE_NAME}=${token}` : '' } },
    id: 'sock-1',
    on: (ev, cb) => { handlers[ev] = cb; },
    emit: (ev, msg) => { emitted.push({ ev, msg }); },
    join: () => {},
    disconnect: () => {},
  };
}

const tick = () => new Promise((r) => setImmediate(r));

async function connect(io, socket) {
  io.on('connection', () => {});
  makeHandler(io);
  io.state.connCb(socket);
  await tick();
  await tick();
  return socket;
}

describe('socket chat relay', () => {
  beforeEach(() => {
    __friends = [];
    __userRow = { token_version: 0, is_verified: 1 };
  });

  it('rejects unauthenticated connections without joining', async () => {
    const io = mockIo();
    const socket = mockSocket({ authed: false });
    let joined = false;
    socket.join = () => { joined = true; };
    await connect(io, socket);
    assert.equal(joined, false);
    assert.ok(socket.emitted.some((e) => e.ev === 'unauthorized'));
  });

  it('relays friend messages to the receiver room with a whitelisted shape', async () => {
    __friends = [{}];
    const io = mockIo();
    const socket = await connect(io, mockSocket({ userId: 7 }));
    await socket.handlers['send-chat']({
      id: 99, sender_id: 7, receiver_id: 13, content: '  go!  ', time: '12:00', isMe: 1, evil: 'x',
    });
    await tick();
    const relay = io.state.emitted.find((e) => e.ev === 'receive-chat');
    assert.ok(relay);
    assert.equal(relay.room, '13');
    assert.deepEqual(relay.msg, {
      id: 99, sender_id: 7, receiver_id: 13, content: 'go!', time: '12:00',
    });
  });

  it('rejects sender spoofing (sender_id must equal the authed user)', async () => {
    __friends = [{}];
    const io = mockIo();
    const socket = await connect(io, mockSocket({ userId: 7 }));
    await socket.handlers['send-chat']({ sender_id: 13, receiver_id: 7, content: 'hi' });
    await tick();
    assert.equal(io.state.emitted.length, 0);
    assert.ok(socket.emitted.some((e) => e.ev === 'forbidden'));
  });

  it('rejects non-friends even with a valid shape', async () => {
    __friends = [];
    const io = mockIo();
    const socket = await connect(io, mockSocket({ userId: 7 }));
    await socket.handlers['send-chat']({ sender_id: 7, receiver_id: 13, content: 'hi' });
    await tick();
    assert.equal(io.state.emitted.length, 0);
    assert.ok(socket.emitted.some((e) => e.ev === 'forbidden'));
  });

  it('rejects empty and over-long content', async () => {
    __friends = [{}];
    const io = mockIo();
    const socket = await connect(io, mockSocket({ userId: 7 }));
    await socket.handlers['send-chat']({ sender_id: 7, receiver_id: 13, content: '   ' });
    await socket.handlers['send-chat']({ sender_id: 7, receiver_id: 13, content: 'x'.repeat(2001) });
    await tick();
    assert.equal(io.state.emitted.length, 0);
  });

  it('rate-limits past 30 messages per minute per socket', async () => {
    __friends = [{}];
    const io = mockIo();
    const socket = await connect(io, mockSocket({ userId: 7 }));
    for (let i = 0; i < 30; i++) {
      await socket.handlers['send-chat']({ sender_id: 7, receiver_id: 13, content: `m${i}` });
    }
    await tick();
    assert.equal(io.state.emitted.length, 30);
    await socket.handlers['send-chat']({ sender_id: 7, receiver_id: 13, content: 'one too many' });
    await tick();
    assert.equal(io.state.emitted.length, 30);
    assert.ok(socket.emitted.some((e) => e.ev === 'rate-limited'));
  });
});
