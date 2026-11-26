import { useState, useEffect, useRef } from "react";
import RouteLayer from "./RouteLayer.jsx";
import MapMarker from "./MapMarker.jsx";
import { REPLAY_DRAWN_LAYERS, REPLAY_GHOST_LAYERS } from "../utils/mapAdapter.js";

// Post-run replay: the faint full route, the line drawing itself in over
// ~120 frames with a moving dot, then start (S) / finish (F) markers.
// Safe for empty / single-point routes (no marker without a valid point).
const RouteReplay = ({ fullPath = undefined, breaks = undefined }) => {
  const path = Array.isArray(fullPath) ? fullPath : [];
  const [drawnPath, setDrawnPath] = useState(() => path.slice(0, 1));
  const [isDone, setIsDone] = useState(false);
  const frameRef = useRef(null);
  const indexRef = useRef(1);
  const PPF = Math.max(1, Math.ceil(path.length / 120));

  // Replay reset when a new path arrives, inside the rAF animation-loop subscription.
  useEffect(() => {
    const pts = Array.isArray(fullPath) ? fullPath : [];
    indexRef.current = 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset of drawn state for the new path
    setDrawnPath(pts.slice(0, 1));
    setIsDone(false);

    const tick = () => {
      if (indexRef.current >= pts.length) {
        setIsDone(true);
        return;
      }
      indexRef.current = Math.min(indexRef.current + PPF, pts.length);
      setDrawnPath(pts.slice(0, indexRef.current));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [fullPath, PPF]);

  return (
    <>
      <RouteLayer id="replay-full" path={path} layers={REPLAY_GHOST_LAYERS} breaks={breaks} />
      <RouteLayer id="replay-drawn" path={drawnPath} layers={REPLAY_DRAWN_LAYERS} breaks={breaks} />
      <MapMarker position={path[0]} variant="start" />
      {!isDone && drawnPath.length > 0 && (
        <MapMarker position={drawnPath[drawnPath.length - 1]} variant="user" />
      )}
      {isDone && <MapMarker position={path[path.length - 1]} variant="finish" />}
    </>
  );
};

export default RouteReplay;
