/**
 * ARKA ADMIN ROUTES - Définitions centralisées des routes admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRoute, RouteParams } from './index';
import { withAdminAuth } from '../rbac-admin-b24';
import { sql } from '../db';

// =====================
// CLIENTS ROUTES
// =====================

// GET /api/admin/clients - Listing + Detail avec switch
export const adminClientsGET = createRoute({
  path: '/api/admin/clients',
  method: 'GET',
  description: 'List clients or get single client (with strategy switch)',
  auth: ['admin', 'manager', 'operator', 'viewer'],
  strategies: {
    // Stratégie QUERY - Utilise ?id= pour le détail
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            const { query } = params;
            
            // Si ID fourni, retourner client unique
            if (query.id) {
              return await getSingleClientQuery(query.id);
            }
            
            // Sinon, retourner la liste
            return await getClientsList(query);
            
          } catch (error) {
            console.error('[Admin Clients Query] Error:', error);
            return NextResponse.json({ error: 'Query strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },

    // Stratégie DYNAMIC - Pour quand Vercel sera fixé
    dynamic: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            // Toujours retourner la liste en dynamic (detail sera dans [id]/route.ts)
            return await getClientsList(params.query);
            
          } catch (error) {
            console.error('[Admin Clients Dynamic] Error:', error);
            return NextResponse.json({ error: 'Dynamic strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },

    // Stratégie HYBRID - Détecte automatiquement
    hybrid: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(
        async (request: NextRequest) => {
          try {
            // Essaie dynamic d'abord, fallback sur query
            if (params.path.id) {
              // On a un path param, utiliser dynamic logic
              return await getSingleClientQuery(params.path.id);
            } else if (params.query.id) {
              // On a un query param, utiliser query logic  
              return await getSingleClientQuery(params.query.id);
            } else {
              // Pas d'ID, retourner liste
              return await getClientsList(params.query);
            }
            
          } catch (error) {
            console.error('[Admin Clients Hybrid] Error:', error);
            return NextResponse.json({ error: 'Hybrid strategy failed' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});

// PUT /api/admin/clients - Modification client
export const adminClientsPUT = createRoute({
  path: '/api/admin/clients',
  method: 'PUT',
  description: 'Update client (with strategy switch)',
  auth: ['admin', 'manager', 'operator'],
  strategies: {
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator'])(
        async (request: NextRequest, user: any) => {
          try {
            const { query } = params;
            if (!query.id) {
              return NextResponse.json({ error: 'ID client requis dans query ?id=' }, { status: 400 });
            }
            
            const body = await request.json();
            return await updateClient(query.id, body, user);
          } catch (error) {
            console.error('[Admin Clients Update Query] Error:', error);
            return NextResponse.json({ error: 'Update query strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },
    
    dynamic: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator'])(
        async (request: NextRequest, user: any) => {
          try {
            if (!params.path.id) {
              return NextResponse.json({ error: 'ID client requis dans path' }, { status: 400 });
            }
            
            const body = await request.json();
            return await updateClient(params.path.id, body, user);
          } catch (error) {
            console.error('[Admin Clients Update Dynamic] Error:', error);
            return NextResponse.json({ error: 'Update dynamic strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },
    
    hybrid: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager', 'operator'])(
        async (request: NextRequest, user: any) => {
          try {
            const clientId = params.path.id || params.query.id;
            if (!clientId) {
              return NextResponse.json({ error: 'ID client requis' }, { status: 400 });
            }
            
            const body = await request.json();
            return await updateClient(clientId, body, user);
          } catch (error) {
            console.error('[Admin Clients Update Hybrid] Error:', error);
            return NextResponse.json({ error: 'Update hybrid strategy failed' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});

// DELETE /api/admin/clients - Suppression client
export const adminClientsDELETE = createRoute({
  path: '/api/admin/clients',
  method: 'DELETE',
  description: 'Delete client (soft delete with strategy switch)',
  auth: ['admin'],
  strategies: {
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin'])(
        async (request: NextRequest, user: any) => {
          try {
            const { query } = params;
            if (!query.id) {
              return NextResponse.json({ error: 'ID client requis dans query ?id=' }, { status: 400 });
            }
            
            return await deleteClient(query.id, user);
          } catch (error) {
            console.error('[Admin Clients Delete Query] Error:', error);
            return NextResponse.json({ error: 'Delete query strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },
    
    dynamic: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin'])(
        async (request: NextRequest, user: any) => {
          try {
            if (!params.path.id) {
              return NextResponse.json({ error: 'ID client requis dans path' }, { status: 400 });
            }
            
            return await deleteClient(params.path.id, user);
          } catch (error) {
            console.error('[Admin Clients Delete Dynamic] Error:', error);
            return NextResponse.json({ error: 'Delete dynamic strategy failed' }, { status: 500 });
          }
        }
      )(req);
    },
    
    hybrid: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin'])(
        async (request: NextRequest, user: any) => {
          try {
            const clientId = params.path.id || params.query.id;
            if (!clientId) {
              return NextResponse.json({ error: 'ID client requis' }, { status: 400 });
            }
            
            return await deleteClient(clientId, user);
          } catch (error) {
            console.error('[Admin Clients Delete Hybrid] Error:', error);
            return NextResponse.json({ error: 'Delete hybrid strategy failed' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});

// POST /api/admin/clients - Création client
export const adminClientsPOST = createRoute({
  path: '/api/admin/clients',
  method: 'POST',
  description: 'Create new client',
  auth: ['admin', 'manager'],
  strategies: {
    query: async (req: NextRequest, params: RouteParams) => {
      return withAdminAuth(['admin', 'manager'])(
        async (request: NextRequest, user: any) => {
          try {
            const body = await request.json();
            return await createClient(body, user);
          } catch (error) {
            console.error('[Admin Clients Create] Error:', error);
            return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
          }
        }
      )(req);
    },
    dynamic: async (req: NextRequest, params: RouteParams) => {
      // Même logique pour create (pas de différence entre strategies pour POST)
      return withAdminAuth(['admin', 'manager'])(
        async (request: NextRequest, user: any) => {
          try {
            const body = await request.json();
            return await createClient(body, user);
          } catch (error) {
            console.error('[Admin Clients Create Dynamic] Error:', error);
            return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
          }
        }
      )(req);
    }
  }
});


// =====================
// PROJECTS ROUTES
// =====================

export const adminProjectsGET = createRoute({
  path: '/api/admin/projects',
  method: 'GET',
  strategies: {
    query: adminProjectsQueryGET,
    dynamic: adminProjectsDynamicGET,
    hybrid: adminProjectsHybridGET
  }
});

export const adminProjectsPOST = createRoute({
  path: '/api/admin/projects',
  method: 'POST',
  strategies: {
    query: adminProjectsQueryPOST,
    dynamic: adminProjectsQueryPOST, // POST ne change pas selon la stratégie
    hybrid: adminProjectsQueryPOST
  }
});

export const adminProjectsPUT = createRoute({
  path: '/api/admin/projects',
  method: 'PUT',
  strategies: {
    query: adminProjectsQueryPUT,
    dynamic: adminProjectsDynamicPUT,
    hybrid: adminProjectsHybridPUT
  }
});

export const adminProjectsDELETE = createRoute({
  path: '/api/admin/projects',
  method: 'DELETE',
  strategies: {
    query: adminProjectsQueryDELETE,
    dynamic: adminProjectsDynamicDELETE,
    hybrid: adminProjectsHybridDELETE
  }
});

// =====================
// PROJECTS IMPLEMENTATIONS
// =====================

// GET Projects (listing ou détail selon params)
async function adminProjectsQueryGET(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (request: NextRequest, user: any) => {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('id');
    
    if (projectId) {
      return await getSingleProjectQuery(projectId, req, user);
    }
    
    // Return projects listing (with French naming convention to match frontend)
    try {
      const result = await sql`
        SELECT
          p.id,
          p.name,
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
          p.created_by,
          c.name as client_name,
          c.sector as client_sector,
          c.size as client_size,
          COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_count,
          COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_count
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN project_squads ps ON p.id = ps.project_id
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, c.name, c.sector, c.size
        ORDER BY p.created_at DESC
        LIMIT 50
      `;
      
      const formattedItems = result.map(row => ({
        id: row.id,
        name: row.name,
        client: {
          id: row.client_id,
          name: row.client_name,
          sector: row.client_sector
        },
        status: row.status,
        priority: row.priority,
        budget: row.budget,
        deadline: row.deadline,
        agents_count: parseInt(row.agents_count) || 0,
        squads_count: parseInt(row.squads_count) || 0,
        created_at: row.created_at,
        created_by: row.created_by,
        // Add deadline alert calculation
        deadline_alert: row.deadline ? (() => {
          const deadline = new Date(row.deadline);
          const now = new Date();
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) return 'depassee';
          if (diffDays <= 3) return 'proche';
          return 'ok';
        })() : undefined
      }));
      
      return NextResponse.json({
        success: true,
        items: formattedItems,
        total: formattedItems.length,
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
  })(req);
}

async function adminProjectsDynamicGET(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (request: NextRequest, user: any) => {
    const projectId = params.path.id;
    if (projectId) {
      return await getSingleProjectQuery(projectId, req, user);
    }
    
    // Fallback to listing if no ID
    return adminProjectsQueryGET(req, params);
  })(req);
}

async function adminProjectsHybridGET(req: NextRequest, params: RouteParams) {
  const searchParams = req.nextUrl.searchParams;
  const queryId = searchParams.get('id');
  const dynamicId = params.path.id;
  
  const projectId = queryId || dynamicId;
  
  if (projectId) {
    return withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (request: NextRequest, user: any) => {
      return await getSingleProjectQuery(projectId, req, user);
    })(req);
  }
  
  return adminProjectsQueryGET(req, params);
}

// POST Projects (création)
async function adminProjectsQueryPOST(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin', 'manager'])(async (request: NextRequest, user: any) => {
    try {
      const body = await req.json();
      const { name, description, client_id, budget, deadline, priority = 'normal', status = 'active', tags = [], requirements = [] } = body;

      if (!name || !client_id) {
        return NextResponse.json(
          { error: 'Project name and client ID are required' },
          { status: 400 }
        );
      }

      const result = await sql`
        INSERT INTO projects (name, description, client_id, budget, deadline, priority, status, tags, requirements, created_by)
        VALUES (
          ${name}, 
          ${description}, 
          ${client_id}::uuid, 
          ${budget || null}, 
          ${deadline || null}, 
          ${priority}, 
          ${status}, 
          ${JSON.stringify(tags)}, 
          ${JSON.stringify(requirements)}, 
          ${user?.id || 'system'}
        )
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        project: result[0]
      });

    } catch (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project', code: 'PROJECT_CREATE_ERROR' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT Projects (modification)
async function adminProjectsQueryPUT(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin', 'manager'])(async (request: NextRequest, user: any) => {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }
    
    return await updateProjectQuery(projectId, req, user);
  })(req);
}

async function adminProjectsDynamicPUT(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin', 'manager'])(async (request: NextRequest, user: any) => {
    const projectId = params.path.id;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }
    
    return await updateProjectQuery(projectId, req, user);
  })(req);
}

async function adminProjectsHybridPUT(req: NextRequest, params: RouteParams) {
  const searchParams = req.nextUrl.searchParams;
  const queryId = searchParams.get('id');
  const dynamicId = params.path.id;
  
  const projectId = queryId || dynamicId;
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    );
  }
  
  return withAdminAuth(['admin', 'manager'])(async (request: NextRequest, user: any) => {
    return await updateProjectQuery(projectId, req, user);
  })(req);
}

// DELETE Projects (suppression)
async function adminProjectsQueryDELETE(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin'])(async (request: NextRequest, user: any) => {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }
    
    return await deleteProjectQuery(projectId, req, user);
  })(req);
}

async function adminProjectsDynamicDELETE(req: NextRequest, params: RouteParams) {
  return withAdminAuth(['admin'])(async (request: NextRequest, user: any) => {
    const projectId = params.path.id;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }
    
    return await deleteProjectQuery(projectId, req, user);
  })(req);
}

async function adminProjectsHybridDELETE(req: NextRequest, params: RouteParams) {
  const searchParams = req.nextUrl.searchParams;
  const queryId = searchParams.get('id');
  const dynamicId = params.path.id;
  
  const projectId = queryId || dynamicId;
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    );
  }
  
  return withAdminAuth(['admin'])(async (request: NextRequest, user: any) => {
    return await deleteProjectQuery(projectId, req, user);
  })(req);
}

// =====================
// HELPER FUNCTIONS
// =====================

// Récupérer un projet unique
async function getSingleProjectQuery(projectId: string, req: NextRequest, user: any) {
  const start = Date.now();
  const traceId = req.headers.get('x-trace-id') || 'unknown';
  
  try {
    console.log(`[API Router] Getting single project: ${projectId}`);
    
    // Get project with comprehensive details (from existing [id]/route.ts)
    const [projectDetails] = await sql`
      SELECT 
        p.*,
        c.name as client_name,
        c.sector as client_sector,
        c.size as client_size,
        c.primary_contact as client_contact,
        COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') as agents_assigned,
        COUNT(DISTINCT ps.squad_id) FILTER (WHERE ps.status = 'active') as squads_assigned,
        -- Budget analysis
        CASE 
          WHEN p.deadline IS NOT NULL AND p.created_at IS NOT NULL THEN
            COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') * 400 * 
            GREATEST(1, EXTRACT(DAYS FROM (p.deadline - p.created_at)))
          ELSE 0
        END as estimated_cost,
        CASE 
          WHEN p.budget IS NOT NULL AND p.budget > 0 THEN
            ((COUNT(DISTINCT pa.agent_id) FILTER (WHERE pa.status = 'active') * 400 * 
              GREATEST(1, EXTRACT(DAYS FROM (COALESCE(p.deadline, p.created_at + INTERVAL '30 days') - p.created_at)))) 
              / p.budget) * 100
          ELSE 0
        END as budget_utilization_percent,
        -- Timeline analysis
        CASE 
          WHEN p.deadline IS NULL THEN 'no_deadline'
          WHEN p.deadline < CURRENT_DATE THEN 'overdue'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'critical'
          WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
          ELSE 'ok'
        END as deadline_status,
        CASE 
          WHEN p.created_at IS NOT NULL AND p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (p.deadline - p.created_at))
          ELSE NULL
        END as total_duration_days,
        CASE 
          WHEN p.deadline IS NOT NULL THEN
            EXTRACT(DAYS FROM (p.deadline - CURRENT_DATE))
          ELSE NULL
        END as days_remaining
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      WHERE p.id = ${projectId} AND p.deleted_at IS NULL
      GROUP BY p.id, c.name, c.sector, c.size, c.primary_contact
    `;

    if (!projectDetails) {
      return NextResponse.json(
        { 
          error: 'Projet introuvable',
          code: 'PROJECT_NOT_FOUND',
          projectId,
          strategy: 'query'
        },
        { status: 404 }
      );
    }

    // Get assigned agents with their details and performance
    const assignedAgents = await sql`
      SELECT 
        a.id,
        a.name,
        a.role,
        a.domaine,
        a.version,
        a.status as agent_status,
        pa.status as assignment_status,
        pa.created_at as assigned_at,
        -- Agent performance on this project could be calculated here
        COUNT(DISTINCT other_pa.project_id) as total_projects,
        CASE 
          WHEN a.performance_score IS NOT NULL THEN a.performance_score
          ELSE 50 -- Default score if not calculated yet
        END as performance_score
      FROM project_assignments pa
      JOIN agents a ON pa.agent_id = a.id
      LEFT JOIN project_assignments other_pa ON a.id = other_pa.agent_id AND other_pa.status = 'active'
      WHERE pa.project_id = ${projectId} 
      AND pa.status = 'active'
      AND a.deleted_at IS NULL
      GROUP BY a.id, pa.status, pa.created_at
      ORDER BY pa.created_at ASC
    `;

    // Get assigned squads with their details
    const assignedSquads = await sql`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.mission,
        s.domain,
        s.status as squad_status,
        ps.status as assignment_status,
        ps.created_at as assigned_at,
        COUNT(DISTINCT sm.agent_id) FILTER (WHERE sm.status = 'active') as members_count,
        -- Recent squad activity
        COUNT(DISTINCT si.id) FILTER (WHERE si.created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_instructions
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      LEFT JOIN squad_members sm ON s.id = sm.squad_id
      LEFT JOIN squad_instructions si ON s.id = si.squad_id
      WHERE ps.project_id = ${projectId}
      AND ps.status = 'active'
      AND s.deleted_at IS NULL
      GROUP BY s.id, ps.status, ps.created_at
      ORDER BY ps.created_at ASC
    `;

    // Get project timeline/activity
    const projectActivity = await sql`
      SELECT 
        'assignment_added' as activity_type,
        CONCAT('Agent: ', a.name) as activity_subject,
        pa.created_at as activity_date,
        pa.created_by as activity_user
      FROM project_assignments pa
      JOIN agents a ON pa.agent_id = a.id
      WHERE pa.project_id = ${projectId}
      
      UNION ALL
      
      SELECT 
        'squad_assigned' as activity_type,
        CONCAT('Squad: ', s.name) as activity_subject,
        ps.created_at as activity_date,
        ps.created_by as activity_user
      FROM project_squads ps
      JOIN squads s ON ps.squad_id = s.id
      WHERE ps.project_id = ${projectId}
      
      ORDER BY activity_date DESC
      LIMIT 20
    `;

    const formattedProject = {
      ...projectDetails,
      tags: JSON.parse(projectDetails.tags || '[]'),
      requirements: JSON.parse(projectDetails.requirements || '[]'),
      agents_assigned: parseInt(projectDetails.agents_assigned),
      squads_assigned: parseInt(projectDetails.squads_assigned),
      estimated_cost: parseFloat(projectDetails.estimated_cost || '0'),
      budget_utilization_percent: parseFloat(projectDetails.budget_utilization_percent || '0'),
      total_duration_days: projectDetails.total_duration_days ? parseInt(projectDetails.total_duration_days) : null,
      days_remaining: projectDetails.days_remaining ? parseInt(projectDetails.days_remaining) : null,
      assigned_agents: assignedAgents.map(agent => ({
        ...agent,
        total_projects: parseInt(agent.total_projects),
        performance_score: parseInt(agent.performance_score)
      })),
      assigned_squads: assignedSquads.map(squad => ({
        ...squad,
        members_count: parseInt(squad.members_count),
        recent_instructions: parseInt(squad.recent_instructions)
      })),
      recent_activity: projectActivity
    };

    return NextResponse.json(formattedProject);

  } catch (error) {
    console.error('Error fetching single project:', error);
    return NextResponse.json(
      { error: 'Échec du chargement du projet', code: 'PROJECT_FETCH_ERROR' },
      { status: 500 }
    );
  }
}

// Mettre à jour un projet
async function updateProjectQuery(projectId: string, req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { nom, description, budget, deadline, priority, status, tags, requirements } = body;

    // Validation simple
    if (!nom && !description && budget === undefined && !deadline && !priority && !status && !tags && !requirements) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Check if project exists
    const [existingProject] = await sql`
      SELECT id FROM projects 
      WHERE id = ${projectId} AND deleted_at IS NULL
    `;

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet introuvable', projectId },
        { status: 404 }
      );
    }

    // Build update object for postgres.js
    const updateData: any = { updated_at: sql`NOW()` };
    
    if (nom) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (tags) updateData.tags = JSON.stringify(tags);
    if (requirements) updateData.requirements = JSON.stringify(requirements);

    const result = await sql`
      UPDATE projects 
      SET ${sql(updateData)}
      WHERE id = ${projectId} AND deleted_at IS NULL
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Échec de la mise à jour du projet' },
        { status: 500 }
      );
    }

    const updatedProject = {
      ...result[0],
      tags: JSON.parse(result[0].tags || '[]'),
      requirements: JSON.parse(result[0].requirements || '[]')
    };

    return NextResponse.json({
      success: true,
      project: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du projet', code: 'PROJECT_UPDATE_ERROR' },
      { status: 500 }
    );
  }
}

// Supprimer un projet
async function deleteProjectQuery(projectId: string, req: NextRequest, user: any) {
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';

    // Check if project exists
    const [existingProject] = await sql`
      SELECT id, nom, status FROM projects 
      WHERE id = ${projectId} AND deleted_at IS NULL
    `;

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projet introuvable', projectId },
        { status: 404 }
      );
    }

    // Check if project is active unless force is specified
    if (!force && existingProject.status === 'active') {
      const [activeAssignments] = await sql`
        SELECT 
          COUNT(DISTINCT pa.agent_id) as active_agents,
          COUNT(DISTINCT ps.squad_id) as active_squads
        FROM projects p
        LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.status = 'active'
        LEFT JOIN project_squads ps ON p.id = ps.project_id AND ps.status = 'active'
        WHERE p.id = ${projectId}
        GROUP BY p.id
      `;

      const totalActive = parseInt(activeAssignments?.active_agents || '0') + parseInt(activeAssignments?.active_squads || '0');
      
      if (totalActive > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete active project with assignments',
            code: 'PROJECT_HAS_ACTIVE_ASSIGNMENTS',
            active_agents: parseInt(activeAssignments?.active_agents || '0'),
            active_squads: parseInt(activeAssignments?.active_squads || '0'),
            suggestion: 'Use ?force=true to override or deactivate assignments first'
          },
          { status: 409 }
        );
      }
    }

    // Soft delete the project and deactivate assignments if force
    const [deletedProject] = await sql`
      UPDATE projects 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${projectId} AND deleted_at IS NULL
      RETURNING id, nom
    `;

    // Deactivate assignments when force deleting
    if (force) {
      await Promise.all([
        sql`
          UPDATE project_assignments
          SET status = 'inactive', updated_at = NOW()
          WHERE project_id = ${projectId} AND status = 'active'
        `,
        sql`
          UPDATE project_squads
          SET status = 'inactive', updated_at = NOW()
          WHERE project_id = ${projectId} AND status = 'active'
        `
      ]);
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      project_id: projectId,
      project_name: deletedProject.nom,
      force_used: force
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Échec de la suppression du projet', code: 'PROJECT_DELETE_ERROR' },
      { status: 500 }
    );
  }
}

// Récupérer un client unique
async function getSingleClientQuery(clientId: string) {
  console.log(`[API Router] Getting single client: ${clientId}`);
  
  const result = await sql`
    SELECT 
      c.id,
      c.name,
      c.sector,
      c.size,
      c.primary_contact,
      c.specific_context,
      c.status,
      c.created_at,
      c.updated_at,
      c.created_by
    FROM clients c
    WHERE c.deleted_at IS NULL AND c.id = ${clientId}::uuid
    LIMIT 1
  `;
  
  if (result.length === 0) {
    return NextResponse.json({ 
      error: 'Client non trouvé',
      clientId,
      strategy: 'query'
    }, { status: 404 });
  }
  
  const row = result[0];
  
  // Get project counts separately
  let projets_count = 0;
  let projets_actifs = 0;
  
  try {
    const projectsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as actifs
      FROM projects 
      WHERE client_id = ${clientId}::uuid AND deleted_at IS NULL
    `;
    if (projectsResult.length > 0) {
      projets_count = parseInt(projectsResult[0].total) || 0;
      projets_actifs = parseInt(projectsResult[0].actifs) || 0;
    }
  } catch (projectError) {
    console.warn('Could not fetch project counts:', projectError);
  }
  
  const client = {
    id: row.id,
    name: row.name,
    email: row.primary_contact?.email || '',
    sector: row.sector || '',
    size: row.size || 'medium',
    primary_contact: row.primary_contact || null,
    contact_nom: row.primary_contact?.name || '',
    specific_context: row.specific_context || '',
    status: row.status || 'active',
    projets_count,
    projets_actifs,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by || 'system',
    _strategy: 'query' // Debug info
  };
  
  return NextResponse.json(client);
}

// Récupérer la liste des clients
async function getClientsList(query: Record<string, string>) {
  console.log(`[API Router] Getting clients list with filters:`, query);
  
  const search = query.search || '';
  const status = query.status || '';
  const size = query.size || '';
  const sector = query.sector || '';
  
  const result = await sql`
    SELECT 
      c.id,
      c.name,
      c.sector,
      c.size,
      c.primary_contact,
      c.specific_context,
      c.status,
      c.created_at,
      c.updated_at,
      c.created_by,
      COUNT(DISTINCT p.id) as projets_count,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as projets_actifs
    FROM clients c
    LEFT JOIN projects p ON p.client_id = c.id
    WHERE c.deleted_at IS NULL
    GROUP BY c.id
    ORDER BY c.name ASC 
    LIMIT 100
  `;
  
  // Apply filters in memory
  let filteredResult = result;
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredResult = filteredResult.filter((row: any) =>
      row.name?.toLowerCase().includes(searchLower) ||
      row.primary_contact?.email?.toLowerCase().includes(searchLower)
    );
  }

  if (status && status !== '') {
    filteredResult = filteredResult.filter((row: any) => row.status === status);
  }

  if (size && size !== '') {
    filteredResult = filteredResult.filter((row: any) => row.size === size);
  }

  if (sector && sector !== '') {
    const sectorLower = sector.toLowerCase();
    filteredResult = filteredResult.filter((row: any) =>
      row.sector?.toLowerCase().includes(sectorLower)
    );
  }
  
  const items = filteredResult.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.primary_contact?.email || '',
    sector: row.sector || '',
    size: row.size || 'medium',
    primary_contact: row.primary_contact || null,
    contact_nom: row.primary_contact?.name || '',
    specific_context: row.specific_context || '',
    status: row.status || 'active',
    projets_count: parseInt(row.projets_count) || 0,
    projets_actifs: parseInt(row.projets_actifs) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by || 'system'
  }));
  
  return NextResponse.json({
    success: true,
    items,
    total: items.length,
    page: 1,
    limit: 100,
    totalPages: 1,
    _strategy: 'list'
  });
}

// Mettre à jour un client
async function updateClient(clientId: string, body: any, user: any) {
  console.log(`[API Router] Updating client ${clientId} for user:`, user?.id);

  const {
    name,
    sector,
    size,
    primary_contact,
    specific_context,
    status
  } = body;

  if (!name || !sector) {
    return NextResponse.json(
      { error: 'Le nom et le secteur sont obligatoires' },
      { status: 400 }
    );
  }

  if (!primary_contact?.name || !primary_contact?.email) {
    return NextResponse.json(
      { error: 'Le nom et l\'email du contact principal sont obligatoires' },
      { status: 400 }
    );
  }

  // Vérifier que le client existe
  const checkResult = await sql`
    SELECT id FROM clients WHERE id = ${clientId}::uuid AND deleted_at IS NULL
  `;
  
  if (checkResult.length === 0) {
    return NextResponse.json(
      { error: 'Client non trouvé' },
      { status: 404 }
    );
  }
  
  // Mettre à jour le client
  const result = await sql`
    UPDATE clients
    SET
      name = ${name},
      sector = ${sector},
      size = ${size || 'medium'},
      primary_contact = ${JSON.stringify(primary_contact)},
      specific_context = ${specific_context || ''},
      status = ${status || 'active'},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${clientId}::uuid AND deleted_at IS NULL
    RETURNING id, name, sector, size, primary_contact, specific_context, status, updated_at
  `;
  
  const client = result[0];
  
  return NextResponse.json({
    success: true,
    id: client.id,
    name: client.name,
    sector: client.sector,
    size: client.size,
    primary_contact: client.primary_contact,
    specific_context: client.specific_context,
    status: client.status,
    updated_at: client.updated_at,
    _strategy: 'update'
  });
}

// Supprimer un client (soft delete)
async function deleteClient(clientId: string, user: any) {
  console.log(`[API Router] Deleting client ${clientId} for user:`, user?.id);
  
  // Vérifier que le client existe
  const checkResult = await sql`
    SELECT id, nom FROM clients WHERE id = ${clientId}::uuid AND deleted_at IS NULL
  `;
  
  if (checkResult.length === 0) {
    return NextResponse.json(
      { error: 'Client non trouvé' },
      { status: 404 }
    );
  }
  
  const clientName = checkResult[0].nom;
  
  // Soft delete
  const result = await sql`
    UPDATE clients 
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ${clientId}::uuid AND deleted_at IS NULL
    RETURNING id
  `;
  
  if (result.length === 0) {
    return NextResponse.json(
      { error: 'Échec de la suppression' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    message: `Client "${clientName}" supprimé avec succès`,
    id: clientId,
    _strategy: 'delete'
  });
}

// Créer un nouveau client
async function createClient(body: any, user: any) {
  console.log(`[API Router] Creating client for user:`, user?.id);

  const {
    name,
    sector,
    size,
    primary_contact,
    specific_context,
    status
  } = body;

  if (!name || !sector) {
    return NextResponse.json(
      { error: 'Le nom et le secteur sont obligatoires' },
      { status: 400 }
    );
  }

  if (!primary_contact?.name || !primary_contact?.email) {
    return NextResponse.json(
      { error: 'Le nom et l\'email du contact principal sont obligatoires' },
      { status: 400 }
    );
  }

  const clientId = crypto.randomUUID();
  
  const result = await sql`
    INSERT INTO clients (
      id,
      name,
      sector,
      size,
      primary_contact,
      specific_context,
      status,
      created_by,
      created_at,
      updated_at
    )
    VALUES (
      ${clientId},
      ${name},
      ${sector},
      ${size || 'medium'},
      ${JSON.stringify(primary_contact)},
      ${specific_context || ''},
      ${status || 'active'},
      ${user?.id || 'system'},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    RETURNING id, name, sector, size, primary_contact, specific_context, status, created_at, created_by
  `;

  const client = result[0];
  
  return NextResponse.json({
    success: true,
    id: client.id,
    nom: client.nom,
    secteur: client.secteur,
    taille: client.taille,
    contact_principal: client.contact_principal,
    contexte_specifique: client.contexte_specifique,
    statut: client.statut,
    created_at: client.created_at,
    created_by: client.created_by,
    _strategy: 'create'
  });
}