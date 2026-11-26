import Icon from '../../../../components/Icon.jsx';
import { useVitalisMap } from '../hooks/useVitalisMap.js';
import { toLngLat } from '../utils/mapAdapter.js';

// Explicit "back to me": auto-follow pauses once the user pans the map, so
// this is the reliable way to snap the camera back to the current GPS fix.
// Rendered outside the MapLibre canvas container, so clicks never start a drag.
const RecenterButton = ({ userLocation = undefined, onRecenter = undefined }) => {
  const map = useVitalisMap();
  const center = toLngLat(userLocation);
  const disabled = !center;

  const handleClick = () => {
    if (!map || !center) return;
    map.flyTo({ center, zoom: Math.max(map.getZoom(), 16), duration: 800 });
    onRecenter?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="Recenter to my location"
      title="Recenter to my location"
      className="am-map-btn absolute top-3 right-3 z-[1000] sm:top-4 sm:right-4"
    >
      <Icon name="my_location" className="text-[19px]" />
    </button>
  );
};

export default RecenterButton;
