import { useState } from 'react';
import Modal from '../../../../../components/ui/Modal.jsx';
import Button from '../../../../../components/ui/Button.jsx';
import Icon from '../../../../../components/Icon.jsx';

const LAST_UPDATED = 'September 2026';

const TERMS_SECTIONS = [
  {
    title: 'What Vitalis is',
    body: 'Vitalis is a student capstone fitness app for manually logging training, nutrition, and activity. AI coaching and macro estimates are informational only — not medical advice, diagnosis, or treatment.',
  },
  {
    title: 'Your account',
    body: 'You must provide an accurate name and email, keep your password confidential, and be at least 13 years old (or the minimum age in your country). You are responsible for all activity under your account.',
  },
  {
    title: 'Acceptable use',
    body: 'Do not misuse the service: no unlawful content, no attempts to breach security, scrape, spam, or upload harmful material (including non-consensual photos). Camera-workout frames are processed on-device/in-session and are never shared publicly by Vitalis.',
  },
  {
    title: 'Health disclaimer',
    body: 'Consult a qualified professional before starting new exercise or nutrition programs. Stop and seek care if you feel pain, dizziness, or chest discomfort. Vitalis is not liable for injuries resulting from your training choices.',
  },
  {
    title: 'Availability & changes',
    body: 'As a capstone, features may change or go offline without notice. We may suspend accounts that violate these terms.',
  },
  {
    title: 'Liability limit',
    body: 'To the maximum extent permitted by law, Vitalis is provided "as is" without warranties, and liability is limited to the amount you paid for the service (PHP 0 for this capstone).',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms? Reach us through the in-app Feedback form (Dashboard → Feedback).',
  },
];

const PRIVACY_SECTIONS = [
  {
    title: 'Data we collect',
    body: 'Account data (name, email, password hash), profile data you enter (goals, body metrics), and content you log (workouts, meals, activity, feedback). Technical data: session cookies, device/session metadata for security.',
  },
  {
    title: 'How we use it',
    body: 'To run your dashboard, plans, analytics, and AI features (meal analysis, coaching); to secure accounts (verification, password reset); and to improve the capstone. We never sell your personal data.',
  },
  {
    title: 'Camera & photos',
    body: 'Workout camera frames are used for live rep/pose feedback during your session. Meal photos you submit for analysis are sent to our AI providers solely to estimate nutrition. We do not use your images for advertising.',
  },
  {
    title: 'Sharing',
    body: 'Shared only with service providers needed to operate Vitalis (hosting/database, email delivery, AI APIs) under confidentiality obligations — and when required by law. No public sharing without your action (e.g., community posts you write).',
  },
  {
    title: 'Storage & security',
    body: 'Passwords are hashed (bcrypt), sessions use HttpOnly cookies, and traffic uses HTTPS. No system is 100% secure — use a unique password and log out on shared devices.',
  },
  {
    title: 'Your rights',
    body: 'You may view/update your profile, change your password, and request deletion via Profile / Feedback. Deletion removes your account data subject to legal/operational retention (e.g., backups, fraud prevention).',
  },
  {
    title: 'Contact',
    body: 'Privacy requests: use the in-app Feedback form and include the email you registered with.',
  },
];

const DOCS = {
  terms: { label: 'Terms of Use', icon: 'description', sections: TERMS_SECTIONS },
  privacy: { label: 'Privacy Policy', icon: 'shield', sections: PRIVACY_SECTIONS },
};

// Numbered, readable document body — calm typography, no shouty caps.
function LegalDocument({ sections = [] }) {
  return (
    <div>
      <p className="text-[12px] text-[var(--text-muted)] mb-5">
        Last updated {LAST_UPDATED} · VITALIS capstone project
      </p>
      <ol className="space-y-5">
        {sections.map((s, i) => (
          <li key={s.title} className="flex gap-3.5">
            <span
              className="shrink-0 w-6 h-6 rounded-full border border-[var(--border-medium)] text-[11px] font-semibold text-[var(--text-muted)] flex items-center justify-center tabular-nums mt-px"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">{s.title}</h4>
              <p className="mt-1 text-[13.5px] leading-[1.65] text-[var(--text-secondary)]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const AcknowledgeFooter = ({ onClose = undefined, label = 'I understand' }) => (
  <div className="flex justify-end">
    <Button onClick={onClose} size="md" className="min-w-[132px]">{label}</Button>
  </div>
);

export function TermsOfUseModal({ isOpen = undefined, onClose = undefined }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Use"
      subtitle="Please read before creating an account"
      icon="description"
      size="xl"
      footer={<AcknowledgeFooter onClose={onClose} />}
    >
      <LegalDocument sections={TERMS_SECTIONS} />
    </Modal>
  );
}

export function PrivacyPolicyModal({ isOpen = undefined, onClose = undefined }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      subtitle="How your data is handled"
      icon="shield"
      size="xl"
      footer={<AcknowledgeFooter onClose={onClose} />}
    >
      <LegalDocument sections={PRIVACY_SECTIONS} />
    </Modal>
  );
}

/**
 * Terms & Privacy in one dialog (Profile → Security). Shows the user's
 * recorded consent and lets them switch between both documents.
 */
export function LegalCenterModal({
  isOpen = false,
  onClose = undefined,
  acceptedAt = null,
  acceptedVersion = null,
  initialTab = 'terms',
}) {
  const [tab, setTab] = useState(initialTab);
  const doc = DOCS[tab] || DOCS.terms;
  const accepted = acceptedAt ? new Date(acceptedAt) : null;
  const acceptedLabel = accepted && !Number.isNaN(accepted.getTime())
    ? accepted.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onExited={() => setTab(initialTab)}
      title="Terms & Privacy"
      subtitle="The agreements that apply to your account"
      icon="verified_user"
      size="xl"
      footer={<AcknowledgeFooter onClose={onClose} label="Done" />}
    >
      {/* Consent status */}
      <div className="flex items-center gap-3 rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-hover)] px-3.5 py-3 mb-5">
        <Icon
          name={acceptedLabel ? 'check_circle' : 'info'}
          fill={1}
          className={`text-[20px] ${acceptedLabel ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}
        />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            {acceptedLabel ? 'You accepted these terms' : 'No consent on record'}
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            {acceptedLabel
              ? `On ${acceptedLabel}${acceptedVersion ? ` · version ${acceptedVersion}` : ''}`
              : 'Accounts created before consent tracking have no recorded date.'}
          </p>
        </div>
      </div>

      {/* Document switch */}
      <div className="flex p-1 rounded-[10px] bg-[var(--bg-hover)] mb-5" role="tablist" aria-label="Legal documents">
        {Object.entries(DOCS).map(([key, d]) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`legal-tab-${key}`}
              aria-selected={active}
              aria-controls="legal-panel"
              onClick={() => setTab(key)}
              className={`flex-1 h-9 rounded-[8px] inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                active
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon name={d.icon} className="text-[16px]" />
              {d.label}
            </button>
          );
        })}
      </div>

      <div id="legal-panel" role="tabpanel" aria-labelledby={`legal-tab-${tab}`}>
        <LegalDocument sections={doc.sections} />
      </div>
    </Modal>
  );
}
