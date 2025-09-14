/**
 * API Lite Module: AUTH
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupAuthRoutes(api: APILite) {
  console.log('🚀 Setup module auth...');

  // Health check pour le module
  api.route('/api/auth/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'auth',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module auth fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module auth configuré');
}
