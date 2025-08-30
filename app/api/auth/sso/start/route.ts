import { NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';

export async function GET() {
  // access to env ensures AUTH_SECRET is validated at build time
  env.AUTH_SECRET;

  return NextResponse.json({ error: 'not implemented' }, { status: 501 });
}
