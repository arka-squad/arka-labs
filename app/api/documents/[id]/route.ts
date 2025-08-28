import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { sql } from '../../../../lib/db';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export const GET = withAuth(
  ['viewer', 'operator', 'owner'],
  async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const { rows } = await sql`select name, mime, storage_key from documents where id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const { name, mime, storage_key } = rows[0];
    const uploads = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploads, storage_key);
    try {
      const stream = fs.createReadStream(filePath);
      return new NextResponse(stream as any, {
        headers: {
          'Content-Type': mime,
          'Content-Disposition': `attachment; filename="${name}"`,
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
  }
);

export const DELETE = withAuth(
  ['owner'],
  async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const { rows } = await sql`delete from documents where id = ${id} returning storage_key`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const uploads = path.join(process.cwd(), 'uploads');
    try {
      await fs.promises.unlink(path.join(uploads, rows[0].storage_key));
    } catch {
      /* ignore */
    }
    return new NextResponse(null, { status: 204 });
  }
);
