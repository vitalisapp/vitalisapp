const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const emails = require('../../src/emails');

describe('email templates', () => {
  beforeEach(() => {
    process.env.FRONTEND_URL = 'https://app.vitalis.test';
    delete process.env.EMAIL_ASSET_BASE_URL;
  });

  it('welcome email greets by first name, escapes input, and uses hosted logos with emoji feature icons', () => {
    const { subject, html, text } = emails.welcomeEmail({ name: 'Ana <b>Cruz</b>' });
    assert.equal(subject, 'Welcome to Vitalis, Ana!');
    assert.match(html, /Welcome to Vitalis, Ana!/);
    assert.doesNotMatch(html, /<b>Cruz<\/b>/);
    assert.match(html, /src="https:\/\/app\.vitalis\.test\/email\/logo\.png"/);
    assert.match(html, /src="https:\/\/app\.vitalis\.test\/email\/logo-hero\.png"/);
    assert.doesNotMatch(html, /icon-(meal|workout|ai|map)\.png/);
    assert.match(html, /&#127869;/);
    assert.match(html, /href="https:\/\/app\.vitalis\.test\/onboarding"/);
    assert.doesNotMatch(html, /Confirm your email/);
    assert.match(text, /Set up your plan: https:\/\/app\.vitalis\.test\/onboarding/);
  });

  it('welcome email includes the verify CTA only when a verifyUrl is passed', () => {
    const verifyUrl = 'https://app.vitalis.test/verify-email?token=abc';
    const { html, text } = emails.welcomeEmail({ name: 'Ana', verifyUrl });
    assert.match(html, /Confirm your email/);
    assert.ok(html.includes(`href="${verifyUrl}"`));
    assert.ok(text.includes(verifyUrl));
  });

  it('google welcome mentions Google sign-in instead of verification', () => {
    const { html } = emails.welcomeEmail({ name: 'Ana', provider: 'google' });
    assert.match(html, /Google/);
    assert.doesNotMatch(html, /Verify email/);
  });

  describe('asset host by NODE_ENV', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => { process.env.NODE_ENV = originalEnv; });

    it('development serves assets from FRONTEND_URL (localhost)', () => {
      process.env.NODE_ENV = 'development';
      process.env.FRONTEND_URL = 'http://localhost:5173';
      process.env.EMAIL_ASSET_BASE_URL = 'https://cdn.vitalis.test/mail/';
      assert.equal(emails.assetUrl('logo'), 'http://localhost:5173/email/logo.png');
    });

    it('production defaults to the Vercel deploy', () => {
      process.env.NODE_ENV = 'production';
      process.env.FRONTEND_URL = 'http://localhost:5173';
      assert.equal(emails.assetUrl('logoHero'), 'https://vitalisapp-eta.vercel.app/email/logo-hero.png');
    });

    it('production honours EMAIL_ASSET_BASE_URL', () => {
      process.env.NODE_ENV = 'production';
      process.env.EMAIL_ASSET_BASE_URL = 'https://cdn.vitalis.test/mail/';
      assert.equal(emails.assetUrl('logo'), 'https://cdn.vitalis.test/mail/logo.png');
    });
  });

  it('every template returns a subject and a full HTML document', () => {
    const built = [
      emails.verificationEmail({ link: 'https://x.test/v' }),
      emails.passwordResetLinkEmail({ link: 'https://x.test/r' }),
      emails.passwordResetOtpEmail({ name: 'Ana', otp: '123456' }),
      emails.passwordChangedEmail({ name: 'Ana', resetUrl: 'https://x.test' }),
      emails.mealSummaryEmail({ summary: { calories: 1800 } }),
      emails.feedbackEmail({ name: 'Ana', email: 'a@x.test', message: 'hi' }),
      emails.emailChangedNoticeEmail({ newEmail: 'b@x.test' }),
    ];
    for (const { subject, html } of built) {
      assert.ok(subject);
      assert.match(html, /^<!DOCTYPE html>/);
      assert.match(html, /VITALIS/);
    }
  });
});
