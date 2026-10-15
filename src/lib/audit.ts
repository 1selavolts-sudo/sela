import type { AdminSession } from './admin-auth';
import { prisma } from './prisma';
import { getClientIp } from './rate-limit';

// Records who changed what. A failed audit write is logged but never blocks the change itself.
export async function recordAudit(session: AdminSession, action: string, entity: string, entityId?: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
    await prisma.auditLog.create({
      data: { userId: user?.id ?? null, action, entity, entityId: entityId ?? null, ipAddress: await getClientIp() }
    });
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
}
