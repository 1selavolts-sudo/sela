'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { kigaliDateTime, pricingCreateSchema, pricingUpdateSchema } from '@/lib/validation';

const listPath = '/admin/pricing';

function refreshSite() {
  revalidatePath('/', 'layout');
}

export async function createPricingRule(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = pricingCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const validFrom = kigaliDateTime(parsed.data.validFrom);
  const validTo = parsed.data.validTo ? kigaliDateTime(parsed.data.validTo) : null;
  if (!validFrom || (parsed.data.validTo && !validTo) || (validTo && validTo <= validFrom)) {
    redirect(`${listPath}?error=dates`);
  }

  if (parsed.data.stationId) {
    const station = await prisma.station.findUnique({ where: { id: parsed.data.stationId }, select: { id: true } });
    if (!station) {
      redirect(`${listPath}?error=no-station`);
    }
  }

  const rule = await prisma.pricingRule.create({
    data: {
      stationId: parsed.data.stationId,
      connectorType: parsed.data.connectorType,
      pricePerKwh: parsed.data.pricePerKwh,
      currency: 'RWF',
      validFrom,
      validTo
    }
  });
  await recordAudit(session, 'pricing.create', 'PricingRule', rule.id);
  refreshSite();
  redirect(`${listPath}?saved=created`);
}

export async function updatePricingRule(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const rule = await prisma.pricingRule.findUnique({ where: { id }, select: { validFrom: true } });
  if (!rule) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = pricingUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const validTo = parsed.data.validTo ? kigaliDateTime(parsed.data.validTo) : null;
  if (parsed.data.validTo && (!validTo || validTo <= rule.validFrom)) {
    redirect(`${listPath}?error=dates`);
  }

  await prisma.pricingRule.update({ where: { id }, data: { pricePerKwh: parsed.data.pricePerKwh, validTo } });
  await recordAudit(session, 'pricing.update', 'PricingRule', id);
  refreshSite();
  redirect(`${listPath}?saved=updated`);
}

export async function deletePricingRule(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.pricingRule.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  await prisma.pricingRule.delete({ where: { id } });
  await recordAudit(session, 'pricing.delete', 'PricingRule', id);
  refreshSite();
  redirect(`${listPath}?saved=deleted`);
}
