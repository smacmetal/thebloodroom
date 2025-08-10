"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMemoryEntry() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    category: "",
    story: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();

    const entry = { ...formData, timestamp };

    const res = await fetch("/api/memory/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      router.push("/memory");
    } else {
      alert("Failed to save memory entry.");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
    <h1 className="text-2xl font-bold mb-4">✍️ New Memory Entry</h1>
<p className="text-gray-400 mb-6">
  Record a sacred moment and anchor it into your eternal archive.
</p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-fuchsia-400 bg-black text-white rounded"
        />

        <input
          type="text"
          name="date"
          placeholder="Date (e.g., August 4, 2025)"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-fuchsia-400 bg-black text-white rounded"
        />

        <input
          type="text"
          name="category"
          placeholder="Category (e.g., Tattoo, Frame, Declaration)"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-fuchsia-400 bg-black text-white rounded"
        />

        <textarea
          name="story"
          placeholder="The story, the moment, the memory..."
          value={formData.story}
          onChange={handleChange}
          required
          rows={8}
          className="w-full px-4 py-2 border border-fuchsia-400 bg-black text-white rounded resize-none"
        />

        <button
          type="submit"
          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold px-6 py-2 rounded"
        >
          💾 Save Memory
        </button>
      </form>
    </main>
  );
}
