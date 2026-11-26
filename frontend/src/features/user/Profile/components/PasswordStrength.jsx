import { getPasswordStrength } from '../utils/passwordStrength.js';
import PasswordChecklist from '../../../../components/password/PasswordChecklist.jsx';

export default function PasswordStrength({ password = undefined }) {
  const strength = getPasswordStrength(password);
  if (!strength) return null;

  return (
    <div className="pw-strength" data-level={strength.key} aria-live="polite">
      <div className="pw-strength-head">
        <span>Password strength</span>
        <strong>{strength.label}</strong>
      </div>
      <div className="pw-strength-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index < strength.bars ? 'is-on' : ''} />
        ))}
      </div>
      <PasswordChecklist password={password} />
    </div>
  );
}
