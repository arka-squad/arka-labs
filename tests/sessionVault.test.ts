import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SessionVault } from '../lib/sessionVault.ts';

// Set up a fixed salt for hashing
process.env.SESSION_SALT = 'test_salt';

describe('SessionVault', () => {
  const vault = new SessionVault(1); // TTL = 1s for tests

  it('should create and retrieve a valid session', () => {
    const provider = 'openai';
    const key = 'secret_key';
    const sessionId = vault.createSession(provider, key);
    const session = vault.getSession(sessionId);
    assert.ok(session, 'Session should exist');
    assert.strictEqual(session.provider, provider);
    assert.strictEqual(typeof session.keyHash, 'string');
    assert.notStrictEqual(session.keyHash, key, 'Key hash should not equal raw key');
  });

  it('should revoke a session', () => {
    const sessionId = vault.createSession('openai', 'another_key');
    assert.ok(vault.getSession(sessionId));
    const revoked = vault.revokeSession(sessionId);
    assert.strictEqual(revoked, true);
    assert.strictEqual(vault.getSession(sessionId), null, 'Session should be revoked and not retrievable');
  });

  it('should expire sessions after TTL', async () => {
    const sessionId = vault.createSession('anthropic', 'key123');
    assert.ok(vault.getSession(sessionId));
    // Wait for TTL to expire (1s) plus margin
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.strictEqual(vault.getSession(sessionId), null, 'Session should be expired and removed');
  });
});
