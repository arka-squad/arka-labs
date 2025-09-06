import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createMocks } from 'node-mocks-http';
import listHandler from '../../api/providers/index';
import testHandler from '../../api/providers/test';
import { signToken } from '../../lib/auth';
import { PROVIDERS_SEED } from '../../lib/providers/seed';

const ownerToken = signToken({ sub: 'u', role: 'owner' });

describe('API /api/providers', () => {
  it('GET should return providers list with cache', async () => {
    const { req, res } = createMocks({ method: 'GET', headers: { Authorization: `Bearer ${ownerToken}` } });
    await listHandler(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    const data = res._getJSONData();
    assert.deepStrictEqual(data.providers, PROVIDERS_SEED);
    assert.ok(data.cached_ms);
  });

  it('POST /api/providers/test should validate provider and model', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: PROVIDERS_SEED[0].id, model: PROVIDERS_SEED[0].models[0].id }),
    });
    await testHandler(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    const data = res._getJSONData();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(typeof data.latency_ms, 'number');
  });

  it('should return 401 on invalid or missing JWT', async () => {
    const mocks1 = createMocks({ method: 'GET' });
    await listHandler(mocks1.req, mocks1.res);
    assert.strictEqual(mocks1.res._getStatusCode(), 401);

    const mocks2 = createMocks({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'x', model: 'y' }),
    });
    await testHandler(mocks2.req, mocks2.res);
    assert.strictEqual(mocks2.res._getStatusCode(), 401);
  });
});
