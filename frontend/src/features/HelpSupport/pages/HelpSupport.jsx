import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar.jsx';
import Topbar from '../../../components/Topbar.jsx';
import BottomNav from '../../../components/BottomNav.jsx';
import FeedbackModal from '../../../components/FeedbackModal.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';

// Real answers only — each one maps to an actual screen/flow in the app.
const FAQS = [
  {
    q: 'How do I log a workout, meal, or sleep?',
    a: 'Tap the + button in the bottom bar for a manual entry. Camera workouts run from Training, meals (scan or manual) from Meal Tracker, and sleep from Analytics.',
  },
  {
    q: 'Where do I see recovery and readiness?',
    a: 'Open Recovery (Analytics). All entries are manual for now — automatic wearable sync is not available yet.',
  },
  {
    q: 'What can the AI Coach do?',
    a: 'The AI Coach gives general fitness information and plan suggestions. It is not medical advice — check with a professional for health concerns.',
  },
  {
    q: 'Community vs Messages — what is the difference?',
    a: 'Community is a public feed of posts, likes, and comments. Messages are private 1:1 chats with your contacts.',
  },
  {
    q: 'How do I change my fitness goal?',
    a: 'Go to Profile → My Goals, expand it, and tap Change Goal. Your calorie and macro targets recompute from the new goal.',
  },
  {
    q: 'How do I change units, step goal, or theme?',
    a: 'Everything lives on the Preferences page (account menu → Preferences). Changes save to your account automatically.',
  },
  {
    q: 'I forgot my password. What now?',
    a: 'On the login screen, use the reset-password link and follow the emailed instructions to set a new password.',
  },
  {
    q: 'How do I manage signed-in devices?',
    a: 'Open Profile → Devices & Sessions to see every session and revoke any you do not recognize.',
  },
];

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      <div className="glass-content">
      <div className="hidden md:block"><Sidebar onClick={handleLogout} expanded={false} setExpanded={() => {}} /></div>
      <Topbar sidebarExpanded={false} userId={user?.id} />
      <main className="pt-[56px] pb-24 px-4 md:px-6 md:ml-[72px]">
        <div className="max-w-[720px] lg:max-w-3xl mx-auto pt-4 pb-6 space-y-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)]">Support</p>
            <h1 className="text-[22px] font-bold">Help & Support</h1>
          </div>

          <div className="glass-card border border-[var(--border-light)] rounded-[14px] px-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[var(--text-muted)]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help topics…"
              aria-label="Search help topics"
              className="w-full h-11 bg-transparent outline-none text-[14px] placeholder:text-[var(--input-placeholder)]"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="w-8 h-8 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <section className="glass-card border border-[var(--border-light)] rounded-[14px] overflow-hidden divide-y divide-[var(--border-light)]">
            {results.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)] p-4 text-center">No topics match “{query}”. Try fewer words, or send feedback below.</p>
            )}
            {results.map((f) => {
              const idx = FAQS.indexOf(f);
              const open = openIdx === idx;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenIdx(open ? -1 : idx)}
                    aria-expanded={open}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <span className="flex-1 min-w-0 text-[14px] font-bold">{f.q}</span>
                    <span className={`material-symbols-outlined text-[18px] text-[var(--text-muted)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {open && <p className="px-4 pb-4 text-[13px] text-[var(--text-muted)] leading-relaxed">{f.a}</p>}
                </div>
              );
            })}
          </section>

          <section className="p-4 rounded-[14px] glass-card border border-[var(--border-light)]">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Still stuck?</p>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Send feedback straight to the team — it goes through the in-app feedback channel.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setFeedbackOpen(true)}
                className="h-10 px-3 rounded-[12px] bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] text-[12px] font-bold hover:brightness-110 active:scale-[0.99] transition-all truncate"
              >
                Send Feedback
              </button>
              <button
                onClick={() => navigate('/dashboard/preferences')}
                className="h-10 px-3 rounded-[12px] border border-[var(--border-light)] text-[12px] font-bold hover:bg-[var(--bg-hover)] transition-colors truncate"
              >
                Open Preferences
              </button>
            </div>
            {user?.email && <p className="text-[11px] text-[var(--text-muted)] mt-3">Signed in as {user.email}</p>}
          </section>
        </div>
      </main>
      <div className="md:hidden"><BottomNav /></div>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      </div>
    </div>
  );
};

export default HelpSupport;
