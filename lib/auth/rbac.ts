import { getDb } from '../db';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  jti?: string;
}

interface RBACOptions {
  checkOwnership?: boolean;
  checkProjectAssignment?: boolean;
}

// Matrice des permissions par rôle
const PERMISSIONS_MATRIX = {
  admin: {
    projects: ['create', 'read', 'update', 'delete'],
    clients: ['create', 'read', 'update', 'delete'],
    agents: ['create', 'read', 'update', 'delete'],
    squads: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    all: true // Admin a tous les droits
  },
  manager: {
    projects: ['create', 'read', 'update:own', 'delete:own'],
    clients: ['create', 'read', 'update', 'delete'],
    agents: ['create', 'read', 'update', 'delete'],
    squads: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    all: false
  },
  operator: {
    projects: ['read:assigned', 'update:assigned'],
    clients: ['read', 'update'],
    agents: ['read', 'update'],
    squads: ['read', 'update'],
    users: [],
    all: false
  },
  viewer: {
    projects: ['read'],
    clients: ['read'],
    agents: ['read'],
    squads: ['read'],
    users: [],
    all: false
  }
};

/**
 * Vérifie si un utilisateur a la permission pour une action
 */
export async function checkPermission(
  user: User,
  resource: string,
  action: string,
  options: RBACOptions = {}
): Promise<boolean> {
  const permissions = PERMISSIONS_MATRIX[user.role];
  
  // Admin a tous les droits
  if (permissions.all) {
    return true;
  }
  
  // Extraire le type de ressource (ex: 'projects' de '/api/backoffice/projects/:id')
  const resourceType = extractResourceType(resource);
  const resourcePermissions = permissions[resourceType as keyof typeof permissions];
  
  if (!resourcePermissions || !Array.isArray(resourcePermissions)) {
    return false;
  }
  
  // Mapper les méthodes HTTP aux actions CRUD
  const crudAction = mapHttpToCrud(action);
  
  // Cast resourcePermissions to string array for type safety
  const perms = resourcePermissions as string[];
  
  // Vérifier les permissions basiques
  if (perms.includes(crudAction)) {
    return true;
  }
  
  // Vérifier les permissions avec conditions (own, assigned)
  if (options.checkOwnership && perms.includes(`${crudAction}:own`)) {
    // Vérifier si l'utilisateur est propriétaire de la ressource
    return await checkResourceOwnership(user, resource, resourceType);
  }
  
  if (options.checkProjectAssignment && perms.includes(`${crudAction}:assigned`)) {
    // Vérifier si l'utilisateur est assigné au projet
    return await checkProjectAssignment(user, resource);
  }
  
  return false;
}

/**
 * Vérifie si un utilisateur est propriétaire d'une ressource
 */
async function checkResourceOwnership(user: User, resource: string, resourceType: string): Promise<boolean> {
  try {
    const db = getDb();
    const resourceId = extractResourceId(resource);
    
    if (!resourceId) return false;
    
    // Vérifier selon le type de ressource
    switch (resourceType) {
      case 'projects': {
        const result = await db.query(
          `SELECT created_by FROM projects WHERE id = $1`,
          [resourceId]
        );
        
        if (result.rows.length === 0) return false;
        
        // Comparer avec l'email de l'utilisateur
        return result.rows[0].created_by === user.email;
      }
      
      case 'squads': {
        const result = await db.query(
          `SELECT created_by FROM squads WHERE id = $1`,
          [resourceId]
        );
        
        if (result.rows.length === 0) return false;
        
        return result.rows[0].created_by === user.id;
      }
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur est assigné à un projet
 */
async function checkProjectAssignment(user: User, resource: string): Promise<boolean> {
  try {
    const db = getDb();
    const projectId = extractProjectId(resource);
    
    if (!projectId) return false;
    
    const result = await db.query(
      `SELECT id FROM user_project_assignments 
       WHERE user_id = $1 AND project_id = $2`,
      [user.id, projectId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking project assignment:', error);
    return false;
  }
}

/**
 * Récupère les projets assignés à un utilisateur
 */
export async function getUserAssignedProjects(userId: string): Promise<number[]> {
  try {
    const db = getDb();
    const result = await db.query(
      `SELECT project_id FROM user_project_assignments WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows.map((row: any) => row.project_id);
  } catch (error) {
    console.error('Error getting user assigned projects:', error);
    return [];
  }
}

/**
 * Récupère les permissions d'un utilisateur
 */
export function getUserPermissions(role: UserRole): string[] {
  const permissions = PERMISSIONS_MATRIX[role];
  const result: string[] = [];
  
  if (permissions.all) {
    return ['ALL'];
  }
  
  Object.entries(permissions).forEach(([resource, actions]) => {
    if (Array.isArray(actions)) {
      actions.forEach(action => {
        result.push(`${resource.toUpperCase()}_${action.toUpperCase().replace(':', '_')}`);
      });
    }
  });
  
  return result;
}

/**
 * Vérifie si un rôle peut effectuer une action sur une route
 */
export async function checkRBACPermission(
  user: User,
  route: string,
  method: string,
  options: RBACOptions = {}
): Promise<boolean> {
  // Cas spéciaux pour les routes publiques
  if (route.startsWith('/api/auth/')) {
    return true;
  }
  
  // Mapper la route et méthode à une permission
  const resource = route.replace('/api/backoffice/', '').split('/')[0];
  const action = method.toLowerCase();
  
  return checkPermission(user, resource, action, options);
}

// Fonctions utilitaires

function extractResourceType(resource: string): string {
  // Extraire le type depuis une URL comme /api/backoffice/projects/123
  const parts = resource.split('/').filter(p => p);
  const backofficeIndex = parts.indexOf('backoffice');
  
  if (backofficeIndex >= 0 && backofficeIndex < parts.length - 1) {
    return parts[backofficeIndex + 1].split('?')[0];
  }
  
  // Si pas dans backoffice, prendre le premier segment après api
  const apiIndex = parts.indexOf('api');
  if (apiIndex >= 0 && apiIndex < parts.length - 1) {
    return parts[apiIndex + 1].split('?')[0];
  }
  
  return parts[0] || '';
}

function extractResourceId(resource: string): string | null {
  // Extraire l'ID depuis une URL comme /api/backoffice/projects/123
  const matches = resource.match(/\/(\d+)(?:\/|$)/);
  return matches ? matches[1] : null;
}

function extractProjectId(resource: string): string | null {
  // Si c'est directement un projet
  if (resource.includes('/projects/')) {
    return extractResourceId(resource);
  }
  
  // Si c'est une ressource liée à un projet (à adapter selon les besoins)
  // Par exemple : /api/backoffice/agents/123?project_id=456
  const urlParams = new URLSearchParams(resource.split('?')[1] || '');
  return urlParams.get('project_id');
}

function mapHttpToCrud(method: string): string {
  const mapping: Record<string, string> = {
    'get': 'read',
    'post': 'create',
    'put': 'update',
    'patch': 'update',
    'delete': 'delete'
  };
  
  return mapping[method.toLowerCase()] || method.toLowerCase();
}

// Types pour l'export
export interface RBACContext {
  user: User;
  resource: string;
  action: string;
  options?: RBACOptions;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
}