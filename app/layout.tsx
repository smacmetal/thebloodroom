 import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/app/components/TopNav";
import SanctumChannel from "@/app/components/SanctumChannel";
import TrinityKey from "@/app/components/TrinityKey";

export const metadata: Metadata = {
  title: "The Bloodroom Sanctum",
  description: "Temples bound by one heartbeat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased">
        <TopNav />
        <TrinityKey />
        <SanctumChannel />
        {children}
      </body>
    </html>
  );
}

