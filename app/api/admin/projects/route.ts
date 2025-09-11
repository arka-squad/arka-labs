import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { withAdminAuth } from '../../../../lib/rbac-admin';

export const GET = withAdminAuth(['projects:read'])(async (req: NextRequest) => {
  try {
    const db = getDb();
    
    // Simple query without complex joins
    const result = await db.query(`
      SELECT 
        p.id,
        p.nom,
        p.description,
        p.client_id,
        p.budget,
        p.deadline,
        p.priority,
        p.status,
        p.tags,
        p.requirements,
        p.created_at,
        p.updated_at,
        c.nom as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `);
    
    return NextResponse.json({
      success: true,
      items: result.rows,
      total: result.rows.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });

  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { error: 'Failed to list projects', code: 'PROJECTS_LIST_ERROR' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(['projects:create'])(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { nom, description, client_id, budget, deadline, priority = 'normal', status = 'active', tags = [], requirements = [] } = body;

    if (!nom || !client_id) {
      return NextResponse.json(
        { error: 'Project name and client ID are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const result = await db.query(`
      INSERT INTO projects (nom, description, client_id, budget, deadline, priority, status, tags, requirements, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [nom, description, parseInt(client_id), budget || null, deadline || null, priority, status, JSON.stringify(tags), JSON.stringify(requirements), 'dev-user']);

    return NextResponse.json({
      success: true,
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', code: 'PROJECT_CREATE_ERROR' },
      { status: 500 }
    );
  }
});