import { NextResponse } from 'next/server';
import { AI_ENABLED } from '../../../../lib/env';
import { resolveClient } from '../../../../lib/providers/router';
import { verifyToken } from '../../../../lib/auth';
import { getSessionVault } from '../../../../lib/sessionVault';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isProd() {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: Request) {
  // Guard: dev/preview only, flag controlled
  if (isProd() || !AI_ENABLED) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  // Derive role from JWT if available; fallback to query, then 'viewer'
  let role = 'viewer';
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth.startsWith('Bearer ')) {
      const jwt = auth.slice(7);
      const user = verifyToken(jwt);
      if (user?.role) {
        const raw = String(user.role).toLowerCase();
        role = raw === 'admin' ? 'owner' : (raw === 'editor' ? 'operator' : (raw as any));
      }
    }
  } catch {}
  if (role === 'viewer') {
    const q = searchParams.get('role');
    if (q) role = q;
  }
  const agent = searchParams.get('agent') || 'AGP';
  const provider = req.headers.get('x-provider') || 'openai';
  const model = req.headers.get('x-model') || 'gpt-4.1-mini';
  // Accept either a provider session or a raw key (preview only)
  const providerSession = req.headers.get('x-provider-session') || null;
  const apiKey = (() => {
    if (providerSession) {
      const s = getSessionVault().getSession(providerSession);
      return s?.keyPlain || null;
    }
    return process.env.OPENAI_API_KEY || null;
  })();

  // Construct prompt
  const prompt = [{ role: 'user', content: 'Bienvenue sur Arka — flux Chat (socle B13). Rôle: ' + role }];

  // Use client to stream response
  const client = resolveClient(provider, apiKey);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(new TextEncoder().encode(sse({ t: 'open', trace_id: traceId, agent, provider, model })));
        let firstAt = 0;
        const startTime = Date.now();
        for await (const chunk of client.stream!({ model, prompt })) {
          const now = Date.now();
          if (!firstAt) firstAt = now;
          controller.enqueue(new TextEncoder().encode(sse({ t: 'token', v: chunk, at: now - startTime })));
        }
        const ttftMs = firstAt ? firstAt - startTime : 0;
        controller.enqueue(new TextEncoder().encode(sse({ t: 'done', ttft_ms: ttftMs, tokens: 0 })));
        controller.close();
      } catch (err: any) {
        const code = typeof err?.status === 'number' ? err.status : (err?.code || 'unknown');
        const msg = String(err?.message || 'stream_error');
        controller.enqueue(new TextEncoder().encode(sse({ t: 'error', code, msg })));
        controller.close();
      }
    }});

  const headers: Record<string, string> = {
    'x-trace-id': traceId,
    'cache-control': 'no-store',
    'content-type': 'text/event-stream; charset=utf-8'};

  // Log NDJSON (stdout default)
  (async () => {
    await sleep(0);
    const rec = {
      ts: new Date().toISOString(),
      route: '/api/chat/stream',
      role,
      agent,
      provider,
      model,
      has_session: !!providerSession,
      trace_id: traceId};
    try {
      console.log('chat_gateway', JSON.stringify(rec));
    } catch {}
  })();

  return new NextResponse(stream, { headers });
}
