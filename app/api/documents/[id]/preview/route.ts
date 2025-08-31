import { NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
  const { rows } = await sql`select name, mime, storage_url from documents where id=${params.id}::int`;
  if (!rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const doc = rows[0];
  const file = doc.storage_url.startsWith('demo/')
    ? doc.storage_url.replace(/^demo\//, '')
    : doc.storage_url;
  const p = join(process.cwd(), 'public', file);
  const buf = await readFile(p);
  return new NextResponse(buf, { status: 200, headers: { 'Content-Type': doc.mime } });
};
