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

        {/* Compose */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] p-5 space-y-4">
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
              className={`px-3 py-1 rounded-full border ${mode === "rich" ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]" : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6]"}`}
            >
              Rich Text
            </button>
            <button
              onClick={() => setMode("html")}
              className={`px-3 py-1 rounded-full border ${mode === "html" ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de]" : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6]"}`}
            >
              HTML
            </button>
          </div>

          {/* Editors */}
          {mode === "rich" ? (
            <RichTextEditor value={richHtml} onChange={setRichHtml} />
          ) : (
            <>
              <textarea
                className="w-full min-h-[160px] rounded-xl bg-[#14090c] border border-[#3a1b20] p-3 outline-none text-[#ffd7de] font-mono text-sm"
                placeholder={`<p>${placeholder}</p>`}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
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
            <input ref={fileInputRef} type="file" multiple onChange={onPickFiles} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]">
              Attach
            </button>
          </div>

          {/* Send */}
          <div className="flex justify-end">
            <button
              onClick={send}
              className="px-4 py-2 rounded-xl text-white transition disabled:opacity-50"
              style={{ backgroundColor: sendButtonColor }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] p-5">
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
                const hasHtml = typeof m.contentHtml === "string" && m.contentHtml.trim() !== "";

                return (
                  <li key={m.uid} className="rounded-2xl border border-[#4b2228] bg-[#261217] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#ffe0e7]">
                        <span className="mr-2 font-semibold">{m.author || "—"}</span>
                        <span className="opacity-80">→ {recipText}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-[#e0a8b1]">{new Date(ts).toLocaleString()}</div>
                        <button
                          onClick={() => deleteMessage(m.uid)}
                          className="text-xs px-2 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]">
                          Delete
                        </button>
                      </div>
                    </div>

                    {hasHtml ? (
                      <div className="mt-2 text-[#fff0f3]" dangerouslySetInnerHTML={{ __html: m.contentHtml! }} />
                    ) : m.content ? (
                      <div className="mt-2 text-[#fff0f3] whitespace-pre-wrap">{m.content}</div>
                    ) : null}

                    {atts.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {atts.map((a, i) =>
                          isImage(a) ? (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-[#4b2228]">
                              <img src={a.thumbUrl || a.url} alt={a.name || "attachment"} className="w-full h-32 object-cover" loading="lazy" />
                            </a>
                          ) : (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-[#ffd7de]">
                              {a.name || a.path}
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {Array.isArray(m.smsResults) && m.smsResults.length > 0 && (
                      <div className="mt-2 text-xs text-[#b98790] space-y-1">
                        {m.smsResults.map((res, i) => (
                          <div key={i}>
                            {res.sid ? (
                              <span>✅ SMS to {res.recipient} delivered</span>
                            ) : res.error ? (
                              <span>⚠️ SMS to {res.recipient} failed: {res.error}</span>
                            ) : (
                              <span>⭕ SMS to {res.recipient} skipped</span>
                            )}
                          </div>
                        ))}
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

