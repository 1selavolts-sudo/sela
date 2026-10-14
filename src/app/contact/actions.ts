'use server';

import { redirect } from 'next/navigation';
import { sendAppEmail } from '@/lib/email';

export async function submitContactAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || !message || message.length > 5000) {
    redirect('/contact?error=invalid');
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