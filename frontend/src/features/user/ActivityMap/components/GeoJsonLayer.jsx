import { useEffect, useRef } from 'react';
import { isMapAlive, useMapStyleLayer, useVitalisMap } from '../hooks/useVitalisMap.js';
import { VITALIS_PREFIX } from '../utils/mapAdapter.js';

// One GeoJSON source + its layers ({ id, type, layout?, paint }).
// Data changes only call source.setData(); the source and layers are created
// once and survive theme swaps. Layers stack in the order components mount.
const GeoJsonLayer = ({ id = undefined, data = undefined, layers = undefined }) => {
  const map = useVitalisMap();
  const sourceId = `${VITALIS_PREFIX}${id}`;

  const dataRef = useRef(data);
  const layersRef = useRef(layers);
  useEffect(() => {
    dataRef.current = data;
    layersRef.current = layers;
  });

  useMapStyleLayer(
    map,
    sourceId,
    (m) => {
      const source = m.getSource(sourceId);
      if (source) source.setData(dataRef.current);
      else m.addSource(sourceId, { type: 'geojson', data: dataRef.current });
      for (const layer of layersRef.current || []) {
        const layerId = `${sourceId}-${layer.id}`;
        if (m.getLayer(layerId)) continue;
        m.addLayer({
          id: layerId,
          type: layer.type,
          source: sourceId,
          ...(layer.layout ? { layout: layer.layout } : {}),
          paint: layer.paint,
        });
      }
    },
    (m) => {
      for (const layer of layersRef.current || []) {
        const layerId = `${sourceId}-${layer.id}`;
        if (m.getLayer(layerId)) m.removeLayer(layerId);
      }
      if (m.getSource(sourceId)) m.removeSource(sourceId);
    },
  );

  // Fresh data → update in place. During a full style rebuild the source is
  // briefly absent; the style.load re-install above then applies dataRef.
  useEffect(() => {
    if (!isMapAlive(map)) return;
    map.getSource(sourceId)?.setData(data);
  }, [map, sourceId, data]);

  return null;
};

export default GeoJsonLayer;
