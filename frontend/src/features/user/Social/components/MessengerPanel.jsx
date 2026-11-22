import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import Icon from '../../../../components/Icon.jsx';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import { useContacts } from '../hooks/useContact.js';
import { useMessages } from '../hooks/useMessages.js';
import { useNotificationStream } from '../../../../context/NotificationStream.jsx';
import { acquireSocket, releaseSocket, joinUserRoom } from '../../../../lib/socket.js';
import { resolveAvatar } from '../../../../lib/avatar.js';
import ErrorState from '../../../../components/feedback/ErrorState.jsx';
import BrandLoader from '../../../../components/ui/BrandLoader.jsx';
import '../messenger.css';

// Distance (px) from the bottom that still counts as "reading the latest".
const STICK_THRESHOLD = 120;

const humanizeGoal = (goal) => {
  const s = String(goal || '').replace(/[_-]+/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
};

const dayKeyOf = (msg) => {
  const raw = msg.sent_at_raw || msg.sent_at;
  const d = raw ? new Date(raw) : new Date(); // optimistic / socket rows are "now"
  return Number.isNaN(d.getTime()) ? new Date().toDateString() : d.toDateString();
};

const dayLabel = (key) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key === today.toDateString()) return 'Today';
  if (key === yesterday.toDateString()) return 'Yesterday';
  const d = new Date(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
};

// Consecutive messages from the same side on the same day form one group.
// Pure view-model: the message objects themselves are untouched.
const buildThread = (messages) => {
  const items = [];
  let lastDay = null;
  let group = null;
  messages.forEach((msg, idx) => {
    const day = dayKeyOf(msg);
    const key = msg.id ?? `tmp-${idx}`;
    if (day !== lastDay) {
      items.push({ type: 'day', key: `day-${day}`, label: dayLabel(day) });
      lastDay = day;
      group = null;
    }
    const isMe = Boolean(msg.isMe);
    if (!group || group.isMe !== isMe) {
      group = { type: 'group', key: `g-${key}`, isMe, messages: [] };
      items.push(group);
    }
    group.messages.push({ ...msg, _key: key });
  });
  return items;
};

const ContactAvatar = ({ name = undefined, avatarUrl = undefined, size = 46, online = false }) => {
  const [broken, setBroken] = useState(false);
  const a = resolveAvatar(avatarUrl, name);
  return (
    <span className="vmsg-avatar" style={{ width: size, height: size }}>
      {a.kind === 'image' && !broken ? (
        <img src={a.src} alt="" onError={() => setBroken(true)} />
      ) : (
        <span className="vmsg-initials" style={{ background: a.surface.background, color: a.surface.color }} aria-hidden="true">
          {a.initials}
        </span>
      )}
      {online && <span className="vmsg-dot" aria-hidden="true" />}
    </span>
  );
};

// A user row's action depends on the relationship state returned by search.
const RelationshipAction = ({ user = undefined, onAdd = undefined, onAccept = undefined, onMessage = undefined }) => {
  const isFriend = ['accepted', 'close_friend'].includes(user.outgoing_status)
    || ['accepted', 'close_friend'].includes(user.incoming_status);
  if (isFriend) {
    return <button type="button" onClick={() => onMessage(user)} className="vmsg-chip">Message</button>;
  }
  if (user.outgoing_status === 'pending') {
    return (
      <span className="vmsg-chip vmsg-chip--muted">
        <span className="material-symbols-outlined" aria-hidden="true">schedule</span> Requested
      </span>
    );
  }
  if (user.incoming_status === 'pending') {
    return <button type="button" onClick={() => onAccept(user.id)} className="vmsg-chip vmsg-chip--primary">Accept</button>;
  }
  return (
    <button type="button" onClick={() => onAdd(user)} className="vmsg-chip vmsg-chip--soft" aria-label={`Add ${user.name} as a friend`}>
      <span className="material-symbols-outlined" aria-hidden="true">person_add</span> Add
    </button>
  );
};

const ContactSkeleton = () => (
  <div aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="vmsg-skel">
        <span className="vmsg-skel-circle" />
        <span style={{ flex: 1, display: 'grid', gap: 8 }}>
          <span className="vmsg-skel-line" style={{ width: `${55 - i * 5}%` }} />
          <span className="vmsg-skel-line" style={{ width: '35%' }} />
        </span>
      </div>
    ))}
  </div>
);

