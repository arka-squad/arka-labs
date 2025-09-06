import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionVault } from '../../lib/sessionVault';
import { verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Auth JWT
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const token = auth.slice(7);
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'invalid token' });

  // Session ID from header
  const sessionId = req.headers['x-provider-session'] as string || req.query.id as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session id' });
  }
  const vault = getSessionVault();
  const session = vault.getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  const ageSec = (Date.now() - session.createdAt) / 1000;
  const ttlRemaining = Math.max(0, vault.ttlSeconds - Math.floor(ageSec));

  return res.status(200).json({ ttl_remaining: ttlRemaining });
}
