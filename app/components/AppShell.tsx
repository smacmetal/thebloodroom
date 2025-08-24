 // C:\Users\steph\thebloodroom\app\components\AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import SiteBanner from "./SiteBanner";
import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Show full chrome everywhere except public surfaces (login, add more if needed)
  const showChrome = !pathname.startsWith("/login");

  return (
    <>
      {showChrome && (
        <>
          <SiteBanner />
          <Navbar />
        </>
      )}
      {/* Apply the top padding only when the chrome is visible */}
      <main className={`max-w-6xl mx-auto px-4 py-6 ${showChrome ? "pt-[112px]" : ""}`}>
        {children}
      </main>
    </>
  );
}

