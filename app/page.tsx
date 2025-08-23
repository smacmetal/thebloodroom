 // app/layout.tsx
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

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 📝 Rule:
  //   - `/` (home page) => no navbar, no banner
  //   - everything else => full layout
  const isHome = pathname === "/";

  return (
    <body className="min-h-screen bg-[#0b0709] text-[#fbe9ed] pt-[112px]">
      <BloodroomProvider>
        {!isHome && (
          <>
            <SiteBanner />
            <Navbar />
          </>
        )}
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
      <LayoutShell>{children}</LayoutShell>
    </html>
  );
}

