const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('module');
const ts = require('typescript');

process.env.AUTH_SECRET = 'test-secret';

Module._extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  module._compile(outputText, filename);
};

const promptBlocks = [
  {
    id: 'b1',
    project_id: 'arka',
    title: 't1',
    value: 'v1',
    trigger: null,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
const snapshots = [];

function mockSql(strings, ...values) {
  const q = strings.join(' ').trim();
  if (q.startsWith('insert into prompt_blocks')) {
    const block = {
      id: `b${promptBlocks.length + 1}`,
      project_id: 'arka',
      title: values[0],
      value: values[1],
      trigger: values[2] ?? null,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    promptBlocks.push(block);
    return Promise.resolve({ rows: [block] });
  }
  if (q.startsWith('select id, project_id, title, value, trigger, version from prompt_blocks where id=')) {
    const id = values[0];
    const block = promptBlocks.find((b) => b.id === id);
    return Promise.resolve({ rows: block ? [block] : [] });
  }
  if (q.startsWith('update prompt_blocks set')) {
    const [title, value, trigger, ver, id] = values;
    const b = promptBlocks.find((pb) => pb.id === id);
    if (b) {
      b.title = title;
      b.value = value;
      b.trigger = trigger ?? null;
      b.version = ver;
      b.updated_at = new Date().toISOString();
    }
    return Promise.resolve({ rows: [] });
  }
  if (q.startsWith('insert into prompt_block_versions')) {
    const [block_id, version, title, value, trigger] = values;
    snapshots.push({ block_id, version, title, value, trigger });
    return Promise.resolve({ rows: [] });
  }
  if (q.startsWith('select id, project_id, title, value, trigger, version, created_at, updated_at from prompt_blocks where id=')) {
    const id = values[0];
    const block = promptBlocks.find((b) => b.id === id);
    return Promise.resolve({ rows: block ? [block] : [] });
  }
  return Promise.resolve({ rows: [] });
}

const dbPath = path.resolve(__dirname, '../lib/db.ts');
require.cache[dbPath] = { exports: { sql: mockSql } };

const { POST } = require('../app/api/prompt-blocks/route.ts');
const { PATCH } = require('../app/api/prompt-blocks/[id]/route.ts');
const { signToken } = require('../lib/auth');

function makeReq(method, url, token, body, trace) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(trace ? { 'x-trace-id': trace } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('viewer cannot POST', async () => {
  const viewer = signToken({ id: 'u1', email: 'v@e.com', role: 'viewer' });
  const before = promptBlocks.length;
  const res = await POST(makeReq('POST', 'http://x/api/prompt-blocks', viewer, { title: 'x', value: 'y' }));
  assert.equal(res.status, 403);
  assert.equal(promptBlocks.length, before);
});

test('operator PATCH does not increment version', async () => {
  const operator = signToken({ id: 'u2', email: 'o@e.com', role: 'operator' });
  const res = await PATCH(
    makeReq('PATCH', 'http://x/api/prompt-blocks/b1', operator, { title: 't2', value: 'v2' }),
    { params: { id: 'b1' } },
  );
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.version, 1);
  assert.equal(snapshots.length, 0);
});

test('owner PATCH increments version and saves snapshot', async () => {
  const owner = signToken({ id: 'u3', email: 'o@e.com', role: 'owner' });
  const res = await PATCH(
    makeReq('PATCH', 'http://x/api/prompt-blocks/b1', owner, { title: 't3', value: 'v3' }, 'trc_test'),
    { params: { id: 'b1' } },
  );
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.version, 2);
  assert.equal(snapshots.length, 1);
});
