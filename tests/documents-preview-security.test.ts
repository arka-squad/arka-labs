import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
// mock sql to return a document with malicious storage_url
function mockSql() {
  return Promise.resolve({
    rows: [{ name: 'x', mime: 'text/plain', storage_url: '../etc/passwd' }],
  });
}

const dbPath = path.resolve(__dirname, '../lib/db.js');
(require.cache as any)[dbPath] = { exports: { sql: mockSql } };

test('malicious storage_url yields 403', async () => {
  const { GET } = await import('../app/api/documents/[id]/preview/route');
  const req = new Request('http://test/api/documents/1/preview');
  const res = await GET(req, { params: { id: '1' } });
  assert.equal(res.status, 403);
});
