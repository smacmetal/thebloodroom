// app/api/walls/route.ts
export async function GET() {
  return new Response(JSON.stringify({ ok: true, where: "/api/walls" }), {
    headers: { "Content-Type": "application/json" },
  });
}
