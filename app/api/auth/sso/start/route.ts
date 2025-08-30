import { NextResponse } from 'next/server';
import { getEnv } from '../../../../../lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const env = getEnv();
    return NextResponse.json(
      { ok: true, hasSecret: Boolean(env.AUTH_SECRET) },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('ENV_MISSING')) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    throw err;
  }
}
