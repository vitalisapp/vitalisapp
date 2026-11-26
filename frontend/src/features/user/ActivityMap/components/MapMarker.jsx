import { useEffect, useRef } from 'react';
import { Marker } from 'maplibre-gl';
import { isMapAlive, useVitalisMap } from '../hooks/useVitalisMap.js';
import { toLngLat } from '../utils/mapAdapter.js';

// DOM for each marker kind (styles in activity-map.css). Replaces the old
// Leaflet L.divIcon factories with the same look.
const createMarkerElement = (variant) => {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.className = `am-marker am-marker--${variant}`;
  if (variant === 'user') {
    const pulse = document.createElement('span');
    pulse.className = 'am-marker__pulse';
    el.appendChild(pulse);
  } else if (variant === 'start' || variant === 'finish') {
    el.textContent = variant === 'start' ? 'S' : 'F';
  }
  return el;
};

// A single MapLibre marker: the element is built once per mount and only
// moved (setLngLat) when `position` ([lat, lng]) changes.
const MapMarker = ({ position = undefined, variant = 'user' }) => {
  const map = useVitalisMap();
  const markerRef = useRef(null);
  const addedRef = useRef(false);
  const lngLat = toLngLat(position);
  const lng = lngLat?.[0];
  const lat = lngLat?.[1];

  useEffect(() => {
    if (!isMapAlive(map)) return undefined;
    markerRef.current = new Marker({ element: createMarkerElement(variant), anchor: 'center' });
    addedRef.current = false;
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      addedRef.current = false;
    };
  }, [map, variant]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !isMapAlive(map)) return;
    if (lng == null || lat == null) {
      if (addedRef.current) { marker.remove(); addedRef.current = false; }
      return;
    }
    marker.setLngLat([lng, lat]);
    if (!addedRef.current) { marker.addTo(map); addedRef.current = true; }
  }, [map, variant, lng, lat]);

  return null;
};

export default MapMarker;
