/**
 * API Lite Module: DATA
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupDataRoutes(api: APILite) {
  console.log('🚀 Setup module data...');

  // Health check pour le module
  api.route('/api/data/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'data',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module data fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module data configuré');
}
