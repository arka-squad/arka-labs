import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { withAdminAuth } from '../../../../lib/rbac-admin';

export const GET = withAdminAuth(['clients:read'])(async (req: NextRequest) => {
  try {
    const db = getDb();
    
    // Simple query to get clients
    const result = await db.query(`
      SELECT 
        id,
        nom,
        email,
        created_at,
        updated_at
      FROM clients
      ORDER BY nom ASC
      LIMIT 100
    `);
    
    return NextResponse.json({
      success: true,
      items: result.rows,
      total: result.rows.length,
      page: 1,
      limit: 100,
      totalPages: 1
    });

  } catch (error) {
    console.error('Error listing clients:', error);
    return NextResponse.json(
      { error: 'Failed to list clients', code: 'CLIENTS_LIST_ERROR' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(['clients:create'])(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { nom, email } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const result = await db.query(`
      INSERT INTO clients (nom, email)
      VALUES ($1, $2)
      RETURNING *
    `, [nom, email || null]);

    return NextResponse.json({
      success: true,
      client: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client', code: 'CLIENT_CREATE_ERROR' },
      { status: 500 }
    );
  }
});