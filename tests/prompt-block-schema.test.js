const test = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const fs = require('node:fs');
const path = require('node:path');

const schemaPath = path.join(__dirname, '../arka-meta/contracts/json-schema/PromptBlockInput.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
delete schema.$schema;
const ajv = new Ajv();
const validate = ajv.compile(schema);

test('PromptBlockInput schema accepts valid payload', () => {
  assert.equal(validate({ title: 't', value: 'v', trigger: 'auto' }), true);
});

test('PromptBlockInput schema rejects unknown field', () => {
  assert.equal(validate({ title: 't', value: 'v', foo: 'bar' }), false);
});
