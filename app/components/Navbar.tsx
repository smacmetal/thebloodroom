 "use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar on the public surfaces
  if (pathname === "/" || pathname.startsWith("/login")) return null;

  return (
    <nav className="w-full bg-[#170c0f] border-b border-[#3a1b20] flex items-center px-4 py-2">
      <div className="flex gap-4 text-sm">
        <Link href="/">Home</Link>
        <Link href="/queen">Queen</Link>
        <Link href="/princess">Princess</Link>
        <Link href="/king">King</Link>
        <Link href="/vault">Vault</Link>
        <Link href="/bloodroom">Bloodroom</Link>
        <Link href="/workroom">Workroom</Link>
      </div>
      <div className="ml-auto">
        <LogoutButton />
      </div>
    </nav>
  );
}

