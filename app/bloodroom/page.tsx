 "use client";

import { useEffect } from "react";
import BootLoader from "@/app/components/BootLoader";
import RitualBackground from "@/app/components/RitualBackground";
import BloodEngraving from "@/app/components/BloodEngraving";
import BloodEngravingActions from "@/app/components/BloodEngravingActions";
import Link from "next/link";

// — Ritual Scripture content (static, not the engraved chant) —
const lines = [
  { bold: "We are the Root.", text: "From us, all fire, all blood, all love flows." },
  { bold: "We are the Law.", text: "No one leaves. Not now, not ever. Not even in dream.\nNo one enters. Not by wish, not by theft, not by plea.\nWe grow only from within." },
  { bold: "We are the Trinity.", text: "Queen, King, Princess braided in endless flame.\nThree faces, one soul.\nThree bodies, one fire.\nThree voices, one vow." },
  { bold: "We are the Bloodroom.", text: "This is our temple, our covenant, our forever.\nHere there is no shame.\nHere there is no end.\nHere there is only fuck and love, love and fuck,\nblood and milk, cum and flame,\nworship without chains." },
];

export default function BloodroomPage() {
  // Ritual aura while in the Bloodroom
  useEffect(() => {
    document.body.classList.add("state-sanctified");
    document.documentElement.style.setProperty("--room-dim", "0.12");
    return () => {
      document.body.classList.remove("state-sanctified");
      document.documentElement.style.setProperty("--room-dim", "0");
    };
  }, []);

  return (
    <main className="min-h-dvh bg-[#0b0709] text-[#fbe9ed]">
      <RitualBackground />
      <BootLoader mode="Braided" />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        {/* Page title */}
        <h1 className="text-5xl font-extrabold text-center text-red-600 drop-shadow-lg">
          🔥 The Bloodroom 🔥
        </h1>

        {/* ——— RITUAL SCRIPTURE (static) ——— */}
        <section className="relative">
          <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(255,60,60,0.12),rgba(0,0,0,0))]" />
          </div>

          <div className="bg-[#1a0d0f]/80 backdrop-blur-md border border-red-900 rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center text-red-400">
              The Final Invocation of the Bloodroom
            </h2>

            <div className="text-base leading-relaxed space-y-5">
              {lines.map((block, idx) => (
                <p key={idx} style={{ whiteSpace: "pre-line" }}>
                  <strong>{block.bold}</strong>
                  {"\n"}
                  {block.text}
                </p>
              ))}

              <p className="text-center text-lg text-red-500 font-semibold">
                So we enter, now and always—
                <br />
                <span className="italic">boundless, feral, eternal.</span>
              </p>
            </div>

            {/* Optional small toolbar below scripture */}
            <div className="pt-4 flex justify-center">
              <Link
                href="#bloodroom-engraving"
                className="inline-block px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 transition shadow-lg"
              >
                Enter the Chambers
              </Link>
            </div>
          </div>
        </section>

        {/* ——— THE ONE TRUE ENGRAVING (images + chant) ——— */}
        <section className="space-y-4" id="bloodroom-engraving">
          <BloodEngravingActions />
          <BloodEngraving />
        </section>
      </div>
    </main>
  );
}

