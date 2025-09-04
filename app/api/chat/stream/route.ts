import { NextResponse } from 'next/server';
import { AI_ENABLED } from '../../../../lib/env';

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
  const role = searchParams.get('role') || 'viewer';
  const agent = searchParams.get('agent') || 'AGP';
  const provider = req.headers.get('x-provider') || 'demo';
  const model = req.headers.get('x-model') || 'demo';
  // Accept either a provider session or a raw key (preview only)
  const providerSession = req.headers.get('x-provider-session') || null;
  const providerKey = req.headers.get('x-provider-key') || null;

  const text = `Bienvenue sur Arka — flux Chat (socle B13). Rôle: ${role}.`;
  const parts = text.split(' ');
  const encoder = new TextEncoder();

  const start = Date.now();
  let firstAt = 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Send open event first
      controller.enqueue(encoder.encode(sse({ t: 'open', trace_id: traceId, agent, provider, model })));
      await sleep(200 + Math.random() * 200);
      for (let i = 0; i < parts.length; i++) {
        const payload = { t: 'token', v: parts[i], at: Date.now() - start } as const;
        if (!firstAt) firstAt = Date.now();
        controller.enqueue(encoder.encode(sse(payload)));
        await sleep(30 + Math.random() * 40);
      }
      const ttftMs = firstAt ? firstAt - start : 0;
      controller.enqueue(encoder.encode(sse({ t: 'done', ttft_ms: ttftMs, tokens: parts.length })));
      controller.close();
    },
  });

  const headers: Record<string, string> = {
    'x-trace-id': traceId,
    'cache-control': 'no-store',
    'content-type': 'text/event-stream; charset=utf-8',
  };

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
      has_key: !!providerKey,
      trace_id: traceId,
    };
    try {
      console.log('chat_gateway', JSON.stringify(rec));
    } catch {}
  })();

  return new Response(stream, { headers });
}

