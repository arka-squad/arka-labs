import assert from 'node:assert/strict';
import { parseIntent } from '../src/chat/intents';

test('parse /gate id', () => {
  const r = parseIntent('/gate perf.lighthouse.basic');
  assert.deepEqual(r, { type: 'gate', gateId: 'perf.lighthouse.basic' });
});

test('parse /gate alias', () => {
  const r = parseIntent('/gate conformité');
  assert.deepEqual(r, { type: 'gate', gateId: 'contracts.schema.documents' });
});

test('parse /test doc', () => {
  const r = parseIntent('/test DOC123');
  assert.deepEqual(r, { type: 'test', docId: 'DOC123' });
});

