import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../../../../lib/apiClient.js';

export const useMessages = (userId, activeContact, socketRef) => {
  const [messages,    setMessages]    = useState([]);
  const [inputValue,  setInputValue]  = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // ── Load message history when active contact changes ─────────────────────
  useEffect(() => {
    if (!activeContact) return;

    // `silent` = background resync: no loader, and keep what we have on error.
    const fetchMessages = async ({ silent = false } = {}) => {
      if (!silent) setLoadingMsgs(true);
      try {
        const data = await apiGet(`/api/messages/${userId}/${activeContact.id}`);
        const rows = Array.isArray(data) ? data.map(m => ({ ...m, isMe: Number(m.isMe) })) : [];
        // Keep unsent/failed optimistic bubbles across a resync.
        setMessages(prev => (silent ? [...rows, ...prev.filter(m => m._temp || m.failed)] : rows));
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error loading messages:', err);
        if (!silent) setMessages([]);
      } finally {
        if (!silent) setLoadingMsgs(false);
      }
    };
    fetchMessages();

    // ── Real-time socket listener ─────────────────────────────────────────
    // Remove any stale listeners before adding a fresh one to prevent stacking
    const socket = socketRef.current;
    if (!socket) return;

    socket.off('receive-chat');

    const handleNewMessage = (newMsg) => {
      const contactId = String(activeContact.id);
      if (String(newMsg.sender_id) !== contactId && String(newMsg.receiver_id) !== contactId) return;
      setMessages(prev => {
        // The same row can arrive twice (REST reply + other-tab sync): keep one.
        if (newMsg.id != null && prev.some(m => String(m.id) === String(newMsg.id))) return prev;
        return [...prev, { ...newMsg, isMe: String(newMsg.sender_id) === String(userId) ? 1 : 0 }];
      });
    };

    // Messages sent while the socket was down never reach us — resync on reconnect.
    const handleReconnect = () => { fetchMessages({ silent: true }); };

    socket.on('receive-chat', handleNewMessage);
    socket.io.on('reconnect', handleReconnect);
    return () => {
      socket.off('receive-chat', handleNewMessage);
      socket.io.off('reconnect', handleReconnect);
    };

  }, [activeContact, userId, socketRef]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !activeContact || isSending) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Optimistic UI: show message immediately before server confirms
    const optimistic = {
      content,
      sent_at: new Date().toISOString(),
      isMe:  1,
      _temp: true,
    };
    setMessages(prev => [...prev, optimistic]);

    // ── Human path: save to DB first, then socket emit ────────────────────
    try {
      const saved = await apiPost('/api/messages', { sender_id: userId, receiver_id: activeContact.id, content });

      // Replace optimistic with DB-confirmed message (has real id + timestamp)
      setMessages(prev =>
        prev.map(m => (m._temp && m.content === content) ? { ...saved, isMe: 1 } : m)
      );

      // Broadcast to receiver's socket room
      socketRef.current?.emit('send-chat', {
        ...saved,
        sender_id:   userId,
        receiver_id: activeContact.id,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Send message error:', err);
      // Mark the optimistic message as failed
      setMessages(prev =>
        prev.map(m => (m._temp && m.content === content) ? { ...m, failed: true } : m)
      );
    } finally {
      setIsSending(false);
    }
  }, [inputValue, activeContact, userId, socketRef, isSending]);

  return {
    messages,
    inputValue,
    setInputValue,
    isSending,
    loadingMsgs,
    handleSendMessage,
  };
};