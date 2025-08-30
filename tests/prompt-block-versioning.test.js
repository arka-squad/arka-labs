const test = require('node:test');
const assert = require('node:assert/strict');

function canWrite(role) {
  return role === 'operator' || role === 'owner';
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

test('operator keeps version', () => {
  assert.equal(canWrite('operator'), true);
  assert.equal(nextVersion(1, 'operator'), 1);
  assert.equal(shouldSaveSnapshot('operator'), false);
});

test('owner increments version', () => {
  assert.equal(canWrite('owner'), true);
  assert.equal(nextVersion(1, 'owner'), 2);
  assert.equal(shouldSaveSnapshot('owner'), true);
});
