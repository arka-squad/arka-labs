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
import { POST as pin } from '../app/api/threads/[threadId]/pin/route';
import { POST as unpin } from '../app/api/threads/[threadId]/unpin/route';
import { POST as abort } from '../app/api/threads/[threadId]/abort/route';

const tokens = {
  viewer: signToken({ sub: 'v', role: 'viewer' }),
  editor: signToken({ sub: 'e', role: 'editor' }),
  admin: signToken({ sub: 'a', role: 'admin' }),
  owner: signToken({ sub: 'w', role: 'owner' }),
};

const roles = [
  { name: 'noauth', token: null },
  { name: 'viewer', token: tokens.viewer },
  { name: 'editor', token: tokens.editor },
  { name: 'admin', token: tokens.admin },
  { name: 'owner', token: tokens.owner },
];

function request(url: string, token: string | null, body?: any, headers: Record<string, string> = {}) {
  const h: Record<string, string> = { ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  return new NextRequest(url, { method: 'POST', headers: h, body: body ? JSON.stringify(body) : undefined });
}

test('rbac route matrix', async () => {
  const cases = [
    {
      name: 'create agent',
      handler: createAgent,
      make: (tok: string | null) => [request('http://test/api/agents', tok, { name: 'a' }), undefined],
      success: 201,
      allowed: ['admin', 'owner'],
    },
    {
      name: 'run agent',
      prepare: async () => {
        const res = await createAgent(request('http://test/api/agents', tokens.owner, { name: 'x' }), undefined);
        const ag = await res.json();
        return { agentId: ag.id.toString() };
      },
      handler: runAgent,
      make: (tok: string | null, ctx: any) => [
        request(`http://test/api/agent/${ctx.agentId}/run`, tok, undefined, { 'x-idempotency-key': randomUUID() }),
        { params: { id: ctx.agentId } },
      ],
      success: 202,
      allowed: ['editor', 'admin', 'owner'],
    },
    {
      name: 'post message',
      prepare: async () => {
        const agRes = await createAgent(request('http://test/api/agents', tokens.owner, { name: 'x' }), undefined);
        const agentId = (await agRes.json()).id.toString();
        const thRes = await createThread(request(`http://test/api/agents/${agentId}/threads`, tokens.owner), { params: { id: agentId } });
        const threadId = (await thRes.json()).thread_id;
        return { threadId };
      },
      handler: postMessage,
      make: (tok: string | null, ctx: any) => [
        request(`http://test/api/threads/${ctx.threadId}/messages`, tok, { role: 'user', content: 'hi' }),
        { params: { threadId: ctx.threadId } },
      ],
      success: 201,
      allowed: ['editor', 'admin', 'owner'],
    },
    {
      name: 'pin message',
      prepare: async () => {
        const agRes = await createAgent(request('http://test/api/agents', tokens.owner, { name: 'x' }), undefined);
        const agentId = (await agRes.json()).id.toString();
        const thRes = await createThread(request(`http://test/api/agents/${agentId}/threads`, tokens.owner), { params: { id: agentId } });
        const threadId = (await thRes.json()).thread_id;
        const msgRes = await postMessage(
          request(`http://test/api/threads/${threadId}/messages`, tokens.owner, { role: 'user', content: 'hi' }),
          { params: { threadId } }
        );
        const messageId = (await msgRes.json()).message_id;
        return { threadId, messageId };
      },
      handler: pin,
      make: (tok: string | null, ctx: any) => [
        request(`http://test/api/threads/${ctx.threadId}/pin`, tok, { message_id: ctx.messageId }),
        { params: { threadId: ctx.threadId } },
      ],
      success: 200,
      allowed: ['editor', 'admin', 'owner'],
    },
    {
      name: 'unpin message',
      prepare: async () => {
        const agRes = await createAgent(request('http://test/api/agents', tokens.owner, { name: 'x' }), undefined);
        const agentId = (await agRes.json()).id.toString();
        const thRes = await createThread(request(`http://test/api/agents/${agentId}/threads`, tokens.owner), { params: { id: agentId } });
        const threadId = (await thRes.json()).thread_id;
        const msgRes = await postMessage(
          request(`http://test/api/threads/${threadId}/messages`, tokens.owner, { role: 'user', content: 'hi' }),
          { params: { threadId } }
        );
        const messageId = (await msgRes.json()).message_id;
        await pin(request(`http://test/api/threads/${threadId}/pin`, tokens.owner, { message_id: messageId }), {
          params: { threadId },
        });
        return { threadId };
      },
      handler: unpin,
      make: (tok: string | null, ctx: any) => [
        request(`http://test/api/threads/${ctx.threadId}/unpin`, tok, {}),
        { params: { threadId: ctx.threadId } },
      ],
      success: 200,
      allowed: ['editor', 'admin', 'owner'],
    },
    {
      name: 'abort thread',
      prepare: async () => {
        const agRes = await createAgent(request('http://test/api/agents', tokens.owner, { name: 'x' }), undefined);
        const agentId = (await agRes.json()).id.toString();
        const thRes = await createThread(request(`http://test/api/agents/${agentId}/threads`, tokens.owner), { params: { id: agentId } });
        const threadId = (await thRes.json()).thread_id;
        return { threadId };
      },
      handler: abort,
      make: (tok: string | null, ctx: any) => [
        request(`http://test/api/threads/${ctx.threadId}/abort`, tok, undefined, { 'x-idempotency-key': randomUUID() }),
        { params: { threadId: ctx.threadId } },
      ],
      success: 202,
      allowed: ['editor', 'admin', 'owner'],
    },
  ];

  for (const c of cases) {
    for (const r of roles) {
      const ctx = c.prepare ? await c.prepare() : {};
      const [rq, params] = c.make(r.token, ctx) as [NextRequest, any];
      const res = await (c.handler as any)(rq, params);
      const expected = r.token ? (c.allowed.includes(r.name) ? c.success : 403) : 401;
      assert.equal(res.status, expected, `${c.name} ${r.name}`);
    }
  }
});
