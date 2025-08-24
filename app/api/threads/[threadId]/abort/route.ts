import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { threadId: string } }) {
  // TODO: abort thread
  return NextResponse.json({ threadId: params.threadId, aborted: true });
}
