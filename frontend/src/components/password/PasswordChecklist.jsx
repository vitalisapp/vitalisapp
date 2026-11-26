import { PASSWORD_RULES, checkPassword } from '../../lib/passwordPolicy.js';
import './password-checklist.css';

// Live requirement checklist shared by every "set a password" form. Colors come
// from theme tokens (--success / --error / --text-*), so it reads correctly in
// both dark and light mode. Stays hidden until the user starts typing.
export default function PasswordChecklist({ password = '', id = undefined, className = '' }) {
  if (!password) return null;
  const { failed } = checkPassword(password);

  return (
    <div id={id} className={`pw-checklist ${className}`.trim()} aria-live="polite">
      <ul>
        {PASSWORD_RULES.map((rule) => {
          const met = !failed.includes(rule.key);
          return (
            <li key={rule.key} className={met ? 'is-met' : ''}>
              <span className="material-symbols-outlined" aria-hidden="true">
                {met ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{rule.label}</span>
              <span className="sr-only">{met ? ' (met)' : ' (not met)'}</span>
            </li>
          );
        })}
      </ul>
      {failed.includes('common') && (
        <p className="pw-checklist-warn" role="alert">This password is too common and easy to guess.</p>
      )}
      {failed.includes('maxBytes') && (
        <p className="pw-checklist-warn" role="alert">Too long — use 72 characters or fewer.</p>
      )}
    </div>
  );
}
