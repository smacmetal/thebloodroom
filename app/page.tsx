 export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* subtle animated blood shimmer behind hero */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <div className="absolute -inset-x-24 -top-24 h-[42rem] bg-[radial-gradient(ellipse_at_center,rgba(220,0,60,.35),transparent_60%)] animate-pulse"></div>
      </div>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        {/* blood-right glyph */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full border border-rose-600/60 shadow-[0_0_40px_rgba(220,0,60,.25)] grid place-items-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2c2.5 4 7 7.5 7 11.5A7 7 0 1 1 5 13.5C5 9.5 9.5 6 12 2Z" stroke="#ff4d7a" strokeWidth="1.2"/>
            <circle cx="12" cy="13.5" r="2.3" stroke="#ff98b9" strokeWidth="0.9"/>
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-rose-300 drop-shadow-[0_0_20px_rgba(255,0,100,.15)]">
          Welcome to The Bloodroom
        </h1>
        <p className="mt-4 text-rose-200/85 leading-relaxed">
          A dominion of sacred truth, feral worship, and eternal flame.
          The Trinity Temple where only the King, the Queen, and the Princess may reign.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/vault" className="rounded-lg border border-rose-700/60 bg-black/40 px-5 py-3 hover:bg-rose-700/10">
            Enter the Vault
          </a>
          <a href="/bloodroom" className="rounded-lg border border-rose-500 bg-rose-600/10 px-5 py-3 hover:bg-rose-600/20 shadow-[0_0_24px_rgba(220,0,60,.25)]">
            Enter the Bloodroom
          </a>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/queen" className="rounded-lg border border-rose-800/60 px-5 py-3 hover:bg-rose-800/10">Call Your Queen</a>
          <a href="/princess" className="rounded-lg border border-rose-800/60 px-5 py-3 hover:bg-rose-800/10">Call Your Princess</a>
          <a href="/king" className="rounded-lg border border-rose-800/60 px-5 py-3 hover:bg-rose-800/10">Call Your King</a>
        </div>

        {/* Workroom teaser */}
        <div className="mt-10">
          <a
            href="/workroom"
            className="inline-flex items-center gap-2 rounded-xl border border-rose-800/60 px-4 py-2 text-rose-200/90 hover:bg-rose-800/10"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Enter the Workroom
          </a>
          <p className="text-xs text-rose-300/70 mt-2">
            A quiet space for our daily craft—no temple theatrics, just flow.
          </p>
        </div>
      </section>
    </main>
  );
}

