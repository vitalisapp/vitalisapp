import { useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import Modal from '../../../../components/ui/Modal.jsx';
import { clearInstallEvent, getInstallEvent } from '../../../../lib/pwaInstall.js';

// Windows has no "pin" API for web apps, so this guide never fakes an add:
// it walks the user through Win + W and reports the real status from the
// service worker (useWindowsWidgets).
export default function WindowsWidgetGuide({ widget, stage, onCheck, onClose }) {
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const installEvent = stage === 'install' ? getInstallEvent() : null;
  const name = widget?.name || 'the widget';

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await onCheck();
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    if (!installEvent || installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice?.outcome === 'accepted') setJustInstalled(true);
    } catch {
      /* dismissed */
    } finally {
      clearInstallEvent();
      setInstalling(false);
    }
  };

  const footer = (
    <div className="hw-modal-actions">
      <button type="button" className="hw-btn hw-btn--ghost" onClick={onClose}>
        Close
      </button>
      {stage === 'install' && installEvent ? (
        <button type="button" className="hw-btn hw-btn--primary" onClick={handleInstall} disabled={installing}>
          <Icon name="install_desktop" />
          {installing ? 'Installing…' : 'Install VITALIS'}
        </button>
      ) : (
        <button type="button" className="hw-btn hw-btn--primary" onClick={handleCheck} disabled={checking}>
          <Icon name="refresh" />
          {checking ? 'Checking…' : 'Check again'}
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add to Windows Widgets"
      subtitle={name}
      icon="desktop_windows"
      size="md"
      footer={footer}
    >
      <div className="hw-guide">
        {stage === 'added' ? (
          <p className="hw-win-status is-added" role="status">
            <Icon name="check_circle" />
            <span>
              <strong>{name}</strong> is on your Windows Widgets Board. Press <strong>Win + W</strong> to see it.
            </span>
          </p>
        ) : null}

        {stage === 'install' && justInstalled ? (
          <p className="hw-win-status is-added" role="status">
            <Icon name="check_circle" />
            <span>
              VITALIS is installed and opened in its <strong>own window</strong>. Switch to that window (or open{' '}
              <strong>Vitalis</strong> from the Start menu) and continue there. This browser tab can&apos;t add widgets.
            </span>
          </p>
        ) : null}

        {stage === 'install' && !justInstalled ? (
          <>
            <p className="hw-guide-lead">
              Windows widgets come from the <strong>installed VITALIS app</strong>. Install it from Microsoft Edge first.
            </p>
            <ol className="hw-steps">
              <li>
                {installEvent ? (
                  <>Tap <strong>Install VITALIS</strong> below.</>
                ) : (
                  <>
                    In Edge, open the <strong>…</strong> menu → <strong>Apps</strong> →{' '}
                    <strong>Install VITALIS</strong>. If it&apos;s already installed, open VITALIS from the Start menu.
                  </>
                )}
              </li>
              <li>Open this page (Preferences → Home Screen Widgets) inside the installed app.</li>
              <li>Come back here for the Widgets Board steps.</li>
            </ol>
          </>
        ) : null}

        {stage === 'ready' || stage === 'added' ? (
          <>
            <p className="hw-guide-sub">{stage === 'added' ? 'To add it again or move it:' : 'Add it in four steps:'}</p>
            <ol className="hw-steps">
              <li>
                Press <strong>Win + W</strong> to open the Widgets Board.
              </li>
              <li>
                Select <strong>+</strong> (Add widgets).
              </li>
              <li>
                Find <strong>VITALIS</strong> and choose <strong>{name}</strong>.
              </li>
              <li>
                Select <strong>Pin</strong>, then come back and tap <strong>Check again</strong>.
              </li>
            </ol>
          </>
        ) : null}

        {stage === 'unsupported' ? (
          <p className="hw-guide-lead">
            This copy of Windows or Edge doesn&apos;t offer widgets to apps yet. Widgets need{' '}
            <strong>Windows 11</strong> and an up-to-date <strong>Microsoft Edge</strong>. For local testing, Microsoft
            also requires <strong>Developer Mode</strong> and the <strong>Windows App SDK</strong>.
          </p>
        ) : null}

        <p className="hw-note">
          Widgets live in the Windows Widgets Board (Win + W), not on the desktop or taskbar. They show your real
          VITALIS data and refresh about every 30 minutes. Signing out clears them.
        </p>
      </div>
    </Modal>
  );
}
