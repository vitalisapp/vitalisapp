import { io } from 'socket.io-client';
import { SOCKET_URL } from '../app/config/env.js';

/** @typedef {import('socket.io-client').Socket} Socket */
let socket = null;
let refCount = 0;
let onlineHandler = null;
let lastJoinKey = null;

/** @returns {Socket} */
export function getSocket() {
  if (!socket) {
    // '' would break path resolution: undefined keeps same-origin via Vite proxy.
    socket = io(SOCKET_URL || undefined, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 10000,
    });
    // Stale-sid 400 after backend restart re-handshakes alone: stay quiet.
    socket.on('connect_error', () => {});
    socket.on('error', () => {});
    socket.on('disconnect', () => { lastJoinKey = null; });
    if (typeof window !== 'undefined' && !onlineHandler) {
      onlineHandler = () => {
        try { if (refCount > 0 && socket && !socket.connected) socket.connect(); } catch { /* noop */ }
      };
      window.addEventListener('online', onlineHandler);
    }
  }
  return socket;
}

// Connects only while an authenticated screen needs it.
/** @returns {Socket} */
export function acquireSocket() {
  const s = getSocket();
  refCount += 1;
  if (!s.connected) {
    try { s.connect(); } catch { /* offline — retries handle it */ }
  }
  return s;
}

export function releaseSocket() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket?.connected) {
    try { socket.disconnect(); } catch { /* noop */ }
  }
}

// Dedupes repeat joins (StrictMode + shared singleton emit per screen).
/** @param {string | number | null | undefined} userId @returns {boolean} */
export function joinUserRoom(userId) {
  if (userId == null) return false;
  const s = getSocket();
  const key = `${s.id || 'connecting'}:${userId}`;
  if (lastJoinKey === key) return false;
  lastJoinKey = key;
  try {
    s.emit('join-room', userId);
  } catch {
    lastJoinKey = null;
    return false;
  }
  return true;
}

export function disconnectSocket() {
  refCount = 0;
  lastJoinKey = null;
  if (typeof window !== 'undefined' && onlineHandler) {
    try { window.removeEventListener('online', onlineHandler); } catch { /* noop */ }
    onlineHandler = null;
  }
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch { /* noop */ }
    socket = null;
  }
}

export default getSocket;
