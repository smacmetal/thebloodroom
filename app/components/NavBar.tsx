 // app/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/bloodroom", label: "Bloodroom" },
  { href: "/king", label: "King" },
  { href: "/queen", label: "Queen" },
  { href: "/princess", label: "Princess" },
  { href: "/vault", label: "Vault" },
];

function Pill({
  href,
  active,
  children,
}: PropsWithChildren<{ href: string; active: boolean }>) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1 text-sm border transition",
        active
          ? "bg-[#2a0f12] border-[#7e2a33] text-[#ffd7de] shadow"
          : "bg-[#170c0f] border-[#3a1b20] text-[#d7aeb6] hover:bg-[#1e0f12]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function NavBar() {
  const pathname = usePathname() || "/";
  return (
    <nav className="w-full bg-[#0b0709] border-b border-[#3a1b20]">
      <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 flex-wrap items-center">
        {tabs.map((t) => {
          const active =
            pathname === t.href ||
            (t.href !== "/" && pathname.startsWith(t.href));
        return <Pill key={t.href} href={t.href} active={active}>{t.label}</Pill>;
        })}
      </div>
    </nav>
  );
}

