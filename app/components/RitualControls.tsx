"use client";

import { useEffect, useState } from "react";

function setRitual(state: "unbound" | "sanctified" | "sealed") {
  document.body.classList.remove("state-sanctified", "state-sealed", "state-unbound");
  if (state !== "unbound") document.body.classList.add(`state-${state}`);
}

function setDim(n: number) {
  document.documentElement.style.setProperty("--room-dim", String(Math.max(0, Math.min(1, n))));
}

export default function RitualControls() {
  const [ritual, setRitualState] = useState<"unbound"|"sanctified"|"sealed">("unbound");
  const [dim, setDimState] = useState(0.12);

  useEffect(() => { setRitual(ritual); }, [ritual]);
  useEffect(() => { setDim(dim); }, [dim]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] bg-black/60 backdrop-blur border border-rose-900/40 rounded p-3 text-xs text-zinc-200">
      <div className="mb-2 font-semibold text-zinc-300">Ritual</div>
      <div className="flex gap-2 mb-3">
        {(["unbound","sanctified","sealed"] as const).map(r => (
          <button
            key={r}
            onClick={() => setRitualState(r)}
            className={`px-2 py-1 rounded border ${
              ritual===r ? "bg-rose-700 border-rose-800 text-white" : "bg-black/40 border-rose-900/40"
            }`}
            aria-pressed={ritual===r}
          >
            {r}
          </button>
        ))}
      </div>
      <label className="block mb-1">Dim: {dim.toFixed(2)}</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={dim}
        onChange={(e) => setDimState(Number(e.target.value))}
        className="w-48"
      />
    </div>
  );
}
