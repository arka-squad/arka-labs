import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { withAuth } from '../../../lib/rbac';
import { log } from '../../../lib/logger';

export const GET = withAuth(['viewer', 'operator', 'owner'], async (_req) => {
  const start = Date.now();
  const route = '/api/projects';
  const { rows } = await sql`select id, name, description, last_activity from projects order by name`;
  log('info', 'projects list', { route, status: 200, duration_ms: Date.now() - start });
  return NextResponse.json({ projects: rows });
});

export const POST = withAuth(['operator', 'owner'], async (req) => {
  const start = Date.now();
  const route = '/api/projects';
  const body = await req.json().catch(() => null);
  const bad = () => {
    log('warn', 'invalid body', { route, status: 400, duration_ms: Date.now() - start });
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return bad();
  const keys = Object.keys(body);
  if (!('name' in body)) return bad();
  if (keys.some((k) => k !== 'name' && k !== 'description')) return bad();
  if (typeof body.name !== 'string' || body.name.length < 2 || body.name.length > 80) return bad();
  if (body.description && (typeof body.description !== 'string' || body.description.length > 512)) return bad();
  const now = new Date();
  const { rows } = await sql`
    insert into projects (name, description, last_activity)
    values (${body.name}, ${body.description || ''}, ${now})
    returning id, name, description, last_activity
  `;
  const res = rows[0];
  log('info', 'project created', { route, status: 201, duration_ms: Date.now() - start });
  return NextResponse.json(res, { status: 201 });
});
