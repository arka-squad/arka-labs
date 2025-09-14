/**
 * API Lite Module: STREAMING
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupStreamingRoutes(api: APILite) {
  console.log('🚀 Setup module streaming...');

  // Health check pour le module
  api.route('/api/streaming/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'streaming',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module streaming fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module streaming configuré');
}
