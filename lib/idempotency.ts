// Idempotency support for POST operations

import { sql } from './db';
import { createApiError, ApiError } from './error-model';

export interface IdempotencyRecord {
  key: string;
  request_hash: string;
  response_status: number;
  response_body: string;
  created_at: Date;
  expires_at: Date;
}

// Store idempotency key with request hash and response
export async function storeIdempotencyKey(
  key: string,
  requestHash: string,
  responseStatus: number,
  responseBody: string,
  ttlMinutes: number = 60
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

  try {
    await sql`
      INSERT INTO idempotency_keys (key, request_hash, response_status, response_body, created_at, expires_at)
      VALUES (${key}, ${requestHash}, ${responseStatus}, ${responseBody}, NOW(), ${expiresAt})
      ON CONFLICT (key) DO NOTHING
    `;
  } catch (error) {
    // Table might not exist yet - create it
    await createIdempotencyTable();
    await sql`
      INSERT INTO idempotency_keys (key, request_hash, response_status, response_body, created_at, expires_at)
      VALUES (${key}, ${requestHash}, ${responseStatus}, ${responseBody}, NOW(), ${expiresAt})
      ON CONFLICT (key) DO NOTHING
    `;
  }
}

// Check if idempotency key already exists
export async function checkIdempotencyKey(
  key: string,
  requestHash: string
): Promise<IdempotencyRecord | null> {
  try {
    const records = await sql`
      SELECT key, request_hash, response_status, response_body, created_at, expires_at
      FROM idempotency_keys
      WHERE key = ${key} AND expires_at > NOW()
    `;

    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    
    // If request hash matches, return stored response
    if (record.request_hash === requestHash) {
      return record as IdempotencyRecord;
    }

    // Same key but different request - conflict
    throw new Error('IDEMPOTENCY_CONFLICT');
  } catch (error) {
    if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') {
      throw error;
    }
    // Table might not exist - ignore for now
    return null;
  }
}

// Generate hash from request body
export function generateRequestHash(body: any): string {
  const crypto = require('crypto');
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHash('sha256').update(bodyString).digest('hex');
}

// Clean up expired idempotency keys (run periodically)
export async function cleanupExpiredKeys(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM idempotency_keys 
      WHERE expires_at <= NOW()
    `;
    return result.count || 0;
  } catch (error) {
    console.error('Failed to cleanup expired idempotency keys:', error);
    return 0;
  }
}

// Create idempotency table if it doesn't exist
async function createIdempotencyTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS idempotency_keys (
      key VARCHAR(255) PRIMARY KEY,
      request_hash VARCHAR(64) NOT NULL,
      response_status INTEGER NOT NULL,
      response_body TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_idempotency_expires 
    ON idempotency_keys(expires_at)
  `;
}

// Validate idempotency key format
export function validateIdempotencyKey(key: string): boolean {
  // UUID v4 or similar format: 36 chars with hyphens, or 32-64 hex chars
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hexPattern = /^[0-9a-f]{32,64}$/i;
  return uuidPattern.test(key) || hexPattern.test(key);
}

// Create standardized idempotency conflict error
export function createIdempotencyConflictError(key: string, traceId?: string): ApiError {
  return createApiError(
    'ERR_IDEMPOTENCY_CONFLICT',
    `Idempotency conflict: key '${key}' is already in use with different request data`,
    { idempotency_key: key },
    traceId || 'unknown'
  );
}

// Middleware wrapper for POST routes requiring idempotency
export function withIdempotency<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<Response> => {
    const [req] = args;
    const idempotencyKey = req.headers.get('idempotency-key');
    
    if (!idempotencyKey) {
      // Idempotency key is required for POST operations
      return Response.json({
        code: 'ERR_VALIDATION_FAILED',
        message: 'Idempotency-Key header is required for POST operations',
        details: {},
        trace_id: req.headers.get('x-trace-id') || 'unknown'
      }, { status: 400 });
    }

    try {
      const body = await req.clone().json();
      const requestHash = generateRequestHash(body);
      
      // Check for existing idempotency key
      const existing = await checkIdempotencyKey(idempotencyKey, requestHash);
      if (existing) {
        // Return stored response
        return new Response(existing.response_body, {
          status: existing.response_status,
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Replayed': 'true'
          }
        });
      }

      // Execute original handler
      const response = await handler(...args);
      
      // Store response for future idempotency checks
      if (response.ok) {
        const responseBody = await response.clone().text();
        await storeIdempotencyKey(
          idempotencyKey,
          requestHash,
          response.status,
          responseBody
        );
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') {
        return Response.json({
          code: 'ERR_IDEMPOTENCY_CONFLICT',
          message: `Concurrent request detected with idempotency key '${idempotencyKey}'`,
          details: { idempotency_key: idempotencyKey },
          trace_id: req.headers.get('x-trace-id') || 'unknown'
        }, { status: 409 });
      }

      // Re-throw other errors
      throw error;
    }
  }) as T;
}