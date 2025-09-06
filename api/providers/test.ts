import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { PROVIDERS_SEED } from '../../lib/providers/seed';
import { verify } from 'jsonwebtoken';
import { log } from '../../lib/logger';

const testSchema = z.object({
  provider: z.string(),
  model: z.string(),
});

type ProviderItem = typeof PROVIDERS_SEED[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth JWT
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const token = auth.slice(7);
  try { verify(token, process.env.JWT_SECRET!); } catch { return res.status(401).json({ error: 'invalid token' }); }

  if (req.method === 'POST') {
    const parse = testSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
    const { provider, model } = parse.data;
    // Validate existence
    const item = PROVIDERS_SEED.find(p => p.id === provider);
    if (!item || !item.models.some(m => m.id === model)) {
      return res.status(400).json({ ok: false, error: 'Unknown provider/model' });
    }
    // Simulate latency
    const latency = Math.floor(Math.random() * 500) + 100;
    await new Promise(r => setTimeout(r, latency));
    log('info', 'providers_test', { route: '/api/providers/test', status: 200, provider, model, latency_ms: latency });
    return res.status(200).json({ ok: true, latency_ms: latency });
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
