import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  // TODO: create thread
  return NextResponse.json({ agentId: params.id, thread: data });
}
