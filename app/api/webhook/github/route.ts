export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verify(sig: string | null, payload: string, secret: string) {
  if (!sig) return false;
  const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${h}`;
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); }
  catch { return false; }
}

async function appJwt(appId: string, pkPem: string) {
  const now = Math.floor(Date.now()/1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iat: now-60, exp: now+9*60, iss: appId })).toString('base64url');
  const data = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256').update(data).sign(pkPem, 'base64url');
  return `${data}.${sign}`;
}

async function installationToken(appId: string, pkPem: string, owner: string, repo: string) {
  const jwt = await appJwt(appId, pkPem);
  const inst = await fetch(`https://api.github.com/repos/${owner}/${repo}/installation`, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' }
  });
  if (!inst.ok) throw new Error(`install lookup ${inst.status}`);
  const { id } = await inst.json();

  const tok = await fetch(`https://api.github.com/app/installations/${id}/access_tokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' }
  });
  if (!tok.ok) throw new Error(`token create ${tok.status}`);
  const j = await tok.json();
  return j.token as string;
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  const raw = await req.text();
  if (!verify(req.headers.get('x-hub-signature-256'), raw, secret))
    return new NextResponse('bad signature', { status: 401 });

  const event = req.headers.get('x-github-event') || undefined;
  const payload = JSON.parse(raw || '{}');

  const allow = (process.env.ALLOWLIST_REPOS || '').split(',').map(s => s.trim()).filter(Boolean);
  const repoFull: string | undefined = payload?.repository?.full_name
    || payload?.workflow_run?.repository?.full_name;
  if (allow.length && (!repoFull || !allow.includes(repoFull)))
    return new NextResponse(null, { status: 204 });

  const interesting = new Set(['push','pull_request','workflow_run','workflow_job','issues','issue_comment']);
  if (!event || !interesting.has(event)) return new NextResponse(null, { status: 204 });

  try {
    const [owner, repo] = String(repoFull).split('/');
    const appId = process.env.GITHUB_APP_ID || '';
    const pkPem = (process.env.GITHUB_PRIVATE_KEY || '').replace(/\n/g, '\n');
    const token = await installationToken(appId, pkPem, owner, repo);

    const reason = `${event}:${payload.action ?? 'na'}`;
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      body: JSON.stringify({ event_type: 'arka-event', client_payload: { source: 'arka', reason } })
    });
    console.log('[ARKA] dispatch', repoFull, reason, r.status);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('[ARKA] error', (e as Error).message);
    return new NextResponse('internal', { status: 500 });
  }
}
