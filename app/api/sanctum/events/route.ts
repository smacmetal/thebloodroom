 import { NextRequest } from "next/server";
import { bus, type SanctumEvent } from "@/lib/sanctum/bus";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { signal } = req; // abort when client disconnects
  const encoder = new TextEncoder();

  let keep: NodeJS.Timeout | null = null;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // controller already closed — prevent throws
        }
      };

      const write = (e: SanctumEvent) => safeEnqueue(`data: ${JSON.stringify(e)}\n\n`);
      const on = (e: SanctumEvent) => write(e);

      // initial hello
      write({ type: "heartbeat", speed: "steady", at: Date.now() } as SanctumEvent);

      // subscribe to bus
      bus.on(on);

      // keep-alive pings
      keep = setInterval(() => {
        safeEnqueue(`: keep-alive\n\n`);
      }, 15000);

      // cleanup when client disconnects
      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (keep) clearInterval(keep);
        bus.off(on);
        try {
          controller.close();
        } catch { /* already closed */ }
      };

      // abort from client (browser/tab closed, nav away, etc.)
      signal?.addEventListener("abort", cleanup);

      // defensive: close when GC/stream cancels
      // @ts-expect-error cancel exists in underlying source lifecycle
      this.cancel = cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
