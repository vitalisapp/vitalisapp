import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Icon from '../../../components/Icon.jsx';
import LogoutConfirmDialog from '../../../components/ui/LogoutConfirmDialog.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { SidebarSection, SidebarAccount } from '../../../components/Sidebar.jsx';
import { capitalizeName } from '../../../lib/avatar.js';
import '../../../components/Sidebar.css';

// Section order for the console rail; items without a group fall into Console.
const ADMIN_GROUPS = [
  { key: 'console', label: 'Console' },
  { key: 'content', label: 'Content' },
  { key: 'security', label: 'Security' },
];

/**
 * Admin rail.
 *
 * Reuses the app sidebar's visual language and collapsed-rail behaviour, but
 * keeps a console-specific hierarchy: admin sections in the body and the
 * elevated account + exit actions in the footer.
 */
const AdminRow = ({
  to = undefined,
  end = undefined,
  icon = undefined,
  label = undefined,
  collapsed = undefined,
  showTooltip = undefined,
  hideTooltip = undefined,
  danger = false,
  onClick = undefined,
}) => {
  const openTooltip = (event) => {
    if (collapsed) showTooltip(label, event.currentTarget);
  };
  const closeTooltip = () => {
    if (collapsed) hideTooltip();
  };

  const body = (active = false) => (
    <>
      <span className="v-sidebar__row-icon">
        <Icon name={icon} className="v-sidebar__icon" fill={active ? 1 : 0} />
      </span>
      <span className="v-sidebar__label" aria-hidden={collapsed ? 'true' : undefined}>
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        end={end}
        aria-label={label}
        className={({ isActive }) => `v-sidebar__row${isActive ? ' is-active' : ''}`}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
      >
        {({ isActive }) => body(isActive)}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      className={`v-sidebar__row${danger ? ' is-danger' : ''}`}
      onClick={onClick}
      aria-label={label}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
    >
      {body()}
    </button>
  );
};

export default function AdminSidebar({ items = undefined, collapsed = false, onToggle = undefined }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [tooltip, setTooltip] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminName = capitalizeName(user?.name || 'Administrator');
  const hideTooltip = () => setTooltip(null);

  return (
    <>
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
        id="admin-sidebar"
        aria-label="Admin console navigation"
        className={`v-sidebar adm-sidebar${collapsed ? ' is-collapsed' : ''}`}
      >
        <div className="v-sidebar__head">
          <Link to="/admin" className="v-sidebar__brand" aria-label="Vitalis admin home">
            <span className="v-sidebar__brand-mark">
              <img src="/pwa-192x192.png" alt="" />
            </span>
            <span className="v-sidebar__brand-copy adm-sidebar__brand-copy" aria-hidden={collapsed ? 'true' : undefined}>
              <span className="adm-sidebar__brand-name">Vitalis</span>
              <span className="adm-sidebar__brand-sub">Admin console</span>
            </span>
          </Link>

          <button
            type="button"
            className="v-sidebar__toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar"
            title={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
          >
            <Icon name={collapsed ? 'left_panel_open' : 'left_panel_close'} />
          </button>
        </div>

        <div className="v-sidebar__body">
          <nav aria-label="Admin sections" className="v-sidebar__nav">
            {ADMIN_GROUPS.map((group) => {
              const groupItems = items.filter((item) => (item.group || 'console') === group.key);
              if (groupItems.length === 0) return null;
              return (
                <SidebarSection key={group.key} label={group.label}>
                  {groupItems.map((item) => (
                    <AdminRow
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      icon={item.icon}
                      label={item.label}
                      collapsed={collapsed}
                      showTooltip={showTooltip}
                      hideTooltip={hideTooltip}
                    />
                  ))}
                </SidebarSection>
              );
            })}
          </nav>
        </div>

        <div className="v-sidebar__foot">
          <AdminRow
            icon="logout"
            label="Sign out"
            danger
            collapsed={collapsed}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            onClick={() => setLogoutOpen(true)}
          />

          <SidebarAccount
            to="/admin/profile"
            name={adminName}
            subtitle="Administrator · Elevated access"
            avatarUrl={user?.avatar}
            active={pathname === '/admin/profile'}
            collapsed={collapsed}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
          />
        </div>
      </aside>

      <LogoutConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        admin
      />
    </>
  );
}
