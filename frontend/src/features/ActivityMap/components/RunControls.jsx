import React from 'react';

// Vitalis record controls: big accent START pill when idle,
// floating control bar (pause/resume + finish) while active.
// `bare` renders just the buttons (no positioning) for embedding in a
// shared bottom stack — keeps the stats card and Start from overlapping.
const ControlsContent = ({ isRecording, hasPaused, metricsTime, onStart, onPauseResume, onFinish, gpsReady = true }) => (
  <>
    {!isRecording && !hasPaused && metricsTime === 0 ? (
      <>
        <button
          onClick={onStart}
          className="flex items-center gap-2.5 bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] pl-6 pr-9 sm:pl-7 sm:pr-11 py-3.5 sm:py-4 rounded-full font-bold
            hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--accent)]/30 text-base sm:text-lg"
        >
          <span className="material-symbols-outlined text-[22px] sm:text-2xl">directions_run</span>
          Start
        </button>
        {!gpsReady && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--warning)] bg-[var(--warning-bg)] border border-[var(--warning)] rounded-full px-3 py-1.5">
            GPS required — enable location to start
          </p>
        )}
      </>
    ) : (
      <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-card)] p-1.5 sm:p-2 pl-2 sm:pl-2.5 rounded-full border border-[var(--border-light)] shadow-[var(--shadow-lg)]">
        <button
          onClick={onPauseResume}
          aria-label={isRecording ? 'Pause' : 'Resume'}
          className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center hover:opacity-85 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px] sm:text-2xl">
            {isRecording ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          onClick={onFinish}
          className="bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] pl-5 pr-6 sm:pl-6 sm:pr-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-[15px] hover:brightness-110 active:scale-95 transition-all"
        >
          Finish
        </button>
      </div>
    )}
  </>
);

const RunControls = (props) => {
  if (props.bare) return <ControlsContent {...props} />;
  return (
    <div
      className="fixed md:absolute z-[1000] left-0 right-0 flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
    >
      <ControlsContent {...props} />
    </div>
  );
};

export default RunControls;
