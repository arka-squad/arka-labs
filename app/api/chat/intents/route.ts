import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({}));
    const auth = req.headers.get('authorization') || '';
    const user = auth.startsWith('Bearer ') ? verifyToken(auth.slice(7)) : null;
    // Minimal validation
    const t = String(body?.t || '').trim();
    const payload = body?.payload || {};
    const trace_id =
      req.headers.get(TRACE_HEADER) || body?.trace_id || generateTraceId();
    // Log intent (dev)
    try {
      log('info', 'chat_intent', {
        route: '/api/chat/intents',
        status: 202,
        trace_id,
        user_role: user?.role || 'public',
        t,
        payload,
      });
    } catch {}
    const res = NextResponse.json({ accepted: true }, { status: 202 });
    res.headers.set(TRACE_HEADER, trace_id);
    return res;
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}

