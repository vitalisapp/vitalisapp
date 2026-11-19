import { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && !!window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Keeps an overlay mounted for `duration` ms after `open` turns false so it
 * can play an exit animation.
 *
 *   const { mounted, closing } = usePresence(open, 180);
 *   {mounted && <Panel className={closing ? 'is-closing' : ''} />}
 *
 * Re-opening during the exit cancels it. Reduced-motion users get an
 * immediate unmount.
 */
export function usePresence(open, duration = 180) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Render-time adjustment (React-endorsed) — no extra effect pass.
  if (open && (!mounted || closing)) {
    setMounted(true);
    setClosing(false);
  } else if (!open && mounted && !closing) {
    setClosing(true);
  }

  useEffect(() => {
    if (!closing) return undefined;
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, prefersReducedMotion() ? 0 : duration);
    return () => clearTimeout(t);
  }, [closing, duration]);

  return { mounted, closing };
}

export default usePresence;
