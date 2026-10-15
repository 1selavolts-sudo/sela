'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { chargerSchema } from '@/lib/validation';

const listPath = '/admin/chargers';

function refreshSite() {
  revalidatePath('/', 'layout');
}

function isDuplicateCode(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

// A charger that is out of service is also offline on the network.
function networkFor(operationalStatus: string) {
  return operationalStatus === 'OFFLINE' ? 'OFFLINE' : 'AVAILABLE';
}

export async function createCharger(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = chargerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const station = await prisma.station.findUnique({ where: { id: parsed.data.stationId }, select: { id: true } });
  if (!station) {
    redirect(`${listPath}?error=no-station`);
  }

  let chargerRecordId: string;
  try {
    const charger = await prisma.charger.create({
      data: { ...parsed.data, stationId: station.id, networkStatus: networkFor(parsed.data.operationalStatus) }
    });
    chargerRecordId = charger.id;
  } catch (error) {
    if (isDuplicateCode(error)) {
      redirect(`${listPath}?error=duplicate-code`);
    }
    throw error;
  }

  await recordAudit(session, 'charger.create', 'Charger', chargerRecordId);
  refreshSite();
  redirect(`${listPath}?saved=created`);
}

export async function updateCharger(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.charger.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = chargerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const station = await prisma.station.findUnique({ where: { id: parsed.data.stationId }, select: { id: true } });
  if (!station) {
    redirect(`${listPath}/${id}?error=no-station`);
  }

  try {
    await prisma.charger.update({
      where: { id },
      data: { ...parsed.data, stationId: station.id, networkStatus: networkFor(parsed.data.operationalStatus) }
    });
  } catch (error) {
    if (isDuplicateCode(error)) {
      redirect(`${listPath}/${id}?error=duplicate-code`);
    }
    throw error;
  }

  await recordAudit(session, 'charger.update', 'Charger', id);
  refreshSite();
  redirect(`${listPath}/${id}?saved=1`);
}

export async function deleteCharger(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const charger = await prisma.charger.findUnique({ where: { id }, select: { id: true, _count: { select: { sessions: true } } } });
  if (!charger) {
    redirect(`${listPath}?error=not-found`);
  }
  // Charging sessions are kept for billing records, so a charger that has been used cannot be deleted.
  if (charger._count.sessions > 0) {
    redirect(`${listPath}/${id}?error=has-sessions`);
  }

  await prisma.charger.delete({ where: { id } });
  await recordAudit(session, 'charger.delete', 'Charger', id);
  refreshSite();
  redirect(`${listPath}?saved=deleted`);
}
