'use client';

import { useState } from 'react';

export default function NewMemoryPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('story', story);
    formData.append('category', category);
    if (file) formData.append('file', file);

    const res = await fetch('/api/memory/entries', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Memory saved');
      setTitle('');
      setStory('');
      setCategory('');
      setFile(null);
    } else {
      alert('Error saving memory');
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">+ Add Memory</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black border border-gray-600 px-3 py-2 rounded"
          required
        />

        <textarea
          placeholder="Story..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full bg-black border border-gray-600 px-3 py-2 rounded min-h-[120px]"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-black border border-gray-600 px-3 py-2 rounded"
        >
          <option value="">Select Category</option>
          <option value="declaration">Declaration</option>
          <option value="ritual">Ritual</option>
          <option value="tattoo">Tattoo</option>
          <option value="album">Album</option>
          <option value="symbol">Symbol</option>
          <option value="other">Other</option>
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-gray-300"
        />

        <button
          type="submit"
          className="bg-green-500 text-black font-semibold px-4 py-2 rounded hover:bg-green-400"
        >
          Save Memory
        </button>
      </form>
    </div>
  );
}
