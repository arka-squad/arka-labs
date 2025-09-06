import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({}));
    const auth = req.headers.get('authorization') || '';
    const user = auth.startsWith('Bearer ') ? verifyToken(auth.slice(7)) : null;
    // Minimal validation
    const t = String(body?.t || '').trim();
    const payload = body?.payload || {};
    const trace_id = body?.trace_id || null;
    // Log intent (dev)
    try { console.log('chat_intent', JSON.stringify({ ts: new Date().toISOString(), sub: user?.sub || 'dev', t, payload, trace_id })); } catch {}
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}

