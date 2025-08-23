 // C:\Users\steph\thebloodroom\app\login\page.tsx
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // On success, set cookie (mock for now)
    document.cookie = "br_auth=ok; path=/";

    // Redirect to ?next= or home
    const next = params.get("next") || "/";
    router.push(next);
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-[#1a0d0f] rounded-lg border border-rose-800 shadow-lg">
      <h1 className="text-2xl font-bold text-center text-rose-400 mb-4">
        Login to The Bloodroom
      </h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded bg-black/40 border border-rose-700/50 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-black/40 border border-rose-700/50 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading login…</div>}>
      <LoginForm />
    </Suspense>
  );
}

