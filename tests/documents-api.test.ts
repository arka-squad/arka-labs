import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../lib/storage';

test('storage exposes put/get/delete', () => {
  assert.equal(typeof storage.putObject, 'function');
  assert.equal(typeof storage.getObjectURL, 'function');
  assert.equal(typeof storage.deleteObject, 'function');
});
