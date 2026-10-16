import { momoConfig, momoPaymentStatus, type MomoOutcome } from './momo';
import { prisma } from './prisma';

// A driver who has not approved within this time gets a closed payment, so the page never waits forever.
export const approvalWindowMs = 10 * 60 * 1000;

export function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'unknown error';
}

export function findMomoPayment(id: string) {
  return prisma.momoPayment.findUnique({ where: { id }, include: { charger: { include: { station: true } } } });
}

// Asks MTN for the latest answer while a driver is waiting. A payment becomes PAID only when MTN says it succeeded.
export async function currentMomoPayment(id: string) {
  const payment = await findMomoPayment(id);
  if (!payment || payment.status !== 'REQUESTED') return payment;

  if (Date.now() - payment.createdAt.getTime() > approvalWindowMs) {
    return prisma.momoPayment.update({
      where: { id },
      data: { status: 'FAILED', providerReason: 'EXPIRED' },
      include: { charger: { include: { station: true } } }
    });
  }

  const config = momoConfig();
  if (!config) return payment;

  let outcome: MomoOutcome;
  try {
    outcome = await momoPaymentStatus(config, payment.providerReference);
  } catch (error) {
    console.error('MTN MoMo status check failed:', describeError(error));
    return payment;
  }

  if (outcome.status === 'SUCCESSFUL') {
    return prisma.momoPayment.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date(), financialTransactionId: outcome.financialTransactionId, providerReason: null },
      include: { charger: { include: { station: true } } }
    });
  }
  if (outcome.status === 'FAILED') {
    return prisma.momoPayment.update({
      where: { id },
      data: { status: 'FAILED', providerReason: outcome.reason ?? 'FAILED' },
      include: { charger: { include: { station: true } } }
    });
  }
  return payment;
}
