 // C:\Users\steph\thebloodroom\app\components\LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    // Clear cookie
    document.cookie = "br_auth=; Max-Age=0; path=/";
    // Redirect to login
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

