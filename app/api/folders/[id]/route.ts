import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { folderNotFoundError, errorResponse, createApiError } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

// GET /api/folders/:id
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { id } = params;
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  try {
    const folder = await sql`
      SELECT 
        id,
        title,
        status,
        vision,
        context,
        agents,
        stats,
        updated_at
      FROM folders 
      WHERE id = ${id}
    `;
    
    if (folder.length === 0) {
      const error = folderNotFoundError(id, traceId);
      return errorResponse(error, 404);
    }
    
    const folderData = folder[0];
    
    // Parse JSON fields
    const result = {
      ...folderData,
      vision: typeof folderData.vision === 'string' ? JSON.parse(folderData.vision) : folderData.vision,
      context: typeof folderData.context === 'string' ? JSON.parse(folderData.context) : folderData.context,
      agents: typeof folderData.agents === 'string' ? JSON.parse(folderData.agents) : folderData.agents,
      stats: typeof folderData.stats === 'string' ? JSON.parse(folderData.stats) : folderData.stats};
    
    // Generate ETag based on updated_at
    const etag = `"${Buffer.from(folderData.updated_at.toString()).toString('base64')}"`;
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
    console.error('GET /api/folders/:id error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});