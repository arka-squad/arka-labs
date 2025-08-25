import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const ok =
    !!process.env.GITHUB_WEBHOOK_SECRET &&
    !!process.env.GITHUB_APP_ID &&
    !!process.env.GITHUB_PRIVATE_KEY;
  return ok
    ? new NextResponse('ready', { status: 200 })
    : new NextResponse('missing env', { status: 500 });
}
