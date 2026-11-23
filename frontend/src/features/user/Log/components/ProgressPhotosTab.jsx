// Module 6 — Progress photos tab: front/side/back captures stored PRIVATELY,
// each reviewed by Gemini (quality + visibility — always labeled a visual
// estimate, never a body-fat or medical read), with an optional
// latest-vs-previous comparison per pose.
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../../../components/Icon.jsx';
import Modal from '../../../../components/ui/Modal.jsx';
import Button from '../../../../components/ui/Button.jsx';
import { apiGet, apiPost, apiFetch } from '../../../../lib/apiClient.js';
import { compressImage } from '../utils/compressImage.js';

const POSES = [
  { key: 'front', label: 'Front', hint: 'Face the camera, arms relaxed' },
  { key: 'side',  label: 'Side',  hint: 'Stand sideways, weight even' },
  { key: 'back',  label: 'Back',  hint: 'Back to the camera, shoulders square' },
];

const poseTitle = (key) => key.charAt(0).toUpperCase() + key.slice(1);

// Date-only values are treated as local midnight so the label never slips a day.
const fmtShortDate = (value) => {
  if (!value) return '';
  const raw = String(value);
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function RatingStars({ rating = undefined }) {
  if (!rating) return null;
  return (
    <span className="ps-rating" title="Photo usability rating (1–5)">
      <span aria-hidden="true">{'★'.repeat(rating)}{'☆'.repeat(Math.max(0, 5 - rating))}</span>
      <span className="sr-only">{rating} out of 5</span>
    </span>
  );
}

export default function ProgressPhotosTab({ userId = undefined }) {
  const [photos, setPhotos]     = useState(null);
  const [error,     setError]   = useState(null);
  const [pose,      setPose]    = useState('front');
  const [busy,      setBusy]    = useState(false);       // upload + analyze pipeline
  const [analyzingId, setAnalyzingId] = useState(null);
  const [viewing,   setViewing] = useState(null);        // photo object in Modal
  const [compare,   setCompare] = useState({ open: false, busy: false, result: null, error: '' });
  // Check-in cadence: { cadence: 'weekly'|'monthly', days, poses: { pose: { nextAllowedAt, daysLeft } } }
  const [cadence,   setCadenceState] = useState(null);
  const [cadenceBusy, setCadenceBusy] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setError(null);
    try {
      const data = await apiGet('/api/progress/photos');
      setPhotos(Array.isArray(data?.photos) ? data.photos : []);
    } catch (err) {
      setError(err.message);
    }
  };

  // No rows yet → first photo of each pose is always allowed.
  const poseState = () => cadence?.poses?.[pose] || { nextAllowedAt: null, daysLeft: 0 };
  const poseBlocked = poseState().daysLeft > 0;
  const poseLabel = poseTitle(pose);

  const setCadence = async (next) => {
    if (cadenceBusy || cadence?.cadence === next) return;
    setCadenceBusy(true);
    try {
      await apiFetch('/api/progress/cadence', { method: 'PUT', body: JSON.stringify({ cadence: next }) });
      setCadenceState(await apiGet('/api/progress/cadence'));
    } catch (err) {
      setError(err.message);
    } finally {
      setCadenceBusy(false);
    }
  };

  useEffect(() => {
    load();
    apiGet('/api/progress/cadence').then((state) => setCadenceState(state)).catch(() => setCadenceState(null));
  }, []);

  const forPose = useMemo(() => (photos || []).filter((p) => p.pose === pose), [photos, pose]);

  // Upload → optional auto-analyze (one tap, two small calls; analyze can be
  // retried later without re-uploading).
  const onPhotoPicked = async (e) => {
    // Capture the file BEFORE resetting the input: per the HTML spec,
    // input.value = '' empties the selected-files list — running the reset
    // first silently killed every upload.
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (busy) return;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    setBusy(true);
    setError(null);
    const priorCount = forPose.length; // ≥1 → this upload makes compare possible
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the file'));
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(dataUrl);
      const saved = await apiPost('/api/progress/photos', { pose, image_data: compressed });
      await load();
      // Auto-confirm the check-in: the compare IS the point of the interval.
      apiGet('/api/progress/cadence').then(setCadenceState).catch(() => {});
      // Fire-and-analyze: failure here is recoverable from the photo's menu.
      setAnalyzingId(saved.id);
      try {
        await apiPost(`/api/progress/photos/${saved.id}/analyze`, {});
      } catch { /* analysis failed — user can retry via Analyze button */ }
      await load();
      if (priorCount >= 1) runCompare();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setAnalyzingId(null);
      setBusy(false);
    }
  };

  const analyze = async (photo) => {
    setAnalyzingId(photo.id);
    setError(null);
    try {
      await apiPost(`/api/progress/photos/${photo.id}/analyze`, {});
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzingId(null);
    }
  };

  const remove = async (photoId) => {
    try {
      await apiFetch(`/api/progress/photos/${photoId}`, { method: 'DELETE' });
      setViewing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const runCompare = async () => {
    setCompare({ open: true, busy: true, result: null, error: '' });
    try {
      const result = await apiPost('/api/progress/compare', { pose });
      setCompare({ open: true, busy: false, result, error: '' });
    } catch (err) {
      setCompare({ open: true, busy: false, result: null, error: err.message });
    }
  };

  const photoUrl = (id) => `/api/progress/photos/${id}/image`;

  return (
    <div className="lg-card ps-card" data-user={userId}>
      <header className="lg-card-head ps-head">
        <div className="lg-card-titles">
          <h2 className="lg-card-title">Progress photos</h2>
          <p className="lg-card-sub">
            Front, side and back — private to you. Gemini&rsquo;s notes are visual estimates, not measurements.
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoPicked} />
        <Button
          size="sm"
          icon="add_a_photo"
          loading={busy}
          disabled={poseBlocked}
          onClick={() => fileRef.current?.click()}
          className="ps-add"
        >
          {busy ? 'Uploading…' : poseBlocked ? 'Check-in done' : 'Add photo'}
        </Button>
      </header>

      {/* Pose + check-in controls */}
      <div className="ps-toolbar">
        <div className="lg-seg ps-poses" role="group" aria-label="Photo pose">
          {POSES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPose(p.key)}
              aria-pressed={pose === p.key}
              title={p.hint}
              className={pose === p.key ? 'is-active' : ''}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ps-checkin">
          <span className="ps-status">
            <span className={`ps-status-dot${poseBlocked ? ' is-waiting' : ''}`} aria-hidden="true" />
            <span className="ps-status-copy">
              <span className="ps-status-label">
                {(cadence?.cadence || 'monthly') === 'weekly' ? 'Weekly' : 'Monthly'} check-in
              </span>
              <span className="ps-status-value">
                {poseBlocked
                  ? `${poseLabel} next in ${poseState().daysLeft} ${poseState().daysLeft === 1 ? 'day' : 'days'} · ${fmtShortDate(poseState().nextAllowedAt)}`
                  : `${poseLabel} ready for a check-in`}
              </span>
            </span>
          </span>

          <div className="lg-seg ps-cadence" role="group" aria-label="Check-in cadence">
            {['weekly', 'monthly'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCadence(c)}
                disabled={cadenceBusy || cadence?.cadence === c}
                aria-pressed={cadence?.cadence === c}
                className={cadence?.cadence === c ? 'is-active' : ''}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="lg-inline-error" role="alert">
          <Icon name="error" /> {error}
        </p>
      )}

      {/* Gallery for the selected pose */}
      {photos === null ? (
        <div className="ps-loading" aria-busy="true">Loading photos…</div>
      ) : forPose.length === 0 ? (
        <div className="ps-empty">
          <Icon name="photo_camera" />
          <strong>No {pose} photos yet</strong>
          <p>Same pose, same lighting and roughly the same distance gives the fairest comparisons.</p>
        </div>
      ) : (
        <div className="ps-gallery">
          {forPose.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setViewing(p)}
              className="ps-tile"
              title={`${poseTitle(p.pose)} · ${new Date(p.captured_at).toLocaleString()}`}
            >
              <span className="ps-tile-frame">
                <img
                  src={photoUrl(p.id)}
                  alt={`Progress photo, ${p.pose} view`}
                  loading="lazy"
                />
                {analyzingId === p.id && (
                  <span className="ps-tile-overlay">
                    <span className="vitalis-spinner" />
                  </span>
                )}
                {p.ai_rating != null && (
                  <span className="ps-tile-rating" title="Photo usability rating">★ {p.ai_rating}</span>
                )}
              </span>
              <span className="ps-tile-meta">
                <span className="ps-tile-date">{fmtShortDate(p.captured_at)}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Gemini latest-vs-previous comparison for this pose */}
      {forPose.length >= 2 && (
        <div className="ps-compare-actions">
          <Button
            variant="ghost"
            size="sm"
            icon="compare"
            loading={compare.busy}
            onClick={runCompare}
          >
            Compare latest two
          </Button>
        </div>
      )}

      {compare.open && (compare.busy || compare.result || compare.error) && (
        <div className="ps-compare">
          <div className="ps-compare-head">
            <span className="ps-compare-label">Gemini comparison</span>
            <button
              type="button"
              onClick={() => setCompare({ open: false, busy: false, result: null, error: '' })}
              className="ps-link-btn"
            >
              Hide
            </button>
          </div>
          {compare.busy ? (
            <p className="ps-compare-note">Reviewing both photos…</p>
          ) : compare.error ? (
            <p className="ps-compare-error" role="alert">{compare.error}</p>
          ) : (
            <>
              <p className="ps-compare-body">{compare.result?.summary}</p>
              <p className="ps-compare-note">
                Confidence: <strong>{compare.result?.confidence}</strong> — a visual estimate, not a measurement.
              </p>
            </>
          )}
        </div>
      )}

      {/* Photo detail */}
      {viewing && (
        <Modal
          isOpen
          onClose={() => setViewing(null)}
          title={`${poseTitle(viewing.pose)} photo`}
          subtitle={new Date(viewing.captured_at).toLocaleString()}
          size="lg"
        >
          <div className="ps-modal">
            <img src={photoUrl(viewing.id)} alt={`Progress photo, ${viewing.pose} view`} className="ps-modal-img" />
            <div className="ps-review">
              <div className="ps-review-head">
                <span className="ps-review-label">Gemini review</span>
                <RatingStars rating={viewing.ai_rating} />
              </div>
              {viewing.ai_summary ? (
                <p className="ps-review-body">{viewing.ai_summary}</p>
              ) : (
                <p className="ps-review-body is-muted">Not analyzed yet.</p>
              )}
              <p className="ps-review-note">Visual estimate — not a measurement, not medical advice.</p>
            </div>
            <div className="ps-modal-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => analyze(viewing)}
                loading={analyzingId === viewing.id}
                icon="auto_awesome"
                className="ps-modal-btn"
              >
                {viewing.ai_summary ? 'Re-analyze' : 'Analyze'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => remove(viewing.id)}
                icon="delete"
                className="ps-modal-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
