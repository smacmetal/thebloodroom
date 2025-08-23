 "use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    // 🩸 Clear session storage, local storage, cookies — customize as needed
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore if not available
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

