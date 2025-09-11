import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { sql } from '../../../../lib/db';
import { storage } from '../../../../lib/storage';

export const runtime = 'nodejs';

export const GET = withAuth(
  ['viewer', 'editor', 'admin', 'owner'],
  async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const rows = await sql`select name, mime, storage_key from documents where id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const { storage_key } = rows[0];
    try {
      const url = await storage.getObjectURL(storage_key);
      return NextResponse.redirect(url);
    } catch {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
  }
);

export const DELETE = withAuth(
  ['admin', 'owner'],
  async (_req: NextRequest, _user: any, { params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const rows = await sql`delete from documents where id = ${id} returning storage_key`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    try {
      await storage.deleteObject(rows[0].storage_key);
    } catch {
      /* ignore */
    }
    return new NextResponse(null, { status: 204 });
  }
);
