// ============================================
// lib/api-lite/middleware.ts
// Middlewares optimisés sans dépendances externes
// ============================================

import { NextResponse } from 'next/server';
import { RouteContext, Middleware } from './core';
import crypto from 'crypto';

// ============================================
// CORS Middleware simplifié
// ============================================

export const corsMiddleware = (options: {
  origins?: string[];
  credentials?: boolean;
} = {}): Middleware => {
  const allowedOrigins = options.origins || process.env.CORS_ORIGINS?.split(',') || ['*'];
  const credentials = options.credentials ?? true;

  return async (context, next) => {
    const origin = context.headers.get('origin');

    // Handle preflight
    if (context.method === 'OPTIONS') {
      const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      };

      if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
        headers['Access-Control-Allow-Origin'] = origin;
        if (credentials) {
          headers['Access-Control-Allow-Credentials'] = 'true';
        }
      }

      return new NextResponse(null, { status: 204, headers });
    }

    const response = await next();

    // Add CORS headers to response
    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    }

    return response;
  };
};

// ============================================
// Validation Middleware (sans Zod)
// ============================================

interface ValidationRules {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
}

interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'enum';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  values?: any[]; // Pour enum
}

export const validationMiddleware = (rules: ValidationRules): Middleware => {
  return async (context, next) => {
    const errors: any[] = [];

    // Validate params
    if (rules.params) {
      for (const [key, rule] of Object.entries(rules.params)) {
        const value = context.params[key];
        const error = validateField(key, value, rule, 'params');
        if (error) errors.push(error);
      }
    }

    // Validate query
    if (rules.query) {
      for (const [key, rule] of Object.entries(rules.query)) {
        const value = context.query[key];
        const error = validateField(key, value, rule, 'query');
        if (error) errors.push(error);
      }
    }

    // Validate body
    if (rules.body && (context.method === 'POST' || context.method === 'PUT' || context.method === 'PATCH')) {
      try {
        const body = await context.request.json();
        for (const [key, rule] of Object.entries(rules.body)) {
          const value = body[key];
          const error = validateField(key, value, rule, 'body');
          if (error) errors.push(error);
        }
        
        // Store parsed body for handler
        context.metadata.set('body', body);
      } catch (e) {
        errors.push({
          field: 'body',
          message: 'Invalid JSON in request body'
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      );
    }

    return await next();
  };
};

function validateField(key: string, value: any, rule: ValidationRule, source: string): any | null {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      field: key,
      source,
      message: `${key} is required`
    };
  }

  // Skip validation if not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Type validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { field: key, source, message: `${key} must be a string` };
      }
      if (rule.min && value.length < rule.min) {
        return { field: key, source, message: `${key} must be at least ${rule.min} characters` };
      }
      if (rule.max && value.length > rule.max) {
        return { field: key, source, message: `${key} must be at most ${rule.max} characters` };
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return { field: key, source, message: `${key} format is invalid` };
      }
      break;

    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return { field: key, source, message: `${key} must be a number` };
      }
      if (rule.min !== undefined && num < rule.min) {
        return { field: key, source, message: `${key} must be at least ${rule.min}` };
      }
      if (rule.max !== undefined && num > rule.max) {
        return { field: key, source, message: `${key} must be at most ${rule.max}` };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return { field: key, source, message: `${key} must be a boolean` };
      }
      break;

    case 'email':
      if (typeof value !== 'string' || !isValidEmail(value)) {
        return { field: key, source, message: `${key} must be a valid email` };
      }
      break;

    case 'uuid':
      if (typeof value !== 'string' || !isValidUUID(value)) {
        return { field: key, source, message: `${key} must be a valid UUID` };
      }
      break;

    case 'enum':
      if (!rule.values || !rule.values.includes(value)) {
        return { field: key, source, message: `${key} must be one of: ${rule.values?.join(', ')}` };
      }
      break;
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================
// RBAC Auth Middleware
// ============================================

export const rbacMiddleware = (options: {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}): Middleware => {
  return async (context, next) => {
    if (!options.required) {
      return await next();
    }

    // Get authorization header
    const authHeader = context.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Simple JWT validation sans library (pour éviter dépendances)
      const user = await validateJWT(token);
      
      // Check roles if specified
      if (options.roles && options.roles.length > 0) {
        if (!user.roles || !options.roles.some(role => user.roles.includes(role))) {
          return NextResponse.json(
            { error: 'forbidden', message: 'Rôle insuffisant' },
            { status: 403 }
          );
        }
      }

      // Check permissions if specified
      if (options.permissions && options.permissions.length > 0) {
        if (!user.permissions || !options.permissions.some(perm => user.permissions.includes(perm))) {
          return NextResponse.json(
            { error: 'forbidden', message: 'Permission insuffisante' },
            { status: 403 }
          );
        }
      }

      // Store user in context
      context.metadata.set('user', user);
      
      return await next();
    } catch (error) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Token invalide' },
        { status: 401 }
      );
    }
  };
};

// Simple JWT validation (sans library)
async function validateJWT(token: string): Promise<any> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [header, payload, signature] = parts;
  
  // Verify signature (simplified)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid JWT signature');
  }

  // Decode payload
  const decodedPayload = JSON.parse(
    Buffer.from(payload, 'base64url').toString('utf8')
  );

  // Check expiration
  if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
    throw new Error('Token expired');
  }

  return decodedPayload;
}

// ============================================
// Timeout Middleware
// ============================================

export const timeoutMiddleware = (timeoutMs: number = 5000): Middleware => {
  return async (context, next) => {
    const timeout = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    try {
      return await Promise.race([next(), timeout]);
    } catch (error) {
      if ((error as Error).message === 'Request timeout') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }
      throw error;
    }
  };
};

// ============================================
// Logging Middleware
// ============================================

export const loggingMiddleware = (options: {
  logBody?: boolean;
  logHeaders?: boolean;
} = {}): Middleware => {
  return async (context, next) => {
    const start = Date.now();
    const requestId = context.metadata.get('requestId') || 'unknown';

    // Log request
    const logData: any = {
      requestId,
      method: context.method,
      path: context.path,
      query: Object.keys(context.query).length > 0 ? context.query : undefined,
      userAgent: context.headers.get('user-agent'),
      ip: context.headers.get('x-forwarded-for') || 'unknown'
    };

    if (options.logHeaders) {
      logData.headers = Object.fromEntries(context.headers.entries());
    }

    if (options.logBody && (context.method === 'POST' || context.method === 'PUT' || context.method === 'PATCH')) {
      try {
        const body = context.metadata.get('body');
        if (body) {
          // Mask sensitive fields
          logData.body = maskSensitiveData(body);
        }
      } catch (e) {
        // Ignore body logging errors
      }
    }

    console.log('🔵 Request:', JSON.stringify(logData, null, 2));

    try {
      const response = await next();
      const duration = Date.now() - start;

      console.log('🟢 Response:', {
        requestId,
        status: response.status,
        duration: `${duration}ms`
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      
      console.log('🔴 Error:', {
        requestId,
        error: (error as Error).message,
        duration: `${duration}ms`
      });

      throw error;
    }
  };
};

// Mask sensitive data in logs
function maskSensitiveData(data: unknown): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'email'];
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (field in masked) {
      (masked as any)[field] = '***MASKED***';
    }
  }

  return masked;
}