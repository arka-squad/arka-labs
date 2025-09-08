import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { signToken } from '../lib/auth';
import { POST } from '../app/api/recipes/run/route';

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_ISSUER = 'arka';
process.env.JWT_AUDIENCE = 'arka-squad';

function req(recipe_id: string, token: string, key: string, inputs: any = {}) {
  return new NextRequest('http://test/api/recipes/run', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-idempotency-key': key,
    },
    body: JSON.stringify({ recipe_id, inputs }),
  });
}

test('dedupe returns 409 and rate limit 429', async () => {
  const token = signToken({ sub: 'u1', role: 'owner' });
  const key1 = randomUUID();
  const key2 = randomUUID();
  const r1 = POST(req('test.sleep', token, key1, { ms: 200 }), undefined);
  const r2 = POST(req('test.sleep', token, key2, { ms: 200 }), undefined);
  const [resA, resB] = await Promise.all([r1, r2]);
  const statuses = [resA.status, resB.status].sort();
  assert.deepEqual(statuses, [202, 409]);

  const ids = ['tmp1','tmp2','tmp3','tmp4','tmp5','tmp6'].map(n=>`test.sleep.${n}`);
  for (const id of ids) {
    const file = `gates/catalog/${id}.mjs`;
    await fs.writeFile(file, "export const meta={id:'"+id+"',version:'1.0.0',title:'tmp',scope:'safe'};export function validate(i){return i;}export async function run(i){const ms=i.ms??0;await new Promise(r=>setTimeout(r,ms));return {recipe_id:meta.id,status:'pass',result:{ms}}};");
  }
  const reqs = ids.map(id=>POST(req(id, token, randomUUID(), { ms: 300 }), undefined));
  const results = await Promise.all(reqs);
  const ok = results.filter(r=>r.status===202).length;
  const rl = results.filter(r=>r.status===429).length;
  assert.equal(ok,5);
  assert.equal(rl,1);
  for (const id of ids) {
    await fs.unlink(`gates/catalog/${id}.mjs`);
  }
});
