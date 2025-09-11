import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { errorResponse, createApiError } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

// GET /api/projects/:id/documents (mapped from folders)
export const GET = withAuth(['viewer', 'editor', 'admin', 'owner'], async (req, user, { params }) => {
  const { id } = params;
  const url = new URL(req.url);
  const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
  
  // Pagination
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;
  
  // Filters
  const statusFilter = url.searchParams.get('status');
  const agentFilter = url.searchParams.get('agent'); 
  const typeFilter = url.searchParams.get('type');
  const sort = url.searchParams.get('sort') || 'updated_at:desc';
  
  // Validate sort parameter
  if (!['updated_at:asc', 'updated_at:desc'].includes(sort)) {
    const error = createApiError(
      'ERR_VALIDATION_FAILED',
      'Invalid sort parameter',
      { allowed_values: ['updated_at:asc', 'updated_at:desc'] },
      traceId
    );
    return errorResponse(error, 400);
  }
  
  try {
    const projectId = parseInt(id);
    
    // Build dynamic query with filters
    let whereConditions = [`pd.project_id = ${projectId}`];
    let joinClause = `FROM project_docs pd
                     LEFT JOIN project_assignments pa ON pa.project_id = pd.project_id AND pa.document_id = pd.id`;
    
    if (statusFilter) {
      // For status filter, we need to determine document status
      // For now, use a simple mapping or add status to project_docs
      whereConditions.push(`'untested' = ${statusFilter}`); // Placeholder - adjust based on actual status logic
    }
    
    if (agentFilter) {
      whereConditions.push(`pa.agent_id = ${agentFilter}`);
    }
    
    if (typeFilter) {
      // Extract type from mime type
      whereConditions.push(`pd.mime LIKE ${typeFilter + '%'}`);
    }
    
    const whereClause = whereConditions.length > 1 ? `WHERE ${whereConditions.join(' AND ')}` : `WHERE ${whereConditions[0]}`;
    const orderDirection = sort.includes('desc') ? 'DESC' : 'ASC';
    
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM project_docs pd
      LEFT JOIN project_assignments pa ON pa.project_id = pd.project_id AND pa.document_id = pd.id
      WHERE pd.project_id = ${projectId}
    `;
    const total = parseInt(countResult[0]?.total || '0');
    
    // Get paginated documents
    const documents = await sql`
      SELECT 
        pd.id,
        pd.name as title,
        pd.mime as type,
        'system' as owner,
        COALESCE(pa.raci_role, 'unassigned') as status,
        pa.agent_id as assigned_to,
        pa.raci_role,
        pd.created_at as updated_at,
        pd.storage_url,
        pd.size
      FROM project_docs pd
      LEFT JOIN project_assignments pa ON pa.project_id = pd.project_id AND pa.document_id = pd.id
      WHERE pd.project_id = ${projectId}
      ORDER BY pd.created_at ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Transform to expected format
    const transformedDocs = documents.map(doc => ({
      id: `doc.project.${doc.id}`,
      title: doc.title,
      type: doc.type?.split('/')[0] || 'document',
      owner: doc.owner,
      status: doc.assigned_to ? 'assigned' : 'untested',
      assigned_to: doc.assigned_to,
      raci_role: doc.raci_role,
      updated_at: doc.updated_at,
      metadata: {
        storage_url: doc.storage_url,
        size: doc.size
      }
    }));
    
    // Generate ETag based on last document update
    const lastUpdate = documents.length > 0 ? documents[0].updated_at : new Date();
    const etag = `"${Buffer.from(lastUpdate.toString()).toString('base64')}"`;
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
    
    return NextResponse.json({
      items: transformedDocs,
      page,
      limit,
      total
    }, {
      headers: {
        'ETag': etag,
        'X-Trace-Id': traceId
      }
    });
  } catch (error) {
    console.error('GET /api/projects/:id/documents error:', error);
    const apiError = createApiError(
      'ERR_INTERNAL_SERVER',
      'Internal server error',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      traceId
    );
    return errorResponse(apiError, 500);
  }
});