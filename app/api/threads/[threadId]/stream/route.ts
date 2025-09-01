import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/rbac';
import { stream as openaiStream } from '../../../../../lib/openai';
import { log } from '../../../../../lib/logger';
import { generateTraceId, TRACE_HEADER } from '../../../../../lib/trace';

export const POST = withAuth(
  ['editor', 'admin', 'owner'],
  async (
    req: NextRequest,
    _user: any,
    { params }: { params: { threadId: string } }
  ) => {
    const encoder = new TextEncoder();
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    log('info', 'thread_stream_start', {
      route: '/api/threads/[id]/stream',
      threadId: params.threadId,
      trace_id: traceId,
      status: 200,
    });

    const { prompt } = await req.json();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data?: any) => {
          let payload = `event: ${event}\n`;
          if (data !== undefined) {
            payload += `data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n`;
          }
          controller.enqueue(encoder.encode(payload + '\n'));
        };

        send('open');
        try {
          for await (const chunk of openaiStream(prompt, {
            signal: req.signal,
            traceId,
          })) {
            send('delta', chunk);
          }
          send('done');
        } catch (err: any) {
          send('error', err.name === 'AbortError' ? 'aborted' : err.message);
        }
        controller.close();
      },
    });

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        [TRACE_HEADER]: traceId,
      },
    });
  }
);
