import { NextRequest } from 'next/server';
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
import { validateRACIInvariants, validateSingleRACIAssignment } from '@/lib/raci-validator';
import { withIdempotency } from '@/lib/idempotency';

const AssignSchema = z.object({
  agentId: z.string(),
  role: z.enum(['A', 'R', 'C', 'I']), // RACI roles
  docIds: z.array(z.string())
});

// POST /api/folders/:id/assign
export const POST = withAuth(['editor', 'admin', 'owner'], 
  withIdempotency(async (req, user, { params }) => {
    const { id } = params;
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    
    try {
      const body = await req.json();
      const { agentId, role, docIds } = AssignSchema.parse(body);
      
      // Validate folder exists
      const folder = await sql`SELECT id FROM folders WHERE id = ${id}`;
      if (folder.length === 0) {
        const error = folderNotFoundError(id, traceId);
        return errorResponse(error, 404);
      }
      
      // Validate agent exists
      const agent = await sql`SELECT id FROM agents WHERE id = ${agentId}`;
      if (agent.length === 0) {
        const error = agentNotFoundError(agentId, traceId);
        return errorResponse(error, 422);
      }
      
      // Validate individual assignments
      const assignmentValidations: string[] = [];
      const newAssignments = docIds.map(docId => ({
        document_id: docId,
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
      const raciValidation = await validateRACIInvariants(id, newAssignments);
      if (!raciValidation.isValid) {
        const error = raciInvariantError(
          docIds[0], 
          raciValidation.violations.join('; '), 
          traceId
        );
        return errorResponse(error, 422);
      }
      
      // Process assignments
      const assignments = [];
      for (const docId of docIds) {
        // Check if document is linked to this folder
        const folderDoc = await sql`
          SELECT * FROM folder_documents 
          WHERE folder_id = ${id} AND document_id = ${docId}
        `;
        
        if (folderDoc.length === 0) {
          const error = createApiError(
            'ERR_DOCUMENT_NOT_FOUND',
            `Document '${docId}' not linked to folder '${id}'`,
            { folder_id: id, document_id: docId },
            traceId
          );
          return errorResponse(error, 422);
        }
        
        // Update assignment
        await sql`
          UPDATE folder_documents 
          SET assigned_to = ${agentId}, raci_role = ${role}, updated_at = NOW()
          WHERE folder_id = ${id} AND document_id = ${docId}
        `;
        
        assignments.push(docId);
      }
      
      // Log assignment activity
      await sql`
        INSERT INTO folder_activity (folder_id, actor, action, details, created_at)
        VALUES (${id}, ${user?.sub}, 'assign_agent', ${JSON.stringify({
          agent_id: agentId,
          role,
          doc_ids: docIds
        })}, NOW())
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
      
      console.error('POST /api/folders/:id/assign error:', error);
      const apiError = createApiError(
        'ERR_INTERNAL_SERVER',
        'Internal server error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        traceId
      );
      return errorResponse(apiError, 500);
    }
  })
);