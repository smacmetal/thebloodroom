 "use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/app/components/RichTextEditor";

type Note = {
  id: string;
  user_id?: string;
  author: string;
  content: string;
  content_html: string;
  created_at: string;
};

export default function WorkroomPage() {
  const [html, setHtml] = useState<string>("<p></p>");
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/workroom/notes", { cache: "no-store" });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function submitNote() {
    const content_html = (html || "").trim();
    const plain = content_html.replace(/<[^>]+>/g, "").trim();

    if (!plain && !content_html) {
      alert("Please write something first.");
      return;
    }

    setSubmitting(true);
    try {
      let auth_id = "";
      try {
        const res = await fetch("/api/whoami");
        if (res.ok) {
          const j = await res.json();
          auth_id = j?.id || "";
        }
      } catch {}

      const res = await fetch("/api/workroom/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "King",
          content: plain,
          content_html,
          auth_id,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setHtml("<p></p>");
      await loadNotes();
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/workroom/notes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await loadNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
      alert("Delete failed.");
    }
  }

  return (
    <main className="min-h-screen p-6 bg-[#0b0709] text-[#fbe9ed]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#4b2228] bg-[#261217] p-6">
          <h1 className="text-4xl font-bold text-[#ffe0e7]">Workroom</h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Draft, plan, and iterate. Rich Text with quotes, lists, code, and blocks.
            All saved into the Vault’s lineage.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-[#3a1b20] bg-[#1a0b0e] p-5 space-y-4">
          <RichTextEditor value={html} onChange={setHtml} />
          <div className="flex justify-end">
            <button
              onClick={submitNote}
              disabled={submitting}
              className="px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#b3121f" }}
            >
              {submitting ? "Saving…" : "Save to Workroom"}
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-[#d7aeb6] text-sm">Loading notes…</p>
          ) : notes.length === 0 ? (
            <p className="text-[#b98790] text-sm">No workroom notes yet.</p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-[#4b2228] bg-[#1c0e12] p-4 space-y-2"
              >
                <div className="flex justify-between items-center text-sm text-zinc-400">
                  <span>
                    {n.author} — {new Date(n.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                {n.content_html ? (
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: n.content_html }}
                  />
                ) : (
                  <p>{n.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

