/**
 * API Lite Module: ADMIN
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupAdminRoutes(api: APILite) {
  console.log('🚀 Setup module admin...');

  // Health check pour le module
  api.route('/api/admin/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'admin',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module admin fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module admin configuré');
}
