import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

process.env.JWT_SECRET = 'testsecret';

const { runLot, getEventLog } = require('../lib/orchestration');
const { signToken } = require('../lib/auth');
const { POST } = require('../app/api/jobs/drain/route');

test('runLot logs full traversal', async () => {
  const before = getEventLog().length;
  await runLot('tester');
  const slice = getEventLog().slice(before);
  assert.equal(slice.length, 4);
  assert.equal(slice[0].state_from, 'DRAFT');
  assert.equal(slice[slice.length - 1].state_to, 'DONE');
});

test('POST /api/jobs/drain requires owner', async () => {
  const token = signToken({ id: 'o1', email: 'o@e.com', role: 'owner' });
  const req = new NextRequest('http://test/api/jobs/drain', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.processed, 1);

  const reqNoAuth = new NextRequest('http://test/api/jobs/drain', { method: 'POST' });
  const resNoAuth = await POST(reqNoAuth);
  assert.equal(resNoAuth.status, 401);
});
