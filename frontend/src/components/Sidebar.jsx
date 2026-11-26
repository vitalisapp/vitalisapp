import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';
import { NAV_ITEMS, NAV_GROUPS, SIDEBAR_BOTTOM_NAV } from '../constants/nav.js';
import FeedbackModal from './FeedbackModal.jsx';
import LogoutConfirmDialog from './ui/LogoutConfirmDialog.jsx';
import { safeSet } from '../lib/storage.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { resolveAvatar, capitalizeName } from '../lib/avatar.js';
import { goalLabel } from '../features/user/Onboarding/constants/goals.js';
import './Sidebar.css';

/**
 * One navigation row for both sidebar states.
 *
 * The row stays outside the Sidebar component so React never remounts the
 * link/button tree when the rail expands or collapses.
 */
const SidebarRow = ({
  href = undefined,
  active = false,
  icon = undefined,
  label = undefined,
  onClick = undefined,
  fillActive = false,
  collapsed = false,
  alert = false,
  danger = false,
  showTooltip = undefined,
  hideTooltip = undefined,
}) => {
  const isLink = Boolean(href);
  const Comp = /** @type {any} */ (isLink ? Link : 'button');
  const accessibleLabel = alert ? `${label} — setup incomplete` : label;

  const openTooltip = (event) => {
    if (collapsed) showTooltip?.(accessibleLabel, event.currentTarget);
  };
  const closeTooltip = () => {
    if (collapsed) hideTooltip?.();
  };

  return (
    <Comp
      {...(isLink ? { to: href } : { type: 'button', onClick })}
      aria-label={accessibleLabel}
      aria-current={active ? 'page' : undefined}
      className={`v-sidebar__row${active ? ' is-active' : ''}${danger ? ' is-danger' : ''}`}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
    >
      <span className="v-sidebar__row-icon">
        <Icon
          name={icon}
          className="v-sidebar__icon"
          fill={active && fillActive ? 1 : 0}
        />
        {alert && <span className="v-sidebar__alert" aria-hidden="true" />}
      </span>
      <span className="v-sidebar__label" aria-hidden={collapsed ? 'true' : undefined}>
        {label}
      </span>
    </Comp>
  );
};

/** Section heading — becomes a thin divider when the rail is collapsed. */
export const SidebarSection = ({ label = undefined, children = undefined }) => (
  <div className="v-sidebar__section" role="group" aria-label={label}>
    <div className="v-sidebar__group-head" aria-hidden="true">
      <span className="v-sidebar__group-text">{label}</span>
    </div>
    {children}
  </div>
);

/** Account card: real user data, links to the profile page. */
export const SidebarAccount = ({
  to = '/profile',
  name = undefined,
  subtitle = undefined,
  avatarUrl = undefined,
  active = false,
  alert = false,
  collapsed = false,
  showTooltip = undefined,
  hideTooltip = undefined,
}) => {
  const [broken, setBroken] = useState(false);
  const a = resolveAvatar(avatarUrl || null, name);
  const label = alert ? `${name} — profile setup incomplete` : `${name} — profile & settings`;
  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`v-sidebar__account${active ? ' is-active' : ''}`}
      onMouseEnter={(e) => { if (collapsed) showTooltip?.(label, e.currentTarget); }}
      onMouseLeave={() => { if (collapsed) hideTooltip?.(); }}
      onFocus={(e) => { if (collapsed) showTooltip?.(label, e.currentTarget); }}
      onBlur={() => { if (collapsed) hideTooltip?.(); }}
    >
      <span className="v-sidebar__avatar">
        {a.kind === 'image' && !broken ? (
          <img src={a.src} alt="" onError={() => setBroken(true)} />
        ) : (
          <span className="v-sidebar__avatar-initials" style={{ background: a.surface.background, color: a.surface.color }}>
            {a.initials}
          </span>
        )}
        {alert && <span className="v-sidebar__alert" aria-hidden="true" />}
      </span>
      <span className="v-sidebar__account-copy" aria-hidden="true">
        <span className="v-sidebar__account-name">{name}</span>
        <span className="v-sidebar__account-sub">{subtitle}</span>
      </span>
      <Icon name="chevron_right" className="v-sidebar__account-chevron" />
    </Link>
  );
};

