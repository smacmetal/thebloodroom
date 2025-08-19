 "use client";

import React, { useState } from "react";

/**
 * RoleImageUploader
 * - Lets you pick an image and upload it for a chamber/role (King/Queen/Princess)
 * - Calls /api/attachments/sign to try direct blob upload; falls back to /api/workroom/upload
 * - Emits a simple result text after upload
 */
export default function RoleImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [chamber, setChamber] = useState<"King" | "Queen" | "Princess">("King");
  const [status, setStatus] = useState<string>("");

  const onChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus("");
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  async function uploadViaServer(f: File, pathname: string) {
    // fallback: send multipart/form-data to your server route
    const form = new FormData();
    form.append("file", f);
    form.append("pathname", pathname);
    form.append("chamber", chamber);

    const res = await fetch("/api/workroom/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  async function upload() {
    if (!file) {
      setStatus("Choose a file first.");
      return;
    }
    setStatus("Preparing…");

    try {
      const contentType = file.type || "application/octet-stream";

      // Ask the server for a signed destination (vercel-blob or fallback)
      const signRes = await fetch("/api/attachments/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType,
          prefix: `attachments/wall/${chamber}`,
          access: "public",
        }),
      });

      if (!signRes.ok) throw new Error(await signRes.text());
      const signed = await signRes.json();

      // vercel-blob direct upload
      if (signed.mode === "vercel-blob" || signed.mode === "vercel-blob-legacy") {
        const putUrl = signed.url ?? signed.uploadUrl ?? signed.signedUrl;
        if (!putUrl) throw new Error("No signed upload URL returned.");

        setStatus("Uploading (direct)...");
        const up = await fetch(putUrl, {
          method: "PUT",
          headers:
            signed.mode === "vercel-blob"
              ? { "Content-Type": contentType }
              : undefined,
          body: file,
        });
        if (!up.ok) throw new Error(`Direct upload failed: ${up.statusText}`);

        setStatus("Uploaded via blob.");
        return;
      }

      // fallback to server route
      setStatus("Uploading (server)...");
      const result = await uploadViaServer(file, signed.pathname);
      setStatus(result?.ok ? "Uploaded via server." : "Server upload done.");
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err?.message || String(err)}`);
    }
  }

  return (
    <div className="rounded-2xl border border-[#3a1b20] bg-[rgba(21,10,12,0.85)] p-5 text-[#ffd7de]">
      <h2 className="text-xl font-semibold mb-3">Attach to a Wall</h2>

      <div className="flex flex-col gap-3">
        <label className="text-sm">
          Chamber
          <select
            className="ml-2 rounded bg-[#14090c] border border-[#3a1b20] px-2 py-1"
            value={chamber}
            onChange={(e) => setChamber(e.target.value as any)}
          >
            <option>King</option>
            <option>Queen</option>
            <option>Princess</option>
          </select>
        </label>

        <input type="file" accept="image/*" onChange={onChoose} />

        {file && (
          <div className="text-xs opacity-80">
            {file.name} — {(file.size / 1024).toFixed(1)} KB
          </div>
        )}

        <button
          onClick={upload}
          className="self-start px-4 py-2 rounded-xl bg-[#b3121f] text-white hover:bg-[#d11423] transition"
        >
          Upload
        </button>

        {status && <div className="text-sm opacity-90">{status}</div>}
      </div>
    </div>
  );
}

