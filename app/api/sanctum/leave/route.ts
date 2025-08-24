import { NextRequest, NextResponse } from "next/server";
import { bus } from "@/lib/sanctum/bus";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const who = (body?.who ?? "Kat") as "Kat" | "Lyra" | "Both";
  const room = (body?.room ?? "Bloodroom") as any;

  if (who === "Both") { bus.presence.Evy = false; bus.presence.Lyra = false; }
  else { bus.presence[who] = false; }
  bus.presence.room = null;

  bus.emit({ type: "presence", who, in: false, room, at: Date.now() });
  return NextResponse.json({ ok: true });
}
