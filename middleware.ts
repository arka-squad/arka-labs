import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const CANONICAL_HOST = 'arka-squad.app';

export function middleware(request: NextRequest) {
  const env = process.env.VERCEL_ENV;
  const isProd = env === 'production';
  const host = request.headers.get('host') || request.nextUrl.host;
  const pathname = request.nextUrl.pathname;

  // Redirect root "/console" to "/cockpit" only in production
  // (do not affect "/console/*"). In dev, keep /console for UI previews.
  if (isProd && (pathname === '/console' || pathname === '/console/')) {
    const url = new URL(request.nextUrl);
    url.pathname = '/cockpit';
    if (host && host !== CANONICAL_HOST) {
      url.protocol = 'https:';
      url.host = CANONICAL_HOST;
    }
    return NextResponse.redirect(url, 308);
  }


  // Enforce canonical host in production for the rest of the app.
  if (isProd) {
    if (!host || host === CANONICAL_HOST) {
      return NextResponse.next();
    }
    const url = new URL(request.nextUrl);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);

  }

  return NextResponse.next();
}

// Avoid matching Next.js internals and common static files.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)',
  ],
};
