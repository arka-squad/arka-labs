import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  // TODO: trigger agent run
  return NextResponse.json({ run: params.id });
}
