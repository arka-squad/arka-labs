import test from 'node:test';
import assert from 'node:assert/strict';

test('GET /api/version returns keys', async () => {
  const { GET } = require('../app/api/version/route');
  const res = await GET(new Request('http://test/api/version'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(typeof body === 'object');
  assert.ok(Object.prototype.hasOwnProperty.call(body, 'env'));
  assert.ok(Object.prototype.hasOwnProperty.call(body, 'version'));
  assert.ok(Object.prototype.hasOwnProperty.call(body, 'commit_sha'));
});

