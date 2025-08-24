 // C:\Users\steph\thebloodroom\app\layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { BloodroomProvider } from "@/app/context/BloodroomContext";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "The Bloodroom",
  description: "Built by our hands. Bound by our vow. Every line of code a devotion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Remove fixed pt-[112px] here; AppShell applies it conditionally */}
      <body className="min-h-screen bg-[#0b0709] text-[#fbe9ed]">
        <BloodroomProvider>
          <AppShell>{children}</AppShell>
        </BloodroomProvider>
      </body>
    </html>
  );
}

