import { useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import Modal from '../../../../components/ui/Modal.jsx';
import { useToastStore } from '../../../../stores/toastStore.js';
import { isNativeShell, requestPinWidget } from '../../../../lib/widgetBridge.js';
import { WIDGETS, SIZES, getWidget } from '../lib/widgetCatalog.js';
import { useWidgetData } from '../hooks/useWidgetData.js';
import { useWidgetPrefs } from '../hooks/useWidgetPrefs.js';
import { useWindowsWidgets } from '../hooks/useWindowsWidgets.js';
import WidgetPreview from './WidgetPreview.jsx';
import WidgetConfigModal from './WidgetConfigModal.jsx';
import WindowsWidgetGuide from './WindowsWidgetGuide.jsx';
import '../widgets.css';

export default function HomeScreenWidgets({ userId }) {
  const { status, error, data, reload } = useWidgetData(userId);
  const { configs, update } = useWidgetPrefs(userId);
  const addToast = useToastStore((s) => s.addToast);
  const [editingId, setEditingId] = useState(null);
  const [guideFor, setGuideFor] = useState(null);
  const [pinning, setPinning] = useState(false);

  // True only inside the VITALIS Android app (it injects window.VitalisWidgets).
  // A browser cannot pin home-screen widgets, so web users get the guide and a
  // disabled "Add widget" button instead of a fake success.
  const native = isNativeShell();
  const editing = editingId ? getWidget(editingId) : null;

  // Windows 11 Widgets Board (Edge + installed PWA). Android shell wins when
  // present, so the Android flow above is unchanged.
  const windows = useWindowsWidgets();
  const windowsActive = !native && windows.stage !== 'unavailable';
  const [windowsGuideFor, setWindowsGuideFor] = useState(null);

  // Asks Android to pin the widget. Returns true when it was added.
  const pinWidget = async (widget) => {
    const result = await requestPinWidget(widget.id);
    if (result.ok) {
      addToast(`${widget.name} added to your home screen.`, 'success');
      return true;
    }
    if (result.reason === 'unsupported') {
      setGuideFor(widget);
    } else if (result.reason === 'cancelled') {
      addToast('Widget pinning was cancelled.', 'info');
    } else {
      addToast('Could not add the widget. Try again from your launcher.', 'error');
    }
    return false;
  };

  const handleAdd = async (widget) => {
    if (!native) {
      setGuideFor(widget);
      return;
    }
    await pinWidget(widget);
  };

  // "Add widget" inside the guide: closes the guide once the widget is placed.
  const handleGuideAdd = async () => {
    if (!native || !guideFor || pinning) return;
    setPinning(true);
    try {
      if (await pinWidget(guideFor)) setGuideFor(null);
    } finally {
      setPinning(false);
    }
  };

  return (
    <section className="pref-section hw-root" aria-labelledby="pref-widgets-title">
      <div className="pref-section-head">
        <span className="pref-section-icon" aria-hidden="true">
          <Icon name="widgets" />
        </span>
        <div className="pref-section-copy">
          <h2 id="pref-widgets-title">Home Screen Widgets</h2>
          <p>
            {native
              ? 'Bring your fitness progress to your home screen. Choose, personalize, and add your VITALIS widgets.'
              : 'Preview and personalize VITALIS home-screen widgets. Adding them to your phone comes with the VITALIS Android app.'}
          </p>
        </div>
      </div>

      <div className="pref-section-body">
        <div className="hw-gallery-meta">
          <span className="hw-gallery-count">{WIDGETS.length} widgets</span>
          {windowsActive ? (
            <span className="hw-support">
              <Icon name="desktop_windows" />
              Windows Widgets Board · 1 widget
            </span>
          ) : null}
          <span className="hw-support">
            <Icon name="android" />
            {native ? 'Android 8.0+' : 'Android app · coming soon'}
          </span>
        </div>

        {status === 'partial' ? (
          <p className="hw-banner" role="status">
            <Icon name="info" />
            <span>{error}</span>
            <button type="button" className="hw-text-btn" onClick={reload}>
              Retry
            </button>
          </p>
        ) : null}

        <div className="hw-grid">
          {WIDGETS.map((widget) => {
            const config = configs[widget.id];
            const size = SIZES[config.size] || SIZES.medium;
            return (
              <article className="hw-card" key={widget.id}>
                <div className="hw-stage">
                  <WidgetPreview
                    widget={widget}
                    config={config}
                    data={data}
                    status={status}
                    error={error}
                    onRetry={reload}
                  />
                </div>

                <div className="hw-card-body">
                  <div className="hw-card-head">
                    <span className="hw-card-icon" aria-hidden="true">
                      <Icon name={widget.icon} />
                    </span>
                    <h3>{widget.name}</h3>
                    {windowsActive && widget.windowsTag && windows.stage === 'added' ? (
                      <span className="hw-win-badge">
                        <Icon name="check_circle" />
                        On Widgets Board
                      </span>
                    ) : null}
                  </div>
                  <p className="hw-card-desc">{widget.description}</p>

                  <div className="hw-card-foot">
                    <span className="hw-sizes">
                      {widget.sizes.map((id) => SIZES[id].cells).join(' · ')}
                      <em>{size.label} selected</em>
                    </span>
                    <div className="hw-card-actions">
                      <button
                        type="button"
                        className="hw-btn hw-btn--ghost"
                        aria-label={`Configure ${widget.name}`}
                        onClick={() => setEditingId(widget.id)}
                      >
                        <Icon name="tune" />
                        Configure
                      </button>
                      {windowsActive && widget.windowsTag ? (
                        <button
                          type="button"
                          className="hw-btn hw-btn--primary"
                          aria-label={`Add ${widget.name} to the Windows Widgets Board`}
                          onClick={() => setWindowsGuideFor(widget)}
                        >
                          <Icon name="desktop_windows" />
                          {windows.stage === 'added' ? 'On Windows' : 'Add on Windows'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="hw-btn hw-btn--primary"
                          aria-label={native ? `Add ${widget.name} to your home screen` : `How to add ${widget.name}`}
                          onClick={() => handleAdd(widget)}
                        >
                          <Icon name={native ? 'add_to_home_screen' : 'help'} />
                          {native ? 'Add widget' : 'How to add'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="hw-disclaimer">
          <Icon name="verified" />
          <span>
            Previews use the data you have already logged. Steps and calories burned are entered manually in VITALIS — the
            widgets do not read phone sensors, heart rate, sleep, or hydration.
          </span>
        </p>
      </div>

      {editing ? (
        <WidgetConfigModal
          widget={editing}
          config={configs[editing.id]}
          data={data}
          status={status}
          error={error}
          onRetry={reload}
          onClose={() => setEditingId(null)}
          onSave={(next) => {
            update(editing.id, next);
            addToast(`${editing.name} settings saved on this device.`, 'success');
            setEditingId(null);
          }}
        />
      ) : null}

      {windowsGuideFor ? (
        <WindowsWidgetGuide
          widget={windowsGuideFor}
          stage={windows.stage}
          onCheck={windows.check}
          onClose={() => setWindowsGuideFor(null)}
        />
      ) : null}

      <Modal
        isOpen={Boolean(guideFor)}
        onClose={() => setGuideFor(null)}
        title="Add a VITALIS widget"
        subtitle={guideFor?.name}
        icon="widgets"
        size="md"
        footer={
          <div className="hw-modal-foot">
            <div className="hw-modal-actions">
              <button type="button" className="hw-btn hw-btn--ghost" onClick={() => setGuideFor(null)}>
                Got it
              </button>
              <button
                type="button"
                className="hw-btn hw-btn--primary"
                onClick={handleGuideAdd}
                disabled={!native || pinning}
                aria-describedby={native ? undefined : 'hw-add-hint'}
              >
                <Icon name="add_to_home_screen" />
                {pinning ? 'Adding…' : 'Add widget'}
              </button>
            </div>
            {native ? null : (
              <p id="hw-add-hint" className="hw-add-hint">
                Adding works inside the VITALIS Android app, coming soon. A browser can't place widgets on your home screen.
              </p>
            )}
          </div>
        }
      >
        {native ? (
          <div className="hw-guide">
            <p className="hw-guide-lead">
              Tap <strong>Add widget</strong> below and confirm on your phone to place{' '}
              <strong>{guideFor?.name || 'the widget'}</strong> on your home screen.
            </p>
            <p className="hw-guide-lead">
              Or long-press an empty area of your home screen, tap <strong>Widgets</strong>, find <strong>VITALIS</strong>,
              and drag <strong>{guideFor?.name || 'the widget'}</strong> onto the screen.
            </p>
            <p className="hw-note">Some launchers restrict one-tap pinning — the long-press route always works.</p>
          </div>
        ) : (
          <div className="hw-guide">
            <p className="hw-guide-lead">
              Home-screen widgets will come with the <strong>VITALIS Android app</strong>, which isn&apos;t available yet.
              You can already preview and personalize <strong>{guideFor?.name || 'each widget'}</strong> here.
            </p>
            <p className="hw-guide-sub">When the app is available:</p>
            <ol className="hw-steps">
              <li>Install the VITALIS Android app and sign in to the same account.</li>
              <li>
                Tap <strong>Add widget</strong>, or long-press your home screen, tap <strong>Widgets</strong>, and find{' '}
                <strong>VITALIS</strong>.
              </li>
              <li>Drop the widget where you want it.</li>
            </ol>
            <p className="hw-note">
              Settings you save here stay in this browser for now — sending them to your phone is part of the upcoming app.
              The app will need Android 8.0 or newer.
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
