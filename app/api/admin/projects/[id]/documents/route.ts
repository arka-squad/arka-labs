import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '../../../../../../lib/rbac-admin';
import { sql } from '../../../../../../lib/db';
import { log } from '../../../../../../lib/logger';
import { TRACE_HEADER } from '../../../../../../lib/trace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/projects/[id]/documents - List project documents
export const GET = withAdminAuth(['admin', 'manager', 'operator', 'viewer'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const { id } = params;
  
  try {
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { 
          error: 'Invalid project ID',
          code: 'INVALID_PROJECT_ID',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const [project] = await sql`
      SELECT id FROM projects 
      WHERE id = ${projectId} AND deleted_at IS NULL
    `;

    if (!project) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    // Get project documents
    const documents = await sql`
      SELECT 
        d.id,
        d.name as title,
        d.mime as type,
        d.size,
        d.storage_key as storage_url,
        d.tags,
        d.created_at as updated_at,
        'system' as owner,
        'available' as status
      FROM documents d
      WHERE d.project_id = ${projectId}::text
      ORDER BY d.created_at DESC
    `;

    // Transform to expected format
    const transformedDocs = documents.map(doc => ({
      id: `doc.project.${doc.id}`,
      title: doc.title,
      type: doc.type?.split('/')[0] || 'document',
      owner: doc.owner,
      status: doc.status,
      updated_at: doc.updated_at,
      metadata: {
        storage_url: doc.storage_url,
        size: doc.size,
        tags: doc.tags || []
      }
    }));

    const response = NextResponse.json({
      items: transformedDocs,
      total: transformedDocs.length
    });

    log('info', 'project_documents_list_success', {
      route: `/api/admin/projects/${projectId}/documents`,
      status: response.status,
      method: 'GET',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      project_id: projectId,
      documents_count: transformedDocs.length
    });

    return response;

  } catch (error) {
    log('error', 'project_documents_list_error', {
      route: `/api/admin/projects/${id}/documents`,
      status: 500,
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      project_id: id
    });

    return NextResponse.json(
      { 
        error: 'Failed to list project documents',
        code: 'PROJECT_DOCUMENTS_LIST_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});

// POST /api/admin/projects/[id]/documents - Upload document to project
export const POST = withAdminAuth(['admin', 'manager'])(async (req, user, { params }) => {
  const start = Date.now();
  const traceId = req.headers.get(TRACE_HEADER) || 'unknown';
  const { id } = params;
  
  try {
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { 
          error: 'Invalid project ID',
          code: 'INVALID_PROJECT_ID',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const [project] = await sql`
      SELECT id FROM projects 
      WHERE id = ${projectId} AND deleted_at IS NULL
    `;

    if (!project) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
          trace_id: traceId
        },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json(
        { 
          error: 'File is required',
          code: 'FILE_REQUIRED',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large (max 50MB)',
          code: 'FILE_TOO_LARGE',
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    // Generate storage key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop() || '';
    const storageKey = `projects/${projectId}/documents/${timestamp}-${randomId}.${extension}`;

    // For now, we'll simulate file storage - in production, upload to S3/GCS
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    // Insert document record
    const [document] = await sql`
      INSERT INTO documents (
        project_id,
        name,
        mime,
        size,
        storage_key,
        tags
      ) VALUES (
        ${projectId}::text,
        ${name || file.name},
        ${file.type},
        ${fileSize},
        ${storageKey},
        ${tagsArray}
      )
      RETURNING *
    `;

    const response = NextResponse.json({
      id: `doc.project.${document.id}`,
      title: document.name,
      type: document.mime?.split('/')[0] || 'document',
      owner: 'system',
      status: 'available',
      updated_at: document.created_at,
      metadata: {
        storage_url: document.storage_key,
        size: document.size,
        tags: document.tags || []
      }
    }, { status: 201 });

    log('info', 'project_document_upload_success', {
      route: `/api/admin/projects/${projectId}/documents`,
      status: response.status,
      method: 'POST',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      project_id: projectId,
      document_id: document.id,
      document_name: document.name,
      file_size: fileSize
    });

    return response;

  } catch (error) {
    log('error', 'project_document_upload_error', {
      route: `/api/admin/projects/${id}/documents`,
      status: 500,
      method: 'POST',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      trace_id: traceId,
      user_id: user.sub,
      project_id: id
    });

    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        code: 'PROJECT_DOCUMENT_UPLOAD_ERROR',
        trace_id: traceId
      },
      { status: 500 }
    );
  }
});