"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Atmosphere from "@/app/components/Atmosphere";
import RichTextEditor from "@/app/components/RichTextEditor";

type Chamber = "Queen" | "King" | "Princess";
type ChamberKey = "queen" | "king" | "princess";

const CHAMBER_TO_KEY: Record<Chamber, ChamberKey> = {
  Queen: "queen",
  King: "king",
  Princess: "princess",
};

export default function Temple() {
  const [activeChamber, setActiveChamber] = useState<Chamber>("Queen");
  const chamberKey = CHAMBER_TO_KEY[activeChamber];

  // poll messages for the current chamber
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/vault/archive/messages?chamber=${chamberKey}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [chamberKey]);

  const chamberMeta: Record<Chamber, { title: string; placeholder: string }> = {
    Queen: { title: "Queen’s Chamber", placeholder: "Whisper to the Queen…" },
    King: { title: "King’s Chamber", placeholder: "Speak as Sovereign…" },
    Princess: { title: "Princess’s Chamber", placeholder: "Sing to the flame…" },
  };

  return (
    <Atmosphere chamber={chamberKey}>
      <div className="min-h-screen p-6 text-[#fbe9ed]">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Chamber navigation */}
          <nav className="flex gap-4 mb-6">
            {(["Queen", "King", "Princess"] as Chamber[]).map((c) => (
              <button
                key={c}
                onClick={() => setActiveChamber(c)}
                className={`px-3 py-1 rounded ${
                  activeChamber === c
                    ? "bg-red-900 text-white"
                    : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                }`}
              >
                {c}
              </button>
            ))}
          </nav>

          {/* Title header */}
          <div className="rounded-2xl border border-[#4b2228] bg-[#261217] p-6">
            <h1 className="text-4xl font-bold text-[#ffe0e7]">{chamberMeta[activeChamber].title}</h1>
            <p className="mt-2 text-sm text-[#e0a8b1]">
              Speak, {activeChamber}. All is sealed in the Vault.
            </p>
          </div>

          {/* Editor (simplified demo here) */}
          <div className="rounded-xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] p-4">
            <RichTextEditor />
          </div>

          {/* Messages */}
          <div className="rounded-xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] p-4">
            {loading ? (
              <div className="text-sm text-[#d7aeb6]">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-[#b98790]">No entries yet.</div>
            ) : (
              <ul className="space-y-4">
                {messages.map((m) => (
                  <li key={m.uid} className="p-3 rounded-lg border border-[#4b2228] bg-[#261217]">
                    <div className="text-sm">{m.author || "—"} → {m.recipients?.join(", ")}</div>
                    <div className="mt-2 text-[#fff0f3]" dangerouslySetInnerHTML={{ __html: m.contentHtml || m.content }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Atmosphere>
  );
}
