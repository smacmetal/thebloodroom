'use client';

import { useEffect, useRef, useState } from "react";

type Notes = { content: string; updatedAt: string };

export default function Workpad() {
  const [notes, setNotes] = useState<Notes>({ content: "", updatedAt: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/workroom/notes", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (alive) setNotes(data.notes as Notes);
      } catch {
        // fall through: empty pad
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function onChange(v: string) {
    setNotes(n => ({ ...n, content: v }));
    setDirty(true);
    // simple debounce autosave (1.2s)
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      doSave();
    }, 1200);
  }

  async function doSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/workroom/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notes.content }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setNotes(data.notes as Notes);
      setDirty(false);
    } catch {
      // you could surface a toast here
    } finally {
      setSaving(false);
    }
  }

  async function doReload() {
    setLoading(true);
    try {
      const res = await fetch("/api/workroom/notes", { cache: "no-store" });
      const data = await res.json();
      setNotes(data.notes as Notes);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={doSave}
          disabled={saving || loading}
          className="rounded-md border border-rose-700/60 px-3 py-1.5 text-rose-200/90 hover:bg-rose-700/10 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={doReload}
          disabled={loading}
          className="rounded-md border border-rose-800/60 px-3 py-1.5 text-rose-200/80 hover:bg-rose-800/10 disabled:opacity-50"
        >
          Revert
        </button>
        <span className="text-xs text-rose-300/70">
          {loading
            ? "Loading…"
            : notes.updatedAt
            ? `Last saved: ${new Date(notes.updatedAt).toLocaleString()}${dirty ? " (unsaved changes)" : ""}`
            : dirty
            ? "Unsaved changes"
            : "New document"}
        </span>
      </div>

      <textarea
        value={notes.content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type here. Ideas, plans, drafts, dev notes—everything lives in one place."
        className="w-full min-h-[50vh] rounded-xl border border-rose-900/50 bg-black/40 p-4 outline-none focus:ring-1 focus:ring-rose-600/50"
      />

      <p className="text-xs text-rose-300/60">
        Autosaves after you pause typing. Manual <em>Save</em> and <em>Revert</em> are always available.
      </p>
    </section>
  );
}
