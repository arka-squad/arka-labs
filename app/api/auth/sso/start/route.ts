import { NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';

export async function GET() {
  // access to env ensures JWT_SECRET is validated at build time
  env.JWT_SECRET;

  return NextResponse.json({ error: 'not implemented' }, { status: 501 });
}
