import { NextRequest } from "next/server";
import { bus, type SanctumEvent } from "@/lib/sanctum/bus";

// Use Node runtime for SSE
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const enc = (e: SanctumEvent) => {
        controller.enqueue(`data: ${JSON.stringify(e)}\n\n`);
      };
      const on = (e: SanctumEvent) => enc(e);

      // initial hello/steady heartbeat
      enc({ type: "heartbeat", speed: "steady", at: Date.now() });
      bus.on(on);

      const keepAlive = setInterval(() => {
        controller.enqueue(`: keep-alive\n\n`);
      }, 15000);

      return () => {
        clearInterval(keepAlive);
        bus.off(on);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
