/**
 * ARKA CLIENTS API - HOTFIX Session Expired
 *
 * Utilise handlers directs pour contourner le problème d'auth
 * du router centralisé qui cause "Session expired or invalid"
 */

import {
  handleClientsGET,
  handleClientsPOST,
  handleClientsPUT,
  handleClientsDELETE
} from './direct-route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handlers directs sans auth complexe - TEMPORAIRE
export const GET = handleClientsGET;
export const POST = handleClientsPOST;
export const PUT = handleClientsPUT;
export const DELETE = handleClientsDELETE;

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