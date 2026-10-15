import { prisma } from '@/lib/prisma';

async function databaseIsReachable() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Log the detail server-side only; it can include the database host.
    console.error('Health check database query failed:', error);
    return false;
  }
}

export async function GET() {
  const healthy = await databaseIsReachable();
  return Response.json(
    { status: healthy ? 'ok' : 'degraded', service: 'selavolt', database: 'postgresql', timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST() {
  const healthy = await databaseIsReachable();
  return Response.json({ status: healthy ? 'ok' : 'degraded', database: 'postgresql' }, { status: healthy ? 200 : 503 });
}
