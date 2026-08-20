export function GET() {
  return Response.json({ status: "ok", service: "hominsu-frontend", timestamp: new Date().toISOString() });
}
