export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  const next = searchParams?.next ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0709]">
      <div className="w-full max-w-md rounded-2xl border border-red-900/30 bg-zinc-900/60 p-6 shadow-lg">
        <div className="text-center mb-4">
          <p className="text-sm tracking-wide text-red-500">
            Welcome to The Bloodroom
          </p>
        </div>

        <h1 className="text-2xl font-semibold text-white text-center mb-6">
          Enter The Bloodroom
        </h1>

        {searchParams?.error && (
          <p className="mb-4 text-center text-sm text-red-400">
            Invalid credentials. Please try again.
          </p>
        )}

        <form method="POST" action="/api/login" className="space-y-4">
          {/* carry forward the next URL if present */}
          {next && <input type="hidden" name="next" value={next} />}

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Username</label>
            <input
              name="username"
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-red-700 hover:bg-red-800 px-3 py-2 font-medium text-white"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
