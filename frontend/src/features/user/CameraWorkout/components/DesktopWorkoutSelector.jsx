import Icon from "../../../../components/Icon.jsx";
import { getPickerOptions, resolveWorkout } from "../constants/workoutGuide.js";

const PICKER_OPTIONS = getPickerOptions();

// Real session state — never a static "Live" badge.
const statusOf = ({ cameraOn, isRecording, paused }) => {
  if (paused) return { label: 'Paused', tone: 'muted' };
  if (isRecording) return { label: 'Live', tone: 'live' };
  if (cameraOn === false) return { label: 'Camera off', tone: 'muted' };
  return { label: 'Ready', tone: 'ready' };
};

// Compact exercise switcher (sm+). Mobile uses MobileWorkoutPills instead.
export default function DesktopWorkoutSelector({
  workoutType = undefined,
  onSelect = undefined,
  isRecording = false,
  paused = false,
  cameraOn = undefined,
}) {
  const icon = resolveWorkout(workoutType)?.icon
    ?? PICKER_OPTIONS.find((o) => o.id === workoutType)?.icon
    ?? 'fitness_center';
  const status = statusOf({ cameraOn, isRecording, paused });

  return (
    <div className="hidden sm:block px-[clamp(16px,3vw,32px)] max-w-7xl 2xl:max-w-[1400px] mx-auto w-full pt-4">
      <div className="flex items-center gap-3 min-w-0">
        <label htmlFor="cw-exercise-select" className="text-[13px] font-medium text-[var(--text-muted)] shrink-0">
          Exercise
        </label>

        <div className="relative min-w-0 w-full max-w-[300px]">
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--accent)]"
          />
          <select
            id="cw-exercise-select"
            value={workoutType}
            onChange={(e) => {
              const opt = PICKER_OPTIONS.find((o) => o.id === e.target.value) ?? resolveWorkout(e.target.value);
              if (opt) onSelect?.(opt);
            }}
            className="appearance-none w-full h-10 pl-10 pr-9 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-light)] text-[14px] font-semibold text-[var(--text-primary)] truncate cursor-pointer outline-none transition-colors hover:border-[var(--border-medium)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-bg)]"
          >
            {PICKER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                {opt.label}{opt.mode === 'hold' ? ' (Hold)' : ''}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--text-muted)]"
          />
        </div>

        <span
          className={`ml-auto inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold shrink-0 ${
            status.tone === 'live'
              ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
          }`}
          role="status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status.tone === 'live' ? 'bg-[var(--accent)] animate-pulse motion-reduce:animate-none'
                : status.tone === 'ready' ? 'bg-[var(--success)]'
                  : 'bg-[var(--text-muted)]'
            }`}
            aria-hidden="true"
          />
          {status.label}
        </span>
      </div>
    </div>
  );
}
