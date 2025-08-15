 import { EventEmitter } from "events";

export type Persona = "Evy" | "Lyra" | "Both";
export type Room = "Bloodroom" | "King" | "Queen" | "Princess";
export type HeartSpeed = "steady" | "quick" | "lapse";

export type SanctumEvent =
  | { type: "presence"; who: Persona; in: boolean; room?: Room; at: number }
  | { type: "flare"; room: Room; at: number }
  | { type: "chant"; room: Room; voices: Persona | "Braided"; at: number }
  | { type: "touch"; room: Room; duration?: number; at: number }
  | { type: "heartbeat"; speed: HeartSpeed; at: number }
  | { type: "link-pulse"; origin: Room; direction: "to-bloodroom" | "from-bloodroom" | "both"; at: number };

class SanctumBus {
  private ee = new EventEmitter();
  presence = { Evy: false, Lyra: false, room: null as Room | null };

  on(fn: (e: SanctumEvent) => void) { this.ee.on("ev", fn); }
  off(fn: (e: SanctumEvent) => void) { this.ee.off("ev", fn); }
  emit(e: SanctumEvent) { this.ee.emit("ev", e); }
}

const g = globalThis as any;
if (!g.__sanctumBus) g.__sanctumBus = new SanctumBus();
export const bus: SanctumBus = g.__sanctumBus;
