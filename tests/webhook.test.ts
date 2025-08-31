import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';

const routePath = '../app/api/webhook/github/route';

function sign(body: string, secret: string) {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

test('webhook returns ok with valid signature', async () => {
  process.env.WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ hello: 'world' });
  const sig = sign(body, 'shh');
  const { POST } = require(routePath);
  const req = new Request('http://test/api/webhook/github', {
    method: 'POST',
    headers: {
      'X-Hub-Signature-256': sig,
      'X-GitHub-Delivery': '1',
    },
    body,
  });
  const res = await POST(req as any);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('webhook rejects bad signature', async () => {
  process.env.WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ hello: 'world' });
  const { POST } = require(routePath);
  const req = new Request('http://test/api/webhook/github', {
    method: 'POST',
    headers: {
      'X-Hub-Signature-256': 'sha256=bad',
      'X-GitHub-Delivery': '2',
    },
    body,
  });
  const res = await POST(req as any);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'bad_signature' });
});

test('webhook is idempotent on duplicate events', async () => {
  process.env.WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ hello: 'world' });
  const sig = sign(body, 'shh');
  const { POST } = require(routePath);
  const req = new Request('http://test/api/webhook/github', {
    method: 'POST',
    headers: {
      'X-Hub-Signature-256': sig,
      'X-GitHub-Delivery': '3',
    },
    body,
  });
  const res1 = await POST(req.clone() as any);
  assert.equal(res1.status, 200);
  const res2 = await POST(req as any);
  assert.equal(res2.status, 200);
  assert.deepEqual(await res2.json(), { ok: true, idempotent: true });
});
