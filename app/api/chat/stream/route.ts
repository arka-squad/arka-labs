import { NextResponse } from 'next/server';
import { AI_ENABLED } from '../../../../lib/env';
import { resolveClient } from '../../../../lib/providers/router';
import { verifyToken } from '../../../../lib/auth';
import { getSessionVault } from '../../../../lib/sessionVault';
import { log } from '../../../../lib/logger';
import { TRACE_HEADER } from '../../../../lib/trace';
import { trackSse } from '../../../../services/metrics';

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
  const traceId =
    req.headers.get(TRACE_HEADER) ||
    searchParams.get(TRACE_HEADER) ||
    crypto.randomUUID();
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
  const route = '/api/chat/stream';
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      trackSse(route, +1);
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
      trackSse(route, -1);
    },
    cancel() {
      trackSse(route, -1);
    },
  });

  const headers: Record<string, string> = {
    [TRACE_HEADER]: traceId,
    'cache-control': 'no-store',
    'content-type': 'text/event-stream; charset=utf-8',
  };

  // Log NDJSON (stdout default)
  (async () => {
    await sleep(0);
    log('info', 'chat_gateway', {
      route,
      status: 200,
      trace_id: traceId,
      user_role: role,
      agent,
      provider,
      model,
      has_session: !!providerSession,
    });
  })();

  return new Response(stream, { headers });
}
