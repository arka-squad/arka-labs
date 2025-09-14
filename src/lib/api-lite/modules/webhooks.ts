/**
 * API Lite Module: WEBHOOKS
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupWebhooksRoutes(api: APILite) {
  console.log('🚀 Setup module webhooks...');

  // Health check pour le module
  api.route('/api/webhooks/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'webhooks',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module webhooks fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module webhooks configuré');
}
