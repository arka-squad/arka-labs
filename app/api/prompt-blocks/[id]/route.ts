import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { sql } from '../../../../lib/db';
import { log } from '../../../../lib/logger';
import { validatePromptBlock } from '../schema';
import { nextVersion, shouldSaveSnapshot } from '../versioning';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export const PATCH = withAuth(['operator', 'owner'], async (req: NextRequest, user, { params }) => {
  const start = Date.now();
  const route = `/api/prompt-blocks/${params.id}`;
  const trace = req.headers.get('x-trace-id') || randomUUID();
  const body = await req.json().catch(() => null);
  if (!validatePromptBlock(body)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { rows } = await sql`select id, project_id, title, value, trigger, version from prompt_blocks where id=${params.id}`;
  if (!rows.length) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const current = rows[0];
  const u = user!;
  const ver = nextVersion(current.version, u.role);
  const { title, value, trigger } = body;
  await sql`
    update prompt_blocks set title=${title}, value=${value}, trigger=${trigger ?? null}, version=${ver}, updated_at=now()
    where id=${params.id}
  `;
  if (shouldSaveSnapshot(u.role)) {
    await sql`
      insert into prompt_block_versions (block_id, version, title, value, trigger)
      values (${params.id}, ${ver}, ${title}, ${value}, ${trigger ?? null})
    `;
  }
  const { rows: updated } = await sql`select id, project_id, title, value, trigger, version, created_at, updated_at from prompt_blocks where id=${params.id}`;
  log('info', 'prompt_blocks_update', { route, status: 200, duration_ms: Date.now() - start, trace_id: trace });
  return NextResponse.json(updated[0]);
});

export const DELETE = withAuth(['operator', 'owner'], async (req: NextRequest, user, { params }) => {
  const start = Date.now();
  const route = `/api/prompt-blocks/${params.id}`;
  const trace = req.headers.get('x-trace-id') || randomUUID();
  const u = user!;
  if (shouldSaveSnapshot(u.role)) {
    const { rows } = await sql`select title, value, trigger, version from prompt_blocks where id=${params.id}`;
    if (rows.length) {
      const b = rows[0];
      await sql`
        insert into prompt_block_versions (block_id, version, title, value, trigger)
        values (${params.id}, ${b.version}, ${b.title}, ${b.value}, ${b.trigger})
      `;
    }
  }
  await sql`delete from prompt_blocks where id=${params.id}`;
  log('info', 'prompt_blocks_delete', { route, status: 204, duration_ms: Date.now() - start, trace_id: trace });
  return NextResponse.json({}, { status: 204 });
});