const Sidebar = ({ onClick = undefined, collapsed = false, onToggle = undefined }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  // Onboarding unfinished (e.g. the user skipped the wizard) → nudge dot on Profile.
  const needsOnboarding = user?.onboardingCompleted === false;

  useEffect(() => {
    safeSet('vitalis:activeNav', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!tooltip) return undefined;
    const hide = () => setTooltip(null);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [tooltip]);

  const showTooltip = (label, element) => {
    const rect = element.getBoundingClientRect();
    setTooltip({
      label,
      left: rect.right + 10,
      top: Math.min(
        Math.max(rect.top + rect.height / 2, 34),
        window.innerHeight - 34,
      ),
    });
  };
  const hideTooltip = () => setTooltip(null);

  const isRowActive = (path) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path + '/'));

  const profileItem = SIDEBAR_BOTTOM_NAV[0];
  const displayName = capitalizeName(user?.name || 'Member');
  const goal = user?.fitness_goal || user?.goalType;
  const subtitle = user?.role === 'admin' ? 'Administrator' : (goal ? goalLabel(goal) : 'Member');

  const rowProps = { collapsed, showTooltip, hideTooltip, fillActive: true };

  return (
    <>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {collapsed && tooltip && createPortal(
        <div
          className="v-sidebar-tooltip"
          role="tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.label}
        </div>,
        document.body,
      )}

      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={`v-sidebar${collapsed ? ' is-collapsed' : ''}`}
      >
        <div className="v-sidebar__head">
          <Link to="/dashboard" className="v-sidebar__brand" aria-label="Vitalis dashboard">
            <span className="v-sidebar__brand-mark">
              <img src="/pwa-192x192.png" alt="" />
            </span>
            <span className="v-sidebar__brand-copy" aria-hidden={collapsed ? 'true' : undefined}>
              Vitalis
            </span>
          </Link>

          <button
            type="button"
            className="v-sidebar__toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={collapsed ? 'left_panel_open' : 'left_panel_close'} />
          </button>
        </div>

        <div className="v-sidebar__body">
          <nav aria-label="Primary navigation" className="v-sidebar__nav">
            {NAV_GROUPS.map((group) => {
              const items = NAV_ITEMS.filter((item) => item.group === group.key);
              if (items.length === 0) return null;
              return (
                <SidebarSection key={group.key} label={group.label}>
                  {items.map((item) => (
                    <SidebarRow
                      key={item.key}
                      href={item.path}
                      active={isRowActive(item.path)}
                      icon={item.icon}
                      label={item.label}
                      {...rowProps}
                    />
                  ))}
                </SidebarSection>
              );
            })}
            {user?.role === 'admin' && (
              <SidebarSection label="Administration">
                <SidebarRow
                  href="/admin"
                  active={isRowActive('/admin')}
                  icon="shield_person"
                  label="Admin Console"
                  {...rowProps}
                />
              </SidebarSection>
            )}
          </nav>
        </div>

        <div className="v-sidebar__foot">
          <SidebarRow
            icon="rate_review"
            label="Feedback"
            onClick={() => setShowFeedback(true)}
            {...rowProps}
          />
          <SidebarRow
            icon="logout"
            label="Log out"
            danger
            onClick={() => setLogoutOpen(true)}
            {...rowProps}
          />

          <SidebarAccount
            to={profileItem?.path || '/profile'}
            name={displayName}
            subtitle={subtitle}
            avatarUrl={user?.avatar}
            active={isRowActive(profileItem?.path || '/profile')}
            alert={needsOnboarding}
            collapsed={collapsed}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        </div>
      </aside>

      <LogoutConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={onClick}
      />
    </>
  );
};

export default Sidebar;
