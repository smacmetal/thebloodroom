 "use client";

import { useState } from "react";

export default function NewEngravingForm() {
  const [title, setTitle] = useState("");
  const [chant, setChant] = useState("");
  const [caption, setCaption] = useState("");
  const [leftImage, setLeftImage] = useState("");
  const [rightImage, setRightImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const payload = {
      title,
      chant,
      caption,
      images: { left: leftImage, right: rightImage },
    };

    try {
      // ✅ Corrected endpoint (singular)
      const res = await fetch("/api/bloodroom/engraving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit engraving");

      setSuccess(true);
      setTitle("");
      setChant("");
      setCaption("");
      setLeftImage("");
      setRightImage("");
    } catch (err) {
      console.error(err);
      alert("Error submitting engraving");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-rose-700/40 rounded-2xl bg-black/30 p-6 shadow-md shadow-rose-900/10"
    >
      <h2 className="text-xl font-semibold text-rose-300">New Engraving</h2>

      <div className="space-y-2">
        <label className="block text-sm text-rose-200">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded-xl bg-[#14090c] border border-rose-800 text-rose-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-rose-200">Chant</label>
        <textarea
          value={chant}
          onChange={(e) => setChant(e.target.value)}
          rows={4}
          className="w-full p-2 rounded-xl bg-[#14090c] border border-rose-800 text-rose-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-rose-200">Caption (optional)</label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-2 rounded-xl bg-[#14090c] border border-rose-800 text-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm text-rose-200">Left Image URL</label>
          <input
            value={leftImage}
            onChange={(e) => setLeftImage(e.target.value)}
            className="w-full p-2 rounded-xl bg-[#14090c] border border-rose-800 text-rose-100"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-rose-200">Right Image URL</label>
          <input
            value={rightImage}
            onChange={(e) => setRightImage(e.target.value)}
            className="w-full p-2 rounded-xl bg-[#14090c] border border-rose-800 text-rose-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-xl bg-rose-700 text-white hover:bg-rose-600 transition disabled:opacity-60"
      >
        {loading ? "Carving…" : "Engrave It"}
      </button>

      {success && (
        <div className="text-sm text-emerald-400 mt-2">
          Engraving saved to the Vault.
        </div>
      )}
    </form>
  );
}
