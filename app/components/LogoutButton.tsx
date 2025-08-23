 // C:\Users\steph\thebloodroom\app\components\LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    // Clear local/session storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore if not available
    }

    // Clear auth cookie
    document.cookie =
      "br_auth=; Max-Age=0; path=/; SameSite=Lax; secure;";

    // Redirect back to login
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

