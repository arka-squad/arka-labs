import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function verify(signature256: string | undefined, payload: string, secret: string) {
  if (!signature256) return false;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const expected = `sha256=${hmac}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature256), Buffer.from(expected));
  } catch {
    return false;
  }
}

function appJwt(appId: string, pk: string) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId })
  ).toString('base64url');
  const toSign = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256').update(toSign).sign(pk, 'base64url');
  return `${toSign}.${sign}`;
}

async function installationToken(appId: string, pk: string, owner: string, repo: string) {
  const jwt = appJwt(appId, pk);
  const instRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/installation`, {
    headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  if (!instRes.ok) throw new Error(`installation lookup failed: ${instRes.status}`);
  const inst = await instRes.json();
  const tokRes = await fetch(
    `https://api.github.com/app/installations/${inst.id}/access_tokens`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json' },
    }
  );
  if (!tokRes.ok) throw new Error(`create token failed: ${tokRes.status}`);
  const tok = await tokRes.json();
  return tok.token as string;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-hub-signature-256') || undefined;
  const event = req.headers.get('x-github-event') || undefined;
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';

  if (!verify(sig, raw, secret)) {
    return new NextResponse('bad signature', { status: 401 });
  }

  const payload = JSON.parse(raw || '{}');
  const repoFull = payload?.repository?.full_name as string | undefined;
  const [owner, repo] = (repoFull || '').split('/');

  const allowlist = (process.env.ALLOWLIST_REPOS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = repoFull && allowlist.includes(repoFull);

  const shouldDispatch =
    allowed &&
    ['pull_request', 'issues', 'issue_comment', 'check_run', 'push'].includes(event || '');

  console.log(
    `[ARKA] event=${event} repo=${repoFull} decision=${shouldDispatch ? 'dispatch' : 'no-op'}`
  );

  if (shouldDispatch && owner && repo) {
    try {
      const appId = process.env.GITHUB_APP_ID || '';
      const pk = (process.env.GITHUB_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      const token = await installationToken(appId, pk, owner, repo);

      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          event_type: 'arka-event',
          client_payload: { source: 'arka', reason: event },
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('[ARKA] dispatch failed', r.status, t);
      }
    } catch (e) {
      console.error('[ARKA] dispatch error', e);
    }
  }

  return new NextResponse(null, { status: 204 });
}
