import { NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { readFile } from 'fs/promises';
import { join, normalize } from 'path';
import { log } from '../../../../../lib/logger';

export const GET = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  const route = `/api/documents/${params.id}/preview`;
  const trace = req.headers.get('x-trace-id') || undefined;
  const { rows } =
    await sql`select name, mime, storage_url from documents where id=${params.id}::int`;
  if (!rows[0])
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const doc = rows[0];
  const file = doc.storage_url.startsWith('demo/')
    ? doc.storage_url.replace(/^demo\//, '')
    : doc.storage_url;
  const publicRoot = join(process.cwd(), 'public');
  const p = normalize(join(publicRoot, file));
  if (!p.startsWith(publicRoot)) {
    log('warn', 'documents_preview_invalid_path', {
      route,
      status: 403,
      trace_id: trace,
      storage_url: doc.storage_url,
    });
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const buf = await readFile(p);
  const res = new NextResponse(buf as any, {
    status: 200,
    headers: { 'Content-Type': doc.mime },
  });
  if (trace) res.headers.set('x-trace-id', trace);
  return res;
};
