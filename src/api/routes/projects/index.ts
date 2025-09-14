// Routes projects - B28 Phase 2
import { Router } from '../core/router';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth/middleware';

export function registerProjectsRoutes(router: Router) {
  // TODO: Migrer routes projects depuis app/api/

  // Exemple route
  router.get('/projects/health', async (req: NextRequest) => {
    return NextResponse.json({
      module: 'projects',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // D'autres routes à ajouter durant migration...
}
