import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/rbac';

export const GET = withAuth(
  ['operator', 'owner'],
  async (req: NextRequest, _user: any, { params }: { params: { threadId: string } }) => {
  const encoder = new TextEncoder();
  let lastId = 0;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data?: any) => {
        let payload = `event: ${event}\n`;
        if (data !== undefined) {
          payload += `data: ${JSON.stringify(data)}\n`;
        }
        controller.enqueue(encoder.encode(payload + '\n'));
      };

      send('ping');
      const ping = setInterval(() => send('ping'), 15000);
      const poll = setInterval(async () => {
        const { rows } = await sql`
          select id, thread_id, role, content, created_at, tokens, meta
          from messages
          where thread_id = ${params.threadId} and id > ${lastId}
          order by id asc
        `;
        for (const row of rows) {
          lastId = row.id;
          send('message', row);
        }
      }, 1000);

      const close = () => {
        clearInterval(ping);
        clearInterval(poll);
        controller.close();
      };

      req.signal.addEventListener('abort', close);
    },
  });

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});
