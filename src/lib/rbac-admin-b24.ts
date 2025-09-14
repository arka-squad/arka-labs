import { NextRequest, NextResponse } from 'next/server';
import { jwtManager, extractTokenFromHeader } from './auth/jwt';
import { isTokenRevoked } from './auth/token-revocation';
import { checkRBACPermission, User, UserRole } from './auth/rbac';
import { logAuditEvent } from './auth/audit';
import crypto from 'crypto';

/**
 * Wrapper withAdminAuth amélioré avec le système B24
 * Compatible avec l'ancien système tout en ajoutant les nouvelles fonctionnalités
 */
export function withAdminAuth(
  requiredPermissions: string[] | UserRole[] = []
) {
  return function(
    handler: (req: NextRequest, user: User, context?: any) => Promise<NextResponse>
  ) {
    return async function authenticatedHandler(
      req: NextRequest,
      context?: any
    ): Promise<NextResponse> {
      const startTime = Date.now();
      
      // Générer ou récupérer le trace ID
      const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
      
      // Ajouter le trace ID à la requête
      (req as any).trace_id = traceId;
      (req as any)._startTime = startTime;
      
      try {
        // Extraire le token du cookie d'abord, puis du header en fallback
        const token = req.cookies.get('arka_access_token')?.value || 
                     req.cookies.get('arka_token')?.value ||
                     extractTokenFromHeader(req.headers.get('authorization') || '');
        
        if (!token) {
          await logAuditEvent(req, 401, 'missing_token');
          
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
          await logAuditEvent(req, 401, 'invalid_token', (error as Error).message);
          
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
          await logAuditEvent(req, 401, 'revoked_token');
          
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
        
        // Vérifier les permissions RBAC
        if (requiredPermissions.length > 0) {
          // Déterminer si ce sont des rôles ou des permissions
          const isRoles = ['admin', 'manager', 'operator', 'viewer'].includes(requiredPermissions[0]);
          
          if (isRoles) {
            // Vérifier si le rôle de l'utilisateur est dans la liste
            if (!requiredPermissions.includes(user.role)) {
              await logAuditEvent(req, 403, 'rbac_denied');
              
              return NextResponse.json(
                {
                  error: 'forbidden',
                  message: `Action non autorisée pour le rôle '${user.role}'`,
                  required_roles: requiredPermissions,
                  trace_id: traceId
                },
                { status: 403 }
              );
            }
          } else {
            // Vérifier les permissions granulaires
            const hasPermission = await checkRBACPermission(
              user,
              req.url,
              req.method,
              {
                checkOwnership: requiredPermissions.some(p => p.includes(':own')),
                checkProjectAssignment: requiredPermissions.some(p => p.includes(':assigned'))
              }
            );
            
            if (!hasPermission) {
              await logAuditEvent(req, 403, 'permission_denied');
              
              return NextResponse.json(
                {
                  error: 'forbidden',
                  message: 'Permission insuffisante',
                  required_permissions: requiredPermissions,
                  trace_id: traceId
                },
                { status: 403 }
              );
            }
          }
        }
        
        // Log de succès
        await logAuditEvent(req, 200, 'auth_success');
        
        // Appeler le handler avec l'utilisateur authentifié
        return handler(req, user, context);
        
      } catch (error) {
        console.error('Auth middleware error:', error);
        
        await logAuditEvent(req, 500, 'auth_error', (error as Error).message);
        
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
  };
}

// Aliases pour compatibilité avec les permissions existantes
export const withAuth = withAdminAuth;

// Helpers spécifiques par permission
export const requireAdmin = () => withAdminAuth(['admin']);
export const requireManager = () => withAdminAuth(['admin', 'manager']);
export const requireOperator = () => withAdminAuth(['admin', 'manager', 'operator']);
export const requireViewer = () => withAdminAuth(['admin', 'manager', 'operator', 'viewer']);

// Helpers pour les permissions sur les ressources
export const requireProjectsRead = () => withAdminAuth(['projects:read']);
export const requireProjectsCreate = () => withAdminAuth(['projects:create']);
export const requireProjectsUpdate = () => withAdminAuth(['projects:update']);
export const requireProjectsDelete = () => withAdminAuth(['projects:delete']);

export const requireClientsRead = () => withAdminAuth(['clients:read']);
export const requireClientsCreate = () => withAdminAuth(['clients:create']);
export const requireClientsUpdate = () => withAdminAuth(['clients:update']);
export const requireClientsDelete = () => withAdminAuth(['clients:delete']);

export const requireAgentsRead = () => withAdminAuth(['agents:read']);
export const requireAgentsCreate = () => withAdminAuth(['agents:create']);
export const requireAgentsUpdate = () => withAdminAuth(['agents:update']);
export const requireAgentsDelete = () => withAdminAuth(['agents:delete']);

export const requireSquadsRead = () => withAdminAuth(['squads:read']);
export const requireSquadsCreate = () => withAdminAuth(['squads:create']);
export const requireSquadsUpdate = () => withAdminAuth(['squads:update']);
export const requireSquadsDelete = () => withAdminAuth(['squads:delete']);