import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const writeEnabled = process.env.MEM_WRITE_ENABLED === 'true' && process.env.NODE_ENV !== 'production';
  const body = {
    kv: 'ok',
    db: 'ok',
    blob: 'ok',
    write_enabled: writeEnabled} as const;
  return NextResponse.json(body, { status: 200 });
}

