// Implements the sendMail interface used by email.service over HTTPS.
function createBrevoTransport({ apiKey, senderEmail, senderName }) {
  return {
    async sendMail({ to, subject, html, text, replyTo }) {
      if (!senderEmail) throw new Error('Brevo HTTPS email requires MAIL_FROM (a verified sender).');
      const payload = {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      };
      let response;
      try {
        response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });
      } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          throw new Error('Brevo HTTPS request timed out after 15 seconds.');
        }
        throw new Error('Could not connect to Brevo HTTPS API. Check outbound HTTPS connectivity.');
      }
      if (!response.ok) {
        const hints = {
          400: 'Check MAIL_FROM is a verified Brevo sender and the recipient is valid.',
          401: 'Brevo rejected authentication. Check the active API key and account access settings.',
          403: 'Check Brevo account permissions and authorized IP settings.',
          429: 'Brevo rate limit reached. Retry later.',
        };
        // Only include the provider's diagnostic fields, never the full response.
        // Redact secrets/content before truncation so partial secrets cannot leak.
        const sanitize = (value) => {
          if (typeof value !== 'string') return '';
          let safe = value;
          for (const secret of [apiKey, senderEmail, to, replyTo, html, text, subject]) {
            if (typeof secret === 'string' && secret) safe = safe.split(secret).join('[redacted]');
          }
          return safe
            .replace(/(?:xkeysib|xsmtpsib)-[\w-]+/gi, '[redacted key]')
            .replace(/https?:\/\/[^\s<>"']+/gi, '[redacted URL]')
            .replace(/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/gi, '[redacted email]')
            .replace(/[\x00-\x1f\x7f]/g, ' ')
            .slice(0, 500);
        };
        let detail = '';
        try {
          const body = await response.json();
          const code = sanitize(body?.code);
          const message = sanitize(body?.message);
          if (code || message) detail = ` Provider: ${[code, message].filter(Boolean).join(': ')}.`;
        } catch {
          // Non-JSON/empty error bodies still get the HTTP status and guidance.
        }
        throw new Error(`Brevo HTTPS API returned ${response.status}.${detail} ${hints[response.status] || 'Check Brevo transactional email logs and account quota.'}`);
      }
      return response.json();
    },
  };
}

module.exports = { createBrevoTransport };
