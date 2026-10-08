import { useState, useEffect } from 'react';

// md breakpoint (768px): landscape tablets get the desktop side panel
// instead of the mobile bottom-sheet overlay.
export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLargeScreen = windowWidth >= 768;

  return { windowWidth, isLargeScreen };
};