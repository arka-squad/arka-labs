import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/webhook/github/route';

function makeReq(event: string, delivery: string, payload: any, secret: string, includeSig = true) {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'x-github-delivery': delivery,
    'x-github-event': event,
  };
  if (includeSig) {
    const sig = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
    headers['x-hub-signature-256'] = sig;
  }
  return new NextRequest('http://test/api/webhook/github', {
    method: 'POST',
    headers,
    body,
  });
}

test('missing hmac yields 403', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const payload = { repository: { full_name: 'a/b' } };
  const req = makeReq('issues', 'd1', payload, 'x', false);
  const res = await POST(req);
  assert.equal(res.status, 403);
});

test('async event returns 202', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const payload = { repository: { full_name: 'a/b' }, workflow_run: { id: 1 } };
  const req = makeReq('workflow_run', 'd2', payload, 'x');
  const res = await POST(req);
  assert.equal(res.status, 202);
});

test('sync event returns 200', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const payload = { repository: { full_name: 'a/b' } };
  const req = makeReq('issues', 'd3', payload, 'x');
  const res = await POST(req);
  assert.equal(res.status, 200);
});

test('duplicate delivery handled once', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const payload = { repository: { full_name: 'a/b' } };
  const req1 = makeReq('issues', 'dup1', payload, 'x');
  const res1 = await POST(req1);
  assert.equal(res1.status, 200);
  const req2 = makeReq('issues', 'dup1', payload, 'x');
  const res2 = await POST(req2);
  assert.equal(res2.status, 202);
  const json = await res2.json();
  assert.equal(json.status, 'duplicate');
});

test('invalid payload yields 400', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const body = '{invalid';
  const headers: Record<string, string> = {
    'x-github-delivery': 'd4',
    'x-github-event': 'issues',
    'x-hub-signature-256': `sha256=${crypto.createHmac('sha256', 'x').update(body).digest('hex')}`,
  };
  const req = new NextRequest('http://test/api/webhook/github', {
    method: 'POST',
    headers,
    body,
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});

test('repo not allowlisted yields 403', async () => {
  process.env.GITHUB_WEBHOOK_SECRET = 'x';
  process.env.ALLOWLIST_REPOS = 'a/b';
  const payload = { repository: { full_name: 'c/d' } };
  const req = makeReq('issues', 'd5', payload, 'x');
  const res = await POST(req);
  assert.equal(res.status, 403);
});
