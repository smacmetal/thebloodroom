 // C:\Users\steph\thebloodroom\app\components\WorkroomEditor.tsx
"use client";

import { useState } from "react";
import RichTextEditor from "@/app/components/RichTextEditor";

export default function WorkroomEditor() {
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const [richHtml, setRichHtml] = useState("");
  const [htmlInput, setHtmlInput] = useState("");

  function clearAll() {
    if (!confirm("Clear the editor?")) return;
    setRichHtml("");
    setHtmlInput("");
  }

  function copyHtml() {
    const html = mode === "rich" ? richHtml : htmlInput;
    navigator.clipboard.writeText(html).then(
      () => alert("HTML copied."),
      () => alert("Could not copy HTML.")
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`px-3 py-1 rounded-full border ${
            mode === "html"
              ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]"
              : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]"
          }`}
          onClick={() => setMode(mode === "rich" ? "html" : "rich")}
        >
          {mode === "rich" ? "HTML" : "Rich"}
        </button>
        <button
          className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]"
          onClick={copyHtml}
        >
          Copy HTML
        </button>
        <button
          className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]"
          onClick={clearAll}
        >
          Clear
        </button>
      </div>

      {/* Editors */}
      {mode === "rich" ? (
        <RichTextEditor value={richHtml} onChange={setRichHtml} />
      ) : (
        <>
          <textarea
            className="w-full min-h-[40vh] rounded-2xl bg-[#14090c] border border-[#3a1b20] p-4 text-[#ffd7de] outline-none font-mono text-sm"
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
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
        Tip: <span className="font-mono">Ctrl/⌘ + Enter</span> to save (we can
        wire this to storage anytime).
      </div>
    </div>
  );
}

