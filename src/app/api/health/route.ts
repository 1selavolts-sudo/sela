import { getMongoDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const database = await getMongoDatabase();
    await database.command({ ping: 1 });
    return Response.json({ status: 'ok', service: 'selavolt', database: 'mongodb', timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ status: 'degraded', service: 'selavolt', database: 'mongodb', error: error instanceof Error ? error.message : 'MongoDB unavailable' }, { status: 503 });
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST() {
  try {
    const database = await getMongoDatabase();
    await database.command({ ping: 1 });
    return Response.json({ status: 'ok', database: 'mongodb' });
  } catch (error) {
    return Response.json({ status: 'degraded', database: 'mongodb', error: error instanceof Error ? error.message : 'MongoDB unavailable' }, { status: 503 });
  }
}