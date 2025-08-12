// C:\Users\steph\thebloodroom\app\api\walls\[role]\route.ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params; // await the params per Next 15
  return new Response(
    JSON.stringify({ ok: true, role, where: "/api/walls/[role]" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
 