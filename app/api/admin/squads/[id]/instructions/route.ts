import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../../lib/rbac-admin';
import { sql } from '../../../../../../lib/db';
import { log } from '../../../../../../lib/logger';
import { validateSquadState, validateProjectState, checkSquadProjectAttachment } from '../../../../../../lib/squad-utils';
import { TRACE_HEADER } from '../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schemas
const CreateInstructionSchema = z.object({
  project_id: z.number().int().positive(),
  content: z.string().min(10).max(2000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

// POST /api/admin/squads/[id]/instructions - Create instruction for squad
export const POST = withAdminAuth(['squads:create_instructions'], 'squad')(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const squadId = params.id;
  
  try {
    const body = await req.json();
    const { project_id, content, priority } = CreateInstructionSchema.parse(body);
    
    // Validate squad state (must be active)
    const squadValidation = await validateSquadState(squadId, ['active']);
    if (!squadValidation.valid) {
      return NextResponse.json({ 
        error: squadValidation.error 
      }, { status: squadValidation.error === 'Squad not found' ? 404 : 400 });
    }

    // Validate project state (must be active, not disabled/archived)
    const projectValidation = await validateProjectState(project_id, ['active']);
    if (!projectValidation.valid) {
      if (projectValidation.currentState === 'disabled') {
        // Special B23 requirement: return 423 Locked for disabled projects
        return NextResponse.json({ 
          error: 'project_disabled',
          message: 'Cannot create instructions for disabled projects'
        }, { status: 423 });
      }
      
      return NextResponse.json({ 
        error: projectValidation.error 
      }, { status: projectValidation.error === 'Project not found' ? 404 : 400 });
    }

    // Check squad-project attachment
    const attachmentCheck = await checkSquadProjectAttachment(squadId, project_id);
    if (!attachmentCheck.attached) {
      return NextResponse.json({ 
        error: 'squad_not_attached_to_project',
        message: 'Squad must be attached to project to create instructions'
      }, { status: 400 });
    }

    // Create instruction
    const rows = await sql`
      INSERT INTO squad_instructions (squad_id, project_id, content, priority, created_by)
      VALUES (${squadId}, ${project_id}, ${content}, ${priority}, ${user.sub})
      RETURNING id, squad_id, project_id, content, priority, status, created_by, created_at
    `;

    const instruction = rows[0];

    // TODO: Integration with B21 routing system
    // const routingResult = await queueInstruction(instruction);
    
    // Simulate B21 routing for now
    const estimatedCompletion = new Date();
    estimatedCompletion.setHours(estimatedCompletion.getHours() + 2); // 2 hour estimate

    const suggestedProvider = determineSuggestedProvider(content, priority);

    const response = {
      instruction_id: instruction.id,
      squad_id: instruction.squad_id,
      project_id: instruction.project_id,
      content: instruction.content,
      priority: instruction.priority,
      status: 'queued', // Will be updated by B21 system
      estimated_completion: estimatedCompletion.toISOString(),
      routing: {
        provider_suggested: suggestedProvider,
        reasoning: getProviderReasoning(content, suggestedProvider)
      },
      created_by: instruction.created_by,
      queued_at: instruction.created_at
    };

    // Update status to queued
    await sql`
      UPDATE squad_instructions 
      SET status = 'queued', metadata = ${JSON.stringify({ 
        provider_suggested: suggestedProvider,
        estimated_completion: estimatedCompletion.toISOString()
      })}
      WHERE id = ${instruction.id}
    `;

    const res = NextResponse.json(response, { status: 202 }); // 202 Accepted for async processing
    
    log('info', 'squad_instruction_created', {
      route: `/api/admin/squads/${squadId}/instructions`,
      method: 'POST',
      status: res.status,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      project_id,
      instruction_id: instruction.id,
      priority,
      content_length: content.length,
      provider_suggested: suggestedProvider
    });

    return res;
  } catch (error) {
    log('error', 'squad_instruction_creation_failed', {
      route: `/api/admin/squads/${squadId}/instructions`,
      method: 'POST',
      status: 500,
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      squad_id: squadId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'validation_failed', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'internal_error' 
    }, { status: 500 });
  }
});

// Helper functions for B21 integration simulation
function determineSuggestedProvider(content: string, priority: string): 'claude' | 'gpt' | 'gemini' {
  // Simple heuristics - in real B21 this would be more sophisticated
  const contentLower = content.toLowerCase();
  
  if (priority === 'urgent' || contentLower.includes('urgent') || contentLower.includes('immediate')) {
    return 'gpt'; // Fast for urgent tasks
  }
  
  if (contentLower.includes('analysis') || contentLower.includes('complex') || contentLower.includes('detailed')) {
    return 'claude'; // Better for complex analysis
  }
  
  if (contentLower.includes('creative') || contentLower.includes('marketing') || contentLower.includes('content')) {
    return 'gemini'; // Good for creative tasks
  }
  
  return 'claude'; // Default fallback
}

function getProviderReasoning(content: string, provider: string): string {
  const reasoningMap = {
    'claude': 'Task requires structured analysis and detailed reasoning',
    'gpt': 'Fast processing needed for urgent or straightforward task',
    'gemini': 'Creative or content generation task detected'
  };
  
  return reasoningMap[provider as keyof typeof reasoningMap] || 'Default provider selection';
}