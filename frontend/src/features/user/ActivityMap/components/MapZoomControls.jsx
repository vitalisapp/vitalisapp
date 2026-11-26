import Icon from '../../../../components/Icon.jsx';
import { useVitalisMap } from '../hooks/useVitalisMap.js';

// Desktop zoom buttons in the Recenter button's style. Hidden below md, where
// pinch-zoom is the natural gesture (the old Leaflet zoom control was too).
const MapZoomControls = () => {
  const map = useVitalisMap();
  if (!map) return null;

  return (
    <div className="absolute top-[60px] right-3 z-[1000] hidden flex-col gap-2 sm:top-[68px] sm:right-4 md:flex">
      <button
        type="button"
        onClick={() => map.zoomIn({ duration: 250 })}
        aria-label="Zoom in"
        title="Zoom in"
        className="am-map-btn"
      >
        <Icon name="add" className="text-[19px]" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut({ duration: 250 })}
        aria-label="Zoom out"
        title="Zoom out"
        className="am-map-btn"
      >
        <Icon name="remove" className="text-[19px]" />
      </button>
    </div>
  );
};

export default MapZoomControls;
