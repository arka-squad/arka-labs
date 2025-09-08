import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { log } from '../../../lib/logger';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { TRACE_HEADER, generateTraceId } from '../../../lib/trace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (req: NextRequest) => {
    const start = Date.now();
    const trace = req.headers.get(TRACE_HEADER) || generateTraceId();
    const dir = path.join(process.cwd(), 'gates', 'catalog');
    const items: any[] = [];
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.mjs')) continue;
        const mod = await import(path.join(dir, file));
        if (mod.meta && !mod.meta.category) items.push(mod.meta);
      }
    } catch {}
    const List = z.object({ items: z.array(z.object({ id: z.string() }).passthrough()) });
    const parsed = List.safeParse({ items });
    const res = parsed.success
      ? NextResponse.json(parsed.data)
      : NextResponse.json({ error: 'invalid_output' }, { status: 500 });
    res.headers.set(TRACE_HEADER, trace);
    log('info', 'recipes_list', {
      route: '/api/recipes',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: trace,
    });
    return res;
  }
);
