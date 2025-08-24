 "use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function LoginInner() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); // 👈 NEW
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, remember }), // 👈 include flag
    });
    if (res.ok) {
      router.push("/"); // Home
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
        <p className="text-sm tracking-wide text-red-500 text-center mb-2">
          Welcome to The Bloodroom
        </p>
        <h1 className="text-2xl font-bold text-center mb-6">Enter The Bloodroom</h1>

        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/40 border border-rose-700/60 focus:outline-none focus:ring focus:ring-rose-600"
            autoComplete="username"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/40 border border-rose-700/60 focus:outline-none focus:ring focus:ring-rose-600"
            autoComplete="current-password"
            required
          />
        </div>

        {/* 👇 NEW remember me */}
        <label className="flex items-center gap-2 text-sm text-zinc-300 mb-6 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-rose-600"
          />
          Remember me on this device
        </label>

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

