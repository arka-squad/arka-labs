import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '../../../lib/rbac';
import { sql } from '../../../lib/db';
import { log } from '../../../lib/logger';
import { validatePromptBlock } from './schema';
import { shouldSaveSnapshot } from './versioning';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req: NextRequest) => {
  const start = Date.now();
  const route = '/api/prompt-blocks';
  const trace = req.headers.get('x-trace-id') || randomUUID();
  const { rows } = await sql`select id, project_id, title, value, trigger, version, created_at, updated_at from prompt_blocks order by id`;
  log('info', 'prompt_blocks_list', { route, status: 200, duration_ms: Date.now() - start, trace_id: trace });
  return NextResponse.json(rows);
});

export const POST = withAuth(['operator', 'owner'], async (req: NextRequest, user) => {
  const start = Date.now();
  const route = '/api/prompt-blocks';
  const trace = req.headers.get('x-trace-id') || randomUUID();
  const body = await req.json().catch(() => null);
  if (!validatePromptBlock(body)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { title, value, trigger } = body;
  const { rows } = await sql`
    insert into prompt_blocks (project_id, title, value, trigger)
    values ('arka', ${title}, ${value}, ${trigger ?? null})
    returning id, project_id, title, value, trigger, version, created_at, updated_at
  `;
  const block = rows[0];
  const u = user!;
  if (shouldSaveSnapshot(u.role)) {
    await sql`
      insert into prompt_block_versions (block_id, version, title, value, trigger)
      values (${block.id}, ${block.version}, ${block.title}, ${block.value}, ${block.trigger})
    `;
  }
  log('info', 'prompt_blocks_create', { route, status: 201, duration_ms: Date.now() - start, trace_id: trace });
  return NextResponse.json(block, { status: 201 });
});

