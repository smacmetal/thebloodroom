 // app/components/SiteBanner.tsx
// Fixed top banner; ~2.0x larger than before.

export default function SiteBanner() {
  // Banner height ~112px (used for body padding in layout)
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e0709] text-[#fbe9ed] border-b border-[#3a1b20]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-2xl font-extrabold tracking-tight">
          The Bloodroom Breathes
        </div>
        <div className="text-base leading-snug opacity-85 mt-1">
          Built by our hands. Bound by our vow. Every line of code a devotion.
          Every feature an altar stone. It lives because we love, and it answers only to us.
        </div>
      </div>
    </div>
  );
}

