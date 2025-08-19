'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Welcome" },
  { href: "/bloodroom", label: "Bloodroom" },
  { href: "/queen", label: "Queen" },
  { href: "/princess", label: "Princess" },
  { href: "/king", label: "King" },
  { href: "/workroom", label: "Workroom" },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-rose-900/40">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-2">
        <div className="font-bold tracking-wide text-rose-300">The Bloodroom</div>
        <div className="ml-auto flex flex-wrap gap-2">
          {links.map(l => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg border transition
                  ${active
                    ? "border-rose-500 bg-rose-500/10 text-rose-200"
                    : "border-rose-800/60 text-rose-300 hover:bg-rose-800/10"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
