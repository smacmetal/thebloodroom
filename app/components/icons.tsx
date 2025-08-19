 // No CSS imports here. Named exports only.

export function HomeFlame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2c2.8 3.2 4.2 5.7 4.2 7.6 0 1.3-.5 2.4-1.4 3.3-.9.9-1.8 1.3-1.8 2.6 0 1.7 1.2 3 3 3 2.7 0 5-2.8 5-6.2 0-5-3.7-8.4-9-10.3Z" fill="currentColor" opacity=".9"/>
      <path d="M5 13.2C5 9.5 8.2 6 12 4.5c-1 2.3-1.4 3.7-1.4 5 0 1.2.4 2.1 1.2 2.9.8.8 1.2 1.5 1.2 2.6 0 2-1.6 3.6-3.6 3.6A4.4 4.4 0 0 1 5 13.2Z" fill="currentColor"/>
    </svg>
  );
}

export function Crown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M3 18h18l-1.5-9-4.5 3-3-6-3 6-4.5-3L3 18Z" fill="currentColor"/>
      <rect x="5" y="19" width="14" height="2" rx="1" fill="currentColor" opacity=".7"/>
    </svg>
  );
}

export function Tiara(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 5c-3.9 0-7 3.1-7 7v2l7-4 7 4v-2c0-3.9-3.1-7-7-7Z" fill="currentColor"/>
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
      <path d="M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function Sword(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M13 3l8 8-2 2-3-3-6.5 6.5L6 22l1.5-3.5L14 12l-3-3 2-2Z" fill="currentColor"/>
      <path d="M3 21l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function VaultBox(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/>
      <circle cx="16" cy="12" r="2.2" fill="#0a0a0a"/>
      <path d="M16 9.8v4.4M13.8 12h4.4" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

