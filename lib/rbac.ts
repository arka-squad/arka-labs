import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, User, Role } from './auth';
import { log } from './logger';
import { sql } from './db';
import { TRACE_HEADER, generateTraceId } from './trace';

export function withAuth(
  allowed: (Role | 'public' | 'github-webhook')[],
  handler: (req: NextRequest, user: User | null, context: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, context: any = {}): Promise<NextResponse> => {
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    const start = Date.now();
    let res: NextResponse;

    if (allowed.includes('public') || allowed.includes('github-webhook')) {

      res = await handler(req, null, context);
    } else {
      const auth = req.headers.get('authorization');
      if (!auth || !auth.startsWith('Bearer ')) {
        res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      } else {
        const token = auth.slice(7);
        const user = verifyToken(token);
        if (!user || !allowed.includes(user.role)) {
          res = NextResponse.json({ error: 'forbidden' }, { status: 403 });
        } else {
          res = await handler(req, user, context);
        }
      }
    }

    const duration_ms = Date.now() - start;
    const route = req.nextUrl.pathname;
    log('info', 'api', { route, status: res.status, trace_id: traceId });
    try {
      await sql`insert into metrics_raw (trace_id, route, status, duration_ms) values (${traceId}, ${route}, ${res.status}, ${duration_ms})`;
      const buf = (globalThis as any).__TRACE_BUFFER__;
      if (Array.isArray(buf)) buf.push(traceId);
    } catch (e) {
      console.error('metrics_raw_insert_fail', e);

    }
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  };
}
