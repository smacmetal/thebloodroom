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

        {/* ... rest of your component unchanged ... */}
      </div>
    </div>
  );
}

