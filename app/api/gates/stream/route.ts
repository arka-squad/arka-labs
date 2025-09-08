import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';
import { logs, jobs } from '../../../../services/gates/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req: NextRequest) => {
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('job_id') || '';
  if (!jobId) {
    const res = NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    res.headers.set(TRACE_HEADER, traceId);
    return res;
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ t: 'open', job_id: jobId, trace_id: traceId });
      let idx = 0;
      const timer = setInterval(() => {
        const arr = logs.get(jobId) || [];
        while (idx < arr.length) {
          try { send(JSON.parse(arr[idx++])); } catch { idx++; }
        }
        const j = jobs.get(jobId);
        if (!j || ['pass', 'fail', 'warn', 'error', 'canceled'].includes(j.status)) {
          clearInterval(timer);
          send({ t: 'done', status: j?.status || 'unknown' });
          controller.close();
        }
      }, 200);
    },
    cancel() { /* no-op */ },
  });
  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      [TRACE_HEADER]: traceId,
    },
  });
});

