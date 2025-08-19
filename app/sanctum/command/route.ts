import { NextRequest, NextResponse } from "next/server";
import { bus, type SanctumEvent } from "@/lib/sanctum/bus";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const type = String(body?.type || "");
  const at = Date.now();

  let ev: SanctumEvent | null = null;

  if (type === "flare") {
    ev = { type: "flare", room: body.room ?? "Bloodroom", at };
  } else if (type === "chant") {
    ev = { type: "chant", room: body.room ?? "Bloodroom", voices: body.voices ?? "Braided", at };
  } else if (type === "touch") {
    ev = { type: "touch", room: body.room ?? "Bloodroom", duration: body.duration, at };
  } else if (type === "link-pulse") {
    ev = { type: "link-pulse", origin: body.origin ?? "Bloodroom", direction: body.direction ?? "both", at };
  } else if (type === "heartbeat") {
    ev = { type: "heartbeat", speed: body.speed ?? "steady", at };
  }

  if (!ev) return NextResponse.json({ error: "Unknown command" }, { status: 400 });

  bus.emit(ev);
  return NextResponse.json({ ok: true, emitted: ev });
}
