 "use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic"; // avoid static prerender traps

function LoginInner() {
  const search = useSearchParams(); // <-- must be inside Suspense
  const router = useRouter();
  const redirectTo = search.get("redirect") || "/bloodroom";

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(redirectTo);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0709] text-[#fbe9ed] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#4b2228] bg-[#261217] p-6 shadow">
        <h1 className="text-2xl font-bold text-[#ffe0e7] mb-4">Enter the Bloodroom</h1>
        <p className="text-sm text-[#e0a8b1] mb-6">
          Authenticate to continue {redirectTo !== "/bloodroom" ? `→ ${redirectTo}` : ""}.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">User</label>
            <input
              className="w-full rounded-xl bg-[#14090c] border border-[#3a1b20] p-2 outline-none text-[#ffd7de]"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-[#14090c] border border-[#3a1b20] p-2 outline-none text-[#ffd7de]"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div className="text-sm text-red-400">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl bg-[#b3121f] text-white hover:bg-[#d11423] transition disabled:opacity-60"
          >
            {loading ? "Entering…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0709] text-[#fbe9ed] flex items-center justify-center">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}

