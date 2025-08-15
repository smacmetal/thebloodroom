"use client";

import { useState, useRef } from "react";

const ROLES = ["king", "queen", "princess"] as const;
type Role = (typeof ROLES)[number];

export default function RoleImageUploader() {
  const [role, setRole] = useState<Role>("king");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string>("");
  const [savedAs, setSavedAs] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavedAs(null);
    setMsg("");
    setStatus("idle");

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus("error");
      setMsg("Choose an image first.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setStatus("uploading");
      const res = await fetch(`/api/upload/${role}`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMsg(data?.error || "Upload failed.");
        return;
      }

      setStatus("done");
      setSavedAs(data?.savedAs || null);
      setMsg(`Uploaded to ${role}/images as ${data?.savedAs}`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Network error.");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 rounded-2xl shadow bg-white space-y-4">
      <h2 className="text-2xl font-semibold">Role Image Uploader</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Role</label>
          <select
            className="border rounded-lg px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Image file</label>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="border rounded-lg px-3 py-2"
          />
          <p className="text-xs text-gray-500">
            Max 25MB. Allowed: JPG, PNG, WEBP, GIF, SVG.
          </p>
        </div>

        <button
          type="submit"
          disabled={status === "uploading"}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </form>

      {msg && (
        <div
          className={`text-sm ${
            status === "error" ? "text-red-600" : "text-green-700"
          }`}
        >
          {msg}
        </div>
      )}

      {savedAs && (
        <div className="text-sm text-gray-600">
          Saved filename: <span className="font-mono">{savedAs}</span>
        </div>
      )}

      <div className="pt-2 text-xs text-gray-500">
        Endpoint: <code>/api/upload/[role]</code> → writes to <code>data/&lt;role&gt;/images</code>
      </div>
    </div>
  );
}
