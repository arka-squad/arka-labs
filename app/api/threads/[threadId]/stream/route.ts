import { NextRequest } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { threadId: string } }) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: stream for ${params.threadId}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
