import { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import Icon from '../../../../components/Icon.jsx';
import { SIZES, SKINS, normalizeConfig } from '../lib/widgetCatalog.js';
import WidgetPreview from './WidgetPreview.jsx';

export default function WidgetConfigModal({
  widget,
  config,
  data,
  status,
  error,
  onRetry,
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);

  const patch = (next) => setDraft((prev) => ({ ...prev, ...next }));
  const sizeInfo = SIZES[draft.size] || SIZES.medium;

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    onSave(draft);
  };

  const footer = (
    <div className="hw-modal-actions">
      <button type="button" className="hw-btn hw-btn--ghost" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="button" className="hw-btn hw-btn--primary" onClick={handleSave} disabled={saving}>
        <Icon name="check" />
        Save widget
      </button>
    </div>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={widget.name}
      subtitle={`${sizeInfo.label} · ${sizeInfo.cells} home-screen size`}
      icon={widget.icon}
      size="lg"
      footer={footer}
    >
      <div className="hw-config">
        <div className="hw-config-preview">
          <div className="hw-config-stage">
            <WidgetPreview
              widget={widget}
              config={draft}
              data={data}
              status={status}
              error={error}
              onRetry={onRetry}
            />
          </div>
          <p className="hw-config-note">
            Live preview with your real account data. Empty widgets show an empty state, never sample numbers.
          </p>
        </div>

        <fieldset className="hw-field">
          <legend className="hw-legend">Size</legend>
          <div className="hw-chips">
            {widget.sizes.map((id) => (
              <button
                key={id}
                type="button"
                className="hw-chip-btn"
                aria-pressed={draft.size === id}
                onClick={() => patch({ size: id })}
              >
                <span>{SIZES[id].label}</span>
                <em>{SIZES[id].cells}</em>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="hw-field">
          <legend className="hw-legend">Style</legend>
          <div className="hw-skins">
            {SKINS.map((skin) => (
              <button
                key={skin.id}
                type="button"
                className="hw-skin-btn"
                aria-pressed={draft.skin === skin.id}
                onClick={() => patch({ skin: skin.id })}
              >
                <span className={`hw-swatch hw-swatch--${skin.id}`} aria-hidden="true" />
                <span className="hw-skin-copy">
                  <strong>{skin.label}</strong>
                  <em>{skin.hint}</em>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {widget.metrics ? (
          <fieldset className="hw-field">
            <legend className="hw-legend">Primary metric</legend>
            <div className="hw-chips">
              {widget.metrics.map((metric) => (
                <button
                  key={metric.id}
                  type="button"
                  className="hw-chip-btn"
                  aria-pressed={draft.metric === metric.id}
                  onClick={() => patch({ metric: metric.id })}
                >
                  <span>{metric.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="hw-toggles">
          <div className="hw-toggle-row">
            <div className="hw-toggle-copy">
              <span className="hw-toggle-title">Secondary stats</span>
              <span className="hw-toggle-desc">Show the supporting row underneath the main number.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.showSecondary}
              aria-label="Show secondary stats"
              className={`pref-switch${draft.showSecondary ? ' is-on' : ''}`}
              onClick={() => patch({ showSecondary: !draft.showSecondary })}
            >
              <span className="pref-switch-thumb" />
            </button>
          </div>

          <div className="hw-toggle-row">
            <div className="hw-toggle-copy">
              <span className="hw-toggle-title">Hide values</span>
              <span className="hw-toggle-desc">Keep the layout but mask numbers on the home screen.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.hideValues}
              aria-label="Hide values on the widget"
              className={`pref-switch${draft.hideValues ? ' is-on' : ''}`}
              onClick={() => patch({ hideValues: !draft.hideValues })}
            >
              <span className="pref-switch-thumb" />
            </button>
          </div>
        </div>

        <div className="hw-config-foot">
          <button
            type="button"
            className="hw-text-btn"
            onClick={() => setDraft(normalizeConfig(widget, null))}
          >
            Reset to default
          </button>
          <p className="hw-config-note">
            Steps and calories are what you log in VITALIS — not phone sensor readings.
          </p>
        </div>
      </div>
    </Modal>
  );
}
