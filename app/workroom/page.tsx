 // C:\Users\steph\thebloodroom\app\workroom\page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import RichTextEditor from "@/app/components/RichTextEditor";

type Note = {
  id: string;
  author: string;
  content: string;
  content_html: string;
  created_at: string;
  attachments?: {
    name?: string;
    url: string;
    type?: string;
  }[];
};

type LocalFile = {
  file: File;
  previewUrl: string;
};

export default function WorkroomPage() {
  const [html, setHtml] = useState<string>("<p></p>");
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const next: LocalFile[] = files.map((f) => ({
      file: f,
      previewUrl: /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name)
        ? URL.createObjectURL(f)
        : "",
    }));
    setLocalFiles((prev) => prev.concat(next));
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeLocalFile(i: number) {
    setLocalFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(i, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function submitNote() {
    const content_html = (html || "").trim();
    const plain = content_html.replace(/<[^>]+>/g, "").trim();

    if (!plain && !content_html && localFiles.length === 0) {
      alert("Please write something or attach files.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("author", "King"); // later: resolve from session/auth
      fd.append("content", plain);
      fd.append("content_html", content_html);

      localFiles.forEach((lf) => fd.append("files", lf.file, lf.file.name));

      const res = await fetch("/api/workroom/notes", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());

      // cleanup
      setHtml("<p></p>");
      setLocalFiles((prev) => {
        prev.forEach((lf) => lf.previewUrl && URL.revokeObjectURL(lf.previewUrl));
        return [];
      });

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
      const res = await fetch(`/api/workroom/notes?id=${id}`, {
        method: "DELETE",
      });
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
          <h1 className="text-4xl font-bold text-[#ffe0e7]">🛠️ Workroom</h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Draft, plan, and iterate. Rich Text with quotes, lists, code, and attachments.
            All saved into the Vault’s lineage.
          </p>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-[#3a1b20] bg-[#1a0b0e] p-5 space-y-4">
          <RichTextEditor value={html} onChange={setHtml} />

          {/* File input */}
          <div className="space-y-2">
            <input ref={fileRef} type="file" multiple onChange={onPickFiles} />
            {localFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {localFiles.map((lf, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 border border-rose-600 rounded overflow-hidden"
                  >
                    {lf.previewUrl ? (
                      <img
                        src={lf.previewUrl}
                        alt={lf.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs p-1">{lf.file.name}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeLocalFile(i)}
                      className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

                {n.attachments && n.attachments.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {n.attachments.map((a, i) =>
                      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(a.url) ? (
                        <img
                          key={i}
                          src={a.url}
                          alt={a.name || "attachment"}
                          className="w-32 h-32 object-cover rounded border border-rose-800/40"
                        />
                      ) : (
                        <a
                          key={i}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline text-blue-400"
                        >
                          {a.name || a.url}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

