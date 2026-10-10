import React, { useState, useRef, useEffect } from 'react';
import { BottomNav, Sidebar, Topbar } from '../../../components/index.js';
import GlassAmbient from '../../../components/GlassAmbient.jsx';
import Icon from '../../../components/Icon.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useContacts } from '../hooks/useContact.js';
import { useMessages } from '../hooks/useMessages.js';
import { acquireSocket, releaseSocket, joinUserRoom } from '../../../lib/socket.js';
import { resolveAvatar } from '../../../lib/avatar.js';
import ErrorState from '../../../components/feedback/ErrorState.jsx';
import BrandLoader from '../../../components/ui/BrandLoader.jsx';

const AI_CONTACT = {
  id: 'ai-bot',
  name: 'Vitalis AI',
  avatar_url: null,
  is_online: 1,
  isAi: true,
};

const ContactAvatar = ({ name, avatarUrl, size = 'w-10 h-10 md:w-12 md:h-12' }) => {
  const a = resolveAvatar(avatarUrl, name);
  if (a.kind === 'image') {
    return <AvatarImg name={name} src={a.src} size={size} />;
  }
  return (
    <div className={`${size} rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0`} style={{ background: a.gradient }}>
      {a.initials}
    </div>
  );
};

const AvatarImg = ({ name, src, size }) => {
  const [broken, setBroken] = React.useState(false);
  const a = resolveAvatar(null, name);
  if (broken) {
    return (
      <div className={`${size} rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0`} style={{ background: a.gradient }}>
        {a.initials}
      </div>
    );
  }
  return (
    <img
      className={`${size} rounded-full border border-[var(--border-medium)] shrink-0 object-cover`}
      src={src}
      alt={name}
      onError={() => setBroken(true)}
    />
  );
};

