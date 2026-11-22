import Icon from '../Icon.jsx';
import { sleepGuidance } from '../../lib/bmi.js';
import './health.css';

/** Short interpretation of the user's usual sleep, shown under the sleep picker. */
export default function SleepNote({ hours = undefined, age = null }) {
  const g = sleepGuidance(hours, age);
  if (!g) return null;
  return (
    <p className={`vh-sleep-note is-${g.tone}`} role="status">
      <Icon name="bedtime" />
      <span><strong>{g.label}.</strong> {g.message}</span>
    </p>
  );
}
