 'use client';

export default function BodyAura() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-15">
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.04,
          background:
            'radial-gradient(60% 50% at 50% 45%, rgba(220,40,70,0.20) 0%, rgba(220,40,70,0.06) 35%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 h-[96px]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(180,0,40,0.12) 90%)',
        }}
      />
    </div>
  );
}

