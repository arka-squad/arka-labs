import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../../lib/rbac';
import { getJob } from '../../../../../../services/gates/runner';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TRACE_HEADER, generateTraceId } from '../../../../../../lib/trace';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (req: NextRequest, _user, { params }: { params: { id: string } }) => {
    const trace = req.headers.get(TRACE_HEADER) || generateTraceId();
    const Params = z.object({ id: z.string() });
    const parsed = Params.safeParse(params);
    if (!parsed.success) {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
    const job = getJob(parsed.data.id);
    if (!job) {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
    const dir = job.type === 'gate' ? 'gates' : 'recipes';
    try {
      const content = await fs.readFile(
        path.join(process.cwd(), 'logs', dir, `${job.id}.ndjson`),
        'utf8'
      );
      const res = new NextResponse(content, {
        headers: { 'content-type': 'application/x-ndjson', [TRACE_HEADER]: trace },
      });
      return res;
    } catch {
      const res = NextResponse.json({ error: 'not_found' }, { status: 404 });
      res.headers.set(TRACE_HEADER, trace);
      return res;
    }
  }
);
