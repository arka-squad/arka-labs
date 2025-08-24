import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: drain action_queue
  return NextResponse.json({ drained: true });
}
