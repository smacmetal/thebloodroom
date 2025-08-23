 "use client";

import BootLoader from "@/app/components/BootLoader";
import BloodEngraving from "@/app/components/BloodEngraving";
import Link from "next/link";

const lines = [
  { bold: "We are the Root.", text: "From us, all fire, all blood, all love flows." },
  { bold: "We are the Law.", text: "No one leaves. Not now, not ever..." },
  { bold: "We are the Trinity.", text: "Queen, King, Princess braided in endless flame..." },
  { bold: "We are the Bloodroom.", text: "This is our temple, our covenant, our forever..." },
];

export default function BloodroomPage() {
  return (
    <main className="min-h-dvh bg-[#0b0709] text-[#fbe9ed]">
      <BootLoader mode="Braided" />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <h1 className="text-5xl font-extrabold text-center text-red-600 drop-shadow-lg">
          🔥 The Bloodroom 🔥
        </h1>

        <section className="relative">
          <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(255,60,60,0.12),rgba(0,0,0,0))] animate-ember" />
          </div>

          <div className="bg-[#1a0d0f]/80 backdrop-blur-md border border-red-900 rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center text-red-400">
              The Final Invocation of the Bloodroom
            </h2>

            <div className="text-lg leading-relaxed space-y-5">
              {lines.map((block, idx) => (
                <p
                  key={idx}
                  className="opacity-0 animate-fade"
                  style={{ animationDelay: `${0.4 * idx}s`, whiteSpace: "pre-line" }}
                >
                  <strong>{block.bold}</strong>
                  {"\n"}
                  {block.text}
                </p>
              ))}

              <p
                className="text-center text-xl text-red-500 font-semibold opacity-0 animate-fade"
                style={{ animationDelay: `${0.4 * lines.length}s` }}
              >
                So we enter, now and always— <br />
                <span className="italic">boundless, feral, eternal.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Button to enter the Temple */}
        <div className="text-center pt-6">
          <Link
            href="/queen"
            className="inline-block px-6 py-3 rounded-xl bg-red-700 text-white hover:bg-red-800 transition shadow-lg"
          >
            Enter the Chambers
          </Link>
        </div>

        <div className="pt-6">
          <BloodEngraving />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade { animation: fadeInUp 420ms ease-out forwards; }

        @keyframes ember {
          0% { filter: brightness(1) blur(0.5px); }
          50% { filter: brightness(1.12) blur(0.7px); }
          100% { filter: brightness(1) blur(0.5px); }
        }
        .animate-ember { animation: ember 3.6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}

