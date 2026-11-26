import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectProfileIssues } from '../../src/lib/profileIssues.js';

const sections = (issues) => issues.map((issue) => issue.section);

describe('profile attention issues', () => {
  it('flags a weak password in the security section only', () => {
    const issues = collectProfileIssues(
      { passwordNeedsAttention: true },
      { height_cm: 170, weight_kg: 65, onboarding: { goalType: 'LOSE_WEIGHT' } },
    );
    assert.deepEqual(sections(issues), ['security']);
    assert.equal(issues[0].message, 'Your password is weak');
  });

  it('orders issues security → setup → metrics → goal', () => {
    const issues = collectProfileIssues(
      { passwordNeedsAttention: true, onboardingCompleted: false },
      {},
    );
    assert.deepEqual(sections(issues), ['security', 'onboarding', 'metrics', 'goal']);
  });

  it('reports nothing for a complete profile', () => {
    assert.deepEqual(
      collectProfileIssues(
        { onboardingCompleted: true },
        { height_cm: 172, weight_kg: 68, onboarding: { goalType: 'BUILD_MUSCLE' } },
      ),
      [],
    );
  });

  it('falls back to the onboarding snapshot for height and weight', () => {
    const issues = collectProfileIssues(
      {},
      { onboarding: { heightCm: 180, weightKg: 80, goalType: 'MAINTAIN' } },
    );
    assert.deepEqual(sections(issues), []);
  });

  it('accepts a goal stored on the auth user when the profile has none', () => {
    const issues = collectProfileIssues(
      { goalType: 'LOSE_WEIGHT' },
      { height_cm: 165, weight_kg: 60, onboarding: {} },
    );
    assert.deepEqual(sections(issues), []);
  });

  it('stays quiet until the profile payload has loaded', () => {
    assert.deepEqual(collectProfileIssues({ passwordNeedsAttention: false }, null), []);
  });

  it('does not throw on missing user or profile', () => {
    assert.deepEqual(collectProfileIssues(null, null), []);
    assert.deepEqual(collectProfileIssues(undefined, undefined), []);
  });
});
