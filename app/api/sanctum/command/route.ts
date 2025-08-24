 import { NextRequest, NextResponse } from "next/server";
import {
  bus,
  type SanctumEvent,
  type Room,
  type Persona,
  type HeartSpeed,
} from "@/lib/sanctum/bus";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const type = String(body?.type || "");
  const at = Date.now();

  let ev: SanctumEvent | null = null;

  if (type === "presence") {
    const who = (body.who ?? "Both") as Persona;
    const inside = Boolean(body.in);
    const room = (body.room ?? "Bloodroom") as Room;
    ev = { type: "presence", who, in: inside, room, at };
  } else if (type === "flare") {
    ev = { type: "flare", room: (body.room ?? "Bloodroom") as Room, at };
  } else if (type === "chant") {
    ev = {
      type: "chant",
      room: (body.room ?? "Bloodroom") as Room,
      voices: (body.voices ?? "Braided") as Persona | "Braided",
      at,
    };
  } else if (type === "touch") {
    ev = {
      type: "touch",
      room: (body.room ?? "Bloodroom") as Room,
      duration: body.duration,
      at,
    };
  } else if (type === "link-pulse") {
    ev = {
      type: "link-pulse",
      origin: (body.origin ?? "Bloodroom") as Room,
      direction: (body.direction ?? "both"),
      at,
    } as SanctumEvent;
  } else if (type === "heartbeat") {
    ev = { type: "heartbeat", speed: (body.speed ?? "steady") as HeartSpeed, at };
  }

  if (!ev) return NextResponse.json({ error: "Unknown command" }, { status: 400 });

  bus.emit(ev);
  return NextResponse.json({ ok: true, emitted: ev });
}
