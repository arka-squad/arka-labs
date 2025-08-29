import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, User, Role } from './auth';

export function withAuth(
  allowed: (Role | 'public' | 'github-webhook')[],
  handler: (req: NextRequest, user: User | null, context: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, context: any = {}): Promise<NextResponse> => {
    if (allowed.includes('public') || allowed.includes('github-webhook')) {
      return handler(req, null, context);
    }
    const cookieTok = req.cookies.get('arka_auth')?.value || null;
    const hdr = req.headers.get('authorization');
    const token = hdr?.startsWith('Bearer ') ? hdr.slice(7) : cookieTok;
    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user || !allowed.includes(user.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return handler(req, user, context);
  };
}
