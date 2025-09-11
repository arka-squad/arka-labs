import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/rbac';
import { sql } from '@/lib/db';
import { errorResponse, createApiError } from '@/lib/error-model';
import { generateTraceId, TRACE_HEADER } from '@/lib/trace';

// GET /api/folders/:id/documents
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
  
  // Validate status filter
  if (statusFilter && !['pass', 'warn', 'fail', 'untested'].includes(statusFilter)) {
    const error = createApiError(
      'ERR_VALIDATION_FAILED', 
      'Invalid status filter',
      { allowed_values: ['pass', 'warn', 'fail', 'untested'] },
      traceId
    );
    return errorResponse(error, 400);
  }
  
  try {
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM folder_documents 
      WHERE folder_id = ${id}
    `;
    const total = parseInt(countResult[0]?.total || '0');
    
    // Get paginated documents
    const documents = await sql`
      SELECT 
        d.id,
        d.title,
        d.type,
        d.owner,
        d.status,
        fd.assigned_to,
        fd.raci_role,
        d.updated_at
      FROM folder_documents fd
      JOIN documents d ON d.id = fd.document_id
      WHERE fd.folder_id = ${id}
      ORDER BY d.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return NextResponse.json({
      items: documents,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('GET /api/folders/:id/documents error:', error);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
});