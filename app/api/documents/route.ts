import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { sql } from '../../../lib/db';
import { storage } from '../../../lib/storage';

export const runtime = 'nodejs';

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export const GET = withAuth(['viewer', 'operator', 'owner'], async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project');
  const q = searchParams.get('q');
  const label = searchParams.get('label');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') || '25'), 1), 100);

  const conditions: any[] = [];
  if (project) conditions.push(sql`project_id = ${project}`);
  if (q) conditions.push(sql`name ILIKE ${'%' + q + '%'}`);
  if (label) conditions.push(sql`${label} = ANY(tags)`);
  const where = conditions.length ? sql`where ${sql.join(conditions, sql` and `)}` : sql``;
  const offset = (page - 1) * pageSize;

  const { rows } = await sql`
    select id, project_id, name, mime, size, storage_key, tags, created_at
    from documents
    ${where}
    order by created_at desc
    limit ${pageSize} offset ${offset}
  `;
  const { rows: countRows } = await sql`
    select count(*)::int as count
    from documents
    ${where}
  `;

  return NextResponse.json({
    items: rows,
    total: countRows[0].count,
    page,
    pageSize,
  });
});

export const POST = withAuth(['operator', 'owner'], async (req: NextRequest) => {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'invalid_mime' }, { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const storageKey = `${Date.now()}-${file.name}`;
  await storage.putObject(storageKey, buffer, file.type);
  const project = (form.get('project') as string) || 'arka';
  const labels = form.getAll('labels').map(String).filter(Boolean);
  const tags = labels.length
    ? sql`ARRAY[${sql.join(labels.map((l) => sql`${l}`), sql`,`)}]`
    : sql`ARRAY[]::text[]`;
  const { rows } = await sql`
    insert into documents (project_id, name, mime, size, storage_key, tags)
    values (${project}, ${file.name}, ${file.type}, ${file.size}, ${storageKey}, ${tags})
    returning id, project_id, name, mime, size, storage_key, tags, created_at
  `;
  return NextResponse.json(rows[0], { status: 201 });
});
