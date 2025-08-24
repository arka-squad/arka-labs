import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const data = await req.json();
  // TODO: pin message
  return NextResponse.json({ threadId: params.threadId, pin: data });
}
