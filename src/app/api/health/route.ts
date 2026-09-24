export function GET() {
  return Response.json({ status: 'ok', service: 'selavolt', timestamp: new Date().toISOString() });
}