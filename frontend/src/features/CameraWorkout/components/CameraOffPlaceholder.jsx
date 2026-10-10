import Icon from "../../../components/Icon.jsx";
export default function CameraOffPlaceholder({ cameraOn, onTurnOn }) {
  if (cameraOn) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[var(--bg-card)]">
      <Icon name="videocam_off" className="text-6xl text-[var(--text-muted)]" />
      <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-bold">Camera Off</p>
      <button
        onClick={onTurnOn}
        className="mt-2 px-6 py-2.5 rounded-full bg-[var(--accent-solid)] text-[var(--accent-solid-fg)] text-[10px] font-black uppercase tracking-widest active:scale-95"
      >
        Turn On
      </button>
    </div>
  );
}