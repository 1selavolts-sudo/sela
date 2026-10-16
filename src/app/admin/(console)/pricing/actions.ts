'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { kigaliDateTime, pricingCreateSchema } from '@/lib/validation';

const listPath = '/admin/pricing';

function refreshSite() {
  revalidatePath('/', 'layout');
}

// The end, if given, must come after the start. Returns null when the times do not work.
function ruleTimes(validFromText: string, validToText: string | null) {
  const validFrom = kigaliDateTime(validFromText);
  const validTo = validToText ? kigaliDateTime(validToText) : null;
  if (!validFrom || (validToText && !validTo) || (validTo && validTo <= validFrom)) {
    return null;
  }
  return { validFrom, validTo };
}

async function stationExists(stationId: string | null) {
  if (!stationId) return true;
  const station = await prisma.station.findUnique({ where: { id: stationId }, select: { id: true } });
  return Boolean(station);
}

export async function createPricingRule(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = pricingCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const times = ruleTimes(parsed.data.validFrom, parsed.data.validTo);
  if (!times) {
    redirect(`${listPath}?error=dates`);
  }
  if (!(await stationExists(parsed.data.stationId))) {
    redirect(`${listPath}?error=no-station`);
  }

  const rule = await prisma.pricingRule.create({
    data: {
      stationId: parsed.data.stationId,
      connectorType: parsed.data.connectorType,
      pricePerKwh: parsed.data.pricePerKwh,
      currency: 'RWF',
      ...times
    }
  });
  await recordAudit(session, 'pricing.create', 'PricingRule', rule.id);
  refreshSite();
  redirect(`${listPath}?saved=created`);
}

// Edits every part of a rate: scope, price and times.
export async function updatePricingRule(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.pricingRule.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = pricingCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const times = ruleTimes(parsed.data.validFrom, parsed.data.validTo);
  if (!times) {
    redirect(`${listPath}/${id}?error=dates`);
  }
  if (!(await stationExists(parsed.data.stationId))) {
    redirect(`${listPath}/${id}?error=no-station`);
  }

  await prisma.pricingRule.update({
    where: { id },
    data: {
      stationId: parsed.data.stationId,
      connectorType: parsed.data.connectorType,
      pricePerKwh: parsed.data.pricePerKwh,
      ...times
    }
  });
  await recordAudit(session, 'pricing.update', 'PricingRule', id);
  refreshSite();
  redirect(`${listPath}/${id}?saved=1`);
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
