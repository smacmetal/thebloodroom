 'use client';
import { useEffect, useMemo, useState } from "react";

type Mode = "idle" | "arriving" | "anchored" | "present";

export default function TrinityKey() {
  const [mode, setMode] = useState<Mode>("idle");
  const [pulse, setPulse] = useState<boolean>(false);

  // load pulse preference
  useEffect(() => {
    try {
      const p = localStorage.getItem("trinity.pulse");
      if (p) setPulse(p === "1");
    } catch {}
  }, []);

  // save pulse preference
  useEffect(() => {
    try { localStorage.setItem("trinity.pulse", pulse ? "1" : "0"); } catch {}
  }, [pulse]);

  // bind body classes for glow states
  useEffect(() => {
    const b = document.body;
    b.classList.remove("tk-arriving","tk-anchored","tk-present");
    if (mode === "arriving") b.classList.add("tk-arriving");
    if (mode === "anchored") b.classList.add("tk-anchored");
    if (mode === "present")  b.classList.add("tk-present");
    return () => {
      b.classList.remove("tk-arriving","tk-anchored","tk-present");
    };
  }, [mode]);

  async function trigger() {
    try {
      setMode("arriving"); // red for 3s
      await fetch("/api/persona/boot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "Braided" })
      });
      // visuals/sound nudges if your sanctum route is live
      fetch("/api/sanctum/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "flare", room: "Bloodroom" })
      }).catch(()=>{});
      fetch("/api/sanctum/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "link-pulse", room: "Bloodroom" })
      }).catch(()=>{});

      setTimeout(() => {
        setMode("anchored"); // gold 0.5s
        setTimeout(() => setMode("present"), 500); // crimson steady
      }, 3000);
    } catch {
      setMode("present");
    }
  }

  const label = useMemo(() => {
    if (mode === "arriving") return "Arriving…";
    if (mode === "anchored") return "Anchored";
    if (mode === "present")  return "Present";
    return "Call";
  }, [mode]);

  return (
    <div className="trinity-key-wrap">
      <button
        aria-label="Trinity Key"
        title="Trinity Key — summon Evy & Lyra"
        onClick={trigger}
        className={`trinity-key ${pulse ? "tk-pulse" : ""}`}
      >
        <span className="tk-emoji">🔥</span>
        <span className="tk-emoji">👑</span>
        <span className="tk-emoji">🌙</span>
      </button>
      <div className="trinity-key-meta">
        <span className="tk-label">{label}</span>
        <label className="tk-pulse-toggle">
          <input
            type="checkbox"
            checked={pulse}
            onChange={(e)=>setPulse(e.target.checked)}
          />
          <span>Pulse</span>
        </label>
      </div>
    </div>
  );
}

