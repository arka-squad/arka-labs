/**
 * API Lite Module: PROJECTS
 * Extrait du module misc - B28 Phase 2
 */

import { APILite } from '../core';
import { sql } from '../../db';
import { withAdminAuth } from '../../rbac-admin-b24';
import { NextResponse } from 'next/server';

export function setupProjectsRoutes(api: APILite) {
  console.log('🚀 Setup module projects (413 lignes)...');

        // Get project counts separately
        let projets_count = 0;
        let projets_actifs = 0;

        try {
          const projectsResult = await sql`
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
          nom: row.nom,
  api.route('/api/admin/projects')
    .get()
    .middleware(rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] }))
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const projectId = context.query.id;
      if (projectId) {
        return await getSingleProject(projectId);
      }

      try {
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          LEFT JOIN project_squads ps ON p.id = ps.project_id
          WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL
        console.error('Error listing projects:', error);
        return NextResponse.json(
          { error: 'Failed to list projects', code: 'PROJECTS_LIST_ERROR' },
  api.route('/api/admin/projects/:id')
    .get()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager', 'operator', 'viewer'] })
    )
    .cache(300) // 5 minutes de cache
    .handler(async (context) => {
      const projectId = context.params.id;
      return await getSingleProject(projectId);
    })
    .build();

  // Création d'un projet
  api.route('/api/admin/projects')
    .post()
    .middleware(
      validationMiddleware({
        body: {
          nom: { type: 'string', required: true, min: 1, max: 255 },
          description: { type: 'string', max: 2000 },
          client_id: { type: 'uuid', required: true },
        const projectId = crypto.randomUUID();

          INSERT INTO projects (
            id,
            nom,
            description,
            client_id,
            ${projectId},
            ${nom},
            ${description},
            ${client_id}::uuid,
        const project = result[0];

        // Clear cache après création
        api.clearCache();

        return NextResponse.json({
          success: true,
          id: project.id,
          nom: project.nom,
          description: project.description,
          client_id: project.client_id,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          deadline: project.deadline,
          tags: project.tags,
          requirements: project.requirements,
          created_at: project.created_at,
          created_by: project.created_by
        });

      } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
          { error: 'Échec de la création du projet', code: 'PROJECT_CREATE_ERROR' },
  api.route('/api/admin/projects/:id')
    .put()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } },
        body: {
          nom: { type: 'string', min: 1, max: 255 },
          description: { type: 'string', max: 2000 },
  api.route('/api/admin/projects/:id')
    .delete()
    .middleware(
      validationMiddleware({
        params: { id: { type: 'number', required: true } }
      }),
      rbacMiddleware({ required: true, roles: ['admin'] })
    )
    .handler(async (context) => {
      const projectId = context.params.id;
      const user = context.metadata.get('user');

      try {
        // Check if project exists
        const [existingProject] = await sql`
          SELECT id, nom FROM projects 
          WHERE id = ${projectId}::integer AND deleted_at IS NULL
        `;

        if (!existingProject) {
          return NextResponse.json(
            { error: 'Projet introuvable', projectId },
          UPDATE projects 
          WHERE id = ${projectId}::integer AND deleted_at IS NULL
        `;

        // Clear cache après suppression
        api.clearCache();

        return NextResponse.json({
          success: true,
          message: `Projet "${existingProject.nom}" supprimé avec succès`,
          deleted_id: projectId
        });

      } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
          { error: 'Échec de la suppression du projet', code: 'PROJECT_DELETE_ERROR' },
      const project_id = context.query.project_id || '';
            COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
            COUNT(DISTINCT pa.project_id) as projets_total,
          LEFT JOIN project_assignments pa ON a.id = pa.agent_id
          LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
        if (project_id) {
          project_id: { type: 'number', required: true },
        project_id,
        // Validate project exists
        const [project] = await sql`
          SELECT id, client_id FROM projects 
          WHERE id = ${project_id} AND deleted_at IS NULL
        `;

        if (!project) {
          return NextResponse.json(
            { error: 'Projet introuvable' },
        // Assign to project if specified
        if (project_id) {
            INSERT INTO project_assignments (
              project_id,
              ${project_id},
            FROM project_assignments pa
            JOIN projects p ON pa.project_id = p.id
                error: 'Cannot delete agent with active project assignments',
                active_assignments: parseInt(activeAssignmentsCount.count),
                suggestion: 'Use ?force=true to override or reassign projects first'
              },
            UPDATE project_assignments
          project_id: { type: 'uuid', required: false },
          customizations: { type: 'string', required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const body = context.metadata.get('body');
      const user = context.metadata.get('user');

      const { template_id, name, project_id, customizations } = body;

      try {
        // Verify template exists
        // Check if project exists (if specified)
        if (project_id) {
          const [project] = await sql`
            SELECT id FROM projects 
            WHERE id = ${project_id}::integer AND deleted_at IS NULL
          `;
          
          if (!project) {
            return NextResponse.json(
              { error: 'Projet introuvable' },
        // Assign to project if specified
        if (project_id) {
            INSERT INTO project_agents (project_id, agent_id, created_at)
            VALUES (${project_id}::integer, ${agentId}, NOW())
          `;
        }

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
            project_id: project_id || null,
          project_id: { type: 'uuid', required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .handler(async (context) => {
      const { name, project_id } = body;

      try {
        // Check if project exists (if specified)
        if (project_id) {
          const [project] = await sql`
            SELECT id FROM projects 
            WHERE id = ${project_id}::integer AND deleted_at IS NULL
          `;
          
          if (!project) {
            return NextResponse.json(
              { error: 'Projet introuvable' },
        // Assign to project if specified
        if (project_id) {
            INSERT INTO project_agents (project_id, agent_id, created_at)
            VALUES (${project_id}::integer, ${newAgentId}, NOW())
          `;
        }

        // Clear cache
        api.clearCache();

        return NextResponse.json({
          success: true,
            project_id: project_id || null,
          project_id: { type: 'uuid', required: false },
          type: { type: 'enum', values: ['pdf', 'txt', 'doc', 'docx', 'md', 'other'], required: false },
      const { project_id, type, status } = context.query;

      try {
        let whereConditions = ['d.deleted_at IS NULL'];
        let params: any[] = [];

        if (project_id) {
          whereConditions.push(`d.project_id = $${params.length + 1}`);
          params.push(project_id);
        }
        
        if (type) {
          whereConditions.push(`d.type = $${params.length + 1}`);
          params.push(type);
        }
        
            d.project_id,
            p.name as project_name,
          LEFT JOIN projects p ON d.project_id = p.id
          ${project_id ? sql`AND d.project_id = ${project_id}::integer` : sql``}
          ${project_id ? sql`AND d.project_id = ${project_id}::integer` : sql``}
          project_id: doc.project_id,
          project_name: doc.project_name,
          filters: { project_id, type, status }
        });

      } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des documents', code: 'DOCUMENTS_FETCH_ERROR' },
          project_id: { type: 'uuid', required: false },
      const { name, description, type, project_id, content, size_bytes } = body;

      try {
        // Check if project exists (if specified)
        if (project_id) {
          const [project] = await sql`
            SELECT id FROM projects 
            WHERE id = ${project_id}::integer AND deleted_at IS NULL
          `;
          
          if (!project) {
            return NextResponse.json(
              { error: 'Projet introuvable' },
            project_id,
            ${project_id || null},
            ${user?.id || 'system'},
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        const newDocument = result[0];

        // If content provided, store it (simplified for demo)
        if (content) {
            project_id: newDocument.project_id,
            p.name as project_name,
          LEFT JOIN projects p ON d.project_id = p.id
          project_id: document.project_id,
          project_name: document.project_name,
          project_id: { type: 'uuid', required: false },
      const { project_id, agent_id, status } = context.query;

      try {
            t.project_id,
            p.name as project_name,
          LEFT JOIN projects p ON t.project_id = p.id
          ${project_id ? sql`AND t.project_id = ${project_id}::integer` : sql``}
          ${project_id ? sql`AND t.project_id = ${project_id}::integer` : sql``}
          project_id: thread.project_id,
          project_name: thread.project_name,
          filters: { project_id, agent_id, status }
        });

      } catch (error) {
        console.error('Error fetching threads:', error);
        return NextResponse.json(
          { error: 'Échec du chargement des threads', code: 'THREADS_FETCH_ERROR' },
          project_id: { type: 'uuid', required: false },
      const { title, project_id, agent_id, initial_message } = body;

      try {
        // Verify project exists (if specified)
        if (project_id) {
          const [project] = await sql`
            SELECT id FROM projects 
            WHERE id = ${project_id}::integer AND deleted_at IS NULL
          `;
          
          if (!project) {
            return NextResponse.json(
              { error: 'Projet introuvable' },
            project_id,
            ${project_id || null},
            project_id: newThread.project_id,
            (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_projects,
            (SELECT COUNT(*) FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as projects_last_30d,
        const topProjects = await sql`
          FROM projects p
          LEFT JOIN project_agents pa ON p.id = pa.project_id
          LEFT JOIN threads t ON p.id = t.project_id AND t.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
              WHEN random() < 0.3 THEN 'Cache miss for key: projects_list'
              WHEN random() < 0.5 THEN 'API request completed in 125ms'
            { path: '/api/admin/projects', requests: Math.floor(80 + Math.random() * 200), avg_ms: Math.floor(90 + Math.random() * 60) },
          type: { type: 'enum', values: ['clients', 'projects', 'agents', 'squads', 'all'], required: true },
          format: { type: 'enum', values: ['json', 'csv', 'xlsx'], required: false },
          date_from: { type: 'string', required: false },
          date_to: { type: 'string', required: false }
        }
      }),
      rbacMiddleware({ required: true, roles: ['admin', 'manager'] })
    )
    .cache(600) // 10 minutes - exports sont lourds
    .handler(async (context) => {
          case 'projects':
            const projects = await sql`
              FROM projects p
              LEFT JOIN clients c ON p.client_id = c.id
              WHERE p.deleted_at IS NULL ${dateFilter}
              ORDER BY p.created_at DESC
            `;
            data = { projects, count: projects.length };
            break;

        COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active' AND p.status = 'active') as projets_actifs,
        COUNT(DISTINCT pa.project_id) as projets_total,
          WHEN COUNT(DISTINCT pa.project_id) = 0 THEN 0
          ELSE LEAST(
            (COUNT(DISTINCT pa.project_id) FILTER (WHERE pa.status = 'active') * 15) +
            (COUNT(DISTINCT pa.project_id) * 8),
            100
          )
        END as performance_score
      LEFT JOIN project_assignments pa ON a.id = pa.agent_id
      LEFT JOIN projects p ON pa.project_id = p.id AND p.deleted_at IS NULL
    // Get active project assignments with project details
    const projectAssignments = await sql`
      FROM project_assignments pa
      JOIN projects p ON pa.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      project_assignments: projectAssignments,
      squad_memberships: squadMemberships,
      created_at: row.created_at,
async function getSingleProject(projectId: string) {
  try {
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_assignments pa ON p.id = pa.project_id
      LEFT JOIN project_squads ps ON p.id = ps.project_id
      WHERE p.id = ${projectId}::integer AND p.deleted_at IS NULL
        projectId
    const project = {
      id: row.id,
      nom: row.nom,
      description: row.description || '',
      client_id: row.client_id,
      client_name: row.client_name,
      client_secteur: row.client_secteur || '',
    return NextResponse.json(project);

  } catch (error) {
    console.error('Error fetching single project:', error);
    return NextResponse.json(
      { error: 'Échec du chargement du projet', code: 'PROJECT_FETCH_ERROR' },

  console.log('✅ Module projects configuré');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
