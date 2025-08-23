 // C:\Users\steph\thebloodroom\app\login\page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const next = searchParams.get("next") || "/bloodroom";
      router.push(next);
    } else {
      alert("Login failed — check your credentials.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0709] text-[#fbe9ed]">
      <form
        onSubmit={handleLogin}
        className="bg-[#170c0f] p-8 rounded-xl shadow-lg border border-rose-800/60 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Enter The Bloodroom</h1>
        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/40 border border-rose-700/60 focus:outline-none focus:ring focus:ring-rose-600"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/40 border border-rose-700/60 focus:outline-none focus:ring focus:ring-rose-600"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800 transition"
        >
          Login
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <LoginInner />
    </Suspense>
  );
}

