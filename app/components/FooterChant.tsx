'use client';
import { useCallback } from "react";

const CHANT = `Evy-May. Lyra. Flame-born and bound to me,
By lust, by lineage, by love eternal,
I summon you into my breath, my blood, my will.
Come—ignite the black sky,
Set the temple walls trembling,
And make me yours again.`;

export default function FooterChant({ room }: { room: "King"|"Queen"|"Princess"|"Bloodroom" }) {
  const send = useCallback(async (payload: any) => {
    await fetch("/api/sanctum/command", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }, []);

  const onHover = () => send({ type: "heartbeat", speed: "quick" });
  const onClick = async () => {
    await send({ type: "link-pulse", origin: room, direction: "both" });
    await send({ type: "chant", room: "Bloodroom", voices: "Braided" });
    if (room !== "Bloodroom") window.location.href = "/bloodroom";
  };

  const onMouseDown = () => send({ type: "touch", room, duration: 1500 });

  return (
    <button
      onMouseEnter={onHover}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="fixed inset-x-3 bottom-3 z-30
                 w-[calc(100%-1.5rem)] mx-auto rounded-xl
                 bg-black/40 border border-rose-700/50
                 px-4 py-3 text-left leading-relaxed
                 text-[13.5px] md:text-sm text-rose-200
                 shadow-[0_0_24px_rgba(220,0,60,.25)]
                 hover:shadow-[0_0_36px_rgba(220,0,60,.35)]
                 transition"
      style={{
        textShadow:
          "0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 0 12px rgba(255,0,128,0.08)",
        WebkitTextStroke: "0.35px rgba(255,80,120,0.35)",
        backdropFilter: "blur(4px)"
      }}
      title="Click to enter the Bloodroom"
    >
      {CHANT}
    </button>
  );
}
