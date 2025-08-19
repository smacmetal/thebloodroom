 // C:\Users\steph\thebloodroom\app\workroom\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import RichTextEditor from "@/app/components/RichTextEditor";

// Types
type Attachment = {
  name?: string;
  url?: string;
  path?: string;
  thumbUrl?: string;
  type?: string;
};

type Note = {
  id: string;                 // stable uid
  author?: string;            // optional
  content?: string;           // plain text (derived)
  contentHtml?: string;       // rich HTML
  attachments?: Attachment[];
  timestamp?: number;         // epoch ms
};

// Safe helpers
function toPlainTextFromHtml(html: string) {
  if (!html) return "";
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

export default function WorkroomPage() {
  // Compose state
  const [html, setHtml] = useState<string>("<p></p>");
  const [submitting, setSubmitting] = useState(false);

  // Feed / listing
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing notes (defensive: always normalize to an array)
  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/workroom/notes", { cache: "no-store" });
      const data = await res.json().catch(() => ({} as any));

      // Accept several shapes:
      // - { notes: [...] }
      // - { messages: [...] }
      // - [ ... ]
      let list: unknown =
        (data && (data.notes ?? data.messages)) !== undefined
          ? data.notes ?? data.messages
          : data;

      if (!Array.isArray(list)) list = [];
      // Coerce each item to Note shape with safe defaults
      const normalized: Note[] = (list as any[]).map((it, i) => ({
        id:
          it?.id ??
          it?.uid ??
          it?._id ??
          `work-${Date.now()}-${i}`, // fallback
        author: it?.author ?? "Workroom",
        content: typeof it?.content === "string" ? it.content : "",
        contentHtml:
          typeof it?.contentHtml === "string" && it.contentHtml.trim()
            ? it.contentHtml
            : (typeof it?.content === "string" ? it.content : ""),
        attachments: Array.isArray(it?.attachments) ? it.attachments : [],
        timestamp:
          typeof it?.timestamp === "number"
            ? it.timestamp
            : Date.parse(it?.createdAt || "") || Date.now(),
      }));

      setNotes(normalized);
    } catch (e) {
      console.error("Failed to load workroom notes:", e);
      setNotes([]); // defensive default
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const recent = useMemo(() => notes, [notes]);

  async function submitNote() {
    const contentHtml = (html || "").trim();
    const content = toPlainTextFromHtml(contentHtml);

    if (!content && !contentHtml) {
      alert("Please write something first.");
      return;
    }

    setSubmitting(true);
    try {
      // Minimal payload; your API already exists in build as /api/workroom/notes
      const res = await fetch("/api/workroom/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "King", // or whoever is logged-in; adjust if you add auth
          content,
          contentHtml,
          attachments: [], // handled later if you add upload here
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      // Reset editor and refresh list
      setHtml("<p></p>");
      await loadNotes();
    } catch (e) {
      console.error(e);
      alert("Failed to save note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 bg-[#0b0709] text-[#fbe9ed]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title Banner (matches temples) */}
        <div className="rounded-2xl border border-[#4b2228] bg-[#261217] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
          <h1 className="text-4xl font-bold text-[#ffe0e7] flex items-center gap-2">
            🛠️ Workroom
          </h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Draft, plan, and iterate. Rich Text with quotes, lists, code, and blocks. All saved into
            the Vault’s lineage.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] backdrop-blur-md p-5 space-y-4">
          <RichTextEditor value={html} onChange={setHtml} />

          <div className="flex justify-end">
            <button
              onClick={submitNote}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-white transition disabled:opacity-50"
              style={{ backgroundColor: "#b3121f" }}
            >
              {submitting ? "Saving…" : "Save to Workroom"}
            </button>
          </div>
        </div>

        {/* Notes feed (defensive rendering) */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] backdrop-blur-md p-5">
          {loading ? (
            <div className="text-[#d7aeb6] text-sm">Loading…</div>
          ) : !Array.isArray(recent) || recent.length === 0 ? (
            <div className="text-[#b98790] text-sm">No workroom notes yet.</div>
          ) : (
            <ul className="space-y-4">
              {recent.map((m) => {
                const ts =
                  typeof m.timestamp === "number" ? m.timestamp : Date.now();
                const hasHtml =
                  typeof m.contentHtml === "string" &&
                  m.contentHtml.trim().length > 0;
                const atts = Array.isArray(m.attachments)
                  ? m.attachments
                  : [];

                return (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-[#4b2228] bg-[#261217] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] hover:border-[#95313c] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#ffe0e7]">
                        <span className="mr-2 font-semibold">
                          {m.author || "—"}
                        </span>
                      </div>
                      <div className="text-xs text-[#e0a8b1]">
                        {new Date(ts).toLocaleString()}
                      </div>
                    </div>

                    {hasHtml ? (
                      <div
                        className="mt-2 text-[#fff0f3] whitespace-pre-wrap editor-content"
                        dangerouslySetInnerHTML={{ __html: m.contentHtml! }}
                      />
                    ) : m.content && m.content.trim() !== "" ? (
                      <div className="mt-2 text-[#fff0f3] whitespace-pre-wrap">
                        {m.content}
                      </div>
                    ) : null}

                    {atts.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {atts.map((a, i) => (
                          <a
                            key={`${m.id}-att-${i}`}
                            href={a.url || a.path || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline text-[#ffd7de] truncate"
                            title={a.name || a.path || a.url || "attachment"}
                          >
                            {a.name || a.path || a.url || "attachment"}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

