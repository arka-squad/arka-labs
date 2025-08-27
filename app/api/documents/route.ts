import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../lib/rbac';
import { sql } from '../../../lib/db';
import fs from 'fs';
import path from 'path';

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
  const { rows } = await sql`
    select id, project_id, name, mime, size, storage_key, tags, created_at
    from documents
    ${project ? sql`where project_id = ${project}` : sql``}
    order by created_at desc
  `;
  return NextResponse.json(rows);
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
  const uploads = path.join(process.cwd(), 'uploads');
  await fs.promises.mkdir(uploads, { recursive: true });
  await fs.promises.writeFile(path.join(uploads, storageKey), buffer);
  const project = (form.get('project') as string) || 'arka';
  const { rows } = await sql`
    insert into documents (project_id, name, mime, size, storage_key)
    values (${project}, ${file.name}, ${file.type}, ${file.size}, ${storageKey})
    returning id, project_id, name, mime, size, storage_key, tags, created_at
  `;
  return NextResponse.json(rows[0], { status: 201 });
});
