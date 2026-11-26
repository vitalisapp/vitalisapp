import { Link, useLocation } from 'react-router-dom';
import AppShell from '../../../../components/AppShell.jsx';
import PageHeader from '../../../../components/app/PageHeader.jsx';
import BottomNav from '../../../../components/BottomNav.jsx';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import CommunityFeed from '../components/CommunityFeed.jsx';
import MessengerPanel from '../../Social/components/MessengerPanel.jsx';
import '../community-hub.css';

const COMMUNITY_FEED_PATH = '/community';
const COMMUNITY_MESSAGES_PATH = '/community/messages';

const SECTIONS = [
  { key: 'feed', label: 'Feed', icon: 'dynamic_feed', to: COMMUNITY_FEED_PATH },
  { key: 'messages', label: 'Messages', icon: 'forum', to: COMMUNITY_MESSAGES_PATH },
];

// Feed | Messages switch. Real routes (not local state) so links, the back
// button and refresh all land on the right section.
const SectionTabs = ({ active = undefined }) => (
  <nav className="vhub-tabs" aria-label="Community sections">
    {SECTIONS.map((s) => (
      <Link
        key={s.key}
        to={s.to}
        replace
        className="vhub-tab"
        aria-current={active === s.key ? 'page' : undefined}
      >
        <span className="material-symbols-outlined" aria-hidden="true">{s.icon}</span>
        {s.label}
      </Link>
    ))}
  </nav>
);

/**
 * Community hub — one page, two sections:
 *  - Feed      (/community)          public posts, likes, comments
 *  - Messages  (/community/messages) private 1:1 chats + friends
 * /messenger redirects to the Messages section.
 */
const Community = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const section = pathname.startsWith(COMMUNITY_MESSAGES_PATH) ? 'messages' : 'feed';

  if (loading) return null;

  if (section === 'messages') {
    return (
      <AppShell
        userId={user?.id}
        mobileTitle="Messages"
        mainClassName="app-main--workbench"
        contentClassName="vhub-work"
        bottomNav={<BottomNav />}
      >
        <MessengerPanel
          headerSlot={(
            <div className="vhub-bar">
              <div className="min-w-0">
                <span className="app-eyebrow">Community</span>
              </div>
              <SectionTabs active="messages" />
            </div>
          )}
        />
      </AppShell>
    );
  }

  return (
    <AppShell userId={user?.id} contentClassName="app-container" bottomNav={<BottomNav />}>
      <CommunityFeed
        header={(
          <PageHeader
            eyebrow="Community"
            title="Community"
            description="Connect, share progress, and stay motivated."
            actions={<SectionTabs active="feed" />}
          />
        )}
      />
    </AppShell>
  );
};

export default Community;
