import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

// ─── Map helpers ──────────────────────────────────────────────────────────────
 const RecenterMap = ({ coords, isRecording, userLocation }) => {
  const map = useMap();
  const didFlyRef = useRef(false);

  useEffect(() => {
    if (userLocation && !didFlyRef.current) {
      didFlyRef.current = true;
      map.flyTo(userLocation, 16, { animate: true, duration: 1.5 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (isRecording && coords.length > 0) {
      map.panTo(coords[coords.length - 1]);
    }
  }, [coords, map, isRecording]);

  return null;
};



export default RecenterMap