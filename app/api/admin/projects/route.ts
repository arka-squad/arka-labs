/**
 * ARKA PROJECTS API V2 - Utilise le nouveau router centralisé
 * 
 * Cette version remplace route-old.ts et offre:
 * - Switch automatique entre query params et dynamic routes
 * - Monitoring centralisé 
 * - Configuration à chaud
 * - Fallback automatique
 */

import { 
  adminProjectsGET, 
  adminProjectsPOST,
  adminProjectsPUT,
  adminProjectsDELETE 
} from '../../../../lib/api-router/admin-routes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Import direct des handlers du router centralisé
export const GET = adminProjectsGET;
export const POST = adminProjectsPOST;
export const PUT = adminProjectsPUT;
export const DELETE = adminProjectsDELETE;

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