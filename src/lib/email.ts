// Sends mail through Resend's HTTPS API. Railway blocks outbound SMTP (ports 25, 465, 587)
// on its lower plans, but HTTPS works everywhere, so SMTP can't be used here.
const resendEndpoint = 'https://api.resend.com/emails';

// Without a verified domain, Resend only accepts the test sender onboarding@resend.dev,
// and it only delivers to the email address on the Resend account.
const defaultFrom = 'SELA ENERGY <onboarding@resend.dev>';

type AppEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendAppEmail(message: AppEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Email is not configured: RESEND_API_KEY is missing.');
  }

  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || defaultFrom,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {})
    }),
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok) {
    // Log the status and Resend's error name only. The message can repeat recipient addresses.
    const body: { name?: unknown } | null = await response.json().catch(() => null);
    const name = typeof body?.name === 'string' ? `, ${body.name}` : '';
    throw new Error(`Resend rejected the email (HTTP ${response.status}${name}).`);
  }
}
