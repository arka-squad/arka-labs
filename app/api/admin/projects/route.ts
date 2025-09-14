/**
 * ARKA PROJECTS API - HOTFIX Session Expired
 *
 * Utilise handlers directs pour contourner le problème d'auth
 * du router centralisé qui cause "Session expired or invalid"
 */

import {
  handleProjectsGET,
  handleProjectsPOST,
  handleProjectsPUT,
  handleProjectsDELETE
} from './direct-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handlers directs sans auth complexe - HOTFIX
export const GET = handleProjectsGET;
export const POST = handleProjectsPOST;
export const PUT = handleProjectsPUT;
export const DELETE = handleProjectsDELETE;

/*
 * USAGE:
 * 
 * 1. Liste projets:
 *    GET /api/admin/projects
 *    
 * 2. Projet spécifique (query strategy):
 *    GET /api/admin/projects?id=project-uuid-123
 *    
 * 3. Projet spécifique (dynamic strategy, si Vercel fonctionne):
 *    GET /api/admin/projects/project-uuid-123
 *    
 * 4. Créer projet:
 *    POST /api/admin/projects
 *    
 * 5. Modifier projet (query strategy):
 *    PUT /api/admin/projects?id=project-uuid-123
 *    
 * 6. Supprimer projet (query strategy):
 *    DELETE /api/admin/projects?id=project-uuid-123
 *    
 * 7. Contrôle stratégie:
 *    POST /api/admin/router {"action": "setGlobalStrategy", "strategy": "query"}
 *    
 * 8. Mode urgence (tout en query):
 *    PATCH /api/admin/router?action=emergency-query
 */