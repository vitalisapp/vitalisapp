# Verification email delivery status

The UI shows a spinner while sending and waiting for delivery. Only a Brevo
`delivered` webhook enables the success checkmark. This means the recipient's
mail server accepted the email; it may still be in Spam. It does not verify the
account — the user must click their verification link.

## Deployment

1. Apply `045_email_delivery.sql` using `npm run db:migrate` from `backend` with
   the production database environment configured.
2. Set `BREVO_WEBHOOK_SECRET` on the Render backend to a long random secret.
   Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   Keep `BREVO_API_KEY`, verified `MAIL_FROM`, and the correct HTTPS `FRONTEND_URL`.
3. In Brevo's Transactional webhooks settings, create a webhook:
   - URL: `https://vitalisapp-hlxy.onrender.com/api/auth/email-delivery-webhook`
   - Authentication: Bearer token, using the same `BREVO_WEBHOOK_SECRET`.
     The resulting request header must be `Authorization: Bearer <secret>`.
   - Events: Delivered, Deferred, Soft bounced, Hard bounced, Blocked,
     Invalid email, Error, and Sent (optional).
4. Deploy the backend and frontend, then request one verification email.

The frontend polls every five seconds for up to two minutes, then shows
"Delivery hasn't been confirmed yet" instead of an indefinite spinner or
false success. Resends have a 30-second UI cooldown. Refreshing the check-email
page retains its initial tracking token in router history state.

Without webhook configuration, emails still send, but the UI says only that
the email was accepted for sending; it never claims confirmed delivery.
Tracking tokens expire after 30 minutes, are scoped to one message, and cannot
be used as login or email-verification tokens. The webhook uses constant-time
secret comparison and persists message status across backend restarts.

Troubleshooting: webhook responses should be HTTP 204. HTTP 401 means the
webhook Bearer secret does not match; HTTP 503 means it is unset. Database
errors usually mean the migration has not been applied. Provider request
failures are logged separately as `Verification email failed:`.

Delivery-event rows contain only message IDs, status, and update timestamps.
They can be purged after seven days using:
`DELETE FROM email_delivery_events WHERE updated_at < NOW() - INTERVAL 7 DAY;`
