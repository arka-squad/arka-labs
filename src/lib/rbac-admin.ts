import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtUser as User, Role } from './auth';
import { log } from './logger';
import { sql } from './db';
import { TRACE_HEADER, generateTraceId } from './trace';

export type AdminPermission = 
  | 'squads:create' | 'squads:read' | 'squads:update' | 'squads:delete' 
  | 'squads:add_members' | 'squads:create_instructions'
  | 'projects:create' | 'projects:read' | 'projects:update' | 'projects:delete'
  | 'projects:attach_squads' | 'projects:manage_docs' | 'projects:write'
  | 'agents:create' | 'agents:read' | 'agents:write' | 'agents:delete'
  | 'clients:create' | 'clients:read' | 'clients:write' | 'clients:delete'
  | 'dashboard:read'
  | 'instructions:create' | 'instructions:cancel' | 'instructions:view';

export type ResourceScope = 'organization' | 'project' | 'squad';

export interface RBACContext {
  user_role: Role;
  resource_scope: ResourceScope;
  ownership: {
    created_by?: string;
    project_assignments?: number[];
    squad_assignments?: string[];
  };
}

// Matrice permissions B23
const PERMISSIONS_MATRIX: Record<AdminPermission, Role[]> = {
  // Squads permissions
  'squads:create': ['admin'],
  'squads:read': ['admin', 'owner', 'editor', 'viewer'],
  'squads:update': ['admin'], // owner only if assigned
  'squads:delete': ['admin'],
  'squads:add_members': ['admin'], // owner only if assigned
  'squads:create_instructions': ['admin'], // owner if project assigned, operator if squad assigned
  
  // Projects permissions  
  'projects:create': ['admin', 'owner'],
  'projects:read': ['admin', 'owner', 'editor', 'viewer'], // owner if created_by, operator if assigned
  'projects:update': ['admin'], // owner if created_by
  'projects:delete': ['admin'], // owner if created_by
  'projects:write': ['admin', 'owner'], // owner if created_by
  'projects:attach_squads': ['admin'], // owner if created_by
  'projects:manage_docs': ['admin'], // owner if created_by, operator if assigned
  
  // Agents permissions
  'agents:create': ['admin'],
  'agents:read': ['admin', 'owner', 'editor', 'viewer'],
  'agents:write': ['admin', 'owner'],
  'agents:delete': ['admin'],
  
  // Clients permissions
  'clients:create': ['admin'],
  'clients:read': ['admin', 'owner', 'editor', 'viewer'],
  'clients:write': ['admin', 'owner'],
  'clients:delete': ['admin'],
  
  // Dashboard permissions
  'dashboard:read': ['admin', 'owner', 'editor', 'viewer'],
  
  // Instructions permissions
  'instructions:create': ['admin'], // owner if project owner, operator if squad member
  'instructions:cancel': ['admin'], // owner if project owner
  'instructions:view': ['admin', 'owner', 'editor', 'viewer'], // if assigned
};

export async function checkResourceOwnership(
  resourceType: 'squad' | 'project' | 'instruction',
  resourceId: string | number,
  userId: string
): Promise<{
  created_by?: string;
  project_assignments?: number[];
  squad_assignments?: string[];
}> {
  try {
    switch (resourceType) {
      case 'squad': {
        const rows = await sql`
          SELECT s.created_by,
                 array_agg(DISTINCT ps.project_id) FILTER (WHERE ps.project_id IS NOT NULL) as project_assignments
          FROM squads s
          LEFT JOIN project_squads ps ON s.id = ps.squad_id AND ps.status = 'active'
          WHERE s.id = ${resourceId}
          GROUP BY s.created_by
        `;
        return {
          created_by: rows[0]?.created_by,
          project_assignments: rows[0]?.project_assignments || []
        };
      }
      
      case 'project': {
        const rows = await sql`
          SELECT p.created_by,
                 array_agg(DISTINCT ps.squad_id) FILTER (WHERE ps.squad_id IS NOT NULL) as squad_assignments
          FROM projects p
          LEFT JOIN project_squads ps ON p.id = ps.project_id AND ps.status = 'active'
          WHERE p.id = ${resourceId}
          GROUP BY p.created_by
        `;
        return {
          created_by: rows[0]?.created_by,
          squad_assignments: rows[0]?.squad_assignments || []
        };
      }
      
      case 'instruction': {
        const rows = await sql`
          SELECT si.created_by, si.project_id, si.squad_id,
                 p.created_by as project_owner
          FROM squad_instructions si
          LEFT JOIN projects p ON si.project_id = p.id
          WHERE si.id = ${resourceId}
        `;
        const row = rows[0];
        return {
          created_by: row?.created_by,
          project_assignments: row?.project_id ? [row.project_id] : [],
          squad_assignments: row?.squad_id ? [row.squad_id] : []
        };
      }
      
      default:
        return {};
    }
  } catch (error) {
    log('warn', 'ownership_check_failed', { route: 'lib', status: 500, resourceType, resourceId, error: error instanceof Error ? error.message : 'Unknown error' });
    return {};
  }
}