const ClinicalMessenger = () => {
  const { user, loading } = useAuth();
  const userId = user?.id || null;

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeContact,   setActiveContact]   = useState(null);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = acquireSocket();
    return () => { releaseSocket(); socketRef.current = null; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    // Deduped centrally — same shared socket as Dashboard, one join per connection.
    joinUserRoom(userId);
  }, [userId]);

  const {
    contacts,
    searchTerm,
    setSearchTerm,
    searchResults,
    handleAddFriend,
    contactsError,
    reloadContacts,
  } = useContacts(userId);

  const {
    messages,
    inputValue,
    setInputValue,
    isAiTyping,
    isSending,
    loadingMsgs,
    handleSendMessage,
  } = useMessages(userId, activeContact, user, socketRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setShowContactPanel(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden relative">
      <GlassAmbient />
      <div className="glass-content">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <Topbar sidebarExpanded={sidebarExpanded} userId={userId} />

      <main
        className="pt-[64px] h-screen flex transition-all duration-[400ms]"
        style={{ marginLeft: isMobile ? 0 : sidebarExpanded ? 240 : 72 }}
      >
        {/* ── Contact sidebar ── */}
        <aside
          className={`
            border-r border-[var(--border-light)] bg-[var(--bg-secondary)] flex flex-col shrink-0
            w-full md:w-64 lg:w-80
            ${showContactPanel ? 'flex' : 'hidden'}
            md:flex
          `}
        >
          <div className="p-4 md:p-6 border-b border-[var(--border-light)] space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-[var(--accent)]">
                Vitalis Messenger
              </h2>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
                <Icon name="search" className="text-lg" weight={500} />
              </div>
              <input
                type="text"
                placeholder="Search global users..."
                aria-label="Search users to add"
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[var(--accent-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar">
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="bg-[var(--accent-bg)] border-b border-[var(--accent-border)] pb-2">
                <p className="px-4 md:px-6 py-2 text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">
                  Global Results
                </p>
                {searchResults.map(u => (
                  <div
                    key={u.id}
                    className="px-4 md:px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ContactAvatar name={u.name} avatarUrl={u.avatar_url} size="w-8 h-8" />
                      <span className="text-sm font-medium truncate max-w-[120px] text-[var(--text-primary)]">
                        {u.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddFriend(u, setActiveContact)}
                      className="flex items-center gap-1 px-3 py-2 bg-[var(--accent)] text-[var(--text-inverse)] rounded-md text-[10px] font-bold hover:scale-105 transition-transform shrink-0 min-h-[36px]"
                    >
                      <Icon name="person_add" weight={600} className="text-xs" /> ADD
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="px-4 md:px-6 py-4 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
              Your Friends
            </p>

            {/* AI contact — always pinned at top */}
            <div
              role="button"
              tabIndex={0}
              aria-label={`Chat with ${AI_CONTACT.name}`}
              aria-current={activeContact?.id === 'ai-bot' ? 'true' : undefined}
              onClick={() => handleSelectContact(AI_CONTACT)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectContact(AI_CONTACT); } }}
              className={`p-3 md:p-4 flex gap-3 md:gap-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors ${
                activeContact?.id === 'ai-bot'
                  ? 'bg-[var(--bg-hover)] border-l-2 border-[var(--accent)]'
                  : ''
              }`}
            >
              <div className="relative shrink-0">
                <ContactAvatar name={AI_CONTACT.name} avatarUrl={AI_CONTACT.avatar_url} />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-[var(--bg-secondary)] bg-[var(--accent)]" />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-bold truncate text-[var(--text-primary)]">
                  {AI_CONTACT.name}
                </h3>
                <p className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold">
                  System Intelligence
                </p>
              </div>
            </div>

            {/* Human contacts */}
            {contactsError && contacts.length === 0 && (
              <div className="px-4 md:px-6 py-2">
                <ErrorState message={contactsError.message || 'Could not load contacts.'} onRetry={reloadContacts} />
              </div>
            )}
            {contacts.length === 0 ? (
              <p className="px-4 md:px-6 text-xs text-[var(--text-muted)] italic">
                No friends added yet. Use search above!
              </p>
            ) : (
              contacts.map(contact => (
                <div
                  key={contact.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Chat with ${contact.name}`}
                  aria-current={activeContact?.id === contact.id ? 'true' : undefined}
                  onClick={() => handleSelectContact(contact)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectContact(contact); } }}
                  className={`p-3 md:p-4 flex gap-3 md:gap-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors ${
                    activeContact?.id === contact.id
                      ? 'bg-[var(--bg-hover)] border-l-2 border-[var(--accent)]'
                      : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <ContactAvatar name={contact.name} avatarUrl={contact.avatar_url} />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-[var(--bg-secondary)] ${
                        contact.is_online ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'
                      }`}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-bold truncate text-[var(--text-primary)]">
                      {contact.name}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                      Clinical Advisor
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <section
          className={`
            flex-grow flex flex-col bg-[var(--bg-primary)] min-w-0
            ${!showContactPanel ? 'flex' : 'hidden'}
            md:flex
          `}
        >
          {activeContact ? (
            <>
              {/* Chat header */}
              <header className="h-16 md:h-20 px-4 md:px-8 flex items-center border-b border-[var(--border-light)] gap-3 md:gap-4 shrink-0 bg-[var(--bg-secondary)]">
                <button
                  className="md:hidden p-2 -ml-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setShowContactPanel(true)}
                  aria-label="Back to contacts"
                >
                  <Icon name="arrow_back" weight={500} className="text-xl" />
                </button>

                <ContactAvatar name={activeContact.name} avatarUrl={activeContact.avatar_url} size="w-8 h-8 md:w-10 md:h-10" />
                <div className="min-w-0">
                  <h1 className="text-base md:text-lg font-bold truncate text-[var(--text-primary)]">
                    {activeContact.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activeContact.is_online
                          ? 'bg-[var(--accent)]'
                          : 'bg-[var(--text-muted)]'
                      }`}
                    />
                    <span className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-medium truncate">
                      Active Session
                    </span>
                  </div>
                </div>
              </header>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 no-scrollbar"
              >
                <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 md:gap-6">
                {loadingMsgs ? (
                  <div className="flex-grow flex flex-col items-center justify-center py-12" role="status" aria-busy="true">
                    <BrandLoader size="sm" message="Loading messages…" />
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col gap-1.5 md:gap-2 w-full max-w-[85%] sm:max-w-md ${
                        msg.isMe ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`px-3 py-2.5 md:px-4 md:py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words overflow-wrap-anywhere w-full ${
                          msg.isMe
                            ? `bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--text-primary)] rounded-br-none${
                                msg.failed ? ' opacity-50' : ''
                              }`
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                        {msg.failed && (
                          <span className="ml-2 text-[10px] text-[var(--error)]">
                            Failed to send
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {msg.time}
                      </span>
                    </div>
                  ))
                )}

                {/* AI typing indicator */}
                {isAiTyping && (
                  <div className="flex flex-col gap-2 w-full max-w-md self-start items-start">
                    <div className="px-4 py-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-bl-none flex gap-1.5 items-center h-11">
                      <span
                        className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Input footer */}
              <footer className="p-3 pb-24 md:p-6 md:pb-6 shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border-light)]">
                <div className="w-full max-w-3xl mx-auto bg-[var(--bg-tertiary)] border border-[var(--border-medium)] rounded-2xl p-2 flex items-center gap-2 shadow-[var(--shadow-md)]">
                  <textarea
                    aria-label={activeContact ? `Message ${activeContact.name}` : 'Message'}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-[var(--text-primary)] p-2 resize-none no-scrollbar placeholder:text-[var(--text-muted)] disabled:opacity-50"
                    placeholder={isSending ? 'Sending…' : `Reply to ${activeContact.name}...`}
                    rows="1"
                    value={inputValue}
                    disabled={isSending}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    aria-label="Send message"
                    className="bg-[var(--accent)] text-[var(--text-inverse)] p-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-all shrink-0 hover:bg-[var(--accent-dark)] flex items-center justify-center min-w-[44px]"
                    disabled={!inputValue.trim() || isSending}
                  >
                    {isSending ? <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin inline-block" aria-hidden="true" /> : <Icon name="send" weight={600} />}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            /* Empty state */
            <div className="flex-grow flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
              <Icon name="forum" className="text-5xl opacity-20" />
              <p className="text-sm font-medium text-center px-4">
                Select a clinician to begin your session.
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="biometrics" />
      </div>
    </div>
  );
};

export default ClinicalMessenger;