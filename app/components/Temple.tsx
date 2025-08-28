 "use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import RichTextEditor from "@/app/components/RichTextEditor";

const POLL_INTERVAL = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL || 5000);

type Chamber = "Queen" | "Princess" | "King";
type ChamberKey = "queen" | "princess" | "king";

type Attachment = {
  name?: string;
  path: string;
  type?: string;
  url: string;
  thumbUrl: string;
};

type SmsResult = {
  recipient: string;
  to?: string;
  sid?: string;
  error?: string;
};

type Message = {
  uid: string;
  id?: string;
  author?: string;
  recipients?: string[];
  content?: string;
  contentHtml?: string;
  attachments?: Attachment[];
  timestamp?: number;
  chamber: Chamber;
  smsResults?: SmsResult[];
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

  // Editor mode + values
  const [mode, setMode] = useState<"rich" | "html">("rich");
  const [richHtml, setRichHtml] = useState<string>("");
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
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [chamberKey]);

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

  const contentHtml = (mode === "rich" ? richHtml : htmlInput).trim();
  const content = htmlToText(contentHtml);

  // ✅ FIX: make sure we don’t reject valid rich text
  const hasMessage =
    !!contentHtml.replace(/<[^>]*>/g, "").trim() || // strip tags, still has text
    !!content || // plain text fallback
    localFiles.length > 0;

  if (!hasMessage) {
    alert("Please enter a message or attach a file.");
    return;
  }

  // fetch auth_id, build FormData ... (rest stays the same)
}

    // 👇 NEW: fetch current user id from API
    let auth_id = "";
    try {
      const res = await fetch("/api/whoami");
      if (res.ok) {
        const j = await res.json();
        auth_id = j?.id || "";
      }
    } catch {}

    const fd = new FormData();
    fd.append("chamber", chamberKey);
    fd.append("author", chamberLabel);
    fd.append("format", mode);
    fd.append("sms", String(!!sendAsSms));
    fd.append("content", content);
    fd.append("contentHtml", contentHtml);
    if (auth_id) fd.append("auth_id", auth_id); // 👈 send to backend
    recipients.forEach((r) => fd.append("recipients", r));
    localFiles.forEach((lf) => fd.append("files", lf.file, lf.file.name));

    try {
      const res = await fetch("/api/temple/submit", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      setRichHtml("");
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
    <div className="min-h-screen p-6 text-[#fbe9ed]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title header */}
        <div className="rounded-2xl border border-[#4b2228] bg-[#261217] p-6">
          <h1 className="text-4xl font-bold text-[#ffe0e7]">{title}</h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Speak, {chamberLabel}. Rich Text or full HTML. Add media if you wish. All is sealed in the Vault.
          </p>
          {chamberLabel === "King" && (
            <div className="mt-4">
              <Link
                href="/workroom"
                className="inline-block px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
              >
                Enter Workroom
              </Link>
            </div>
          )}
        </div>

        {/* Editor + Send */}
        <div className="rounded-2xl border border-[#4b2228] bg-[#1a0b0e] p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => setMode("rich")}
              className={`px-3 py-1 rounded ${
                mode === "rich" ? "bg-rose-700 text-white" : "bg-black/40 text-zinc-300"
              }`}
            >
              Rich Text
            </button>
            <button
              type="button"
              onClick={() => setMode("html")}
              className={`px-3 py-1 rounded ${
                mode === "html" ? "bg-rose-700 text-white" : "bg-black/40 text-zinc-300"
              }`}
            >
              Raw HTML
            </button>
          </div>

          {/* Editor */}
          {mode === "rich" ? (
            <RichTextEditor value={richHtml} onChange={setRichHtml} />
          ) : (
            <textarea
              className="w-full min-h-[150px] bg-black/40 border border-rose-700/60 p-2 rounded text-sm"
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="<p>Write HTML here…</p>"
            />
          )}

          {/* File input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onPickFiles}
              className="text-sm"
            />
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

          {/* SMS options */}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={sendAsSms} onChange={(e) => setSendAsSms(e.target.checked)} />
              Send as SMS
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={sendToKing} onChange={(e) => setSendToKing(e.target.checked)} />
              To King
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={sendToQueen} onChange={(e) => setSendToQueen(e.target.checked)} />
              To Queen
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={sendToPrincess} onChange={(e) => setSendToPrincess(e.target.checked)} />
              To Princess
            </label>
          </div>

          {/* Send button */}
          <button
            onClick={send}
            className="px-4 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: sendButtonColor }}
          >
            Send to Vault
          </button>
        </div>

        {/* Recent messages */}
        <div className="space-y-4">
          {loading && <p className="text-zinc-400">Loading messages…</p>}
          {!loading && recent.length === 0 && (
            <p className="text-zinc-400 italic">No messages yet.</p>
          )}
          {recent.map((m) => (
            <div
              key={m.uid}
              className="rounded-xl border border-[#4b2228] bg-[#1c0e12] p-4 space-y-2"
            >
              <div className="flex justify-between items-center text-sm text-zinc-400">
                <span>
                  {m.author} — {new Date(m.timestamp || 0).toLocaleString()}
                </span>
                <button
                  onClick={() => deleteMessage(m.uid)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              {m.contentHtml ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: m.contentHtml }}
                />
              ) : (
                <p>{m.content}</p>
              )}
              {m.attachments?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {m.attachments.map((a, i) =>
                    isImage(a) ? (
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
          ))}
        </div>
      </div>
    </div>
  );
}

