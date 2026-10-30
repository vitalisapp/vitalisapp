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
          401: 'Check BREVO_API_KEY is a valid API key, not an SMTP key.',
          403: 'Check Brevo account permissions and authorized IP settings.',
          429: 'Brevo rate limit reached. Retry later.',
        };
        // Do not log request headers, email contents, or raw provider responses.
        throw new Error(`Brevo HTTPS API returned ${response.status}. ${hints[response.status] || 'Check Brevo transactional email logs and account quota.'}`);
      }
      return response.json();
    },
  };
}

module.exports = { createBrevoTransport };
