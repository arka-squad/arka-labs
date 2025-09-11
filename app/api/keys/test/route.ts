import { NextResponse } from 'next/server';
import { z } from 'zod';
import { testProviderKey } from '../../../../lib/providers/router';

const BodySchema = z.object({
  provider: z.string(),
  model: z.string(),
  apiKey: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const { provider, model, apiKey } = BodySchema.parse(json);
  try {
    const result = await testProviderKey(provider, model, apiKey);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
