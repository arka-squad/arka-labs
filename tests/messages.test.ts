import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMessage } from '../app/api/threads/[threadId]/messages/schema';

test('validateMessage accepts valid payload', () => {
  assert.equal(validateMessage({ role: 'user', content: 'hi' }), true);
});

test('validateMessage rejects unknown fields', () => {
  assert.equal(validateMessage({ role: 'user', content: 'hi', foo: 'bar' } as any), false);
});

test('validateMessage rejects negative tokens', () => {
  assert.equal(validateMessage({ role: 'user', content: 'hi', tokens: -1 }), false);
});

test('validateMessage rejects non-object meta', () => {
  assert.equal(validateMessage({ role: 'user', content: 'hi', meta: 'x' } as any), false);
});
