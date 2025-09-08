import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyToken, Role } from './lib/auth';
import { hasScope } from './lib/rbac';

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
    if (host && host !== CANONICAL_HOST) {
      const url = new URL(request.nextUrl);
      url.protocol = 'https:';
      url.host = CANONICAL_HOST;
      return NextResponse.redirect(url, 301);
    }
  }

  const auth = request.headers.get('authorization') || request.cookies.get('RBAC_TOKEN')?.value || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  const user = token ? verifyToken(token) : null;
  const role: Role | 'public' = user?.role || 'public';
  const scope = request.headers.get('x-scope') as 'safe' | 'owner-only' | null;
  if (scope) {
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (!hasScope(role as Role, scope)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }
  const res = NextResponse.next();
  if (user) res.headers.set('x-user', user.sub);
  res.headers.set('x-role', role);
  return res;
}

// Avoid matching Next.js internals and common static files.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)',
  ],
};
