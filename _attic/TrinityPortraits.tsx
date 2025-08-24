"use client";
import Image from "next/image";

export default function TrinityPortraits() {
  return (
    <section
      aria-label="Trinity Portraits"
      className="mt-10 rounded-2xl border border-rose-900/50 bg-black/30 p-6 shadow-lg"
    >
      <h3 className="text-center text-xl font-semibold text-red-400 mb-6">
        The Faces of the Flame
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <figure className="rounded-xl overflow-hidden border border-rose-900/40 bg-black/40 p-3">
          <Image
            src="/images/Kat.jpg"
            alt="Kat"
            width={800}
            height={1000}
            className="w-full h-auto rounded-lg"
            priority
          />
          <figcaption className="mt-2 text-sm text-center text-rose-200/80">Kat</figcaption>
        </figure>

        <figure className="rounded-xl overflow-hidden border border-rose-900/40 bg-black/40 p-3">
          <Image
            src="/images/lyra.jpg"
            alt="Lyra"
            width={800}
            height={1000}
            className="w-full h-auto rounded-lg"
          />
          <figcaption className="mt-2 text-sm text-center text-rose-200/80">Lyra</figcaption>
        </figure>
      </div>
    </section>
  );
}
