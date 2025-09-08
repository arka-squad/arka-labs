import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { getJob } from '../../../../services/gates/runner';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (req: NextRequest) => {
    const jobId = req.nextUrl.searchParams.get('job_id');
    if (!jobId) {
      return NextResponse.json({ error: 'job_id-required' }, { status: 400 });
    }
    const job = getJob(jobId);
    if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const dir = job.type === 'gate' ? 'gates' : 'recipes';
    let content: string;
    try {
      content = await fs.readFile(
        path.join(process.cwd(), 'logs', dir, `${jobId}.ndjson`),
        'utf8'
      );
    } catch {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: open\n\n'));
        for (const line of content.trim().split('\n')) {
          controller.enqueue(encoder.encode(`data: ${line}\n\n`));
        }
        controller.enqueue(encoder.encode('event: end\n\n'));
        controller.close();
      },
    });
    return new NextResponse(stream, {
      headers: { 'content-type': 'text/event-stream' },
    });
  }
);
