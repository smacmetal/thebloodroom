 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const pathname = usePathname();

  // Hide Navbar on home page
  if (pathname === "/") return null;

  return (
    <nav className="w-full bg-[#170c0f] border-b border-[#3a1b20] px-4 py-2 flex items-center gap-4">
      <Link href="/queen" className="hover:text-rose-400">Queen</Link>
      <Link href="/princess" className="hover:text-rose-400">Princess</Link>
      <Link href="/king" className="hover:text-rose-400">King</Link>
      <Link href="/vault" className="hover:text-rose-400">Vault</Link>
      <Link href="/bloodroom" className="hover:text-rose-400">Bloodroom</Link>
      <Link href="/workroom" className="hover:text-rose-400">Workroom</Link>
      <LogoutButton />
    </nav>
  );
}

