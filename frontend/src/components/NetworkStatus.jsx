// NetworkStatus — app-wide connectivity indicator (Section 9).
//
// VITALIS is online-first: logging, plans and every AI feature (Gemini meal
// scans, coach, progress-photo review) need the server and the internet.
// When the browser goes offline we say so plainly instead of letting each
// screen fail with a vague error. Fixed-position pill = no layout shift.
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import './networkStatus.css';

const BACK_ONLINE_MS = 3000;

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  const [showBack, setShowBack] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const goOffline = () => {
      clearTimeout(timer.current);
      setShowBack(false);
      setOnline(false);
    };
    const goOnline = () => {
      setOnline(true);
      setShowBack(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShowBack(false), BACK_ONLINE_MS);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      clearTimeout(timer.current);
    };
  }, []);

  if (online && !showBack) return null;

  return (
    <div className={`net-status ${online ? 'is-online' : 'is-offline'}`} role="status" aria-live="polite">
      <Icon name={online ? 'wifi' : 'wifi_off'} />
      {online ? (
        <span>Back online</span>
      ) : (
        <span>
          <strong>You&apos;re offline.</strong> Saving logs and AI features (meal scan, coach, photo review) need an internet connection.
        </span>
      )}
    </div>
  );
}
