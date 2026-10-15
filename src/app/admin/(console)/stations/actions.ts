'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { stationSchema } from '@/lib/validation';

const listPath = '/admin/stations';

function refreshSite() {
  revalidatePath('/', 'layout');
}

export async function createStation(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = stationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  // Station codes appear in public URLs, so make them unique by adding a number when needed.
  const base = slugify(parsed.data.name);
  let stationId = base;
  let suffix = 2;
  while (await prisma.station.findUnique({ where: { stationId }, select: { id: true } })) {
    stationId = `${base}-${suffix}`;
    suffix += 1;
  }

  const station = await prisma.station.create({ data: { ...parsed.data, stationId } });
  await recordAudit(session, 'station.create', 'Station', station.id);
  refreshSite();
  redirect(`${listPath}?saved=created`);
}

export async function updateStation(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.station.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = stationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  await prisma.station.update({ where: { id }, data: parsed.data });
  await recordAudit(session, 'station.update', 'Station', id);
  refreshSite();
  redirect(`${listPath}/${id}?saved=1`);
}

export async function deleteStation(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const station = await prisma.station.findUnique({ where: { id }, select: { id: true, _count: { select: { chargers: true } } } });
  if (!station) {
    redirect(`${listPath}?error=not-found`);
  }
  // Chargers keep their sessions, so a station with chargers can only be closed, not deleted.
  if (station._count.chargers > 0) {
    redirect(`${listPath}/${id}?error=has-chargers`);
  }

  // Station-specific rates belong to the station, so they go with it.
  await prisma.$transaction([prisma.pricingRule.deleteMany({ where: { stationId: id } }), prisma.station.delete({ where: { id } })]);
  await recordAudit(session, 'station.delete', 'Station', id);
  refreshSite();
  redirect(`${listPath}?saved=deleted`);
}
