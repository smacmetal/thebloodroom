 "use client";

import { useEffect, useMemo, useState } from "react";

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
  content?: string;
  contentHtml?: string;
  attachments?: Attachment[];
  timestamp?: number;
  chamber: "King" | "Queen" | "Princess";
};

const CHAMBERS = ["All", "Queen", "Princess", "King"] as const;

function isImage(att: Attachment) {
  const p = (att.url || att.path || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(p);
}

export default function VaultPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [chamber, setChamber] = useState<(typeof CHAMBERS)[number]>("All");

  async function loadArchive(c: string, q: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (c && c !== "All") {
        params.set("chamber", c.toLowerCase());
      } else {
        // default chamber=all so backend won't 400
        params.set("chamber", "all");
      }

      if (q.trim()) params.set("q", q.trim());

      const qs = params.toString();
      const res = await fetch(`/api/vault/archive/messages${qs ? "?" + qs : ""}`);
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setMessages((data.messages || []) as Message[]);
    } catch (e) {
      console.error("Archive load failed:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(uid: string) {
    if (!confirm("Delete this entry from the Vault? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/vault/archive/messages?uid=${encodeURIComponent(uid)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert("Delete failed.");
        return;
      }
      await loadArchive(chamber, query);
    } catch {
      alert("Delete failed.");
    }
  }

  useEffect(() => {
    loadArchive(chamber, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamber]);

  const filtered = useMemo(() => messages, [messages]);

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") loadArchive(chamber, query);
  }

  return (
    <div className="min-h-screen p-6 bg-[#0b0709] text-[#fbe9ed]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title Card */}
        <div className="mb-6 rounded-2xl border border-[#4b2228] bg-[#261217] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
          <h1 className="text-2xl font-bold text-[#ffe0e7] flex items-center gap-2">
            <span role="img" aria-label="vault">🔒</span> The Vault
          </h1>
          <p className="mt-2 text-sm text-[#e0a8b1]">
            Reliquary of the Bloodroom — where sacred artifacts, vows, and records are sealed.
          </p>
        </div>

        {/* Controls + List */}
        <div className="rounded-3xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] backdrop-blur-md p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CHAMBERS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChamber(c)}
                  className={`px-3 py-1 rounded-full border transition ${
                    chamber === c
                      ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de] shadow"
                      : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]"
                  }`}
                >
                  {c === "Queen" && "👑 Queen"}
                  {c === "Princess" && "💎 Princess"}
                  {c === "King" && "🩸 King"}
                  {c === "All" && "All"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Search text…"
                className="w-64 rounded-xl bg-[#14090c] border border-[#3a1b20] p-2 outline-none text-[#ffd7de] placeholder:text-[#b98790]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
              <button
                onClick={() => loadArchive(chamber, query)}
                className="px-4 rounded-xl bg-[#b3121f] text-white hover:bg-[#d11423] transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Archive List */}
          <div className="mt-5">
            {loading ? (
              <div className="text-[#d7aeb6] text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-[#b98790] text-sm">
                The archive is quiet. Offer in any chamber — or clear your filters.
              </div>
            ) : (
              <ul className="space-y-4">
                {filtered.map((m) => {
                  const recips = Array.isArray(m.recipients) ? m.recipients : [];
                  const recipText = recips.length ? recips.join(", ") : "—";
                  const ts = typeof m.timestamp === "number" ? m.timestamp : 0;
                  const atts = Array.isArray(m.attachments) ? m.attachments : [];
                  const hasHtml =
                    typeof (m as any).contentHtml === "string" &&
                    (m as any).contentHtml.trim() !== "";

                  return (
                    <li
                      key={m.uid}
                      className="rounded-2xl border border-[#4b2228] bg-[#261217] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] hover:border-[#95313c] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-[#ffe0e7]">
                          <span className="mr-2 font-semibold">{m.author || "—"}</span>
                          <span className="opacity-80">→ {recipText}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-[#e0a8b1]">
                            {ts ? new Date(ts).toLocaleString() : "Invalid Date"}
                          </div>
                          <button
                            onClick={() => deleteMessage(m.uid)}
                            className="text-xs px-2 py-1 rounded-md border border-[#7e2a33] text-[#ffd7de] hover:bg-[#2a0f12]"
                            title="Delete from Vault"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {hasHtml ? (
                        <div
                          className="mt-2 text-[#fff0f3] whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: (m as any).contentHtml as string }}
                        />
                      ) : m.content && m.content.trim() !== "" ? (
                        <div className="mt-2 text-[#fff0f3] whitespace-pre-wrap">
                          {m.content}
                        </div>
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
                                className="block rounded-lg overflow-hidden border border-[#4b2228] hover:border-[#95313c] transition"
                                title={a.name || a.path}
                              >
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
                                className="text-sm underline text-[#ffd7de] transition"
                                title={a.name || a.path}
                              >
                                {a.name || a.path}
                              </a>
                            )
                          )}
                        </div>
                      )}

                      <div className="mt-3 text-xs text-[#d7aeb6]">
                        Chamber:{" "}
                        {m.chamber === "Queen"
                          ? "👑 Queen"
                          : m.chamber === "Princess"
                          ? "💎 Princess"
                          : "🩸 King"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

