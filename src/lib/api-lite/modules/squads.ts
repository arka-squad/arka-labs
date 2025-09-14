/**
 * API Lite Module: SQUADS
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupSquadsRoutes(api: APILite) {
  console.log('🚀 Setup module squads...');

  // Health check pour le module
  api.route('/api/squads/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'squads',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module squads fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module squads configuré');
}
