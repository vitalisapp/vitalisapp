import { useCallback, useEffect, useState } from 'react';
import {
  detectWindowsEnvironment,
  getWindowsWidgetStatus,
  refreshWindowsWidgets,
} from '../../../../lib/widgetBridge.js';

/**
 * Windows Widgets Board readiness for the Preferences gallery.
 *
 * stage:
 *  - 'unavailable'   not Windows + Microsoft Edge → existing guide, unchanged
 *  - 'install'       Edge on Windows, but this page isn't the installed app
 *  - 'unsupported'   installed app, but the host doesn't expose widgets
 *  - 'ready'         host supports widgets; user can add from Win + W
 *  - 'added'         a VITALIS widget is on the Widgets Board
 */
export function useWindowsWidgets() {
  const [env] = useState(() => detectWindowsEnvironment());
  const [status, setStatus] = useState({ checked: false, worker: false, supported: false, added: false });

  const eligible = env.isWindows && env.isEdge;

  const check = useCallback(async () => {
    if (!eligible) return;
    const next = await getWindowsWidgetStatus();
    setStatus({ checked: true, ...next });
    if (next.added) refreshWindowsWidgets();
  }, [eligible]);

  useEffect(() => {
    if (!eligible) return undefined;
    let alive = true;
    getWindowsWidgetStatus().then((next) => {
      if (alive) setStatus({ checked: true, ...next });
    });
    // Re-check when the user comes back from the Widgets Board.
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [eligible, check]);

  let stage = 'unavailable';
  if (eligible) {
    // The Widgets Board only lists widgets from the installed app, so a plain
    // Edge tab must see the install step even if its worker exposes the API.
    if (status.added) stage = 'added';
    else if (!env.isInstalledApp) stage = 'install';
    else if (status.supported) stage = 'ready';
    else stage = 'unsupported';
  }

  return { stage, checked: status.checked, env, check };
}

export default useWindowsWidgets;
