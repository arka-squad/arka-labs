import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { folderNotFoundError, errorResponse, createApiError } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

// GET /api/projects/:id (mapped from folders)
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { id } = params;
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  try {
    const project = await sql`
      SELECT 
        id,
        name as title,
        status,
        vision,
        context,
        agents,
        stats,
        created_by,
        created_at,
        updated_at
      FROM projects 
      WHERE id = ${parseInt(id)}
    `;
    
    if (project.length === 0) {
      const error = folderNotFoundError(id, traceId);
      return errorResponse(error, 404);
    }
    
    const projectData = project[0];
    
    // Parse JSON fields
    const result = {
      id: projectData.id.toString(), // Convert to string for consistency
      title: projectData.title,
      status: projectData.status || 'active',
      vision: typeof projectData.vision === 'string' ? JSON.parse(projectData.vision) : (projectData.vision || {}),
      context: typeof projectData.context === 'string' ? JSON.parse(projectData.context) : (projectData.context || {}),
      agents: typeof projectData.agents === 'string' ? JSON.parse(projectData.agents) : (projectData.agents || []),
      stats: typeof projectData.stats === 'string' ? JSON.parse(projectData.stats) : (projectData.stats || {}),
      created_by: projectData.created_by,
      created_at: projectData.created_at,
      updated_at: projectData.updated_at || projectData.created_at};
    
    // Generate ETag based on updated_at
    const etag = `"${Buffer.from((result.updated_at || result.created_at).toString()).toString('base64')}"`;
    const ifNoneMatch = req.headers.get('if-none-match');
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': etag,
          'X-Trace-Id': traceId
        }
      });
    }
    
    return NextResponse.json(result, {
      headers: {
        'ETag': etag,
        'X-Trace-Id': traceId
      }
    });
  } catch (error) {
    console.error('GET /api/projects/:id error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});