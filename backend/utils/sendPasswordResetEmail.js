const nodemailer = require('nodemailer');

/**
 * Password reset email — configure ONE of the following on the server (e.g. Vercel env):
 *
 * 1) Resend (easiest on Vercel; no SMTP)
 *    - RESEND_API_KEY=re_...
 *    - RESEND_FROM_EMAIL="ALU FoodShare <onboarding@resend.dev>"  (testing; use your domain after verifying in Resend)
 *
 * 2) SMTP (Gmail, Outlook, etc.)
 *    - SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASS
 *    - Optional: SMTP_FROM, SMTP_SECURE=true for port 465
 *
 * If neither is set, the reset link is only printed in server logs (Vercel → Functions → Logs).
 */

async function sendViaResend(to, subject, text, html) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, detail: 'missing RESEND_API_KEY' };

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'ALU FoodShare <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, detail: `${res.status} ${body}` };
  }
  return { ok: true };
}

function buildSmtpTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });
}

/**
 * @returns {Promise<{ sent: boolean; provider: 'resend'|'smtp'|'none'; error?: string }>}
 */
async function sendPasswordResetEmail(to, resetUrl) {
  const subject = 'Reset your ALU FoodShare password';
  const text = `Reset your password (link expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<p>Reset your password (link expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`;

  if (process.env.RESEND_API_KEY?.trim()) {
    const r = await sendViaResend(to, subject, text, html);
    if (r.ok) return { sent: true, provider: 'resend' };
    console.error('[password-reset] Resend error:', r.detail);
    return { sent: false, provider: 'resend', error: r.detail };
  }

  const transport = buildSmtpTransport();
  if (transport) {
    try {
      const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER;
      await transport.sendMail({ from, to, subject, text, html });
      return { sent: true, provider: 'smtp' };
    } catch (e) {
      console.error('[password-reset] SMTP error:', e.message);
      return { sent: false, provider: 'smtp', error: e.message };
    }
  }

  console.warn(
    '[password-reset] No email provider (set RESEND_API_KEY or SMTP_*). Reset URL:',
    resetUrl
  );
  return { sent: false, provider: 'none' };
}

module.exports = { sendPasswordResetEmail };
