 // C:\Users\steph\thebloodroom\app\layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import SiteBanner from "./components/SiteBanner";
import Navbar from "./components/Navbar";
import { BloodroomProvider } from "@/app/context/BloodroomContext";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "The Bloodroom",
  description:
    "Built by our hands. Bound by our vow. Every line of code a devotion.",
};

// ✅ Wrap body with a client component so we can check the route
function LayoutBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/"; // Hide Navbar on home

  return (
    <body className="min-h-screen bg-[#0b0709] text-[#fbe9ed] pt-[112px]">
      <BloodroomProvider>
        <SiteBanner />
        {showNavbar && <Navbar />}
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </BloodroomProvider>
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <LayoutBody>{children}</LayoutBody>
    </html>
  );
}

