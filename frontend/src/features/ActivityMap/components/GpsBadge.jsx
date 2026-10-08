import React from 'react';

// Vitalis map chip: white pill, colored status dot. Readable over both
// light and dark tiles.
const GpsBadge = ({ locationStatus }) => (
  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-[1000] flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-md">
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0
        ${locationStatus === 'granted' ? 'bg-green-500' : locationStatus === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}
    />
    <span className="text-[10px] sm:text-[11px] font-bold text-gray-800">
      {locationStatus === 'granted' ? 'GPS Active' : locationStatus === 'pending' ? 'Locating…' : 'GPS Off'}
    </span>
  </div>
);

export default GpsBadge;
