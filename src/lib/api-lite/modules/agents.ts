/**
 * API Lite Module: AGENTS
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupAgentsRoutes(api: APILite) {
  console.log('🚀 Setup module agents...');

  // Health check pour le module
  api.route('/api/agents/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'agents',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module agents fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module agents configuré');
}
