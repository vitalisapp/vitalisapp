import { useMemo } from 'react';
import GeoJsonLayer from './GeoJsonLayer.jsx';
import { ACCURACY_LAYERS, accuracyCircleFeatureCollection } from '../utils/mapAdapter.js';

// Translucent circle of the device-reported accuracy (metres) around the live
// position: a coarse Wi-Fi / cell fix shows as a large circle, GPS lock as a
// tight one. Nothing is drawn without a real accuracy value.
const AccuracyCircle = ({ position = undefined, accuracy = undefined }) => {
  const lat = position?.[0];
  const lng = position?.[1];
  const data = useMemo(
    () => accuracyCircleFeatureCollection(lat == null ? null : [lat, lng], accuracy),
    [lat, lng, accuracy],
  );
  return <GeoJsonLayer id="gps-accuracy" data={data} layers={ACCURACY_LAYERS} />;
};

export default AccuracyCircle;
