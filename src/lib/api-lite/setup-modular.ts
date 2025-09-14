/**
 * API Lite Setup - Nouveau Point d'Entrée
 * B28 Phase 2 - Architecture modulaire
 * Remplace monolithe 4399 lignes par 17 modules
 */

import { APILite } from './core';
import { corsMiddleware, validationMiddleware, rbacMiddleware, loggingMiddleware } from './middleware';

// Import modules
import { setupAdminRoutes } from './modules/admin';
import { setupAgentsRoutes } from './modules/agents';
import { setupAuthRoutes } from './modules/auth';
import { setupClientsRoutes } from './modules/clients';
import { setupDataRoutes } from './modules/data';
import { setupMiscRoutes } from './modules/misc';
import { setupProjectsRoutes } from './modules/projects';
import { setupSquadsRoutes } from './modules/squads';
import { setupStreamingRoutes } from './modules/streaming';
import { setupSystemRoutes } from './modules/system';
import { setupWebhooksRoutes } from './modules/webhooks';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export function setupAPIRoutes(): APILite {
  console.log('🚀 API Lite Setup - Architecture Modulaire B28...');

  const api = new APILite();

  // Middlewares globaux
  api.use(corsMiddleware({
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }));

  if (isDevelopment) {
    api.use(loggingMiddleware({ logBody: false, logHeaders: false }));
  }

  // Setup modules thématiques (11 modules organisés)
  setupSystemRoutes(api);   // 1116 lignes - Health, version, metrics
  setupAuthRoutes(api);     // 135 lignes - Authentication, tokens
  setupAdminRoutes(api);    // 105 lignes - Admin backoffice
  setupClientsRoutes(api);  // 88 lignes - Client management
  setupProjectsRoutes(api); // 433 lignes - Project management
  setupAgentsRoutes(api);   // 970 lignes - AI agents
  setupSquadsRoutes(api);   // 75 lignes - Squad management
  setupDataRoutes(api);     // 611 lignes - Database queries
  setupWebhooksRoutes(api); // 79 lignes - GitHub webhooks
  setupStreamingRoutes(api);// 89 lignes - SSE streaming
  setupMiscRoutes(api);     // 76 lignes - Residual routes

  console.log('✅ API Lite configurée avec 11 modules');
  console.log('📊 Architecture: Monolithe 4399L → 11 modules maintenables');
  console.log('🎯 Plus gros module: 1116L (vs 4399L monolithe)');

  return api;
}

// Statistiques pour monitoring
export const API_LITE_STATS = {
  version: '2.0.0-b28',
  architecture: 'modular',
  modules: 11,
  totalLines: 3777, // Somme des 11 modules
  originalLines: 4399,
  reductionPercent: Math.round((1 - 3777/4399) * 100),
  maxModuleSize: 1116, // vs 4399 original
  avgModuleSize: Math.round(3777/11),
  created: new Date().toISOString(),
  breakdown: {
    system: 1116,
    agents: 970,
    data: 611,
    projects: 433,
    auth: 135,
    admin: 105,
    streaming: 89,
    clients: 88,
    webhooks: 79,
    misc: 76,
    squads: 75
  }
};
