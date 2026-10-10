import Icon from '../../../components/Icon.jsx';
import { PlanCover } from './PlanWidgets.jsx';

const PlanDetailOverlay = ({ plan, onClose, onStart }) => {
  if (!plan) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 md:p-6 overflow-y-auto bg-[var(--bg-overlay)]"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg lg:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl sm:my-auto max-h-[92vh] max-h-[92dvh] flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-medium)]"
        style={{
          animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag pill for mobile sheet */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-medium)]" />
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="aspect-[16/7] relative overflow-hidden flex-shrink-0">
            <PlanCover seed={plan.image_seed} title={plan.title} opacity={0.3} />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-secondary)_0%,rgba(0,0,0,0.2)_60%,transparent_100%)]"
            />
            <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 flex gap-2">
              <span
                className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-[var(--accent-solid)] text-[var(--accent-solid-fg)]"
              >
                {plan.tag}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                {plan.intensity}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close plan details"
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-11 h-11 rounded-full flex items-center justify-center transition-colors bg-black/45 text-[var(--text-muted)]"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 max-w-[420px] sm:max-w-xl mx-auto w-full">
            <h2 className="text-xl sm:text-2xl font-black mb-1 text-[var(--text-primary)]">{plan.title}</h2>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 text-[var(--text-muted)]">{plan.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-6 text-center">
              {[
                { label: 'Duration',  value: plan.duration,      sub: 'program', icon: 'schedule' },
                { label: 'Level', value: plan.intensity,     sub: 'intensity', icon: 'bolt' },
                { label: 'Focus',     value: (plan.target_focus || '').split(' ')[0] || 'Full', sub: 'body', icon: 'track_changes' },
                { label: 'Equipment', value: 'None', sub: 'needed', icon: 'block' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-2.5 text-center border bg-[var(--bg-hover)] border-[var(--border-light)]"
                >
                  <p className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{stat.label}</p>
                  <p className="text-[13px] font-black text-[var(--text-primary)]">{stat.value}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">{stat.sub}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border bg-[var(--accent-bg)] border-[var(--accent-border)]"
            >
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2 text-[var(--accent)]">
                What this plan does
              </p>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                This structured {plan.duration} program targets{' '}
                <strong className="text-[var(--text-primary)]">{plan.target_focus}</strong> with daily progressive
                sessions. Each day builds on the last — follow the protocol, complete every task, and unlock the next day.
              </p>
            </div>
            <div className="flex items-center justify-between mb-4 sm:mb-5 px-1">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {plan.price === 0 || plan.price === '0.00' ? 'Free' : `$${plan.price}`}
              </span>
              {plan.price > 0 && plan.is_enrolled !== 1 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
                  One-time purchase
                </span>
              )}
            </div>
            <button
              onClick={onStart}
              className="w-full py-3.5 pl-5 pr-2 rounded-full font-bold text-sm flex items-center justify-between active:scale-[0.98] transition-all duration-200 bg-[var(--text-primary)] text-[var(--bg-primary)]"
            >
              <span>{plan.is_enrolled === 1 ? 'Open Plan Tracker' : 'Start Workout'}</span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetailOverlay;
