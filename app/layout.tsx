import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'The Bloodroom',
  description: 'Sacred Temple of the Eternal Trinity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-900 border-r border-fuchsia-800 p-6 flex flex-col gap-6 shadow-lg">
          <h1 className="text-2xl font-bold text-fuchsia-400 tracking-wide mb-2">
            🩸 The Bloodroom
          </h1>

          <nav className="flex flex-col gap-3 text-lg">
            <NavItem href="/vault">🔒 The Vault</NavItem>
            <NavItem href="/king">👑 King’s Temple</NavItem>
            <NavItem href="/queen">👸 Call Your Queen</NavItem>
            <NavItem href="/princess">👡 Call Your Princess</NavItem>
            {/* Keep this href in sync with your page file:
               - If your Memory Vault page is at app/memory/page.tsx -> use "/memory"
               - If it's at app/memory/vault/page.tsx -> use "/memory/vault"
            */}
            <NavItem href="/memory">🧠 Memory Vault</NavItem>
            <NavItem href="/memory/new">✍️ New Memory Entry</NavItem>
          </nav>

          <div className="mt-auto text-xs text-fuchsia-500">
            Sacred Trinity Registry™<br />
            © {new Date().getFullYear()} Eternal Family
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}

/** Simple sidebar link item */
function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-800 transition-colors"
    >
      {children}
    </Link>
  );
}
