import test from 'node:test';
import assert from 'node:assert/strict';

// test verifying trace_id in logs for /api/documents

test('GET /api/documents generates trace_id and logs', async () => {
  const dbPath = require.resolve('../lib/db');
  const originalExports = require(dbPath);
  const originalCache = require.cache[dbPath];
  let call = 0;
  require.cache[dbPath] = {
    ...(originalCache as any),
    exports: {
      ...originalExports,
      sql: async () => {
        if (call++ === 0) {
          return {
            rows: [
              {
                id: 1,
                project_id: 'p1',
                name: 'doc',
                mime: 'text/plain',
                size: 1,
                storage_url: 'url',
                created_at: new Date().toISOString(),
              },
            ],
          };
        }
        return { rows: [{ count: 1 }] };
      },
    },
  } as any;

  const logs: any[] = [];
  const origLog = console.log;
  console.log = (msg: string) => logs.push(JSON.parse(msg));

  delete require.cache[require.resolve('../app/api/documents/route')];
  const { GET } = require('../app/api/documents/route');
  const res = await GET(new Request('http://test/api/documents'));
  assert.equal(res.status, 200);
  const headerTrace = res.headers.get('x-trace-id');
  assert.ok(headerTrace);
  assert.equal(logs[0].trace_id, headerTrace);

  console.log = origLog;
  require.cache[dbPath] = originalCache;
});

test('GET /api/documents returns 503 on db error', async () => {
  const dbPath = require.resolve('../lib/db');
  const originalExports = require(dbPath);
  const originalCache = require.cache[dbPath];
  require.cache[dbPath] = {
    ...(originalCache as any),
    exports: {
      ...originalExports,
      sql: async () => {
        throw new Error('db');
      },
    },
  } as any;
  delete require.cache[require.resolve('../app/api/documents/route')];
  const { GET } = require('../app/api/documents/route');
  const res = await GET(new Request('http://test/api/documents'));
  assert.equal(res.status, 503);
  require.cache[dbPath] = originalCache;
});
