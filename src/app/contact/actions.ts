'use server';

import { redirect } from 'next/navigation';
import { sendAppEmail } from '@/lib/email';
import { getClientIp, hitRateLimit } from '@/lib/rate-limit';

export async function submitContactAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || !message || message.length > 5000) {
    redirect('/contact?error=invalid');
  }

  // The site-wide cap bounds inbox flooding even if the client IP can't be trusted.
  const hour = 60 * 60 * 1000;
  const ip = await getClientIp();
  const ipLimited = ip !== null && hitRateLimit(`contact:ip:${ip}`, 5, hour);
  if (ipLimited || hitRateLimit('contact:all', 50, hour)) {
    redirect('/contact?error=too-many-requests');
  }

  const recipient = process.env.CONTACT_EMAIL || process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'denysmahoro@gmail.com';

  try {
    await sendAppEmail({
      to: recipient,
      replyTo: email,
      subject: 'New SELA ENERGY inquiry',
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
  } catch (error) {
    console.error('Contact inquiry email failed:', error);
    redirect('/contact?error=delivery');
  }

  redirect('/contact?sent=1');
}