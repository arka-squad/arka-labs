import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_ISSUER = 'arka';
process.env.JWT_AUDIENCE = 'arka-squad';
import { signToken } from '../lib/auth';
import { POST as createAgent } from '../app/api/agents/route';
import { POST as runAgent } from '../app/api/agent/[id]/run/route';
import { POST as createThread } from '../app/api/agents/[id]/threads/route';
import { POST as postMessage } from '../app/api/threads/[threadId]/messages/route';
import { POST as pinMessage } from '../app/api/threads/[threadId]/pin/route';
import { POST as unpinMessage } from '../app/api/threads/[threadId]/unpin/route';
import { POST as abortThread } from '../app/api/threads/[threadId]/abort/route';

const token = signToken({ sub: 'u1', role: 'admin' });

function req(url: string, body?: any, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('e2e agent thread flow', async () => {
  // create agent
  let res = await createAgent(req('http://test/api/agents', { name: 'a1' }));
  assert.equal(res.status, 201);
  const agent = await res.json();
  const agentId = agent.id.toString();

  // run agent
  res = await runAgent(
    req(`http://test/api/agent/${agentId}/run`, undefined, { 'x-idempotency-key': randomUUID() }),
    { params: { id: agentId } }
  );
  assert.equal(res.status, 202);

  // create thread
  res = await createThread(req(`http://test/api/agents/${agentId}/threads`), { params: { id: agentId } });
  assert.equal(res.status, 201);
  const thread = await res.json();
  const threadId = thread.thread_id as string;

  // post message
  res = await postMessage(
    req(`http://test/api/threads/${threadId}/messages`, { role: 'user', content: 'hi' }),
    { params: { threadId } }
  );
  assert.equal(res.status, 201);
  const msg = await res.json();
  const messageId = msg.message_id as number;

  // pin
  res = await pinMessage(
    req(`http://test/api/threads/${threadId}/pin`, { message_id: messageId }),
    { params: { threadId } }
  );
  assert.equal(res.status, 200);

  // unpin
  res = await unpinMessage(req(`http://test/api/threads/${threadId}/unpin`, {}), { params: { threadId } });
  assert.equal(res.status, 200);

  // abort
  res = await abortThread(
    req(`http://test/api/threads/${threadId}/abort`, undefined, { 'x-idempotency-key': randomUUID() }),
    { params: { threadId } }
  );
  assert.equal(res.status, 202);
});
