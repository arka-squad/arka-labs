import test from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from '../lib/http';

test('apiFetch ajoute Authorization si token présent', async () => {
  (global as any).document = { cookie: 'arka_access_token=token123' };
  let auth: string | null = null;
  (global as any).fetch = async (_: any, init: any) => {
    auth = init.headers.get('Authorization');
    return new Response(null, { status: 200 });
  };
  await apiFetch('/api/test');
  assert.equal(auth, 'Bearer token123');
});

test('apiFetch redirige sur /login quand 401', async () => {
  (global as any).document = { cookie: '' };
  const loc = { href: '' };
  (global as any).window = { location: loc };
  (global as any).fetch = async () => new Response(null, { status: 401 });
  await apiFetch('/api/test');
  assert.equal(loc.href, '/login');
});
