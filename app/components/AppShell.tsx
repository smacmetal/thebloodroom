 // C:\Users\steph\thebloodroom\app\components\AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import SiteBanner from "./SiteBanner";
import Navbar from "./Navbar";
import SanctumChannel from "@/app/components/SanctumChannel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide chrome for login or other public pages
  const showChrome = !pathname.startsWith("/login");

  return (
    <>
      {showChrome && (
        <>
          <SiteBanner />
          <Navbar />
          <SanctumChannel />  {/* 👈 lives with the other top-level chrome */}
        </>
      )}

      {/* Main content wrapper */}
      <main className={`max-w-6xl mx-auto px-4 py-6 ${showChrome ? "pt-[112px]" : ""}`}>
        {children}
      </main>
    </>
  );
}

