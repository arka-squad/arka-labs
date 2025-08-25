export const runtime = 'nodejs';        // force Node, pas Edge
export const dynamic = 'force-dynamic'; // pas de cache

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verify(sig256: string | null, payload: string, secret: string) {
  if (!sig256) return false;
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${h}`;
  try { return crypto.timingSafeEqual(Buffer.from(sig256), Buffer.from(expected)); }
  catch { return false; }
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  const sig = req.headers.get('x-hub-signature-256');
  const event = req.headers.get('x-github-event') || undefined;

  const raw = await req.text();
  if (!verify(sig, raw, secret)) return new NextResponse('bad signature', { status: 401 });

  const allow = (process.env.ALLOWLIST_REPOS || '').split(',').map(s => s.trim()).filter(Boolean);
  const payload = JSON.parse(raw || '{}');
  const repoFull: string | undefined = payload?.repository?.full_name;

  const allowed = !allow.length || (repoFull && allow.includes(repoFull));
  if (!allowed) return new NextResponse(null, { status: 204 });

  console.log('[ARKA]', { event, repo: repoFull, action: payload?.action });

  // TODO: dispatch repo si besoin
  return new NextResponse(null, { status: 204 });
}
