import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { 
  createApiError, 
  folderNotFoundError,
  validationError 
} from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';
// import { withIdempotency } from '@/lib/idempotency'; // Temporarily disabled for production build
import { calculateContextCompletion, getWeightsForFolderType } from '@/lib/context-completion';

const ContextSchema = z.object({
  type: z.enum(['note', 'constraint', 'objective', 'agent_question', 'user_note']),
  content: z.string().min(1),
  agent: z.string().optional()
});

// POST /api/folders/:id/context
export const POST = withAuth(['editor', 'admin', 'owner'], 
  async (req, user, { params }) => {
    const { id } = params;
    const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
    
    try {
      const body = await req.json();
      const { type, content, agent } = ContextSchema.parse(body);
      
      // Validate content is not empty
      if (!content.trim()) {
        const error = createApiError(
          'ERR_CONTEXT_EMPTY',
          'Context content cannot be empty',
          {},
          traceId
        );
        return NextResponse.json(error, { status: 422 });
      }
      
      // Validate folder exists and get folder type
      const folder = await sql`SELECT id, vision FROM folders WHERE id = ${id}`;
      if (folder.length === 0) {
        const error = folderNotFoundError(id, traceId);
        return NextResponse.json(error, { status: 404 });
      }
      
      const folderData = folder[0];
      const vision = typeof folderData.vision === 'string' 
        ? JSON.parse(folderData.vision) 
        : folderData.vision;
      const folderType = vision?.type || 'project'; // Default to project type
      
      // Generate context ID
      const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert context entry
      await sql`
        INSERT INTO folder_context (id, folder_id, type, content, agent, created_by, created_at)
        VALUES (${contextId}, ${id}, ${type}, ${content}, ${agent || null}, ${user?.sub}, NOW())
      `;
      
      // Get all context entries for deterministic completion calculation
      const contextEntries = await sql`
        SELECT type, content, agent
        FROM folder_context 
        WHERE folder_id = ${id}
        ORDER BY created_at ASC
      `;
      
      // Calculate completion using deterministic formula
      const weights = getWeightsForFolderType(folderType);
      const completionResult = calculateContextCompletion(
        contextEntries.map((entry: any) => ({
          type: entry.type,
          content: entry.content,
          agent: entry.agent
        })),
        weights
      );
      
      // Update folder context with detailed completion info
      await sql`
        UPDATE folders 
        SET context = jsonb_set(
          jsonb_set(
            COALESCE(context, '{}'),
            '{completion}',
            ${completionResult.completion}::text::jsonb
          ),
          '{completion_breakdown}',
          ${JSON.stringify(completionResult.completion_breakdown)}::jsonb
        ),
        updated_at = NOW()
        WHERE id = ${id}
      `;
      
      // Log context activity
      await sql`
        INSERT INTO folder_activity (folder_id, actor, action, details, created_at)
        VALUES (${id}, ${user?.sub}, 'add_context', ${JSON.stringify({
          context_id: contextId,
          type,
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          completion_updated: completionResult.completion
        })}, NOW())
      `;
      
      return NextResponse.json({
        folder_id: id,
        context_id: contextId,
        type,
        content,
        created_at: new Date().toISOString(),
        completion_updated: completionResult.completion
      }, {
        headers: {
          'X-Trace-Id': traceId
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const apiError = validationError(error.errors, traceId);
        return NextResponse.json(apiError, { status: 400 });
      }
      
      console.error('POST /api/folders/:id/context error:', error);
      const apiError = createApiError(
        'ERR_INTERNAL_SERVER',
        'Internal server error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        traceId
      );
      return NextResponse.json(apiError, { status: 500 });
    }
  }
);