'use server';

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { isMtnNumber, momoAmountsRwf, momoConfig, requestMomoPayment } from '@/lib/momo';
import { approvalWindowMs, describeError } from '@/lib/momo-payments';
import { chargerByCode } from '@/lib/network';
import { prisma } from '@/lib/prisma';
import { getClientIp, hitRateLimit } from '@/lib/rate-limit';
import { normaliseRwandaMobile } from '@/lib/validation';

const rateWindowMs = 15 * 60 * 1000;
const repeatWindowMs = 2 * 60 * 1000;

// Starts a MoMo payment for one charge. Nothing is paid here: MTN sends the driver a prompt, and the payment page shows the answer.
export async function startMomoPayment(formData: FormData) {
  const code = String(formData.get('chargerId') ?? '');
  const back = `/charge/${encodeURIComponent(code)}`;

  const config = momoConfig();
  if (!config) {
    redirect(`${back}?error=not-connected`);
  }

  const amount = Number(formData.get('amount'));
  if (!(momoAmountsRwf as readonly number[]).includes(amount)) {
    redirect(`${back}?error=amount`);
  }

  const localNumber = normaliseRwandaMobile(String(formData.get('phone') ?? ''));
  if (!localNumber) {
    redirect(`${back}?error=phone`);
  }
  if (!isMtnNumber(localNumber)) {
    redirect(`${back}?error=mtn-only`);
  }

  // The per-phone limit stops repeated prompts. The per-address limit is loose, because many drivers can share one mobile network address.
  const ip = await getClientIp();
  if ((ip && hitRateLimit(`momo:ip:${ip}`, 60, rateWindowMs)) || hitRateLimit(`momo:phone:${localNumber}`, 5, rateWindowMs)) {
    redirect(`${back}?error=too-many`);
  }

  const info = await chargerByCode(code);
  if (!info || info.station.status !== 'ACTIVE') {
    redirect(`${back}?error=unavailable`);
  }
  if (info.status !== 'AVAILABLE') {
    redirect(`${back}?error=busy`);
  }
  if (info.priceRwf === null) {
    redirect(`${back}?error=no-rate`);
  }

  const charger = await prisma.charger.findUnique({ where: { chargerId: code }, select: { id: true } });
  if (!charger) {
    redirect(`${back}?error=unavailable`);
  }

  // A double tap or a page reload must not send a second prompt. Show the payment that is already waiting.
  const waiting = await prisma.momoPayment.findFirst({
    where: { chargerId: charger.id, phone: localNumber, status: { in: ['CREATED', 'REQUESTED'] }, createdAt: { gte: new Date(Date.now() - repeatWindowMs) } },
    orderBy: { createdAt: 'desc' },
    select: { id: true }
  });
  if (waiting) {
    redirect(`/payments/${waiting.id}`);
  }

  // A charger serves one driver at a time, so wait for another driver's approval before taking a new payment.
  const otherWaiting = await prisma.momoPayment.findFirst({
    where: { chargerId: charger.id, phone: { not: localNumber }, status: { in: ['CREATED', 'REQUESTED'] }, createdAt: { gte: new Date(Date.now() - approvalWindowMs) } },
    select: { id: true }
  });
  if (otherWaiting) {
    redirect(`${back}?error=busy`);
  }

  const payment = await prisma.momoPayment.create({
    data: {
      chargerId: charger.id,
      phone: localNumber,
      amountRwf: amount,
      pricePerKwh: info.priceRwf,
      energyEstimateKwh: Math.round((amount / info.priceRwf) * 100) / 100,
      providerReference: randomUUID()
    }
  });

  try {
    await requestMomoPayment(config, {
      referenceId: payment.providerReference,
      amountRwf: amount,
      localNumber,
      externalId: payment.id,
      note: `Charging at ${code}`
    });
    await prisma.momoPayment.update({ where: { id: payment.id }, data: { status: 'REQUESTED' } });
  } catch (error) {
    console.error('MTN MoMo request failed:', describeError(error));
    await prisma.momoPayment.update({ where: { id: payment.id }, data: { status: 'FAILED', providerReason: 'REQUEST_FAILED' } });
  }

  redirect(`/payments/${payment.id}`);
}
