import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { resolveLoginError, loginCopy } from '../app/login/messages';

// Error mapping tests

test('resolveLoginError INVALID_CREDENTIALS', () => {
  assert.equal(
    resolveLoginError('INVALID_CREDENTIALS'),
    loginCopy.errors.INVALID_CREDENTIALS,
  );
});

test('resolveLoginError INVALID_PASSWORD', () => {
  assert.equal(
    resolveLoginError('INVALID_PASSWORD'),
    loginCopy.errors.INVALID_PASSWORD,
  );
});

test('resolveLoginError network', () => {
  assert.equal(resolveLoginError(undefined, true), loginCopy.errors.NETWORK);
});

// Component structure tests via static analysis

test('login page shows reset link in normal state', () => {
  const file = path.join(__dirname, '../../app/login/page.tsx');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('!error && ('));
  assert(content.includes('href="/reset"'));
  assert(content.includes('loginCopy.forgot'));
});
