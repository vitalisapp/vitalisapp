import { useEffect } from "react";
import { useVitalisMap } from "../hooks/useVitalisMap.js";
import { boundsOf } from "../utils/mapAdapter.js";

// Frame the finished route. maxZoom stops a tiny / single-spot route from
// zooming to street-level noise.
const FitRoute = ({ path = undefined }) => {
  const map = useVitalisMap();
  useEffect(() => {
    if (!map || !Array.isArray(path) || path.length < 2) return;
    const bounds = boundsOf(path);
    if (bounds) map.fitBounds(bounds, { padding: 60, duration: 1200, maxZoom: 17 });
  }, [path, map]);
  return null;
};

export default FitRoute;
