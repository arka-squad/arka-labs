import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { getJob } from '../../../../services/gates/runner';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { TRACE_HEADER, generateTraceId } from '../../../../lib/trace';
import { trackSse } from '../../../../services/metrics';

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (req: NextRequest) => {
    const trace = req.headers.get(TRACE_HEADER) || generateTraceId();
    const Query = z.object({ job_id: z.string() });
    const parsed = Query.safeParse({ job_id: req.nextUrl.searchParams.get('job_id') });
    if (!parsed.success) {
      const res = NextResponse.json({ error: 'job_id-required' }, { status: 400 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
    const jobId = parsed.data.job_id;
    const job = getJob(jobId);
    if (!job) {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
    const dir = job.type === 'gate' ? 'gates' : 'recipes';
    let content: string;
    try {
      content = await fs.readFile(
        path.join(process.cwd(), 'logs', dir, `${jobId}.ndjson`),
        'utf8'
      );
    } catch {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
    const encoder = new TextEncoder();
    const route = '/api/gates/stream';
    const stream = new ReadableStream({
      start(controller) {
        trackSse(route, +1);
        controller.enqueue(encoder.encode('event: open\n\n'));
        for (const line of content.trim().split('\n')) {
          controller.enqueue(encoder.encode(`data: ${line}\n\n`));
        }
        controller.enqueue(encoder.encode('event: end\n\n'));
        controller.close();
        trackSse(route, -1);
      },
      cancel() {
        trackSse(route, -1);
      },
    });
    return new NextResponse(stream, {
      headers: { 'content-type': 'text/event-stream', [TRACE_HEADER]: trace },
    });
  }
);