export function checkPermissionMatrix(
  userRole: Role,
  requiredPermissions: AdminPermission[],
  ownership: {
    created_by?: string;
    project_assignments?: number[];
    squad_assignments?: string[];
  },
  userId?: string
): boolean {
  // Admin has all permissions
  if (userRole === 'admin') return true;
  
  // Check each required permission
  for (const permission of requiredPermissions) {
    const allowedRoles = PERMISSIONS_MATRIX[permission];
    
    // Base role check
    if (!allowedRoles.includes(userRole)) {
      // Check ownership-based permissions
      if (userRole === 'owner') {
        // Owner can act on owned resources
        if (permission.includes('squads:') && ownership.squad_assignments?.length) continue;
        if (permission.includes('projects:') && ownership.created_by === userId) continue;
        if (permission.includes('instructions:') && ownership.created_by === userId) continue;
      }
      
      if (userRole === 'editor') {
        // Operator can act on assigned resources
        if (permission === 'squads:create_instructions' && ownership.squad_assignments?.length) continue;
        if (permission.includes('projects:') && ownership.project_assignments?.length) continue;
      }
      
      return false;
    }
  }
  
  return true;
}

export function withAdminAuth(
  requiredPermissions: AdminPermission[],
  resourceType?: 'squad' | 'project' | 'instruction'
) {
  return function(handler: (req: AuthenticatedRequest, user: User, context: any) => Promise<NextResponse> | NextResponse) {
    return async (req: NextRequest, context: any = {}): Promise<NextResponse> => {
      const traceId = req.headers.get(TRACE_HEADER) || generateTraceId();
      const start = Date.now();

      // Bypass RBAC for development testing
      if (process.env.RBAC_BYPASS === 'true') {
        const mockUser: User = {
          sub: 'dev-user',
          role: 'admin' as Role
        };
        return handler(req as AuthenticatedRequest, mockUser, context);
      }

      // 1. Authentication - read from cookies first, fallback to authorization header
      const token = req.cookies.get('arka_access_token')?.value || 
                   req.cookies.get('arka_token')?.value ||
                   (() => {
                     const auth = req.headers.get('authorization');
                     return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
                   })();

      if (!token) {
        const res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        log('warn', 'rbac_auth_missing', { route: 'lib', status: 401, trace_id: traceId, pathname: req.nextUrl.pathname });
        return res;
      }
      const user = verifyToken(token);
      if (!user) {
        const res = NextResponse.json({ error: 'invalid_token' }, { status: 401 });
        log('warn', 'rbac_token_invalid', { route: 'lib', status: 500, trace_id: traceId, pathname: req.nextUrl.pathname });
        return res;
      }

      // 2. Admin role check (quick path)
      if (user.role === 'admin') {
        (req as any).user = user;
        const res = await handler(req as AuthenticatedRequest, user, context);
        
        const duration_ms = Date.now() - start;
        log('debug', 'rbac_admin_access', { route: 'lib', status: 200, trace_id: traceId, 
          pathname: req.nextUrl.pathname,
          user_id: user.sub,
          role: user.role,
          decision: 'allow',
          duration_ms });
        
        return res;
      }

      // 3. Resource ownership check for non-admin users
      let ownership = {};
      if (resourceType && (context.params?.id || context.params?.squad_id)) {
        const resourceId = context.params?.id || context.params?.squad_id;
        ownership = await checkResourceOwnership(resourceType, resourceId, user.sub);
      }

      // 4. Permission matrix check
      const hasPermission = checkPermissionMatrix(user.role, requiredPermissions, ownership, user.sub);
      
      if (!hasPermission) {
        const res = NextResponse.json({ 
          error: 'forbidden', 
          resource: resourceType,
          required_permissions: requiredPermissions 
        }, { status: 403 });
        
        log('warn', 'rbac_permission_denied', { route: 'lib', status: 403, trace_id: traceId,
          pathname: req.nextUrl.pathname,
          user_id: user.sub,
          role: user.role,
          required_permissions: requiredPermissions,
          ownership });
        
        return res;
      }

      // 5. Execute handler
      (req as any).user = user;
      const res = await handler(req as AuthenticatedRequest, user, context);
      
      const duration_ms = Date.now() - start;
      log('debug', 'rbac_access_granted', { route: 'lib', status: 200, trace_id: traceId, 
        pathname: req.nextUrl.pathname,
        user_id: user.sub,
        role: user.role,
        permissions: requiredPermissions,
        decision: 'allow',
        duration_ms });

      return res;
    };
  };
}

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}