import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionVault, SessionVault } from '../lib/sessionVault';
import { z } from 'zod';
import { verifyToken } from '../lib/auth';
import { log } from '../lib/logger';

const exchangeSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'openrouter', 'vercel_ai']),
  key: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const vault = getSessionVault();

  // Auth JWT
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    log('warn', 'keys_unauthenticated', { route: '/api/keys/exchange', status: 401 });
    return res.status(401).json({ error: 'unauthorized' });
  }
  const token = authHeader.slice(7);
  const user = verifyToken(token);
  if (!user) {
    log('warn', 'keys_invalid_token', { route: '/api/keys/exchange', status: 401 });
    return res.status(401).json({ error: 'invalid token' });
  }

  if (req.method === 'POST') {
    const parse = exchangeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const { provider, key } = parse.data;

    // TODO: validate JWT auth

    const sessionToken = vault.createSession(provider, key);
    // Log exchange sans clé brute
    log('info', 'keys_exchange', { route: '/api/keys/exchange', status: 201, provider, key_hash: sessionToken, ttl_sec: vault.ttlSeconds });
    return res.status(201).json({ session_token: sessionToken, ttl_sec: vault.ttlSeconds });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid session id' });
    }
    // TODO: validate JWT auth
    const success = vault.revokeSession(id);
    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Log revocation
    log('info', 'keys_revoke', { route: '/api/keys/session/:id', status: 204, session_id: id });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
