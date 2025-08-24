import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/github';

export async function POST(req: NextRequest) {
  const delivery = req.headers.get('x-github-delivery') || '';
  const signature = req.headers.get('x-hub-signature-256') || '';
  const payload = await req.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  if (!verifySignature(secret, payload, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }
  // TODO: idempotence and enqueue actions
  return NextResponse.json({ received: true, delivery });
}
