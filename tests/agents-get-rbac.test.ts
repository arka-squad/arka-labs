import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_ISSUER = 'arka';
process.env.JWT_AUDIENCE = 'arka-squad';

import { signToken } from '../lib/auth';
import { GET } from '../app/api/agents/route';

const tokens = {
  viewer: signToken({ sub: 'v', role: 'viewer' }),
  editor: signToken({ sub: 'e', role: 'editor' }),
  admin: signToken({ sub: 'a', role: 'admin' }),
};

test('rbac GET /api/agents', async () => {
  let res = await GET(new NextRequest('http://test/api/agents'));
  assert.equal(res.status, 401);

  res = await GET(new NextRequest('http://test/api/agents', { headers: { authorization: `Bearer ${tokens.viewer}` } }));
  assert.equal(res.status, 403);

  res = await GET(new NextRequest('http://test/api/agents', { headers: { authorization: `Bearer ${tokens.editor}` } }));
  assert.equal(res.status, 200);

  res = await GET(new NextRequest('http://test/api/agents', { headers: { authorization: `Bearer ${tokens.admin}` } }));
  assert.equal(res.status, 200);
});
