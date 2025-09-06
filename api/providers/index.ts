import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionVault } from '../../lib/sessionVault';
import { PROVIDERS_SEED } from '../../lib/providers/seed';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import { log } from '../../lib/logger';

// Simple in-memory cache
let cached: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow public providers list in dev for UI integration
  if (process.env.NEXT_PUBLIC_COCKPIT_PREFILL !== '1') {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const token = auth.slice(7);
    try {
      verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  }

  if (req.method === 'GET') {
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }
    const data = {
      providers: PROVIDERS_SEED,
      cached_ms: Date.now(),
    };
    cached = { data, timestamp: Date.now() };
    log('info', 'providers_list', { route: '/api/providers', status: 200 });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
