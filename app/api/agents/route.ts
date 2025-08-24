import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ agents: [] });
}

export async function POST(req: Request) {
  const data = await req.json();
  // TODO: create agent
  return NextResponse.json({ agent: data });
}
