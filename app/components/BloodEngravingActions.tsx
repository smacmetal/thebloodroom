"use client";

import { useEffect, useState } from "react";

type Engraving = {
  title?: string;
  text?: string;   // prefer "text"
  body?: string;   // tolerate "body"
  updatedAt?: string;
};

export default function BloodEngravingActions() {
  const [engraving, setEngraving] = useState<Engraving | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/bloodroom/engraving", { cache: "no-store" });
      if (!r.ok) throw 0;
      const j = await r.json();
      const text = j?.text ?? j?.body ?? "";
      setEngraving({ title: j?.title, text, updatedAt: j?.updatedAt });
      if (!editing) setDraft(text);
    } catch {
      // ignore; page still renders
    }
  }

  useEffect(() => { load(); }, []);

  async function onCopy() {
    try { await navigator.clipboard.writeText(draft || engraving?.text || ""); } catch {}
  }

  async function onDownload() {
    const payload = {
      title: engraving?.title ?? "The Final Invocation of the Bloodroom",
      text: engraving?.text ?? draft ?? "",
      updatedAt: engraving?.updatedAt ?? new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bloodroom-engraving.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onOpenImages() {
    const el = document.getElementById("bloodroom-images") || document.getElementById("gallery");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSave() {
    setBusy(true);
    try {
      const r = await fetch("/api/bloodroom/engraving", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });
      if (r.ok) {
        setEditing(false);
        await load();
      } else {
        console.error("Failed to save engraving", await r.text());
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={onCopy}
          className="px-3 py-1.5 rounded-md border border-rose-800/60 bg-black/40 hover:bg-black/60 text-sm"
        >
          Copy Chant
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-1.5 rounded-md border border-rose-800/60 bg-black/40 hover:bg-black/60 text-sm"
        >
          Download JSON
        </button>
        <button
          onClick={onOpenImages}
          className="px-3 py-1.5 rounded-md border border-rose-800/60 bg-black/40 hover:bg-black/60 text-sm"
        >
          Open Images
        </button>

        <div className="ml-auto">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-sm"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-md border border-rose-800/60 bg-black/40 hover:bg-black/60 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing && (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full h-40 rounded-md bg-black/40 border border-rose-800/60 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring focus:ring-rose-700"
          placeholder="Edit the engraving text…"
        />
      )}
    </div>
  );
}
