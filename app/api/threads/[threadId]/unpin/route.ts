import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const data = await req.json();
  // TODO: unpin message
  return NextResponse.json({ threadId: params.threadId, unpin: data });
}
