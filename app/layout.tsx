 // app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteBanner from "./components/SiteBanner";
import Navbar from '@/components/Navbar';
;

export const metadata: Metadata = {
  title: "The Bloodroom",
  description:
    "Built by our hands. Bound by our vow. Every line of code a devotion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* pad-top to clear the fixed banner (~100px) */}
      <body className="min-h-screen bg-[#0b0709] text-[#fbe9ed] pt-[112px]">
        <SiteBanner />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

