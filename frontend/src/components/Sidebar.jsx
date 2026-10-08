import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { NAV_ITEMS } from '../constants/nav.js';
import FeedbackModal from './FeedbackModal.jsx';
import { safeSet } from '../lib/storage.js';

const Sidebar = ({ onClick, expanded, setExpanded }) => {
  const location = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    safeSet('vitalis:activeNav', location.pathname);
  }, [location.pathname]);

  return (
    <>
      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* ── Desktop Sidebar — minimal: flat, no shadow */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false); }}
        aria-label="Primary"
        className={`
          hidden md:flex fixed left-0 top-0 h-full flex-col
          bg-[var(--bg-primary)] border-r border-[var(--border-light)]
          py-7 z-40 overflow-hidden
          transition-all duration-200 ease-out
          ${expanded ? 'w-60' : 'w-18'}
          focus-within:w-60
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5 px-5 mb-9 overflow-hidden">
          <img src="/pwa-192x192.png" alt="Vitalis logo" className="w-8 h-8 min-w-8 rounded-md shrink-0" />
          <span
            className={`font-['Manrope'] font-black tracking-[0.2em] text-[13px] text-[var(--accent)] whitespace-nowrap transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            VITALIS
          </span>
        </div>

        {/* Primary nav */}
        <nav aria-label="Primary navigation" className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.label}
                to={item.path}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-4.5 px-5 h-11 whitespace-nowrap overflow-hidden
                  text-[11px] uppercase tracking-[0.12em] no-underline transition-colors duration-150
                  ${
                    isActive
                      ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  className="text-[20px] min-w-5 shrink-0"
                  fill={isActive ? 1 : 0}
                />
                <span
                  className={`transition-opacity duration-200 ${
                    expanded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-[var(--border-light)] pt-2">
          <button
            onClick={() => setShowFeedback(true)}
            title="Feedback"
            aria-label="Feedback"
            className="w-full flex items-center gap-4.5 px-5 h-11 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)] whitespace-nowrap overflow-hidden transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            <Icon name="feedback" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-opacity duration-150 ${
                expanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Feedback
            </span>
          </button>
          <button
            onClick={onClick}
            title="Logout"
            aria-label="Logout"
            className="w-full flex items-center gap-4.5 px-5 h-11 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap overflow-hidden transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            <Icon name="logout" className="text-[20px] min-w-5 shrink-0" />
            <span
              className={`transition-opacity duration-150 ${
                expanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;