import './health.css';

/** Plain-language explanation of the selected activity level. */
export default function ActivityDetail({ level = undefined }) {
  if (!level?.detail) return null;
  return (
    <div className="vh-activity-detail" role="note" aria-live="polite">
      <strong>{level.label}:</strong> {level.detail}
      {level.examples?.length > 0 && (
        <ul>
          {level.examples.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}
