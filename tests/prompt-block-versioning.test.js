const test = require('node:test');
const assert = require('node:assert/strict');

function canWrite(role) {
  return role === 'editor' || role === 'admin' || role === 'owner';
}

function nextVersion(current, role) {
  return role === 'owner' ? current + 1 : current;
}

function shouldSaveSnapshot(role) {
  return role === 'owner';
}

test('viewer cannot write', () => {
  assert.equal(canWrite('viewer'), false);
});

test('editor keeps version', () => {
  assert.equal(canWrite('editor'), true);
  assert.equal(nextVersion(1, 'editor'), 1);
  assert.equal(shouldSaveSnapshot('editor'), false);
});

test('owner increments version', () => {
  assert.equal(canWrite('owner'), true);
  assert.equal(nextVersion(1, 'owner'), 2);
  assert.equal(shouldSaveSnapshot('owner'), true);
});
