 "use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Chamber = "Queen" | "Princess" | "King";
type ChamberKey = "queen" | "princess" | "king";

type Attachment = {
  name?: string;
  path: string;
  type?: string;
  url: string;
  thumbUrl: string;
};

type Message = {
  uid: string;
  id?: string;
  author?: string;
  recipients?: string[];
  content?: string;      // plain text
  contentHtml?: string;  // rich HTML
  attachments?: Attachment[];
  timestamp?: number;
  chamber: Chamber;
};

const CHAMBER_TO_KEY: Record<Chamber, ChamberKey> = {
  Queen: "queen",
  Princess: "princess",
  King: "king",
};

function isImagePath(p: string) {
  const s = (p || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(s);
}
function isImage(att: Attachment) {
  return isImagePath(att.url || att.path || "");
}
function htmlToText(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

type LocalFile = {
  file: File;
  previewUrl: string;
};

export default function Temple({
  chamberLabel,
  title,
  placeholder,
  sendButtonColor = "#b3121f",
}: {
  chamberLabel: Chamber;
  title: string;
  placeholder: string;
  sendButtonColor?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Recipients + SMS
  const [sendToKing, setSendToKing] = useState(false);
  const [sendToQueen, setSendToQueen] = useState(false);
  const [sendToPrincess, setSendToPrincess] = useState(false);
  const [sendAsSms, setSendAsSms] = useState(false);

  // Editor mode
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const richRef = useRef<HTMLDivElement>(null);
  const [htmlInput, setHtmlInput] = useState("");

  // Local files
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chamberKey = CHAMBER_TO_KEY[chamberLabel];

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/vault/archive/messages?chamber=${chamberKey}`);
      const data = await res.json();
      setMessages((data.messages || []) as Message[]);
    } catch (e) {
      console.error("Temple load failed:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(uid: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/vault/archive/messages?uid=${encodeURIComponent(uid)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert("Delete failed.");
        return;
      }
      await load();
    } catch {
      alert("Delete failed.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const next: LocalFile[] = files.map((f) => ({
      file: f,
      previewUrl: isImagePath(f.name) ? URL.createObjectURL(f) : "",
    }));
    setLocalFiles((prev) => prev.concat(next));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function removeLocalFile(idx: number) {
    setLocalFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function send() {
    const recipients: string[] = [];
    if (sendToKing) recipients.push("King");
    if (sendToQueen) recipients.push("Queen");
    if (sendToPrincess) recipients.push("Princess");

    const contentHtml = (mode === "rich"
      ? (richRef.current?.innerHTML || "")
      : (htmlInput || "")
    ).trim();
    const content = htmlToText(contentHtml);

    if (!content && !contentHtml && localFiles.length === 0) {
      alert("Please enter a message or attach a file.");
      return;
    }

    const fd = new FormData();
    fd.append("chamber", chamberKey);
    fd.append("author", chamberLabel);
    fd.append("format", mode);
    fd.append("sms", String(!!sendAsSms));
    fd.append("content", content);
    fd.append("contentHtml", contentHtml);
    recipients.forEach((r) => fd.append("recipients", r));
    localFiles.forEach((lf) => fd.append("files", lf.file, lf.file.name));

    try {
      const res = await fetch("/api/temple/submit", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      if (richRef.current) richRef.current.innerHTML = "";
      setHtmlInput("");
      setLocalFiles((prev) => {
        prev.forEach((lf) => lf.previewUrl && URL.revokeObjectURL(lf.previewUrl));
        return [];
      });

      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to send.");
    }
  }

  const recent = useMemo(() => messages, [messages]);

  return (
    <div className="min-h-screen bg-[#0b0709] text-[#fbe9ed]">
      {/* FROZEN TOP BANNER (2.5x size) */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-5xl">
          <div className="m-4 rounded-3xl border border-[#4b2228] bg-[#261217] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
            <h1 className="text-[2.5rem] leading-tight font-bold text-[#ffe0e7] flex items-center gap-2">
              {title}
            </h1>
            <p className="mt-2 text-base text-[#e0a8b1]">
              Speak, {chamberLabel}. Rich Text or full HTML. Add media if you wish. All is sealed in the Vault.
            </p>

            {/* Workroom button only in King's temple */}
            {chamberLabel === "King" && (
              <div className="mt-4">
                <Link
                  href="/workroom"
                  className="inline-block px-4 py-2 bg-red-700 text-white rounded-lg shadow hover:bg-red-800 transition"
                >
                  Enter Workroom
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAGE CONTENT (padded below banner) */}
      <div className="max-w-5xl mx-auto px-4 pt-[200px] pb-6 space-y-6">
        {/* Compose */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] backdrop-blur-md p-5 space-y-4">
          {/* Recipients + SMS */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[#ffd7de]">
              <input type="checkbox" className="accent-[#b3121f]" checked={sendToKing} onChange={(e) => setSendToKing(e.target.checked)} />
              Send to King
            </label>
            <label className="flex items-center gap-2 text-[#ffd7de]">
              <input type="checkbox" className="accent-[#b3121f]" checked={sendToQueen} onChange={(e) => setSendToQueen(e.target.checked)} />
              Send to Queen
            </label>
            <label className="flex items-center gap-2 text-[#ffd7de]">
              <input type="checkbox" className="accent-[#b3121f]" checked={sendToPrincess} onChange={(e) => setSendToPrincess(e.target.checked)} />
              Send to Princess
            </label>

            <span className="mx-2 opacity-40">|</span>

            <label className="flex items-center gap-2 text-[#ffd7de]">
              <input type="checkbox" className="accent-[#b3121f]" checked={sendAsSms} onChange={(e) => setSendAsSms(e.target.checked)} />
              Send as SMS (store intent)
            </label>
          </div>

          {/* Mode Switch */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("rich")}
              className={`px-3 py-1 rounded-full border ${mode === "rich" ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]" : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]"}`}
            >
              Rich Text
            </button>
            <button
              onClick={() => setMode("html")}
              className={`px-3 py-1 rounded-full border ${mode === "html" ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]" : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]"}`}
            >
              HTML
            </button>
          </div>

          {/* Editors */}
          {mode === "rich" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => exec("bold")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">Bold</button>
                <button onClick={() => exec("italic")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">Italic</button>
                <button onClick={() => exec("underline")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">Underline</button>
                <button onClick={() => exec("insertUnorderedList")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">• List</button>
                <button onClick={() => exec("insertOrderedList")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">1. List</button>
                <button onClick={() => exec("formatBlock", "<h2>")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">H2</button>
                <button onClick={() => exec("removeFormat")} className="px-2 py-1 border rounded-md border-[#3a1b20] hover:bg-[#1e0f12]">Clear</button>
              </div>
              <div
                ref={richRef}
                className="min-h-[140px] mt-2 rounded-xl bg-[#14090c] border border-[#3a1b20] p-3 outline-none text-[#ffd7de]"
                contentEditable
                suppressContentEditableWarning
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="text-xs text-[#b98790] mt-1">
                Tip: Press <span className="font-mono">Ctrl/⌘ + Enter</span> to send.
              </div>
            </>
          ) : (
            <>
              <textarea
                className="w-full min-h-[140px] rounded-xl bg-[#14090c] border border-[#3a1b20] p-3 outline-none text-[#ffd7de] placeholder:text-[#b98790] font-mono text-sm"
                placeholder={`<p>${placeholder}</p>`}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="text-xs text-[#b98790]">Live preview:</div>
              <div
                className="rounded-xl bg-[#14090c] border border-[#3a1b20] p-3 text-[#ffd7de]"
                dangerouslySetInnerHTML={{ __html: htmlInput || "" }}
              />
            </>
          )}

          {/* Attachments */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onPickFiles}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]"
              title="Attach files"
            >
              Attach
            </button>

            {localFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {localFiles.map((lf, idx) => (
                  <div key={`lf-${idx}`} className="rounded-xl border border-[#3a1b20] p-2 bg-[#14090c]">
                    {lf.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lf.previewUrl} alt={lf.file.name} className="w-full h-28 object-cover rounded-md" />
                    ) : (
                      <div className="text-xs text-[#d7aeb6] break-words">{lf.file.name}</div>
                    )}
                    <button
                      className="mt-2 text-xs px-2 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]"
                      onClick={() => removeLocalFile(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send */}
          <div className="flex justify-end">
            <button
              onClick={send}
              className="px-4 py-2 rounded-xl text-white transition disabled:opacity-50"
              style={{ backgroundColor: sendButtonColor }}
              title="Send"
            >
              Send
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] backdrop-blur-md p-5">
          {loading ? (
            <div className="text-[#d7aeb6] text-sm">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="text-[#b98790] text-sm">No entries yet.</div>
          ) : (
            <ul className="space-y-4">
              {recent.map((m) => {
                const recips = Array.isArray(m.recipients) ? m.recipients : [];
                const recipText = recips.length ? recips.join(", ") : "—";
                const ts = typeof m.timestamp === "number" ? m.timestamp : 0;
                const atts = Array.isArray(m.attachments) ? m.attachments : [];
                const hasHtml = typeof (m as any).contentHtml === "string" && (m as any).contentHtml.trim() !== "";

                return (
                  <li key={m.uid} className="rounded-2xl border border-[#4b2228] bg-[#261217] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] hover:border-[#95313c] transition">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#ffe0e7]">
                        <span className="mr-2 font-semibold">{m.author || "—"}</span>
                        <span className="opacity-80">→ {recipText}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-[#e0a8b1]">{new Date(ts).toLocaleString()}</div>
                        <button
                          onClick={() => deleteMessage(m.uid)}
                          className="text-xs px-2 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]"
                          title="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {hasHtml ? (
                      <div className="mt-2 text-[#fff0f3] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (m as any).contentHtml as string }} />
                    ) : m.content && m.content.trim() !== "" ? (
                      <div className="mt-2 text-[#fff0f3] whitespace-pre-wrap">{m.content}</div>
                    ) : null}

                    {atts.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {atts.map((a, i) =>
                          isImage(a) ? (
                            <a
                              key={`${m.uid}-att-${i}`}
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg overflow-hidden border border-[#4b2228] hover:border-[#95313c]"
                              title={a.name || a.path}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={a.thumbUrl || a.url}
                                alt={a.name || "attachment"}
                                className="w-full h-32 object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </a>
                          ) : (
                            <a
                              key={`${m.uid}-att-${i}`}
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline text-[#ffd7de]"
                              title={a.name || a.path}
                            >
                              {a.name || a.path}
                            </a>
                          )
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-[#d7aeb6]">Chamber: {m.chamber}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

