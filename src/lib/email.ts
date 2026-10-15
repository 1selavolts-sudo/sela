import nodemailer from 'nodemailer';

type AppEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendAppEmail(message: AppEmail) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !password || !Number.isInteger(port)) {
    throw new Error('SMTP is not fully configured.');
  }

  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    // On STARTTLS ports, never send the password unless the upgrade to TLS succeeds.
    requireTLS: !secure,
    auth: { user, pass: password }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text
  });
}