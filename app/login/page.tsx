 // C:\Users\steph\thebloodroom\app\login\page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/bloodroom";

  function handleLogin() {
    // Set auth cookie
    document.cookie = `br_auth=ok; path=/`;
    // Redirect to next or bloodroom
    window.location.href = next;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0b0709] text-[#fbe9ed]">
      <h1 className="text-3xl mb-6 font-bold text-rose-300">
        Welcome to The Bloodroom
      </h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 rounded-lg bg-rose-600 text-white border border-rose-900 shadow hover:bg-rose-700 transition"
      >
        Enter
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

