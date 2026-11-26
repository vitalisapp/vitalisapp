import { useEffect, useRef } from "react";
import { useVitalisMap } from "../hooks/useVitalisMap.js";
import { toLngLat } from "../utils/mapAdapter.js";

// Camera helper:
//  · centres on the first valid fix exactly once (never a hardcoded spot),
//  · follows the user while following is on (tight while recording),
//  · pauses following when the user pans, so the map never fights them.
const RecenterMap = ({ lastPoint = undefined, isRecording = undefined, follow = undefined, onUserInteract = undefined }) => {
  const map = useVitalisMap();
  const centeredRef = useRef(false);

  // One-time recenter on the first real fix.
  useEffect(() => {
    const center = toLngLat(lastPoint);
    if (map && center && !centeredRef.current) {
      centeredRef.current = true;
      map.flyTo({ center, zoom: 16, duration: 1200 });
    }
  }, [lastPoint, map]);

  // Follow (unless the user took control). No zoom change per fix.
  //  · recording: short pan on every fix, as before;
  //  · idle: the live dot keeps refining after the first (often coarse)
  //    fix, so re-centre only when it drifts toward the edge — keeps the
  //    real position on screen without jittering on GPS noise.
  useEffect(() => {
    const center = toLngLat(lastPoint);
    if (!map || !follow || !center) return;
    if (isRecording) {
      map.panTo(center, { duration: 600 });
      return;
    }
    // Never interrupt a camera move in progress — notably the first-fix
    // flyTo above (an easeTo here would cancel its zoom-in).
    if (map.isMoving()) return;
    const { x, y } = map.project(center);
    const el = map.getContainer();
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (Math.abs(x - w / 2) > w * 0.3 || Math.abs(y - h / 2) > h * 0.3) {
      map.easeTo({ center, duration: 600 });
    }
  }, [lastPoint, isRecording, follow, map]);

  // Manual drag = user wants to explore; stop auto-following.
  // MapLibre fires `dragstart` only for user gestures, not panTo/flyTo.
  useEffect(() => {
    if (!map) return undefined;
    const onDrag = () => onUserInteract?.();
    map.on("dragstart", onDrag);
    return () => {
      map.off("dragstart", onDrag);
    };
  }, [map, onUserInteract]);

  return null;
};

export default RecenterMap;
