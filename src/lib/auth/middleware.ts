import { NextRequest, NextResponse } from 'next/server';
import { jwtManager, extractTokenFromHeader } from './jwt';
import { isTokenRevoked } from './token-revocation';
import { checkRBACPermission, User, UserRole } from './rbac';
import { logAuditEvent } from './audit';
import crypto from 'crypto';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  trace_id?: string;
}

interface AuthOptions {
  requiredRoles?: UserRole[];
  checkOwnership?: boolean;
  checkProjectAssignment?: boolean;
  skipAudit?: boolean;
}

/**
 * Middleware d'authentification avec support RBAC
 */
export function withAuth(options: AuthOptions = {}) {
  return async function authMiddleware(
    req: NextRequest,
    context?: any
  ): Promise<NextResponse | void> {
    const startTime = Date.now();
    
    // Générer ou récupérer le trace ID
    const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
    
    // Ajouter le trace ID à la requête
    (req as any).trace_id = traceId;
    (req as any)._startTime = startTime;
    
    try {
      // Extraire le token du cookie ou du header (fallback)
      let token: string | null = null;
      
      // D'abord essayer de récupérer depuis les cookies
      const cookies = req.cookies;
      if (cookies.get('arka_access_token')) {
        token = cookies.get('arka_access_token')?.value || null;
      } else if (cookies.get('arka_token')) {
        token = cookies.get('arka_token')?.value || null;
      }
      
      // Fallback sur le header Authorization si pas de cookie
      if (!token) {
        const authHeader = req.headers.get('authorization');
        token = extractTokenFromHeader(authHeader || '');
      }
      
      if (!token) {
        if (!options.skipAudit) {
          await logAuditEvent(req, 401, 'missing_token');
        }
        
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Token d\'authentification requis',
            trace_id: traceId
          },
          { status: 401 }
        );
      }
      
      // Vérifier et décoder le token
      let payload;
      try {
        payload = jwtManager.verifyToken(token);
      } catch (error: Error | unknown) {
        if (!options.skipAudit) {
          await logAuditEvent(req, 401, 'invalid_token', error.message);
        }
        
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Token invalide ou expiré',
            trace_id: traceId
          },
          { status: 401 }
        );
      }
      
      // Vérifier si le token est révoqué
      if (payload.jti && await isTokenRevoked(payload.jti)) {
        if (!options.skipAudit) {
          await logAuditEvent(req, 401, 'revoked_token');
        }
        
        return NextResponse.json(
          {
            error: 'unauthorized',
            message: 'Token révoqué',
            trace_id: traceId
          },
          { status: 401 }
        );
      }
      
      // Créer l'objet user
      const user: User = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        jti: payload.jti
      };
      
      // Attacher l'utilisateur à la requête
      (req as any).user = user;
      
      // Vérifier les permissions RBAC si des rôles sont requis
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        // Vérifier si le rôle de l'utilisateur est dans la liste des rôles requis
        if (!options.requiredRoles.includes(user.role)) {
          // Vérifier les permissions plus granulaires
          const hasPermission = await checkRBACPermission(
            user,
            req.url,
            req.method,
            {
              checkOwnership: options.checkOwnership,
              checkProjectAssignment: options.checkProjectAssignment
            }
          );
          
          if (!hasPermission) {
            if (!options.skipAudit) {
              await logAuditEvent(req, 403, 'rbac_denied');
            }
            
            return NextResponse.json(
              {
                error: 'forbidden',
                message: `Action non autorisée pour le rôle '${user.role}'`,
                required_roles: options.requiredRoles,
                trace_id: traceId
              },
              { status: 403 }
            );
          }
        }
      }
      
      // Log de succès
      if (!options.skipAudit) {
        await logAuditEvent(req, 200, 'auth_success');
      }
      
      // Continuer avec la requête
      // Dans Next.js App Router, on ne retourne rien pour continuer
      return;
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (!options.skipAudit) {
        await logAuditEvent(req, 500, 'auth_error', (error as Error).message);
      }
      
      return NextResponse.json(
        {
          error: 'internal_error',
          message: 'Erreur d\'authentification',
          trace_id: traceId
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper pour les API routes avec authentification
 */
export function withAuthHandler(
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async function authenticatedHandler(
    req: NextRequest,
    context?: any
  ): Promise<NextResponse> {
    // Appliquer le middleware d'authentification
    const authResult = await withAuth(options)(req, context);
    
    // Si le middleware retourne une réponse, c'est une erreur
    if (authResult) {
      return authResult;
    }
    
    // Sinon, appeler le handler avec l'utilisateur authentifié
    return handler(req as NextRequest & { user: User }, context);
  };
}

/**
 * Helper pour créer des handlers avec des rôles spécifiques
 */
export const withAdminAuth = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { requiredRoles: ['admin'] });

export const withManagerAuth = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { requiredRoles: ['admin', 'manager'] });

export const withOperatorAuth = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { requiredRoles: ['admin', 'manager', 'operator'] });

export const withViewerAuth = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { requiredRoles: ['admin', 'manager', 'operator', 'viewer'] });

/**
 * Middleware pour vérifier l'ownership d'une ressource
 */
export const withOwnership = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { 
  requiredRoles: ['admin', 'manager'],
  checkOwnership: true 
});

/**
 * Middleware pour vérifier l'assignation à un projet
 */
export const withProjectAssignment = (
  handler: (req: NextRequest & { user: User }, context?: any) => Promise<NextResponse>
) => withAuthHandler(handler, { 
  requiredRoles: ['admin', 'manager', 'operator'],
  checkProjectAssignment: true 
});