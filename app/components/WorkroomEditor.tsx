 "use client";

import { useEffect, useRef, useState } from "react";

type UploadedFile = { url: string; name?: string; contentType?: string };

export default function WorkroomEditor() {
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const [htmlInput, setHtmlInput] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // keep htmlInput in sync when switching from rich -> html
  useEffect(() => {
    if (mode === "html") {
      setHtmlInput(editorRef.current?.innerHTML || "");
    }
    // when switching back to rich, push html into editor
    if (mode === "rich" && editorRef.current && htmlInput && editorRef.current.innerHTML !== htmlInput) {
      editorRef.current.innerHTML = htmlInput;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL (https://…):", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  const insertImageUrl = () => {
    const url = prompt("Image URL (https://…):", "https://");
    if (!url) return;
    exec("insertImage", url);
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f, f.name));
      const res = await fetch("/api/workroom/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data: { files: UploadedFile[] } = await res.json();
      for (const f of data.files || []) {
        if (/\.(png|jpe?g|gif|webp|svg)$/i.test(f.url)) {
          exec("insertImage", f.url);
        } else {
          // insert as a link block
          const a = document.createElement("a");
          a.href = f.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = f.name || f.url;
          editorRef.current?.focus();
          document.execCommand("insertHTML", false, a.outerHTML);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
      editorRef.current?.focus();
    }
  };

  const copyHtml = async () => {
    const html = mode === "rich" ? (editorRef.current?.innerHTML || "") : htmlInput;
    try {
      await navigator.clipboard.writeText(html);
      alert("HTML copied to clipboard.");
    } catch {
      alert("Could not copy HTML.");
    }
  };

  const clearAll = () => {
    if (!confirm("Clear the editor?")) return;
    if (mode === "rich") {
      if (editorRef.current) editorRef.current.innerHTML = "";
    } else {
      setHtmlInput("");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      // placeholder “save” gesture
      alert("Saved (Ctrl/⌘+Enter). We can wire this to notes or a save endpoint anytime.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("bold")}>B</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("italic")}><i>/</i></button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("underline")}>U</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("formatBlock", "<h1>")}>H1</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("formatBlock", "<h2>")}>H2</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("insertUnorderedList")}>• List</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("insertOrderedList")}>1. List</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={() => exec("formatBlock", "<blockquote>")}>❝</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={insertLink}>Link</button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={insertImageUrl}>Image URL</button>

        <input ref={fileRef} type="file" multiple className="hidden" onChange={onPickFiles} />
        <button className="px-2 py-1 border rounded-md border-[#7e2a33] hover:bg-[#2a0f12]" onClick={() => fileRef.current?.click()}>
          Upload
        </button>

        <div className="grow" />

        <button
          className={`px-3 py-1 rounded-full border ${mode === "html" ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]" : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]"}`}
          onClick={() => setMode(mode === "rich" ? "html" : "rich")}
        >
          {mode === "rich" ? "HTML" : "Rich"}
        </button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={copyHtml}>
          Copy HTML
        </button>
        <button className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]" onClick={clearAll}>
          Clear
        </button>
      </div>

      {/* Editors */}
      {mode === "rich" ? (
        <div
          ref={editorRef}
          className="min-h-[50vh] rounded-2xl bg-[#14090c] border border-[#3a1b20] p-4 text-[#ffd7de] outline-none"
          contentEditable
          suppressContentEditableWarning
          onKeyDown={onKeyDown}
        />
      ) : (
        <>
          <textarea
            className="w-full min-h-[40vh] rounded-2xl bg-[#14090c] border border-[#3a1b20] p-4 text-[#ffd7de] outline-none font-mono text-sm"
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Write or paste raw HTML…"
          />
          <div className="text-xs text-[#b98790]">Preview:</div>
          <div
            className="rounded-2xl bg-[#14090c] border border-[#3a1b20] p-4 text-[#ffd7de]"
            dangerouslySetInnerHTML={{ __html: htmlInput }}
          />
        </>
      )}
      <div className="text-xs text-[#b98790]">
        Tip: <span className="font-mono">Ctrl/⌘ + Enter</span> to save.
      </div>
    </div>
  );
}

