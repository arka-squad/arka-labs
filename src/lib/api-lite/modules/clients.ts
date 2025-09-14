/**
 * API Lite Module: CLIENTS
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupClientsRoutes(api: APILite) {
  console.log('🚀 Setup module clients...');

  // Health check pour le module
  api.route('/api/clients/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'clients',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module clients fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module clients configuré');
}
