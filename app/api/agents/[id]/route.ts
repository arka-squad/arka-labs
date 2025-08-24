import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  // TODO: update agent
  return NextResponse.json({ id: params.id, data });
}
