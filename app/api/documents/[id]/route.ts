import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '../../../../lib/rbac';
import { sql } from '../../../../lib/db';
import fs from 'fs';
import path from 'path';

export const DELETE = withAuth(
  ['operator', 'owner'],
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
