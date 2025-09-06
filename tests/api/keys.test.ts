import { testApiHandler } from 'next-test-api-route-handler';
import handler from '../../api/keys';
import { signToken } from '../../lib/auth';
import { getSessionVault } from '../../lib/sessionVault';
import assert from 'node:assert';

describe('API /api/keys', () => {
  let token: string;

  before(() => {
    // Générer un JWT de test avec un rôle d'owner
    token = signToken({ sub: 'user123', role: 'owner' });
  });

  it('POST /api/keys/exchange should return 201 with session_token and ttl_sec', async () => {
    await testApiHandler({
      handler,
      url: '/api/keys',
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ provider: 'openai', key: 'test_key' }),
        });
        assert.strictEqual(response.status, 201);
        const json = await response.json();
        assert.ok(json.session_token, 'session_token should be present');
        assert.strictEqual(typeof json.ttl_sec, 'number');

        // Vérifier que la session existe en vault
        const vault = getSessionVault();
        const session = vault.getSession(json.session_token);
        assert.ok(session, 'Session should be retrievable');
        assert.strictEqual(session.provider, 'openai');
      },
    });
  });

  it('DELETE /api/keys/session/:id should return 204 and remove session', async () => {
    // Préparer une session à supprimer
    const vault = getSessionVault();
    const sessionId = vault.createSession('openai', 'delete_key');

    await testApiHandler({
      handler,
      url: '/api/keys',
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          query: { id: sessionId },
        });
        assert.strictEqual(response.status, 204);
        assert.strictEqual(vault.getSession(sessionId), null);
      },
    });
  });

  it('should reject unauthorized requests with 401', async () => {
    await testApiHandler({
      handler,
      url: '/api/keys',
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        assert.strictEqual(response.status, 401);
      },
    });
  });
});
