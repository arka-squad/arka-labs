// B28 Phase 2 - Point d'entrée API unifié
// Remplace les 97 routes directes par un système centralisé

import { NextRequest } from 'next/server';
import { createRouter } from './core/router';
import { registerAdminRoutes } from './routes/admin';
import { registerAgentsRoutes } from './routes/agents';
import { registerAuthRoutes } from './routes/auth';
import { registerClientsRoutes } from './routes/clients';
import { registerProjectsRoutes } from './routes/projects';
import { registerSquadsRoutes } from './routes/squads';
import { registerSystemRoutes } from './routes/system';

export function createAPI() {
  const router = createRouter();

  // Enregistrer tous les modules
  registerSystemRoutes(router);    // health, version, metrics
  registerAuthRoutes(router);      // auth, login, tokens
  registerAdminRoutes(router);     // backoffice admin
  registerClientsRoutes(router);   // gestion clients
  registerProjectsRoutes(router);  // gestion projets
  registerAgentsRoutes(router);    // gestion agents
  registerSquadsRoutes(router);    // gestion squads

  return router;
}

export async function apiHandler(req: NextRequest, context: any) {
  const api = createAPI();
  return api.handle(req, context);
}

// Stats pour monitoring
export const API_STATS = {
  version: '2.0.0',
  architecture: 'unified',
  totalRoutes: 97,
  migratedFrom: 'direct-routes + api-lite',
  created: new Date().toISOString()
};
