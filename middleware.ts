 // C:\Users\steph\thebloodroom\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedMatchers = [
  '/test',
  '/debug',
  '/vault/json',
  '/messages/monitor',
  '/api/stats',
];

export function middleware(req: NextRequest) {
  // Only guard in production AND when enabled
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  if (process.env.DEV_TOOLS_ENABLED !== 'true') return NextResponse.next();

  const url = req.nextUrl;
  const needsAuth = protectedMatchers.some((p) => url.pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const user = process.env.ADMIN_USER || '';
  const pass = process.env.ADMIN_PASS || '';
  const expected = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

  const got = req.headers.get('authorization') || '';
  if (got !== expected) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Bloodroom Admin"' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/test/:path*',
    '/debug/:path*',
    '/vault/json/:path*',
    '/messages/monitor/:path*',
    '/api/stats/:path*',
  ],
};
