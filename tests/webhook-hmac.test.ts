import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { verifyHmac } from '../lib/hmac';

test('verifyHmac fuzz', () => {
  const secret = 's3cr3t';
  for (let i = 0; i < 20; i++) {
    const payload = crypto.randomBytes(16).toString('hex');
    const sig = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
    assert.equal(verifyHmac(sig, payload, secret), true);
    const badSig = `sha256=${crypto.randomBytes(32).toString('hex')}`;
    assert.equal(verifyHmac(badSig, payload, secret), false);
  }
});
