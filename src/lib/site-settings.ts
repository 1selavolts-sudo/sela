import { prisma } from './prisma';

// Values the Control Center can change without a deploy. Keys are stored in the SiteSetting table.
export const supportWhatsAppKey = 'support.whatsapp';

// Used until an admin saves a different number.
export const defaultSupportWhatsApp = '0789662677';

// Stored as a local Rwandan mobile number (07…), digits only.
export async function supportWhatsApp(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: supportWhatsAppKey }, select: { value: true } });
    return setting?.value ?? defaultSupportWhatsApp;
  } catch (error) {
    // The Contact page should still load if the database is briefly unavailable.
    console.error('Loading the support WhatsApp number failed:', error);
    return defaultSupportWhatsApp;
  }
}

// 0789662677 reads as 0789 662 677.
export function formatLocalNumber(digits: string) {
  return digits.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
}

// WhatsApp links use the international form without the leading 0: 250789662677.
export function whatsappLink(localNumber: string) {
  return `https://wa.me/250${localNumber.replace(/^0/, '')}`;
}
