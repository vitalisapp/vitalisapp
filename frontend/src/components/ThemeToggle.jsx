import React from 'react';
import { useTheme } from '../hooks/useTheme.js';
import Icon from './Icon.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`
        theme-toggle relative p-2 rounded-xl transition-all duration-300 cursor-pointer border-none
        ${isDark 
          ? 'bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-[var(--accent)]' 
          : 'bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-[var(--accent)]'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated icon container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun icon - visible in light mode */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-300
            ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
          `}
        >
          <Icon name="light_mode" className="text-[20px]" />
        </div>
        
        {/* Moon icon - visible in dark mode */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
          `}
        >
          <Icon name="dark_mode" className="text-[20px]" />
        </div>
      </div>

      {/* Ripple effect on toggle */}
      {isTransitioning && (
        <span className="absolute inset-0 rounded-xl animate-ping-slow bg-current opacity-20" />
      )}
    </button>
  );
};

export default ThemeToggle;
