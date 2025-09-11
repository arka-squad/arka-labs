// Uniform error model for B15 API responses

import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, any>;
  trace_id: string;
}

export type ErrorCode = 
  | 'ERR_FOLDER_NOT_FOUND'
  | 'ERR_AGENT_NOT_FOUND'
  | 'ERR_DOCUMENT_NOT_FOUND'
  | 'ERR_VALIDATION_FAILED'
  | 'ERR_RACI_INVARIANT'
  | 'ERR_DUPLICATE_ASSIGNMENT'
  | 'ERR_CONTEXT_INVALID'
  | 'ERR_UNAUTHORIZED'
  | 'ERR_FORBIDDEN'
  | 'ERR_INTERNAL_SERVER'
  | 'ERR_IDEMPOTENCY_CONFLICT'
  | 'ERR_CONTEXT_EMPTY'
  | 'ERR_INVALID_CONTENT_BLOCKS'
  | 'ERR_PROJECT_NOT_FOUND'
  | 'ERR_THREAD_NOT_FOUND'
  | 'ERR_PROJECT_ID_REQUIRED'
  | 'ERR_NO_CONTENT'
  | 'ERR_NO_MEMORY_BLOCKS_EXTRACTED'
  | 'ERR_MISSING_REQUIRED_FIELDS'
  | 'ERR_INVALID_SNAPSHOT_TYPE'
  | 'ERR_NO_MEMORY_BLOCKS'
  | 'ERR_INVALID_CONTEXT_TYPE'
  | 'ERR_INVALID_DATE_FORMAT'
  | 'ERR_INVALID_BLOCK_TYPE';

export function createApiError(
  code: ErrorCode,
  message: string,
  details: Record<string, any> = {},
  traceId: string
): ApiError {
  return {
    code,
    message,
    details,
    trace_id: traceId
  };
}

export function errorResponse(
  error: ApiError,
  status: number
): NextResponse {
  const response = NextResponse.json(error, { status });
  response.headers.set('X-Trace-Id', error.trace_id);
  return response;
}

// Helper functions for common error types
export function folderNotFoundError(folderId: string, traceId: string): ApiError {
  return createApiError(
    'ERR_FOLDER_NOT_FOUND',
    `Folder '${folderId}' not found`,
    { folder_id: folderId },
    traceId
  );
}

export function agentNotFoundError(agentId: string, traceId: string): ApiError {
  return createApiError(
    'ERR_AGENT_NOT_FOUND', 
    `Agent '${agentId}' not found`,
    { agent_id: agentId },
    traceId
  );
}

export function raciInvariantError(docId: string, violation: string, traceId: string): ApiError {
  return createApiError(
    'ERR_RACI_INVARIANT',
    `RACI invariant violation on document '${docId}': ${violation}`,
    { document_id: docId, violation },
    traceId
  );
}

export function validationError(errors: any[], traceId: string): ApiError {
  return createApiError(
    'ERR_VALIDATION_FAILED',
    'Request validation failed',
    { validation_errors: errors },
    traceId
  );
}

export function idempotencyConflictError(key: string, traceId: string): ApiError {
  return createApiError(
    'ERR_IDEMPOTENCY_CONFLICT',
    `Concurrent request detected with idempotency key '${key}'`,
    { idempotency_key: key },
    traceId
  );
}