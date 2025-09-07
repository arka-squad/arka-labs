import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';

import { POST } from '../app/api/gates/webhook/route';

function sign(body: string, secret: string) {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

test('gates webhook accepts valid signature', async () => {
  process.env.GATES_WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ job_id: '1', status: 'pass' });
  const sig = sign(body, 'shh');
  const req = new Request('http://test/api/gates/webhook', {
    method: 'POST',
    headers: { 'X-Signature': sig, 'X-Event-Id': '1' },
    body,
  });
  const res = await POST(req as any);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('gates webhook rejects bad signature', async () => {
  process.env.GATES_WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ job_id: '1', status: 'pass' });
  const req = new Request('http://test/api/gates/webhook', {
    method: 'POST',
    headers: { 'X-Signature': 'sha256=bad', 'X-Event-Id': '2' },
    body,
  });
  const res = await POST(req as any);
  assert.equal(res.status, 401);
});

test('gates webhook idempotent', async () => {
  process.env.GATES_WEBHOOK_SECRET = 'shh';
  const body = JSON.stringify({ job_id: '1', status: 'pass' });
  const sig = sign(body, 'shh');
  const req = new Request('http://test/api/gates/webhook', {
    method: 'POST',
    headers: { 'X-Signature': sig, 'X-Event-Id': '3' },
    body,
  });
  const res1 = await POST(req.clone() as any);
  assert.equal(res1.status, 200);
  const res2 = await POST(req as any);
  assert.equal(res2.status, 200);
  assert.deepEqual(await res2.json(), { ok: true, idempotent: true });
});
