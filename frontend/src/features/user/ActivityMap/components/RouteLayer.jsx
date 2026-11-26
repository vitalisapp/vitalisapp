import { useMemo } from 'react';
import GeoJsonLayer from './GeoJsonLayer.jsx';
import { pathToLineFeatureCollection, segmentedPathFeatureCollection } from '../utils/mapAdapter.js';

const ROUTE_LAYOUT = { 'line-cap': 'round', 'line-join': 'round' };

// A [lat, lng] path drawn as stacked rounded line layers ({ id, paint }).
// Display-only: the path is never mutated or smoothed, so recorded distance
// is unaffected. `breaks` (pause / GPS-gap indexes) split the route into
// separate LineStrings so no fake straight line is drawn across a break.
const RouteLayer = ({ id = undefined, path = undefined, layers = undefined, breaks = undefined }) => {
  const data = useMemo(
    () => (breaks && breaks.length
      ? segmentedPathFeatureCollection(path, breaks)
      : pathToLineFeatureCollection(path)),
    [path, breaks],
  );
  const lineLayers = useMemo(
    () => (layers || []).map((l) => ({ ...l, type: 'line', layout: ROUTE_LAYOUT })),
    [layers],
  );
  return <GeoJsonLayer id={id} data={data} layers={lineLayers} />;
};

export default RouteLayer;
