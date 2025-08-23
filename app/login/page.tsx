 // C:\Users\steph\thebloodroom\app\login\page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");

  const nextUrl = params.get("next") || "/bloodroom";

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // TODO: Add real auth check if you want
    if (password === "blood") {
      document.cookie =
        "br_auth=ok; path=/; SameSite=Lax; secure; Max-Age=86400"; // 1 day
      router.push(nextUrl);
    } else {
      alert("Wrong password, try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0709] text-[#fbe9ed]">
      <form
        onSubmit={handleLogin}
        className="bg-[#1a0d0f] border border-red-900 p-6 rounded-lg shadow-lg space-y-4 w-80"
      >
        <h1 className="text-2xl font-bold text-center text-red-500">
          Bloodroom Login
        </h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[#0b0709] border border-red-800 text-[#fbe9ed]"
        />
        <button
          type="submit"
          className="w-full px-3 py-2 rounded bg-red-700 hover:bg-red-800 border border-red-900"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

