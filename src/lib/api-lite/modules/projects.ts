/**
 * API Lite Module: PROJECTS
 * B28 Phase 3 - Module fonctionnel minimal
 */

import { APILite } from '../core';
import { NextResponse } from 'next/server';

export function setupProjectsRoutes(api: APILite) {
  console.log('🚀 Setup module projects...');

  // Health check pour le module
  api.route('/api/projects/health')
    .get()
    .handler(async (context) => {
      return NextResponse.json({
        module: 'projects',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Module projects fonctionnel - B28 Phase 3'
      });
    });

  // TODO: Migrer les vraies routes depuis l'ancien monolithe
  // Routes à implémenter selon les besoins métier

  console.log('✅ Module projects configuré');
}
