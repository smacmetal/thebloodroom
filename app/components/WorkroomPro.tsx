 'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type NotesPayload = { contentHtml: string, updatedAt: string };

function nowIso() { return new Date().toISOString(); }

export default function WorkroomPro() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [status, setStatus] = useState<string>("Ready.");
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  // Load from localStorage first
  useEffect(() => {
    const raw = localStorage.getItem("workroom.editor.html");
    if (raw && editorRef.current) editorRef.current.innerHTML = raw;
    const t = localStorage.getItem("workroom.editor.savedAt");
    if (t) setLastSaved(t);
  }, []);

  // Debounced autosave to localStorage
  const commitLocal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onInput = useCallback(() => {
    setDirty(true);
    setStatus("Editing…");
    if (commitLocal.current) clearTimeout(commitLocal.current);
    commitLocal.current = setTimeout(() => {
      const html = editorRef.current?.innerHTML || "";
      localStorage.setItem("workroom.editor.html", html);
      localStorage.setItem("workroom.editor.updatedAt", nowIso());
      setStatus("Saved (local).");
    }, 700);
  }, []);

  // Toolbar actions
  function cmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    onInput();
  }

  function insertLink() {
    const url = prompt("Enter URL (https://…):")?.trim();
    if (!url) return;
    cmd("createLink", url);
  }

  function insertImageByUrl() {
    const url = prompt("Image URL (https://…):")?.trim();
    if (!url) return;
    cmd("insertImage", url);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setStatus("Uploading…");
    const uploads: string[] = [];

    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f, f.name);
      const res = await fetch("/api/workroom/upload", { method: "POST", body: fd });
      if (!res.ok) { setStatus("Upload failed."); continue; }
      const data = await res.json() as { url: string, type: string };
      uploads.push(data.url);

      // Insert into editor
      const el = editorRef.current;
      if (!el) continue;
      if (data.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = data.url;
        img.alt = f.name;
        img.style.maxWidth = "100%";
        img.style.borderRadius = "12px";
        img.style.margin = "8px 0";
        insertNodeAtCaret(el, img);
      } else if (data.type.startsWith("audio/")) {
        const a = document.createElement("audio");
        a.controls = true;
        a.src = data.url;
        a.style.width = "100%";
        a.style.margin = "8px 0";
        insertNodeAtCaret(el, a);
      } else if (data.type.startsWith("video/")) {
        const v = document.createElement("video");
        v.controls = true;
        v.src = data.url;
        v.style.width = "100%";
        v.style.borderRadius = "12px";
        v.style.margin = "8px 0";
        insertNodeAtCaret(el, v);
      } else {
        const link = document.createElement("a");
        link.href = data.url;
        link.textContent = f.name;
        link.target = "_blank";
        link.rel = "noopener";
        link.style.textDecoration = "underline";
        link.style.color = "#ff99b3";
        link.style.display = "inline-block";
        link.style.margin = "6px 0";
        insertNodeAtCaret(el, link);
      }
    }
    setStatus(`Uploaded ${uploads.length} file(s).`);
    onInput();
  }

  function insertNodeAtCaret(container: HTMLElement, node: Node) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { container.appendChild(node); return; }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    // move caret after node
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Save to server (production: Vercel Blob)
  async function saveToServer() {
    const contentHtml = editorRef.current?.innerHTML || "";
    setStatus("Saving to server…");
    const res = await fetch("/api/workroom/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: contentHtml }),
    });
    if (!res.ok) { setStatus("Server save failed (local is safe)."); return; }
    const data = (await res.json()) as { notes: NotesPayload };
    setLastSaved(data.notes.updatedAt);
    localStorage.setItem("workroom.editor.savedAt", data.notes.updatedAt);
    setDirty(false);
    setStatus("Saved to server.");
  }

  async function loadFromServer() {
    setStatus("Loading from server…");
    const res = await fetch("/api/workroom/notes", { cache: "no-store" });
    if (!res.ok) { setStatus("Server load failed."); return; }
    const data = await res.json() as { notes: NotesPayload };
    if (editorRef.current) editorRef.current.innerHTML = data.notes.contentHtml ?? "";
    localStorage.setItem("workroom.editor.html", data.notes.contentHtml ?? "");
    localStorage.setItem("workroom.editor.savedAt", data.notes.updatedAt ?? nowIso());
    setLastSaved(data.notes.updatedAt ?? "");
    setDirty(false);
    setStatus("Loaded from server.");
  }

  function clearEditor() {
    if (!confirm("Clear the editor?")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    localStorage.removeItem("workroom.editor.html");
    setDirty(true);
  }

  function toggleHtml() {
    setHtmlMode(v => !v);
  }

  function copyHtml() {
    const html = editorRef.current?.innerHTML || "";
    navigator.clipboard.writeText(html).then(() => setStatus("HTML copied."));
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Editor + toolbar */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button className="br-btn" onClick={() => cmd("bold")}>B</button>
          <button className="br-btn" onClick={() => cmd("italic")}><em>I</em></button>
          <button className="br-btn" onClick={() => cmd("underline")}><u>U</u></button>
          <button className="br-btn" onClick={() => cmd("formatBlock","H1")}>H1</button>
          <button className="br-btn" onClick={() => cmd("formatBlock","H2")}>H2</button>
          <button className="br-btn" onClick={() => cmd("formatBlock","BLOCKQUOTE")}>&ldquo; &rdquo;</button>
          <button className="br-btn" onClick={() => cmd("insertUnorderedList")}>• List</button>
          <button className="br-btn" onClick={insertLink}>Link</button>
          <button className="br-btn" onClick={insertImageByUrl}>Image URL</button>
          <label className="br-upload">
            <input type="file" multiple onChange={(e)=>uploadFiles(e.target.files)} />
            Upload
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button className="br-btn" onClick={toggleHtml}>{htmlMode ? "WYSIWYG" : "HTML"}</button>
            <button className="br-btn" onClick={copyHtml}>Copy HTML</button>
            <button className="br-btn" onClick={clearEditor}>Clear</button>
          </div>
        </div>

        {!htmlMode ? (
          <div
            ref={editorRef}
            className="min-h-[55vh] rounded-xl border border-rose-900/50 bg-black/40 p-4 outline-none"
            contentEditable
            onInput={onInput}
            suppressContentEditableWarning
            placeholder="Type here…"
            style={{ whiteSpace: "pre-wrap" }}
          />
        ) : (
          <textarea
            className="w-full min-h-[55vh] rounded-xl border border-rose-900/50 bg-black/40 p-4 outline-none"
            value={editorRef.current?.innerHTML || ""}
            onChange={(e) => {
              if (editorRef.current) editorRef.current.innerHTML = e.target.value;
              onInput();
            }}
          />
        )}

        <div className="text-xs text-rose-300/70">
          {status} {dirty ? "• Unsaved changes." : ""} {lastSaved ? `• Last saved: ${new Date(lastSaved).toLocaleString()}` : ""}
        </div>

        <div className="flex items-center gap-2">
          <button className="br-btn" onClick={saveToServer}>Save (server)</button>
          <button className="br-btn" onClick={loadFromServer}>Load (server)</button>
        </div>
      </div>

      {/* Quick Links */}
      <aside className="space-y-3">
        <div className="rounded-xl border border-rose-900/50 bg-black/30 p-3">
          <h3 className="font-semibold text-rose-200 mb-2">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a className="br-link" href="/bloodroom">/bloodroom</a></li>
            <li><a className="br-link" href="/queen">/queen</a></li>
            <li><a className="br-link" href="/princess">/princess</a></li>
            <li><a className="br-link" href="/king">/king</a></li>
          </ul>
          <p className="text-[11px] text-rose-300/60 mt-2">
            Use this page for planning, notes, drafts, media and HTML you can paste anywhere.
          </p>
        </div>
      </aside>

      <style jsx>{`
        .br-btn{
          border:1px solid rgba(120,0,30,.45);
          background:rgba(0,0,0,.45);
          color:rgba(255,220,230,.9);
          border-radius:8px;
          padding:6px 10px;
          font-size:13px;
        }
        .br-btn:hover{ background:rgba(120,0,30,.12); }
        .br-upload{
          border:1px solid rgba(120,0,30,.45);
          background:rgba(0,0,0,.45);
          color:rgba(255,220,230,.9);
          border-radius:8px;
          padding:6px 10px;
          font-size:13px;
          cursor:pointer;
        }
        .br-upload input{ display:none; }
        .br-link{ color:#ff9fb8; text-decoration: underline; }
      `}</style>
    </section>
  );
}

