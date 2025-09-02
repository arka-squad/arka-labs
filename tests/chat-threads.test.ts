import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import * as postgres from '@vercel/postgres';

test('returns last_msg_at for thread without messages', async () => {
  const id = randomUUID();
  const createdAt = '2020-01-01T00:00:00.000Z';
  (postgres as any).sql = async () => ({ rows: [{ id, title: 'empty', last_msg_at: createdAt }] });
  const { GET } = await import('../app/api/chat/threads/route');
  const res = await GET(new NextRequest('http://test/api/chat/threads'));
  assert.equal(res.status, 200);
  const body = await res.json();
  const thread = body.items.find((t: any) => t.id === id);
  assert(thread);
  assert.equal(thread.last_msg_at, createdAt);
});
