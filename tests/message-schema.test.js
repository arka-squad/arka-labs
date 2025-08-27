const test = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const fs = require('node:fs');
const path = require('node:path');

const schemaPath = path.join(__dirname, '../arka-meta/contracts/json-schema/MessageInput.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
delete schema.$schema;
const ajv = new Ajv();
const validate = ajv.compile(schema);

test('MessageInput schema accepts valid payload', () => {
  assert.equal(validate({ role: 'user', content: 'hello' }), true);
});

test('MessageInput schema rejects invalid payload', () => {
  assert.equal(validate({ role: 'admin', content: 'hi' }), false);
});
