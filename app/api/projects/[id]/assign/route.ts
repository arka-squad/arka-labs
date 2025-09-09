import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { 
  errorResponse, 
  createApiError, 
  folderNotFoundError, 
  agentNotFoundError, 
  raciInvariantError,
  validationError 
} from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
import { validateRACIInvariantsProject, validateSingleRACIAssignment } from '@/lib/raci-validator-project';
// import { withIdempotency } from '@/lib/idempotency'; // Temporarily disabled for production build

const AssignSchema = z.object({
  agentId: z.string(),
  role: z.enum(['A', 'R', 'C', 'I']), // RACI roles
  docIds: z.array(z.string())
});

// POST /api/projects/:id/assign (mapped from folders)
export const POST = withAuth(['editor', 'admin', 'owner'], 
  async (req, user, { params }) => {
    const { id } = params;
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    const projectId = parseInt(id);
    
    try {
      const body = await req.json();
      const { agentId, role, docIds } = AssignSchema.parse(body);
      
      // Validate project exists
      const project = await sql`SELECT id FROM projects WHERE id = ${projectId}`;
      if (project.length === 0) {
        const error = folderNotFoundError(id, traceId);
        return errorResponse(error, 404);
      }
      
      // Validate agent exists
      const agent = await sql`SELECT id FROM agents WHERE id = ${agentId}`;
      if (agent.length === 0) {
        const error = agentNotFoundError(agentId, traceId);
        return errorResponse(error, 422);
      }
      
      // Convert docIds from format "doc.project.123" to actual IDs
      const documentIds = docIds.map(docId => {
        if (docId.startsWith('doc.project.')) {
          return parseInt(docId.replace('doc.project.', ''));
        }
        return parseInt(docId);
      }).filter(id => !isNaN(id));
      
      // Validate individual assignments
      const assignmentValidations: string[] = [];
      const newAssignments = documentIds.map(docId => ({
        document_id: docId.toString(),
        agent_id: agentId,
        role: role as 'A' | 'R' | 'C' | 'I'
      }));
      
      for (const assignment of newAssignments) {
        const violations = validateSingleRACIAssignment(assignment);
        assignmentValidations.push(...violations);
      }
      
      if (assignmentValidations.length > 0) {
        const error = validationError(assignmentValidations, traceId);
        return errorResponse(error, 400);
      }
      
      // Validate RACI invariants
      const raciValidation = await validateRACIInvariantsProject(projectId, newAssignments);
      if (!raciValidation.isValid) {
        const error = raciInvariantError(
          documentIds[0]?.toString() || 'unknown', 
          raciValidation.violations.join('; '), 
          traceId
        );
        return errorResponse(error, 422);
      }
      
      // Process assignments
      const assignments = [];
      for (const docId of documentIds) {
        // Check if document belongs to this project
        const projectDoc = await sql`
          SELECT * FROM project_docs 
          WHERE project_id = ${projectId} AND id = ${docId}
        `;
        
        if (projectDoc.length === 0) {
          const error = createApiError(
            'ERR_DOCUMENT_NOT_FOUND',
            `Document '${docId}' not found in project '${id}'`,
            { project_id: projectId, document_id: docId },
            traceId
          );
          return errorResponse(error, 422);
        }
        
        // Upsert assignment (insert or update)
        await sql`
          INSERT INTO project_assignments (project_id, document_id, agent_id, raci_role, assigned_at, updated_at)
          VALUES (${projectId}, ${docId}, ${agentId}, ${role}, NOW(), NOW())
          ON CONFLICT (project_id, document_id) 
          DO UPDATE SET 
            agent_id = EXCLUDED.agent_id,
            raci_role = EXCLUDED.raci_role,
            assigned_at = EXCLUDED.assigned_at,
            updated_at = NOW()
        `;
        
        assignments.push(`doc.project.${docId}`);
      }
      
      // Log assignment activity
      await sql`
        INSERT INTO project_activity (project_id, actor, action, details, created_at)
        VALUES (${projectId}, ${user?.sub}, 'assign_agent', ${JSON.stringify({
          agent_id: agentId,
          role,
          doc_ids: assignments
        })}, NOW())
      `;
      
      // Update project stats
      const totalDocs = await sql`SELECT COUNT(*) as count FROM project_docs WHERE project_id = ${projectId}`;
      const assignedDocs = await sql`SELECT COUNT(*) as count FROM project_assignments WHERE project_id = ${projectId}`;
      const uniqueAgents = await sql`SELECT COUNT(DISTINCT agent_id) as count FROM project_assignments WHERE project_id = ${projectId}`;
      
      const stats = {
        docs_total: parseInt(totalDocs[0]?.count || '0'),
        docs_assigned: parseInt(assignedDocs[0]?.count || '0'),
        agents_assigned: parseInt(uniqueAgents[0]?.count || '0'),
        roadmap_progress: 0 // Placeholder
      };
      
      await sql`
        UPDATE projects 
        SET stats = ${JSON.stringify(stats)}, updated_at = NOW()
        WHERE id = ${projectId}
      `;
      
      return Response.json({
        folder_id: id,
        agent_id: agentId,
        role,
        assigned_docs: assignments,
        assigned_at: new Date().toISOString()
      }, {
        headers: {
          'X-Trace-Id': traceId
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const apiError = validationError(error.errors, traceId);
        return errorResponse(apiError, 400);
      }
      
      console.error('POST /api/projects/:id/assign error:', error);
      const apiError = createApiError(
        'ERR_INTERNAL_SERVER',
        'Internal server error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        traceId
      );
      return errorResponse(apiError, 500);
    }
  }
);