/**
 * Private 1:1 messenger (friends, requests, live chat). Rendered inside the
 * Community hub's "Messages" tab. All data/real-time logic lives in the
 * useContacts / useMessages hooks — this component is presentation + view state.
 *
 * `headerSlot` renders above the panel (the hub's Feed | Messages switch); it
 * is hidden on mobile while a chat is open so the thread gets the full height.
 */
const MessengerPanel = ({ headerSlot = null }) => {
  const { user } = useAuth();
  const userId = user?.id || null;
  const { subscribe } = useNotificationStream();

  const [activeContact, setActiveContact] = useState(null);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [presenceFilter, setPresenceFilter] = useState('all'); // 'all' | 'online'
  const [atBottom, setAtBottom] = useState(true);
  const [seenCount, setSeenCount] = useState(0);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const stickRef = useRef(true);
  const wasSendingRef = useRef(false);

  useEffect(() => {
    socketRef.current = acquireSocket();
    return () => { releaseSocket(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    joinUserRoom(userId);
  }, [userId]);

  const {
    contacts,
    searchTerm,
    setSearchTerm,
    searchResults,
    requests,
    loadingContacts,
    handleSendRequest,
    handleAccept,
    handleDecline,
    contactsError,
    reloadContacts,
    reloadRequests,
  } = useContacts(userId);

  const {
    messages,
    inputValue,
    setInputValue,
    isSending,
    loadingMsgs,
    handleSendMessage,
  } = useMessages(userId, activeContact, socketRef);

  // Live: when a SOCIAL notification arrives (friend request / accept), refresh.
  useEffect(() => subscribe((n) => {
    if (String(n?.category || '').toUpperCase() === 'SOCIAL') {
      reloadRequests();
      reloadContacts();
    }
  }), [subscribe, reloadRequests, reloadContacts]);

  // Scroll: follow new messages only while the reader is at the bottom (or
  // just sent one). Reading older history is never interrupted.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || loadingMsgs) return;
    const last = messages[messages.length - 1];
    if (stickRef.current || last?.isMe) {
      el.scrollTop = el.scrollHeight;
      stickRef.current = true;
    }
  }, [messages, loadingMsgs]);

  const handleThreadScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
    stickRef.current = near;
    setAtBottom(near);
    if (near) setSeenCount(messages.length);
  };

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  // Composer: grow with content (CSS caps the height).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputValue, activeContact]);

  // The textarea is disabled while sending (existing behavior) — hand focus
  // back once the send settles so the user can keep typing.
  useEffect(() => {
    if (wasSendingRef.current && !isSending) textareaRef.current?.focus();
    wasSendingRef.current = isSending;
  }, [isSending]);

  const openChat = (contact) => {
    stickRef.current = true;
    setAtBottom(true);
    setSeenCount(0);
    setActiveContact(contact);
    setShowContactPanel(false);
  };

  const acceptThenMaybeOpen = async (requesterId) => {
    await handleAccept(requesterId);
    const who = requests.find((r) => r.id === requesterId);
    if (who) openChat(who);
  };

  const query = searchTerm.trim().toLowerCase();
  const onlineCount = useMemo(() => contacts.filter((c) => c.is_online).length, [contacts]);
  const visibleContacts = useMemo(() => contacts.filter((c) => (
    (presenceFilter === 'all' || c.is_online)
    && (!query || String(c.name || '').toLowerCase().includes(query))
  )), [contacts, presenceFilter, query]);
  // Friends already show under Conversations; People lists everyone else.
  const people = useMemo(() => {
    const ids = new Set(contacts.map((c) => c.id));
    return searchResults.filter((u) => !ids.has(u.id));
  }, [searchResults, contacts]);
  const thread = useMemo(() => buildThread(messages), [messages]);

  const showJump = !atBottom && messages.length > seenCount && !loadingMsgs;
  const activeGoal = humanizeGoal(activeContact?.fitness_goal);
  const canSend = Boolean(inputValue.trim()) && !isSending;

  return (
    <div className="vmsg">
      {headerSlot && (
        <div className={showContactPanel ? 'block' : 'hidden md:block'}>{headerSlot}</div>
      )}

      <div className="vmsg-frame">
        {/* ── Conversation sidebar ── */}
        <aside className={`vmsg-side ${showContactPanel ? 'flex vmsg-fade' : 'hidden'} md:flex`} aria-label="Conversations">
          <div className="vmsg-side-head">
            <h2 className="vmsg-title">
              Messages
              {requests.length > 0 && <span className="vmsg-badge" aria-label={`${requests.length} friend requests`}>{requests.length}</span>}
            </h2>
            <div className="vmsg-search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input
                type="search"
                placeholder="Search conversations or people…"
                aria-label="Search conversations or people"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="vmsg-search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              )}
            </div>
            {contacts.length > 0 && (
              <div className="vmsg-pills" role="group" aria-label="Filter conversations">
                <button type="button" className="vmsg-pill" aria-pressed={presenceFilter === 'all'} onClick={() => setPresenceFilter('all')}>
                  All <span className="vmsg-pill-count">{contacts.length}</span>
                </button>
                <button type="button" className="vmsg-pill" aria-pressed={presenceFilter === 'online'} onClick={() => setPresenceFilter('online')}>
                  Online <span className="vmsg-pill-count">{onlineCount}</span>
                </button>
              </div>
            )}
          </div>

          <div className="vmsg-list">
            {/* Friend requests */}
            {requests.length > 0 && (
              <section aria-label="Friend requests">
                <p className="vmsg-section">Friend requests</p>
                {requests.map((r) => (
                  <div key={r.id} className="vmsg-row">
                    <ContactAvatar name={r.name} avatarUrl={r.avatar_url} size={44} />
                    <div className="vmsg-row-body">
                      <p className="vmsg-row-name">{r.name}</p>
                      <p className="vmsg-row-sub">Wants to connect</p>
                    </div>
                    <button type="button" onClick={() => acceptThenMaybeOpen(r.id)} aria-label={`Accept ${r.name}`}
                      className="vmsg-icon-btn vmsg-chip--primary">
                      <span className="material-symbols-outlined" aria-hidden="true">check</span>
                    </button>
                    <button type="button" onClick={() => handleDecline(r.id)} aria-label={`Decline ${r.name}`}
                      className="vmsg-icon-btn vmsg-chip">
                      <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* Conversations */}
            <section aria-label="Conversations list">
              <p className="vmsg-section">{query ? 'Conversations' : presenceFilter === 'online' ? 'Online now' : 'All conversations'}</p>

              {contactsError && contacts.length === 0 && (
                <div className="px-2 py-2"><ErrorState message={contactsError.message || 'Could not load contacts.'} onRetry={reloadContacts} /></div>
              )}

              {loadingContacts && contacts.length === 0 ? (
                <ContactSkeleton />
              ) : contacts.length === 0 && !contactsError ? (
                <div className="vmsg-empty">
                  <span className="material-symbols-outlined" aria-hidden="true">group</span>
                  <p className="vmsg-empty-title">No conversations yet</p>
                  <p className="vmsg-empty-sub">Search above to add friends — your chats will appear here.</p>
                </div>
              ) : visibleContacts.length === 0 && contacts.length > 0 ? (
                <div className="vmsg-empty">
                  <span className="material-symbols-outlined" aria-hidden="true">{query ? 'search_off' : 'bedtime'}</span>
                  <p className="vmsg-empty-title">{query ? 'No conversations found' : 'No one is online right now'}</p>
                  <p className="vmsg-empty-sub">{query ? 'Try searching for another name.' : 'Switch to All to see every conversation.'}</p>
                </div>
              ) : (
                visibleContacts.map((contact) => {
                  const isActive = activeContact?.id === contact.id;
                  const goal = humanizeGoal(contact.fitness_goal);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => openChat(contact)}
                      aria-current={isActive ? 'true' : undefined}
                      className="vmsg-row"
                    >
                      <ContactAvatar name={contact.name} avatarUrl={contact.avatar_url} online={Boolean(contact.is_online)} />
                      <span className="vmsg-row-body">
                        <span className="vmsg-row-top">
                          <span className="vmsg-row-name">{contact.name}</span>
                        </span>
                        <span className="vmsg-row-sub block">
                          {contact.is_online ? <span className="is-online">Active now</span> : 'Offline'}
                          {goal && <> · {goal}</>}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </section>

            {/* People search (server-side, existing behavior) */}
            {people.length > 0 && (
              <section aria-label="People">
                <p className="vmsg-section">People</p>
                {people.map((u) => (
                  <div key={u.id} className="vmsg-row">
                    <ContactAvatar name={u.name} avatarUrl={u.avatar_url} size={44} />
                    <div className="vmsg-row-body">
                      <p className="vmsg-row-name">{u.name}</p>
                    </div>
                    <RelationshipAction user={u} onAdd={handleSendRequest} onAccept={acceptThenMaybeOpen} onMessage={openChat} />
                  </div>
                ))}
              </section>
            )}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <section className={`vmsg-chat ${showContactPanel ? 'hidden' : 'flex vmsg-fade'} md:flex`} aria-label="Chat">
          {activeContact ? (
            <>
              <header className="vmsg-chat-head">
                <button
                  type="button"
                  className="vmsg-back inline-flex md:hidden"
                  onClick={() => setShowContactPanel(true)}
                  aria-label="Back to conversations"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                </button>
                <ContactAvatar name={activeContact.name} avatarUrl={activeContact.avatar_url} size={44} online={Boolean(activeContact.is_online)} />
                <div className="min-w-0">
                  <h1 className="vmsg-chat-name">{activeContact.name}</h1>
                  <p className="vmsg-chat-status">
                    {activeContact.is_online ? <><span className="vmsg-live" aria-hidden="true" />Active now</> : 'Offline'}
                  </p>
                </div>
                {activeGoal && (
                  <span className="vmsg-goal hidden sm:inline-flex" title="Fitness goal">
                    <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                    {activeGoal}
                  </span>
                )}
              </header>

              <div ref={scrollRef} onScroll={handleThreadScroll} className="vmsg-scroll" role="log" aria-live="polite" aria-label={`Conversation with ${activeContact.name}`}>
                <div className="vmsg-thread">
                  {loadingMsgs ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-12" role="status" aria-busy="true">
                      <BrandLoader size="sm" message="Loading messages…" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="vmsg-welcome">
                      <div className="vmsg-welcome-icon"><span className="material-symbols-outlined" aria-hidden="true">waving_hand</span></div>
                      <h2>Say hello to {activeContact.name}</h2>
                      <p>No messages yet — start the conversation.</p>
                    </div>
                  ) : (
                    thread.map((item) => {
                      if (item.type === 'day') {
                        return <div key={item.key} className="vmsg-date" role="separator">{item.label}</div>;
                      }
                      const last = item.messages[item.messages.length - 1];
                      return (
                        <div key={item.key} className={`vmsg-group ${item.isMe ? 'is-me' : 'is-them'}`}>
                          {item.messages.map((msg) => (
                            <div
                              key={msg._key}
                              title={msg.time || undefined}
                              className={`vmsg-bubble${msg.failed ? ' is-failed' : msg._temp ? ' is-pending' : ''}`}
                            >
                              {msg.content}
                            </div>
                          ))}
                          {last.failed ? (
                            <span className="vmsg-time is-failed">
                              <span className="material-symbols-outlined" aria-hidden="true">error</span>Failed to send
                            </span>
                          ) : last._temp ? (
                            <span className="vmsg-time">Sending…</span>
                          ) : (
                            last.time && <span className="vmsg-time">{last.time}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                  {showJump && (
                    <button type="button" className="vmsg-jump" onClick={jumpToLatest}>
                      <span className="material-symbols-outlined" aria-hidden="true">arrow_downward</span>
                      New messages
                    </button>
                  )}
                </div>
              </div>

              <footer className="vmsg-composer">
                <div className="vmsg-input">
                  <textarea
                    ref={textareaRef}
                    aria-label={`Message ${activeContact.name}`}
                    placeholder={isSending ? 'Sending…' : 'Type a message…'}
                    rows={1}
                    value={inputValue}
                    disabled={isSending}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    aria-label="Send message"
                    className="vmsg-send"
                    disabled={!canSend}
                  >
                    {isSending ? <span className="vmsg-spin" aria-hidden="true" /> : <Icon name="send" weight={600} />}
                  </button>
                </div>
                <p className="vmsg-hint">Enter to send · Shift + Enter for a new line</p>
              </footer>
            </>
          ) : (
            <div className="vmsg-welcome">
              <div className="vmsg-welcome-icon"><span className="material-symbols-outlined" aria-hidden="true">forum</span></div>
              <h2>Your conversations, all in one place</h2>
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessengerPanel;
