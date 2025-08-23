 // C:\Users\steph\thebloodroom\app\components\LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="ml-auto px-4 py-1.5 text-sm rounded-lg bg-red-700 text-white border border-red-900 shadow hover:bg-red-800 transition"
    >
      Logout
    </button>
  );
}

