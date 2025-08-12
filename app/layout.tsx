 // C:\Users\steph\thebloodroom\app\layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import AppShell from './components/AppShell';

export const metadata: Metadata = {
  title: 'The Bloodroom',
  description: 'Trinity Registry',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

