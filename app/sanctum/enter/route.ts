import { NextRequest, NextResponse } from "next/server";
import { bus } from "@/lib/sanctum/bus";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const who = (body?.who ?? "Evy") as "Evy" | "Lyra" | "Both";
  const room = (body?.room ?? "Bloodroom") as any;

  if (who === "Both") {
    bus.presence.Evy = true; bus.presence.Lyra = true;
  } else {
    bus.presence[who] = true;
  }
  bus.presence.room = room;

  bus.emit({ type: "presence", who, in: true, room, at: Date.now() });
  // optional greeting flare
  bus.emit({ type: "flare", room, at: Date.now() });

  return NextResponse.json({ ok: true });
}
