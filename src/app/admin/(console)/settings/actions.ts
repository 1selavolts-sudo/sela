'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { supportWhatsAppKey } from '@/lib/site-settings';
import { supportWhatsAppSchema } from '@/lib/validation';

const listPath = '/admin/settings';

// Super admins and admins can change the contact number. Other roles cannot open this page.
export async function updateSupportWhatsApp(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = supportWhatsAppSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=whatsapp`);
  }

  await prisma.siteSetting.upsert({
    where: { key: supportWhatsAppKey },
    update: { value: parsed.data.whatsapp },
    create: { key: supportWhatsAppKey, value: parsed.data.whatsapp }
  });

  await recordAudit(session, 'settings.whatsapp', 'SiteSetting', supportWhatsAppKey);
  revalidatePath('/contact');
  redirect(`${listPath}?saved=whatsapp`);
}
