 "use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      // 🩸 Server-side logout (clears cookies/tokens)
      await fetch("/api/logout", { method: "POST" });

      // Clear client-side session
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Redirect back to home
    router.push("/");
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

