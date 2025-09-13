/**
 * ARKA CLIENTS API V2 - Utilise le nouveau router centralisé
 * 
 * Cette version remplace route.ts et offre:
 * - Switch automatique entre query params et dynamic routes
 * - Monitoring centralisé 
 * - Configuration à chaud
 * - Fallback automatique
 */

import { 
  adminClientsGET, 
  adminClientsPOST,
  adminClientsPUT,
  adminClientsDELETE 
} from '../../../../lib/api-router/admin-routes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Import direct des handlers du router centralisé
export const GET = adminClientsGET;
export const POST = adminClientsPOST;
export const PUT = adminClientsPUT;
export const DELETE = adminClientsDELETE;

/*
 * USAGE:
 * 
 * 1. Liste clients:
 *    GET /api/admin/clients
 *    
 * 2. Client spécifique (query strategy):
 *    GET /api/admin/clients?id=b35321bd-7ebd-4910-9dcc-f33e707d6417
 *    
 * 3. Client spécifique (dynamic strategy, si Vercel fonctionne):
 *    GET /api/admin/clients/b35321bd-7ebd-4910-9dcc-f33e707d6417
 *    
 * 4. Contrôle stratégie:
 *    POST /api/admin/router {"action": "setGlobalStrategy", "strategy": "query"}
 *    
 * 5. Mode urgence (tout en query):
 *    PATCH /api/admin/router?action=emergency-query
 */