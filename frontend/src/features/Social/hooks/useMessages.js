import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../../../lib/apiClient.js';

export const useMessages = (userId, activeContact, user, socketRef) => {
  const [messages,    setMessages]    = useState([]);
  const [inputValue,  setInputValue]  = useState('');
  const [isAiTyping,  setIsAiTyping]  = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // ── Load message history when active contact changes ─────────────────────
  useEffect(() => {
    if (!activeContact) return;

    if (activeContact.id === 'ai-bot') {
      setMessages([{
        content: `Hello ${user?.name ?? ''}! I'm Vitalis AI Coach. How can I help with your fitness goals today?`,
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe:    0,
      }]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMsgs(true);
      try {
        const data = await apiGet(`/api/messages/${userId}/${activeContact.id}`);
        setMessages(Array.isArray(data) ? data.map(m => ({ ...m, isMe: Number(m.isMe) })) : []);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error loading messages:', err);
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    };
    fetchMessages();

    // ── Real-time socket listener ─────────────────────────────────────────
    // Remove any stale listeners before adding a fresh one to prevent stacking
    const socket = socketRef.current;
    if (!socket) return;

    socket.off('receive-chat');

    const handleNewMessage = (newMsg) => {
      if (
        newMsg.sender_id === activeContact.id ||
        newMsg.receiver_id === activeContact.id
      ) {
        setMessages(prev => [
          ...prev,
          { ...newMsg, isMe: newMsg.sender_id === userId ? 1 : 0 },
        ]);
      }
    };

    socket.on('receive-chat', handleNewMessage);
    return () => socket.off('receive-chat', handleNewMessage);

  }, [activeContact, userId, socketRef, user?.name]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !activeContact || isSending) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Optimistic UI: show message immediately before server confirms
    const optimistic = {
      content,
      time:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe:  1,
      _temp: true,
    };
    setMessages(prev => [...prev, optimistic]);

    // ── AI path ───────────────────────────────────────────────────────────
    if (activeContact.id === 'ai-bot') {
      setIsAiTyping(true);
      try {
        const data = await apiPost('/api/ai-chat', { message: content }, { timeoutMs: 60000 });
        setMessages(prev => [...prev, {
          content: data.reply || 'System Error: Unable to reach AI pipeline.',
          time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe:    0,
        }]);
      } catch (err) {
        if (import.meta.env.DEV) console.error('AI chat error:', err);
        setMessages(prev => [...prev, {
          content: 'System Error: Unable to reach AI pipeline.',
          time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe:    0,
        }]);
      } finally {
        setIsAiTyping(false);
        setIsSending(false);
      }
      return;
    }

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
    isAiTyping,
    isSending,
    loadingMsgs,
    handleSendMessage,
  };
};