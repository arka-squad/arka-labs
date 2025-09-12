import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isProd() {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

function enabled() {
  return process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function GET(req: Request) {
  // Guard: dev/preview only, flag controlled
  if (isProd() || !enabled()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') || 'txt').toLowerCase(); // 'es' or 'txt'
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  const role = searchParams.get('role') || 'viewer';

  const text = `Bienvenue sur Arka — flux IA (pilote). Rôle: ${role}. TTFT mesuré.`;
  const tokens = text.split(' ');
  const encoder = new TextEncoder();

  const start = Date.now();
  let firstChunkAt = 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // petite latence pour simuler modèle
      await sleep(250 + Math.random() * 250);
      for (let i = 0; i < tokens.length; i++) {
        const chunk = tokens[i] + (i < tokens.length - 1 ? ' ' : '');
        const payload = format === 'es'
          ? `data: ${chunk}\n\n`
          : chunk;
        if (!firstChunkAt) firstChunkAt = Date.now();
        controller.enqueue(encoder.encode(payload));
        await sleep(40 + Math.random() * 60);
      }
      controller.close();
    }});

  const headers: Record<string, string> = {
    'x-trace-id': traceId,
    'cache-control': 'no-store'};
  if (format === 'es') headers['content-type'] = 'text/event-stream; charset=utf-8';
  else headers['content-type'] = 'text/plain; charset=utf-8';

  // Log NDJSON (stdout par défaut; filesystem si autorisé)
  const ttft = async () => {
    // attendre un tick pour capturer la valeur après le premier enqueue
    await sleep(0);
    const ttftMs = firstChunkAt ? firstChunkAt - start : 0;
    const rec = {
      ts: new Date().toISOString(),
      route: '/api/ai/stream',
      role,
      ttft_ms: ttftMs,
      tokens: tokens.length,
      trace_id: traceId};
    try {
      if (process.env.AI_LOG_TO_FS === '1') {
        // Lazy import fs only if requested
        const fs = await import('fs');
        const path = 'logs/ai_gateway.ndjson';
        fs.mkdirSync('logs', { recursive: true });
        fs.appendFileSync(path, JSON.stringify(rec) + '\n');
      } else {
        console.log('ai_gateway', JSON.stringify(rec));
      }
    } catch {
      // ignore logging errors
    }
  };
  ttft();

  return new NextResponse(stream, { headers });
}

