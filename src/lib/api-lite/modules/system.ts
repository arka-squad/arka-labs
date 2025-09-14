/**
 * API Lite Module: SYSTEM
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupSystemRoutes(api: APILite) {
  console.log('🚀 Setup module system...');

  // Health check pour le module
  api.route('/api/system/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'system',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module system fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module system configuré');
}
