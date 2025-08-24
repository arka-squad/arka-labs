import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const data = await req.json();
  // TODO: append message
  return NextResponse.json({ threadId: params.threadId, message: data });
}
