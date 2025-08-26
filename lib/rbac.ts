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
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const token = auth.slice(7);
    const user = verifyToken(token);
    if (!user || !allowed.includes(user.role)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return handler(req, user, context);
  };
}
